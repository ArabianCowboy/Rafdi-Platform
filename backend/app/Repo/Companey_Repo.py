from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func


from app.Repo.Base_Repo import BaseRepo
from app.models import Company
from app.Dtos.Company_DTOs import CompanyUpdate
from app.Dtos.Auth_DTOs import RegisterCreate

from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.User_Model import User


class CompanyRepo(BaseRepo[Company]):

    def __init__(self, db: Session):
        super().__init__(db)


    def get_by_id(self, id: int) -> Optional[Company]:
        return self.db.query(Company).filter(Company.CompanyID == id).first()
    
    def get_by_company_id(self, company_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.CompanyID == company_id).first()

    def get_all(self) -> list[Company]:
        return self.db.query(Company).all()

    def get_all_admin(self) -> list[dict]:
        from app.models import User, Warehouse, Booking

        user_counts = (
            self.db.query(
                User.CompanyID.label("CompanyID"),
                func.count(User.UserID).label("total_users"),
            )
            .group_by(User.CompanyID)
            .subquery()
        )

        warehouse_counts = (
            self.db.query(
                Warehouse.CompanyID.label("CompanyID"),
                func.count(Warehouse.WarehouseID).label("total_warehouses"),
            )
            .group_by(Warehouse.CompanyID)
            .subquery()
        )

        renter_booking_counts = (
            self.db.query(
                Booking.RenterCompanyID.label("CompanyID"),
                func.count(Booking.BookingID).label("total_bookings_as_renter"),
            )
            .group_by(Booking.RenterCompanyID)
            .subquery()
        )

        warehouse_booking_counts = (
            self.db.query(
                Warehouse.CompanyID.label("CompanyID"),
                func.count(Booking.BookingID).label("total_bookings_on_warehouses"),
            )
            .join(Booking, Booking.WarehouseID == Warehouse.WarehouseID)
            .group_by(Warehouse.CompanyID)
            .subquery()
        )

        rows = (
            self.db.query(
                Company.CompanyID,
                Company.Name,
                Company.CommercialRegistration,
                Company.Status,
                Company.CreatedAt,
                func.coalesce(user_counts.c.total_users, 0).label("total_users"),
                func.coalesce(warehouse_counts.c.total_warehouses, 0).label("total_warehouses"),
                func.coalesce(
                    renter_booking_counts.c.total_bookings_as_renter,
                    0,
                ).label("total_bookings_as_renter"),
                func.coalesce(
                    warehouse_booking_counts.c.total_bookings_on_warehouses,
                    0,
                ).label("total_bookings_on_warehouses"),
            )
            .outerjoin(user_counts, user_counts.c.CompanyID == Company.CompanyID)
            .outerjoin(warehouse_counts, warehouse_counts.c.CompanyID == Company.CompanyID)
            .outerjoin(renter_booking_counts, renter_booking_counts.c.CompanyID == Company.CompanyID)
            .outerjoin(warehouse_booking_counts, warehouse_booking_counts.c.CompanyID == Company.CompanyID)
            .order_by(Company.CreatedAt.desc())
            .all()
        )

        return [
            {
                "CompanyID": row.CompanyID,
                "Name": row.Name,
                "CommercialRegistration": row.CommercialRegistration,
                "Status": row.Status,
                "CreatedAt": row.CreatedAt,
                "total_users": row.total_users,
                "total_warehouses": row.total_warehouses,
                "total_bookings_as_renter": row.total_bookings_as_renter,
                "total_bookings_on_warehouses": row.total_bookings_on_warehouses,
            }
            for row in rows
        ]

    def get_by_commercial_registration(self, CommercialRegistration: str) -> Optional[Company]:
        return self.db.query(Company).filter(Company.CommercialRegistration == CommercialRegistration).first()

    def add(self, obj: RegisterCreate) -> Company:
        company = Company(
            Name                   = obj.company_name,
            CommercialRegistration = obj.commercial_registration,
            Status                 = True
        )
        self.db.add(company)
        self.db.flush()
        self.db.refresh(company)
        return company

    def update(self, id: int, obj: CompanyUpdate) -> Optional[Company]:
        company = self.get_by_id(id)
        
        if not company:
            return None
        
        if obj.Name:
            company.Name = obj.Name

        if obj.CommercialRegistration:
            company.CommercialRegistration = obj.CommercialRegistration

        self.db.commit()
        self.db.refresh(company)
        return company

    def delete(self, id: int) -> None:
        company = self.get_by_id(id)
        if company:
            self.db.delete(company)
            self.db.commit()
