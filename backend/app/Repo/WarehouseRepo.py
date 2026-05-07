from typing import Optional
from sqlalchemy.orm import Session

from app.Repo.Base_Repo import BaseRepo
from app.models import Warehouse
from app.Dtos.Warehouse_DTOs import WarehouseCreate, WarehouseUpdate


class WarehouseRepo(BaseRepo[Warehouse]):

    def __init__(self, db: Session):
        super().__init__(db)

    def get_by_id(self, id: int) -> Optional[Warehouse]:
        return self.db.query(Warehouse).filter(Warehouse.WarehouseID == id).first()

    def get_all(self) -> list[Warehouse]:
        return self.db.query(Warehouse).filter(Warehouse.IsActive == True).all()

    def get_all_admin(self) -> list[Warehouse]:
        return self.db.query(Warehouse).all()

    def get_by_company(self, company_id: int) -> list[Warehouse]:
        return self.db.query(Warehouse).filter(Warehouse.CompanyID == company_id).all()

    def add(self, obj: WarehouseCreate) -> Warehouse:
        warehouse = Warehouse(
            CompanyID     = obj.CompanyID,
            Name          = obj.Name,
            Location      = obj.Location,
            Size          = obj.Size,
            PricePerMonth = obj.PricePerMonth,
            Description   = obj.Description,
            IsActive      = obj.IsActive,
            ImagePath     = obj.ImagePath,
        )
        self.db.add(warehouse)
        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def update(self, id: int, obj: WarehouseUpdate) -> Optional[Warehouse]:
        warehouse = self.get_by_id(id)
        if not warehouse:
            return None
        
        if obj.Name:
            warehouse.Name = obj.Name

        if obj.Location:
            warehouse.Location = obj.Location

        if obj.Size:
            warehouse.Size = obj.Size

        if obj.PricePerMonth: 
            warehouse.PricePerMonth = obj.PricePerMonth

        if obj.Description: 
            warehouse.Description = obj.Description

        if obj.ImagePath:
            warehouse.ImagePath = obj.ImagePath

        if obj.IsActive is not None:
            warehouse.IsActive = obj.IsActive

        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def toggle(self, id: int) -> Optional[Warehouse]:
        warehouse = self.get_by_id(id)
        if not warehouse:
            return None
        warehouse.IsActive = not warehouse.IsActive
        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def delete(self, id: int) -> None:
        warehouse = self.get_by_id(id)
        if warehouse:
            self.db.delete(warehouse)
            self.db.commit()
