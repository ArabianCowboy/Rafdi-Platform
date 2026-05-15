from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date
from app.Enums.EnumTypes import PaymentStatusEnum

class PaymentCreate(BaseModel):
    BookingID  : int
    Amount     : Decimal
    PaymentDate: date
    Status     : PaymentStatusEnum = PaymentStatusEnum.pending

class ProcessPaymentRequest(BaseModel):
    booking_id        : int
    moyasar_payment_id: Optional[str] = None
    moyasar_status    : Optional[str] = None
    payment_method    : Optional[str] = None

class PaymentUpdate(BaseModel):
    Amount           : Optional[Decimal]           = None
    PaymentDate      : Optional[date]              = None
    Status           : Optional[PaymentStatusEnum] = None

class PaymentResponse(BaseModel):
    PaymentID        : int
    BookingID        : int
    Amount           : Decimal
    commission_amount: Decimal = Decimal(0)
    net_amount       : Decimal = Decimal(0)
    PaymentDate      : date
    Status           : PaymentStatusEnum
    MoyasarPaymentID : Optional[str] = None
    MoyasarStatus    : Optional[str] = None
    PaymentMethod    : Optional[str] = None

    model_config = {"from_attributes": True}