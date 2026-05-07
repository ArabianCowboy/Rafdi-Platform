from datetime import date
from decimal import Decimal
from app.Repo import WarehouseRepo
import calendar

def calculate_months(start: date, end: date) -> Decimal:

    months = (end.year - start.year) * 12 + (end.month - start.month)

    if end.day < start.day:
        months -= 1

    last_month_days = calendar.monthrange(end.year, end.month)[1]
    remaining_days = (end.day - start.day) % last_month_days

    fraction = Decimal(remaining_days) / Decimal(last_month_days)

    return Decimal(months) + fraction

class BookingPriceService:

    def __init__(self, warehouse_repo: WarehouseRepo):
        self.warehouse_repo = warehouse_repo

    def calculate_price(self, warehouse_id: int, start_date: date, end_date: date) -> Decimal:
        
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("المستودع غير موجود")
        
        months        = calculate_months(start_date, end_date)
        total_price   = months * warehouse.PricePerMonth

        return round(total_price, 2)
