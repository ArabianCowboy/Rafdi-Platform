from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session


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
