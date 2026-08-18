from pydantic import BaseModel, EmailStr
from typing import Optional
from app.enums.enum_types import AccountTypeEnum


class ProfileUpdate(BaseModel):
    company_name            : Optional[str]      = None
    email                   : Optional[EmailStr] = None

class RegisterCreate(BaseModel):

    company_name            : str
    commercial_registration : str
    account_types            : list[AccountTypeEnum]
 
    email   : EmailStr
    password: str
 
 
class LoginCreate(BaseModel):
    email   : EmailStr
    password: str
 
 
class TokenResponse(BaseModel):
    access_token : str
    refresh_token: str
    token_type   : str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email       : EmailStr
    otp         : str
    new_password: str