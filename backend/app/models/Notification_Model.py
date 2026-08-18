from __future__ import annotations
from typing import TYPE_CHECKING

from app.models.base_model import Base, TimestampMixin
from sqlalchemy import String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.enums.enum_types import NotificationTypeEnum

if TYPE_CHECKING:
    from app.models.user_model import User
    
class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
 
    NotificationID: Mapped[int]                  = mapped_column(primary_key=True, autoincrement=True)
    UserID        : Mapped[int]                  = mapped_column(ForeignKey("users.UserID"))
    Type          : Mapped[NotificationTypeEnum] = mapped_column(Enum(NotificationTypeEnum))
    Message       : Mapped[str]                  = mapped_column(String(500))
    IsRead        : Mapped[bool]                 = mapped_column(Boolean, default=False)
 
 
    user: Mapped["User"] = relationship(back_populates="notifications")
