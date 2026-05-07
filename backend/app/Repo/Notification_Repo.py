from typing import Optional
from sqlalchemy.orm import Session
 
from app.Repo.Base_Repo import BaseRepo
from app.models import Notification
from app.Dtos.Notification_DTOs import NotificationCreate, NotificationUpdate

class NotificationRepo(BaseRepo[Notification]):
 
    def __init__(self, db: Session):
        super().__init__(db)
 
    def get_by_id(self, id: int) -> Optional[Notification]:
        return self.db.query(Notification).filter(Notification.NotificationID == id).first()
 
    def get_all(self) -> list[Notification]:
        return self.db.query(Notification).all()
 
    def get_by_user(self, user_id: int) -> list[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.UserID == user_id)
            .order_by(Notification.NotificationID.desc())
            .all()
        )
 
    def add(self, obj: NotificationCreate) -> Notification:
        notification = Notification(
            UserID  = obj.UserID,
            Type    = obj.Type,
            Message = obj.Message,
            IsRead  = obj.IsRead,
        )
        self.db.add(notification)
        self.db.flush()
        self.db.refresh(notification)
        return notification
 
    def update(self, id: int, obj: NotificationUpdate) -> Optional[Notification]:
        notification = self.get_by_id(id)

        if not notification:
            return None
        
        if obj.IsRead  is not None: 
            notification.IsRead = obj.IsRead

        if obj.Type: 
            notification.Type = obj.Type

        if obj.Message: 
            notification.Message = obj.Message
            
        self.db.commit()
        self.db.refresh(notification)
        return notification
 
    def mark_all_read(self, user_id: int) -> None:
        self.db.query(Notification).filter(
            Notification.UserID == user_id,
            Notification.IsRead == False
        ).update({"IsRead": True})
        self.db.commit()
 
    def delete(self, id: int) -> None:
        notification = self.get_by_id(id)
        if notification:
            self.db.delete(notification)
            self.db.commit()
