from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.Dtos.Notification_DTOs import NotificationResponse
from app.Repo.Notification_Repo import NotificationRepo
from app.api.Auth_middleware import get_current_user
from app.config import get_db
from app.services.Notification_Services.Notification_Service import NotificationService


router = APIRouter(prefix="/notifications", tags=["Notifications"])


def get_notification_service(db: Session = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepo(db))


@router.get("", response_model=list[NotificationResponse])
def get_notifications(
    service: NotificationService = Depends(get_notification_service),
    current_user: dict = Depends(get_current_user),
):
    return service.get_by_user(current_user["user_id"])


@router.patch("/read-all")
def mark_all_notifications_read(
    service: NotificationService = Depends(get_notification_service),
    current_user: dict = Depends(get_current_user),
):
    service.mark_all_read(current_user["user_id"])
    return {"message": "تم تعليم جميع الإشعارات كمقروءة"}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    service: NotificationService = Depends(get_notification_service),
    current_user: dict = Depends(get_current_user),
):
    try:
        return service.mark_as_read(notification_id, current_user["user_id"])
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
