from app.Repo import Payment_Repo
from app.Dtos.Payment_DTOs import PaymentResponse
from app.services.Payment_Services.Commission_Service import CommissionService
from app.models.Booking_Model import BookingStatusEnum
from app.models.Payment_Model import PaymentStatusEnum
from app.Repo import Booking_Repo


class PaymentService:

    def __init__(
        self,
        payment_repo      : Payment_Repo,
        booking_repo      : Booking_Repo,
        commission_service: CommissionService,
    ):
        self.payment_repo       = payment_repo
        self.booking_repo       = booking_repo
        self.commission_service = commission_service

    def process_payment(self, booking_id: int) -> PaymentResponse:
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

            commission     = self.commission_service.calculate(booking.TotalPrice)
            payment.Amount = commission["total_amount"]
            payment.Status = PaymentStatusEnum.paid

            booking.Status = BookingStatusEnum.confirmed

            self.payment_repo.db.commit()

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
