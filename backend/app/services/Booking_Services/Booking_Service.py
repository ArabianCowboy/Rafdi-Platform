from datetime import date

from app.Repo import WarehouseRepo
from app.Dtos.Booking_DTOs import BookingCreate, BookingStatusUpdate, BookingResponse
from app.Dtos.Payment_DTOs import PaymentCreate
from app.services.Booking_Services.BookingOverlap_Service import BookingOverlapService
from app.services.Booking_Services.BookingPrice_Service import BookingPriceService
from app.services.Notification_Services import NotificationTrigger_Service
from app.models.Payment_Model import PaymentStatusEnum
from app.Repo import Booking_Repo, Payment_Repo, UserRepo


class BookingService:


    def __init__(
        self,
        booking_repo         : Booking_Repo,
        payment_repo         : Payment_Repo,
        warehouse_repo       : WarehouseRepo,
        user_repo            : UserRepo,
        overlap_service      : BookingOverlapService,
        price_service        : BookingPriceService,
        notification_trigger : NotificationTrigger_Service,
    ):
        self.booking_repo         = booking_repo
        self.payment_repo         = payment_repo
        self.warehouse_repo       = warehouse_repo
        self.user_repo            = user_repo
        self.overlap_service      = overlap_service
        self.price_service        = price_service
        self.notification_trigger = notification_trigger



    def create(self, data: BookingCreate, renter_company_id: int, renter_user_id: int) -> BookingResponse:
        try:
            self.overlap_service.check_overlap(
                data.WarehouseID,
                data.StartDate,
                data.EndDate
            )

            warehouse  = self.warehouse_repo.get_by_id(data.WarehouseID)
            if not warehouse:
                raise ValueError("المستودع غير موجود")
            if not warehouse.IsActive:
                raise ValueError("المستودع غير متاح للحجز")

            owner_user = self.user_repo.get_by_company_id(warehouse.CompanyID)

            total_price = self.price_service.calculate_price(
                data.WarehouseID,
                data.StartDate,
                data.EndDate
            )

            data.RenterCompanyID = renter_company_id
            data.TotalPrice      = total_price
            booking = self.booking_repo.add(data)

            self.payment_repo.add(PaymentCreate(
                BookingID   = booking.BookingID,
                Amount      = total_price,
                PaymentDate = date.today(),
                Status      = PaymentStatusEnum.pending,
            ))

            if owner_user:
                self.notification_trigger.on_booking_created(
                    owner_user_id  = owner_user.UserID,
                    warehouse_name = warehouse.Name,
                )

            self.booking_repo.db.commit()

            return BookingResponse.model_validate(booking)

        except ValueError:
            self.booking_repo.db.rollback()
            raise
        except Exception as e:
            self.booking_repo.db.rollback()
            raise ValueError(str(e))
        

    def get_by_company(self, company_id: int) -> list[BookingResponse]:
        bookings = self.booking_repo.get_by_company(company_id)
        return [BookingResponse.model_validate(b) for b in bookings]

    def get_all(self) -> list[BookingResponse]:
        bookings = self.booking_repo.get_all()
        return [BookingResponse.model_validate(b) for b in bookings]
    
    def get_by_owner(self, company_id: int) -> list[BookingResponse]:
        warehouses = self.warehouse_repo.get_by_company(company_id)
        warehouse_ids = [w.WarehouseID for w in warehouses]
        if not warehouse_ids:
            return []
        bookings = self.booking_repo.get_by_owner_warehouses(warehouse_ids)
        return [BookingResponse.model_validate(b) for b in bookings]

    def update_status(self, booking_id: int, data: BookingStatusUpdate) -> BookingResponse:
        try:
            booking = self.booking_repo.get_by_id(booking_id)
            if not booking:
                raise ValueError("الحجز غير موجود")

            updated = self.booking_repo.update(booking_id, data)
            self.booking_repo.db.commit()

            return BookingResponse.model_validate(updated)

        except ValueError:
            self.booking_repo.db.rollback()
            raise
        except Exception as e:
            self.booking_repo.db.rollback()
            raise ValueError(str(e))
