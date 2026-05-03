from typing import Optional
from sqlalchemy.orm import Session
 
from app.Repo.Base_Repo import BaseRepo
from app.models import User_Role

class UserRoleRepo(BaseRepo[User_Role]):
 
    def __init__(self, db: Session):
        super().__init__(db)
 

    def get_by_id(self, id: int) -> Optional[User_Role]:
        return self.db.query(User_Role).filter(User_Role.UserID == id).first()
 
    def get_all(self) -> list[User_Role]:
        return self.db.query(User_Role).all()
 
    def get_by_user(self, user_id: int) -> list[User_Role]:
        return self.db.query(User_Role).filter(User_Role.UserID == user_id).all()
 
    def get_by_role(self, role_id: int) -> list[User_Role]:
        return self.db.query(User_Role).filter(User_Role.RolesID == role_id).all()
 

    def add(self, user_id: int, role_ids: list[int]) -> None:
        for role_id in role_ids:
            user_role = User_Role(
            RolesID = role_id,
            UserID  = user_id,
            )
            self.db.add(user_role)
        self.db.flush()

    def update(self, id: int, obj) -> Optional[User_Role]:
        raise NotImplementedError("Update not supported")
 
    def delete(self, id: int) -> None:
        user_role = self.get_by_id(id)
        if user_role:
            self.db.delete(user_role)
            self.db.commit()
 
    def delete_by_user_and_role(self, user_id: int, role_id: int) -> None:
        user_role = self.db.query(User_Role).filter(
            User_Role.UserID  == user_id,
            User_Role.RolesID == role_id
        ).first()
        if user_role:
            self.db.delete(user_role)
            self.db.commit()