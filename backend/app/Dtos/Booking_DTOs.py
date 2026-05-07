from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date
from app.Dtos.Company_DTOs import CompanyResponse
from app.Dtos.Warehouse_DTOs import WarehouseResponse
from app.Enums.EnumTypes import BookingStatusEnum

class BookingCreate(BaseModel):
    WarehouseID    : int
    RenterCompanyID: int
    StartDate      : date
    EndDate        : date
    TotalPrice     : Decimal
    Status         : BookingStatusEnum = BookingStatusEnum.pending
 
 
class BookingUpdate(BaseModel):
    StartDate : Optional[date]              = None
    EndDate   : Optional[date]              = None
    TotalPrice: Optional[Decimal]           = None
    Status    : Optional[BookingStatusEnum] = None
 
 
class BookingResponse(BaseModel):
    BookingID      : int
    WarehouseID    : int
    RenterCompanyID: int
    StartDate      : date
    EndDate        : date
    TotalPrice     : Decimal
    Status         : BookingStatusEnum
    warehouse      : Optional[WarehouseResponse] = None
    renter_company : Optional[CompanyResponse]   = None
 
    model_config = {"from_attributes": True}

class BookingStatusUpdate(BaseModel):
    Status: BookingStatusEnum
