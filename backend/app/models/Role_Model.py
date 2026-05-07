from __future__ import annotations
from typing import TYPE_CHECKING

from app.models.Base_Model import Base, TimestampMixin
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.User_Model import User_Role

class Role(TimestampMixin, Base):
    __tablename__ = "roles"
 
    RolesID : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    RoleName: Mapped[str] = mapped_column(String(100), unique=True)
 
    user_roles: Mapped[list["User_Role"]] = relationship(back_populates="role")
