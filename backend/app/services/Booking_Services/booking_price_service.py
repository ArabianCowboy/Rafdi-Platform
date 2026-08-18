from datetime import date
from decimal import Decimal
from app.repo.warehouse_repo import WarehouseRepo


def calculate_days(start: date, end: date) -> Decimal:
    return Decimal((end - start).days)


class BookingPriceService:

    def __init__(self, warehouse_repo: WarehouseRepo):
        self.warehouse_repo = warehouse_repo

    def calculate_price(self, warehouse_id: int, start_date: date, end_date: date) -> Decimal:
        warehouse = self.warehouse_repo.get_by_id(warehouse_id)
        if not warehouse:
            raise ValueError("المستودع غير موجود")

        days        = calculate_days(start_date, end_date)
        total_price = days * Decimal(warehouse.PricePerDay)

        return round(total_price, 2)