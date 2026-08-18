from typing import Optional
from sqlalchemy.orm import Session
 
from app.repo.base_repo import BaseRepo
from app.models import Role
from app.dtos.role_dtos import RoleCreate
from app.dtos.role_dtos import RoleUpdate

class RoleRepo(BaseRepo[Role]):
 
    def __init__(self, db: Session):
        super().__init__(db)
 
    def get_by_id(self, id: int) -> Optional[Role]:
        return self.db.query(Role).filter(Role.RolesID == id).first()
 
    def get_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.RoleName == name).first()
 
    def get_all(self) -> list[Role]:
        pass
 
    def add(self, obj: RoleCreate) -> Role:
        pass
 
    def update(self, id: int, obj: RoleUpdate) -> Optional[Role]:
      pass
 
    def delete(self, id: int) -> None:
       pass
