from pydantic import BaseModel
from typing import Optional

class CompanyCreate(BaseModel):
    Name                  : str
    CommercialRegistration: str
    Status                : bool = True
 
 
class CompanyUpdate(BaseModel):
    Name                  : Optional[str]  = None
    CommercialRegistration: Optional[str]  = None
    Status                : Optional[bool] = None
 
 
class CompanyResponse(BaseModel):
    CompanyID             : int
    Name                  : str
    CommercialRegistration: str
    Status                : bool
 
    model_config = {"from_attributes": True}

class CompanyStatusUpdate(BaseModel):
    Status: bool
