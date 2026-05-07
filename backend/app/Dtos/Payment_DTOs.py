from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date
from app.Enums.EnumTypes import PaymentStatusEnum
from app.Dtos.Booking_DTOs import BookingResponse

class PaymentCreate(BaseModel):
    BookingID  : int
    Amount     : Decimal
    PaymentDate: date
    Status     : PaymentStatusEnum = PaymentStatusEnum.pending
 
 
class PaymentUpdate(BaseModel):
    Amount     : Optional[Decimal]           = None
    PaymentDate: Optional[date]              = None
    Status     : Optional[PaymentStatusEnum] = None
 
 
class PaymentResponse(BaseModel):
    PaymentID        : int
    BookingID        : int
    Amount           : Decimal
    commission_amount: Decimal
    net_amount       : Decimal
    PaymentDate      : date
    Status           : PaymentStatusEnum

    model_config = {"from_attributes": True}
