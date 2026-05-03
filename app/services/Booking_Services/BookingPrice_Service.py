from datetime import date
from decimal import Decimal
from app.Repo import WarehouseRepo


class BookingPriceService:

    def __init__(self, warehouse_repo: WarehouseRepo):
        self.warehouse_repo = warehouse_repo

    def calculate_price(self, warehouse_id: int, start_date: date, end_date: date) -> Decimal:
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("المستودع غير موجود")

        days          = (end_date - start_date).days
        months        = Decimal(days) / Decimal(30)
        total_price   = months * warehouse.PricePerMonth

        return round(total_price, 2)