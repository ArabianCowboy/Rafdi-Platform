from app.Repo.Notification_Repo import NotificationRepo
from app.Dtos.Notification_DTOs import NotificationCreate, NotificationResponse
from app.Enums.EnumTypes import NotificationTypeEnum


class NotificationService:

    def __init__(self, notification_repo: NotificationRepo):
        self.notification_repo = notification_repo


    def send(self, user_id: int, type: NotificationTypeEnum, message: str) -> NotificationResponse:
        notification = self.notification_repo.add(NotificationCreate(
            UserID  = user_id,
            Type    = type,
            Message = message,
            IsRead  = False,
        ))
        self.notification_repo.db.commit()
        return NotificationResponse.model_validate(notification)


    def get_by_user(self, user_id: int) -> list[NotificationResponse]:
        notifications = self.notification_repo.get_by_user(user_id)
        return [NotificationResponse.model_validate(n) for n in notifications]

    def mark_as_read(self, notification_id: int, user_id: int) -> NotificationResponse:
        notification = self.notification_repo.get_by_id(notification_id)
        if not notification:
            raise LookupError("الإشعار غير موجود")
        if notification.UserID != user_id:
            raise PermissionError("ما عندك صلاحية لهذا الإشعار")

        notification.IsRead = True
        self.notification_repo.db.commit()
        return NotificationResponse.model_validate(notification)

    def mark_all_read(self, user_id: int) -> None:
        self.notification_repo.mark_all_read(user_id)
