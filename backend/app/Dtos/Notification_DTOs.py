from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.enums.enum_types import NotificationTypeEnum
from app.dtos.user_dtos import UserResponse

class NotificationCreate(BaseModel):
    UserID : int
    Type   : NotificationTypeEnum
    Message: str
    IsRead : bool = False
 
 
class NotificationUpdate(BaseModel):
    Type   : Optional[NotificationTypeEnum] = None
    Message: Optional[str]                  = None
    IsRead : Optional[bool]                 = None
 
 
class NotificationResponse(BaseModel):
    NotificationID: int
    UserID        : int
    Type          : NotificationTypeEnum
    Message       : str
    IsRead        : bool
    CreatedAt     : datetime
    user          : Optional[UserResponse] = None
 
    model_config = {"from_attributes": True}
