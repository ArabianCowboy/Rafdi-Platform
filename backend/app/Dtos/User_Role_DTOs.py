from pydantic import BaseModel
from typing import Optional
from app.Dtos.Role_DTOs import RoleResponse

class UserRoleCreate(BaseModel):
    RolesID: int
    UserID : int
 
 
class UserRoleUpdate(BaseModel):
    RolesID: Optional[int] = None
    UserID : Optional[int] = None
 
 
class UserRoleResponse(BaseModel):
    RolesID: int
    UserID : int
    role   : Optional[RoleResponse] = None
 
    model_config = {"from_attributes": True}
