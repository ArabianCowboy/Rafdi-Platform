from __future__ import annotations
from typing import TYPE_CHECKING

from app.models.base_model import Base,TimestampMixin
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.user_model import User
    from app.models.warehouse_model import Warehouse
    from app.models.booking_model import Booking
    

class Company(TimestampMixin, Base):
    __tablename__ = "companies"
 
    CompanyID             : Mapped[int]  = mapped_column(primary_key=True, autoincrement=True)
    Name                  : Mapped[str]  = mapped_column(String(255))
    CommercialRegistration: Mapped[str]  = mapped_column(String(50), unique=True)
    Status                : Mapped[bool] = mapped_column(Boolean, default=True)
 
    users     : Mapped[list["User"]]      = relationship(back_populates="company")
    warehouses: Mapped[list["Warehouse"]] = relationship(back_populates="company")
    bookings  : Mapped[list["Booking"]]   = relationship(back_populates="renter_company",foreign_keys="Booking.RenterCompanyID")
