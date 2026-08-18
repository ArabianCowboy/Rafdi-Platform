from app.repo.payment_repo import PaymentRepo
from datetime import date
from decimal import Decimal

from app.dtos.booking_dtos import BookingCreate
from app.dtos.payment_dtos import PaymentCreate, PaymentResponse
from app.services.payment_services.commission_service import CommissionService
from app.models.booking_model import BookingStatusEnum
from app.models.payment_model import PaymentStatusEnum
from app.repo.booking_repo import BookingRepo
from app.repo.user_repo import UserRepo
from app.repo.warehouse_repo import WarehouseRepo
from app.services.notification_services.notification_trigger_service import NotificationTriggerService


class PaymentService:

    def __init__(
        self,
        payment_repo      : PaymentRepo,
        booking_repo      : BookingRepo,
        commission_service: CommissionService,
        notification_trigger: NotificationTriggerService,
        user_repo: UserRepo,
        warehouse_repo: WarehouseRepo,
    ):
        self.payment_repo       = payment_repo
        self.booking_repo       = booking_repo
        self.commission_service = commission_service
        self.notification_trigger = notification_trigger
        self.user_repo = user_repo
        self.warehouse_repo = warehouse_repo

    def process_payment(
        self,
        booking_id       : int,
        moyasar_payment_id: str = None,
        moyasar_status   : str = None,
        payment_method   : str = None,
    ) -> PaymentResponse:
        try:
            booking = self.booking_repo.get_by_id(booking_id)
            if not booking:
                raise ValueError("الحجز غير موجود")
            if booking.Status != BookingStatusEnum.pending:
                raise ValueError("الحجز غير متاح للدفع")

            payment = self.payment_repo.get_by_booking(booking_id)
            if not payment:
                raise ValueError("لا يوجد دفع معلق لهذا الحجز")
            if payment.Status == PaymentStatusEnum.paid:
                raise ValueError("تم الدفع مسبقاً")

            commission            = self.commission_service.calculate(booking.TotalPrice)
            payment.Amount        = commission["total_amount"]
            payment.Status        = PaymentStatusEnum.paid
            payment.MoyasarPaymentID = moyasar_payment_id
            payment.MoyasarStatus    = moyasar_status
            payment.PaymentMethod    = payment_method

            booking.Status = BookingStatusEnum.confirmed

            self.payment_repo.db.commit()

            try:
                renter_user = self.user_repo.get_by_company_id(booking.RenterCompanyID)
                warehouse = self.warehouse_repo.get_by_id(booking.WarehouseID)
                owner_user = self.user_repo.get_by_company_id(warehouse.CompanyID) if warehouse else None

                if renter_user and warehouse:
                    self.notification_trigger.on_booking_confirmed(
                        renter_user.UserID,
                        warehouse.Name,
                    )

                if renter_user and owner_user:
                    self.notification_trigger.on_payment_success(
                        renter_user.UserID,
                        owner_user.UserID,
                        str(booking.TotalPrice),
                    )
            except Exception:
                pass

            return PaymentResponse.model_validate(payment)

        except ValueError:
            self.payment_repo.db.rollback()
            raise
        except Exception as e:
            self.payment_repo.db.rollback()
            raise ValueError(str(e))

    def get_by_booking(self, booking_id: int) -> PaymentResponse:
        payment = self.payment_repo.get_by_booking(booking_id)
        if not payment:
            raise ValueError("لا يوجد دفع لهذا الحجز")

        commission = self.commission_service.calculate(
            self.booking_repo.get_by_id(booking_id).TotalPrice
        )

        response                   = PaymentResponse.model_validate(payment)
        response.commission_amount = commission["renter_commission"]
        response.net_amount        = commission["net_amount"]

        return response

    def process_booking_payment(
        self,
        booking_data: BookingCreate,
        renter_company_id: int,
        moyasar_payment_id: str = None,
        moyasar_status: str = None,
        payment_method: str = None,
    ) -> PaymentResponse:
        try:
            if booking_data.EndDate <= booking_data.StartDate:
                raise ValueError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية")

            warehouse = self.warehouse_repo.get_by_id(booking_data.WarehouseID)
            if not warehouse:
                raise ValueError("المستودع غير موجود")
            if not warehouse.IsActive:
                raise ValueError("المستودع غير متاح للحجز")
            if self.booking_repo.check_overlap(
                booking_data.WarehouseID,
                booking_data.StartDate,
                booking_data.EndDate,
            ):
                raise ValueError("التواريخ المحددة غير متاحة")

            days = Decimal((booking_data.EndDate - booking_data.StartDate).days)
            base_amount = round(days * Decimal(warehouse.PricePerDay), 2)
            commission = self.commission_service.calculate(base_amount)

            booking_data.RenterCompanyID = renter_company_id
            booking_data.TotalPrice = base_amount
            booking_data.Status = BookingStatusEnum.confirmed
            booking = self.booking_repo.add(booking_data)

            payment = self.payment_repo.add(PaymentCreate(
                BookingID=booking.BookingID,
                Amount=commission["total_amount"],
                PaymentDate=date.today(),
                Status=PaymentStatusEnum.paid,
            ))
            payment.MoyasarPaymentID = moyasar_payment_id
            payment.MoyasarStatus = moyasar_status
            payment.PaymentMethod = payment_method

            self.payment_repo.db.commit()
            self.payment_repo.db.refresh(payment)

            try:
                renter_user = self.user_repo.get_by_company_id(booking.RenterCompanyID)
                owner_user = self.user_repo.get_by_company_id(warehouse.CompanyID)

                if renter_user:
                    self.notification_trigger.on_booking_confirmed(
                        renter_user.UserID,
                        warehouse.Name,
                    )

                if renter_user and owner_user:
                    self.notification_trigger.on_payment_success(
                        renter_user.UserID,
                        owner_user.UserID,
                        str(base_amount),
                    )
            except Exception:
                pass

            response = PaymentResponse.model_validate(payment)
            response.commission_amount = commission["renter_commission"]
            response.net_amount = commission["net_amount"]
            return response

        except ValueError:
            self.payment_repo.db.rollback()
            raise
        except Exception as e:
            self.payment_repo.db.rollback()
            raise ValueError(str(e))

    def get_all(self) -> list[PaymentResponse]:
        payments = self.payment_repo.get_all()
        return [PaymentResponse.model_validate(p) for p in payments]
