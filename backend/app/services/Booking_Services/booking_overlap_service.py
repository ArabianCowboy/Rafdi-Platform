from datetime import date
from app.repo.booking_repo import BookingRepo
 
 
class BookingOverlapService:

    def __init__(self, booking_repo: BookingRepo):
        self.booking_repo = booking_repo
 
    def check_overlap(self, warehouse_id: int, start_date: date, end_date: date) -> None:
        existing_bookings = self.booking_repo.get_confirmed_by_warehouse(warehouse_id)
 
        for booking in existing_bookings:
            if not (end_date <= booking.StartDate or start_date >= booking.EndDate):
                raise ValueError("التواريخ المحددة غير متاحة — يوجد حجز مؤكد في نفس الفترة")
