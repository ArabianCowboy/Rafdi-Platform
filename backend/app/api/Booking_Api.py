from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dtos.booking_dtos import BookingCreate, BookingStatusUpdate, BookingResponse
from app.repo.user_repo import UserRepo
from app.repo.booking_repo import BookingRepo
from app.repo.payment_repo import PaymentRepo
from app.repo.warehouse_repo import WarehouseRepo
from app.repo.notification_repo import NotificationRepo
from app.services.booking_services.booking_service import BookingService
from app.services.booking_services.booking_overlap_service import BookingOverlapService
from app.services.booking_services.booking_price_service import BookingPriceService
from app.services.notification_services.notification_service import NotificationService
from app.services.notification_services.notification_trigger_service import NotificationTriggerService
from app.api.auth_middleware import get_current_user, require_renter
from app.config import get_db

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def get_booking_service(db: Session = Depends(get_db)) -> BookingService:
    booking_repo   = BookingRepo(db)
    payment_repo   = PaymentRepo(db)
    warehouse_repo = WarehouseRepo(db)
    user_repo      = UserRepo(db)
    notification_service = NotificationService(NotificationRepo(db))
    return BookingService(
        booking_repo         = booking_repo,
        payment_repo         = payment_repo,
        warehouse_repo       = warehouse_repo,
        user_repo            = user_repo,
        overlap_service      = BookingOverlapService(booking_repo),
        price_service        = BookingPriceService(warehouse_repo),
        notification_trigger = NotificationTriggerService(notification_service),
    )

@router.get("/booked-dates/{warehouse_id}")
def get_booked_dates(
    warehouse_id: int,
    db          : Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user)
):
    booking_repo = BookingRepo(db)
    bookings = booking_repo.get_confirmed_by_warehouse(warehouse_id)
    return [
        {
            "start": b.StartDate.isoformat(),
            "end": b.EndDate.isoformat(),
        }
        for b in bookings
    ]

@router.post("/", response_model=BookingResponse)
def create(
    data        : BookingCreate,
    service     : BookingService = Depends(get_booking_service),
    current_user: dict           = Depends(require_renter)
):
    try:
        return service.create(
            data             = data,
            renter_company_id= current_user["company_id"],
            renter_user_id   = current_user["user_id"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my", response_model=list[BookingResponse])
def get_my_bookings(
    service     : BookingService = Depends(get_booking_service),
    current_user: dict           = Depends(get_current_user)
):
    return service.get_by_company(current_user["company_id"])

@router.get("/owner", response_model=list[BookingResponse])
def get_owner_bookings(
    service     : BookingService = Depends(get_booking_service),
    current_user: dict           = Depends(get_current_user)
):
    return service.get_by_owner(current_user["company_id"])


@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_status(
    booking_id  : int,
    data        : BookingStatusUpdate,
    service     : BookingService = Depends(get_booking_service),
    current_user: dict           = Depends(get_current_user)
):
    try:
        return service.update_status(booking_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))