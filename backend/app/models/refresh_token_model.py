from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user_model import User


class RefreshToken(TimestampMixin, Base):
    __tablename__ = "refresh_tokens"

    TokenID  : Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    UserID   : Mapped[int]      = mapped_column(ForeignKey("users.UserID"))
    Token    : Mapped[str]      = mapped_column(String(500), unique=True)
    ExpiresAt: Mapped[datetime] = mapped_column(DateTime)

    user: Mapped["User"] = relationship()