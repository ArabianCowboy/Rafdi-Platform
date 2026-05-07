from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
 
class Base(DeclarativeBase):
    pass
class TimestampMixin:
    CreatedAt: Mapped[datetime]           = mapped_column(DateTime, server_default=func.now())
    UpdatedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now(), nullable=True)
