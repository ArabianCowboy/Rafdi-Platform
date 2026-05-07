from pydantic import BaseModel
from decimal import Decimal

class DashboardResponse(BaseModel):
    total_companies  : int
    total_warehouses : int
    total_bookings   : int
    total_payments   : Decimal
    active_warehouses: int
