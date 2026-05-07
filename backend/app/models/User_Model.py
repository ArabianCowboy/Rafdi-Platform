from __future__ import annotations
from typing import TYPE_CHECKING, Optional

from app.models.Base_Model import Base, TimestampMixin
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.Company_Model import Company
    from app.models.User_Role_Model import User_Role
    from app.models.Notification_Model import Notification

class User(TimestampMixin, Base):

    __tablename__ = "users"
 
    UserID      : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    CompanyID   : Mapped[Optional[int]] = mapped_column(ForeignKey("companies.CompanyID"), nullable=True)
    Email       : Mapped[str]           = mapped_column(String(255), unique=True)
    PasswordHash: Mapped[str]           = mapped_column(String(255))
 
 
    company      : Mapped[Optional["Company"]]  = relationship(back_populates="users")
    user_roles   : Mapped[list["User_Role"]]     = relationship(back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
