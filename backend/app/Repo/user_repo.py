from typing import Optional
from sqlalchemy.orm import Session

from app.Repo.Base_Repo import BaseRepo
from app.models import User
from app.Dtos.User_DTOs import UserUpdate
from app.Dtos.Auth_DTOs import RegisterCreate


class UserRepo(BaseRepo[User]):

    def __init__(self, db: Session):
        super().__init__(db)

    def get_by_id(self, id: int) -> Optional[User]:
        return self.db.query(User).filter(User.UserID == id).first()
    
    def get_by_company_id(self, id: int) -> Optional[User]:
        return self.db.query(User).filter(User.CompanyID == id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.Email == email).first()

    def get_all(self) -> list[User]:
        return self.db.query(User).all()



    def add(self, obj: RegisterCreate, password_hash: str, company_id: int) -> User:
        user = User(
            Email        = obj.email,
            PasswordHash = password_hash,
            CompanyID    = company_id
        )
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user

    def update(self, id: int, obj: UserUpdate) -> Optional[User]:
        user = self.get_by_id(id)

        if not user:
            return None
        
        if obj.Email:
            user.Email = obj.Email

        if obj.CompanyID: 
            user.CompanyID = obj.CompanyID
            
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, id: int) -> None:
        user = self.get_by_id(id)
        if user:
            self.db.delete(user)
            self.db.commit()
