from __future__ import annotations
from typing import TYPE_CHECKING, Optional

from app.models.base_model import Base, TimestampMixin
from sqlalchemy import String, Boolean, Text, Numeric, ForeignKey,DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.company_model import Company
    from app.models.booking_model import Booking
    
class Warehouse(TimestampMixin, Base):
    __tablename__ = "warehouses"
 
    WarehouseID  : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    CompanyID    : Mapped[int]           = mapped_column(ForeignKey("companies.CompanyID"))
    Name         : Mapped[str]           = mapped_column(String(255))
    Location     : Mapped[str]           = mapped_column(String(255))
    Size         : Mapped[int]
    PricePerDay: Mapped[DECIMAL]       = mapped_column(Numeric(10, 2))
    Description  : Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    IsActive     : Mapped[bool]          = mapped_column(Boolean, default=True)
    ImagePath    : Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
 
    company : Mapped["Company"]       = relationship(back_populates="warehouses")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="warehouse")
