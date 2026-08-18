from __future__ import annotations

from decimal import Decimal
from typing import Optional, TYPE_CHECKING

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.repo.base_repo import BaseRepo
from app.models import Company
from app.dtos.company_dtos import CompanyUpdate
from app.dtos.auth_dtos import RegisterCreate

if TYPE_CHECKING:
    from app.models.user_model import User


class CompanyRepo(BaseRepo[Company]):

    def __init__(self, db: Session):
        super().__init__(db)


    def get_by_id(self, id: int) -> Optional[Company]:
        return self.db.query(Company).filter(Company.CompanyID == id).first()
    
    def get_by_company_id(self, company_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.CompanyID == company_id).first()

    def get_all(self) -> list[Company]:
        return self.db.query(Company).all()

    def get_dashboard_stats(self) -> dict:
        from app.models import Booking, Payment, Warehouse

        total_companies = select(func.count(Company.CompanyID)).scalar_subquery()
        total_warehouses = select(func.count(Warehouse.WarehouseID)).scalar_subquery()
        active_warehouses = (
            select(func.count(Warehouse.WarehouseID))
            .where(Warehouse.IsActive == True)
            .scalar_subquery()
        )
        total_bookings = select(func.count(Booking.BookingID)).scalar_subquery()
        # Keep the existing DTO name even though this is total revenue from payments.
        total_payments = select(func.coalesce(func.sum(Payment.Amount), 0)).scalar_subquery()

        row = self.db.execute(
            select(
                total_companies.label("total_companies"),
                total_warehouses.label("total_warehouses"),
                total_bookings.label("total_bookings"),
                total_payments.label("total_payments"),
                active_warehouses.label("active_warehouses"),
            )
        ).one()

        return {
            "total_companies": row.total_companies,
            "total_warehouses": row.total_warehouses,
            "total_bookings": row.total_bookings,
            "total_payments": row.total_payments or Decimal("0.00"),
            "active_warehouses": row.active_warehouses,
        }

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

    def update_status(self, id: int, status: bool) -> Optional[Company]:
        company = self.get_by_id(id)
        if not company:
            return None

        company.Status = status
        self.db.commit()
        self.db.refresh(company)
        return company

    def delete(self, id: int) -> None:
        company = self.get_by_id(id)
        if company:
            self.db.delete(company)
            self.db.commit()
