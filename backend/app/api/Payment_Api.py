from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dtos.payment_dtos import BookingPaymentCreate, PaymentResponse
from app.repo.payment_repo import PaymentRepo
from app.repo.booking_repo import BookingRepo
from app.repo.user_repo import UserRepo
from app.repo.warehouse_repo import WarehouseRepo
from app.repo.notification_repo import NotificationRepo
from app.services.payment_services.payment_service import PaymentService
from app.services.payment_services.commission_service import CommissionService
from app.services.notification_services.notification_service import NotificationService
from app.services.notification_services.notification_trigger_service import NotificationTriggerService
from app.api.auth_middleware import get_current_user, require_renter
from app.config import get_db

router = APIRouter(prefix="/payments", tags=["Payments"])


def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    notification_service = NotificationService(NotificationRepo(db))
    return PaymentService(
        payment_repo       = PaymentRepo(db),
        booking_repo       = BookingRepo(db),
        commission_service = CommissionService(),
        notification_trigger = NotificationTriggerService(notification_service),
        user_repo          = UserRepo(db),
        warehouse_repo     = WarehouseRepo(db),
    )


@router.post("/", response_model=PaymentResponse)
def process_payment(
    booking_id         : int,
    moyasar_payment_id : str = None,
    moyasar_status     : str = None,
    payment_method     : str = None,
    service            : PaymentService = Depends(get_payment_service),
    current_user       : dict           = Depends(require_renter)
):
    try:
        return service.process_payment(
            booking_id          = booking_id,
            moyasar_payment_id  = moyasar_payment_id,
            moyasar_status      = moyasar_status,
            payment_method      = payment_method,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/with-booking", response_model=PaymentResponse)
def process_payment_with_booking(
    data               : BookingPaymentCreate,
    moyasar_payment_id : str = None,
    moyasar_status     : str = None,
    payment_method     : str = None,
    service            : PaymentService = Depends(get_payment_service),
    current_user       : dict           = Depends(require_renter)
):
    try:
        return service.process_booking_payment(
            booking_data       = data.booking,
            renter_company_id  = current_user["company_id"],
            moyasar_payment_id = moyasar_payment_id,
            moyasar_status     = moyasar_status,
            payment_method     = payment_method,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{booking_id}", response_model=PaymentResponse)
def get_payment(
    booking_id  : int,
    service     : PaymentService = Depends(get_payment_service),
    current_user: dict           = Depends(get_current_user)
):
    try:
        return service.get_by_booking(booking_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
