from app.Repo import BookingRepo
from app.Dtos.Booking_DTOs import BookingCreate, BookingUpdate, BookingStatusUpdate, BookingResponse
from app.services.Booking_Services.BookingOverlap_Service import BookingOverlapService
from app.services.Booking_Services.BookingPrice_Service import BookingPriceService

class BookingService:

    def __init__(
        self,
        booking_repo   : BookingRepo,
        overlap_service: BookingOverlapService,
        price_service  : BookingPriceService,
    ):
        self.booking_repo    = booking_repo
        self.overlap_service = overlap_service
        self.price_service   = price_service


    def create(self, data: BookingCreate, renter_company_id: int) -> BookingResponse:

        self.overlap_service.check_overlap(
            data.WarehouseID,
            data.StartDate,
            data.EndDate
        )

        total_price = self.price_service.calculate_price(
            data.WarehouseID,
            data.StartDate,
            data.EndDate
        )

        data.RenterCompanyID = renter_company_id
        data.TotalPrice      = total_price

        booking = self.booking_repo.add(data)
        self.booking_repo.db.commit()

        return BookingResponse.model_validate(booking)


    def get_by_company(self, company_id: int) -> list[BookingResponse]:
        bookings = self.booking_repo.get_by_company(company_id)
        return [BookingResponse.model_validate(b) for b in bookings]

    def get_all(self) -> list[BookingResponse]:
        bookings = self.booking_repo.get_all()
        return [BookingResponse.model_validate(b) for b in bookings]


    def update_status(self, booking_id: int, data: BookingStatusUpdate) -> BookingResponse:
        booking = self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise ValueError("الحجز غير موجود")

        updated = self.booking_repo.update(booking_id, data)
        self.booking_repo.db.commit()

        return BookingResponse.model_validate(updated)