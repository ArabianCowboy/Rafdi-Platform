from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.Dtos.Payment_DTOs import PaymentResponse, ProcessPaymentRequest
from app.Repo.Payment_Repo import PaymentRepo
from app.Repo.Booking_Repo import BookingRepo
from app.services.Payment_Services.Payment_Service import PaymentService
from app.services.Payment_Services.Commission_Service import CommissionService
from app.api.Auth_middleware import get_current_user, require_renter
from app.config import get_db

router = APIRouter(prefix="/payments", tags=["Payments"])


def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    return PaymentService(
        payment_repo       = PaymentRepo(db),
        booking_repo       = BookingRepo(db),
        commission_service = CommissionService(),
    )


@router.post("/", response_model=PaymentResponse)
def process_payment(
    data        : ProcessPaymentRequest,
    service     : PaymentService = Depends(get_payment_service),
    current_user: dict           = Depends(require_renter)
):
    return service.process_payment(
        data.booking_id,
        data.moyasar_payment_id,
        data.moyasar_status,
        data.payment_method
    )


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