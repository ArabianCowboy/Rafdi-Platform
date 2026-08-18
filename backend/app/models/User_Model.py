from __future__ import annotations
from typing import TYPE_CHECKING, Optional

from app.models.base_model import Base, TimestampMixin
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.company_model import Company
    from app.models.user_role_model import UserRole
    from app.models.notification_model import Notification

class User(TimestampMixin, Base):

    __tablename__ = "users"
 
    UserID      : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    CompanyID   : Mapped[Optional[int]] = mapped_column(ForeignKey("companies.CompanyID"), nullable=True)
    Email       : Mapped[str]           = mapped_column(String(255), unique=True)
    PasswordHash: Mapped[str]           = mapped_column(String(255))
 
 
    company      : Mapped[Optional["Company"]]  = relationship(back_populates="users")
    user_roles   : Mapped[list["UserRole"]]     = relationship(back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
