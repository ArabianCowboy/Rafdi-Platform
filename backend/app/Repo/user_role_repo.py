from typing import Optional
from sqlalchemy.orm import Session
 
from app.repo.base_repo import BaseRepo
from app.models import UserRole

class UserRoleRepo(BaseRepo[UserRole]):
 
    def __init__(self, db: Session):
        super().__init__(db)
 

    def get_by_id(self, id: int) -> Optional[UserRole]:
        return self.db.query(UserRole).filter(UserRole.UserID == id).first()
 
    def get_all(self) -> list[UserRole]:
        return self.db.query(UserRole).all()
 
    def get_by_user(self, user_id: int) -> list[UserRole]:
        return self.db.query(UserRole).filter(UserRole.UserID == user_id).all()
 
    def get_by_role(self, role_id: int) -> list[UserRole]:
        return self.db.query(UserRole).filter(UserRole.RolesID == role_id).all()
 

    def add(self, user_id: int, role_ids: list[int]) -> None:
        for role_id in role_ids:
            user_role = UserRole(
            RolesID = role_id,
            UserID  = user_id,
            )
            self.db.add(user_role)
        self.db.flush()

    def update(self, id: int, obj) -> Optional[UserRole]:
        raise NotImplementedError("Update not supported")
 
    def delete(self, id: int) -> None:
        user_role = self.get_by_id(id)
        if user_role:
            self.db.delete(user_role)
            self.db.commit()
 
    def delete_by_user_and_role(self, user_id: int, role_id: int) -> None:
        user_role = self.db.query(UserRole).filter(
            UserRole.UserID  == user_id,
            UserRole.RolesID == role_id
        ).first()
        if user_role:
            self.db.delete(user_role)
            self.db.commit()
