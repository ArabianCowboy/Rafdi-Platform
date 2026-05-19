from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional

class DashboardResponse(BaseModel):
    total_companies  : int
    total_warehouses : int
    total_bookings   : int
    total_payments   : Decimal
    active_warehouses: int


class AdminCompanyResponse(BaseModel):
    CompanyID                  : int
    Name                       : str
    CommercialRegistration    : str
    Status                     : bool
    CreatedAt                  : datetime
    total_users                : int
    total_warehouses           : int
    total_bookings_as_renter   : int
    total_bookings_on_warehouses: int

    model_config = {"from_attributes": True}


class AdminUserResponse(BaseModel):
    UserID     : int
    CompanyID  : Optional[int] = None
    Email      : str
    CompanyName: Optional[str] = None
    Roles      : list[str]

    model_config = {"from_attributes": True}
