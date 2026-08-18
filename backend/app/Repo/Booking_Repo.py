from typing import Optional
from sqlalchemy.orm import Session
 
from app.repo.base_repo import BaseRepo
from app.models import Booking
from app.dtos.booking_dtos import BookingCreate, BookingStatusUpdate
from app.models.booking_model import BookingStatusEnum

class BookingRepo(BaseRepo[Booking]):
 
    def __init__(self, db: Session):
        super().__init__(db)
 
    def get_by_id(self, id: int) -> Optional[Booking]:
        return self.db.query(Booking).filter(Booking.BookingID == id).first()
 
    def get_all(self) -> list[Booking]:
        return self.db.query(Booking).all()
 
    def get_by_company(self, company_id: int) -> list[Booking]:
        return self.db.query(Booking).filter(Booking.RenterCompanyID == company_id).all()
    
    def get_by_owner_warehouses(self, warehouse_ids: list[int]) -> list[Booking]:
        return self.db.query(Booking).filter(
        Booking.WarehouseID.in_(warehouse_ids)
    ).all()
 
    def add(self, obj: BookingCreate) -> Booking:
        booking = Booking(
            WarehouseID     = obj.WarehouseID,
            RenterCompanyID = obj.RenterCompanyID,
            StartDate       = obj.StartDate,
            EndDate         = obj.EndDate,
            TotalPrice      = obj.TotalPrice,
            Status          = obj.Status,
        )
        self.db.add(booking)
        self.db.flush()
        self.db.refresh(booking)
        return booking
 
    def update(self, id: int, obj: BookingStatusUpdate) -> Optional[Booking]:
        booking = self.get_by_id(id)
        if not booking:
            return None
        booking.Status = obj.Status
        self.db.commit()
        self.db.refresh(booking)
        return booking
 
    def delete(self, id: int) -> None:
        booking = self.get_by_id(id)
        if booking:
            self.db.delete(booking)
            self.db.commit()

    def check_overlap(self, warehouse_id: int, start_date, end_date) -> bool:
        
        overlap = self.db.query(Booking).filter(
            Booking.WarehouseID == warehouse_id,
            Booking.Status      == BookingStatusEnum.confirmed,
            Booking.StartDate   <= end_date,
            Booking.EndDate     >= start_date,
        ).first()
        return overlap is not None
    
    def get_confirmed_by_warehouse(self, warehouse_id: int) -> list[Booking]:
        return self.db.query(Booking).filter(
        Booking.WarehouseID == warehouse_id,
        Booking.Status      == BookingStatusEnum.confirmed
    ).all()
