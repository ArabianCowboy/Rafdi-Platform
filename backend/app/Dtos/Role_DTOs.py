from pydantic import BaseModel
from typing import Optional

class RoleCreate(BaseModel):
    RoleName: str
 
 
class RoleUpdate(BaseModel):
    RoleName: Optional[str] = None
 
 
class RoleResponse(BaseModel):
    RolesID : int
    RoleName: str
 
    model_config = {"from_attributes": True}
