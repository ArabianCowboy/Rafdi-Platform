from __future__ import annotations
from typing import TYPE_CHECKING

from app.models.base_model import Base, TimestampMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.role_model import Role
    from app.models.user_model import User
    
class UserRole(TimestampMixin, Base):
    __tablename__ = "user_roles"
 
    User_Roles_ID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    RolesID      : Mapped[int] = mapped_column(ForeignKey("roles.RolesID"))
    UserID       : Mapped[int] = mapped_column(ForeignKey("users.UserID"))

    role: Mapped["Role"] = relationship(back_populates="user_roles")
    user: Mapped["User"] = relationship(back_populates="user_roles")
