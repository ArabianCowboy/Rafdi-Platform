from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.Dtos.Booking_DTOs import BookingCreate, BookingStatusUpdate, BookingResponse
from app.Repo.user_repo import UserRepo
from app.Repo.Booking_Repo import BookingRepo
from app.Repo.Payment_Repo import PaymentRepo
from app.Repo.WarehouseRepo import WarehouseRepo
from app.Repo.Notification_Repo import NotificationRepo
from app.services.Booking_Services.Booking_Service import BookingService
from app.services.Booking_Services.BookingOverlap_Service import BookingOverlapService
from app.services.Booking_Services.BookingPrice_Service import BookingPriceService
from app.services.Notification_Services.Notification_Service import NotificationService
from app.services.Notification_Services.NotificationTrigger_Service import NotificationTriggerService
from app.api.Auth_middleware import get_current_user, require_renter
from app.config import get_db

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# Build the booking service by wiring the repos and helper services together.
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


# Create a new booking. Only renter accounts can use this endpoint.
@router.post("/", response_model=BookingResponse)
def create(
    data        : BookingCreate,
    service     : BookingService = Depends(get_booking_service),
    current_user: dict           = Depends(require_renter)
): 
    try:
        # Use the authenticated user's IDs instead of trusting client input.
        return service.create(
            data             = data,
            renter_company_id= current_user["company_id"],
            renter_user_id   = current_user["user_id"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="حدث خطأ أثناء إنشاء الحجز")


# Return bookings for the logged-in user's company.
@router.get("/my", response_model=list[BookingResponse])
def get_my_bookings(
    service     : BookingService = Depends(get_booking_service),
    current_user: dict           = Depends(get_current_user)
):
    try:
        return service.get_by_company(current_user["company_id"])
    except Exception:
        raise HTTPException(status_code=500, detail="حدث خطأ أثناء جلب الحجوزات")


# Update the status of one booking using the booking ID from the URL.
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
    except Exception:
        raise HTTPException(status_code=500, detail="حدث خطأ أثناء تحديث حالة الحجز")
