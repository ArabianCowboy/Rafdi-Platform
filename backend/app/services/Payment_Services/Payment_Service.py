from app.Repo import Payment_Repo
from app.Dtos.Payment_DTOs import PaymentResponse
from app.services.Payment_Services.Commission_Service import CommissionService
from app.models.Booking_Model import BookingStatusEnum
from app.models.Payment_Model import PaymentStatusEnum
from app.Repo import Booking_Repo, UserRepo
from app.Repo.WarehouseRepo import WarehouseRepo
from app.services.Notification_Services.NotificationTrigger_Service import NotificationTriggerService


class PaymentService:

    def __init__(
        self,
        payment_repo      : Payment_Repo,
        booking_repo      : Booking_Repo,
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

    def get_all(self) -> list[PaymentResponse]:
        payments = self.payment_repo.get_all()
        return [PaymentResponse.model_validate(p) for p in payments]
