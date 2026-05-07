from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from app.Dtos.Company_DTOs import CompanyResponse

class WarehouseCreate(BaseModel):
    CompanyID    : int
    Name         : str
    Location     : str
    Size         : int
    PricePerMonth: Decimal
    Description  : Optional[str] = None
    IsActive     : bool = True
    ImagePath    : Optional[str] = None
 
 
class WarehouseUpdate(BaseModel):
    Name         : Optional[str]     = None
    Location     : Optional[str]     = None
    Size         : Optional[int]     = None
    PricePerMonth: Optional[Decimal] = None
    Description  : Optional[str]     = None
    IsActive     : Optional[bool]    = None
    ImagePath    : Optional[str]     = None
 
 
class WarehouseResponse(BaseModel):
    WarehouseID  : int
    CompanyID    : int
    Name         : str
    Location     : str
    Size         : int
    PricePerMonth: Decimal
    Description  : Optional[str] = None
    IsActive     : bool
    ImagePath    : Optional[str] = None
    company      : Optional[CompanyResponse] = None
 
    model_config = {"from_attributes": True}

class WarehouseToggleResponse(BaseModel):
    WarehouseID: int
    IsActive   : bool

    model_config = {"from_attributes": True}
