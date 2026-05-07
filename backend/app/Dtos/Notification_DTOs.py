from pydantic import BaseModel
from typing import Optional
from app.Enums.EnumTypes import NotificationTypeEnum
from app.Dtos.User_DTOs import UserResponse

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
    user          : Optional[UserResponse] = None
 
    model_config = {"from_attributes": True}
