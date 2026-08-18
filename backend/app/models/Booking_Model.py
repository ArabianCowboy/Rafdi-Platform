from __future__ import annotations
from typing import TYPE_CHECKING

from app.models.base_model import Base,TimestampMixin
from sqlalchemy import Date, Numeric, Enum, ForeignKey, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.enums.enum_types import BookingStatusEnum

if TYPE_CHECKING:
    from app.models.warehouse_model import Warehouse
    from app.models.company_model import Company
    from app.models.payment_model import Payment

class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"
 
    BookingID      : Mapped[int]               = mapped_column(primary_key=True, autoincrement=True)
    WarehouseID    : Mapped[int]               = mapped_column(ForeignKey("warehouses.WarehouseID"))
    RenterCompanyID: Mapped[int]               = mapped_column(ForeignKey("companies.CompanyID"))
    StartDate      : Mapped[Date]              = mapped_column(Date)
    EndDate        : Mapped[Date]              = mapped_column(Date)
    TotalPrice     : Mapped[DECIMAL]           = mapped_column(Numeric(10, 2))
    Status         : Mapped[BookingStatusEnum] = mapped_column(Enum(BookingStatusEnum), default=BookingStatusEnum.pending)
 
    warehouse     : Mapped["Warehouse"]     = relationship(back_populates="bookings")
    renter_company: Mapped["Company"]       = relationship(back_populates="bookings", foreign_keys=[RenterCompanyID])
    payments      : Mapped[list["Payment"]] = relationship(back_populates="booking")
