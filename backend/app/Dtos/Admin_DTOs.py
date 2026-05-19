from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

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
