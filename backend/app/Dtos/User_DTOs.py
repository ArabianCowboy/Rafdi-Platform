from pydantic import BaseModel, EmailStr
from typing import Optional
from app.dtos.company_dtos import CompanyResponse

class UserUpdate(BaseModel):
    CompanyID: Optional[int]       = None
    Email    : Optional[EmailStr]  = None
 
 
class UserResponse(BaseModel):
    UserID   : int
    CompanyID: Optional[int] = None
    Email    : EmailStr
    company  : Optional[CompanyResponse] = None
 
    model_config = {"from_attributes": True}
