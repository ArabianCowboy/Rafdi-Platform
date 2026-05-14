from __future__ import annotations
from typing import TYPE_CHECKING, Optional

from app.models.Base_Model import Base, TimestampMixin
from sqlalchemy import Date, Numeric, Enum, ForeignKey, DECIMAL, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.Enums.EnumTypes import PaymentStatusEnum

if TYPE_CHECKING:
    from app.models.Booking_Model import Booking
    
class Payment(TimestampMixin, Base):
    __tablename__ = "payments"
 
    PaymentID        : Mapped[int]                  = mapped_column(primary_key=True, autoincrement=True)
    BookingID        : Mapped[int]                  = mapped_column(ForeignKey("bookings.BookingID"))
    Amount           : Mapped[DECIMAL]              = mapped_column(Numeric(10, 2))
    PaymentDate      : Mapped[Date]                 = mapped_column(Date)
    Status           : Mapped[PaymentStatusEnum]    = mapped_column(Enum(PaymentStatusEnum), default=PaymentStatusEnum.pending)
    MoyasarPaymentID : Mapped[Optional[str]]        = mapped_column(String(100), nullable=True)
    MoyasarStatus    : Mapped[Optional[str]]        = mapped_column(String(50), nullable=True)
    PaymentMethod    : Mapped[Optional[str]]        = mapped_column(String(50), nullable=True)
 
    booking: Mapped["Booking"] = relationship(back_populates="payments")