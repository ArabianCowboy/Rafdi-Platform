from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.Dtos.Auth_DTOs import RegisterCreate, LoginCreate, TokenResponse, ProfileUpdate
from app.Dtos.User_DTOs import UserResponse
from app.Dtos.Company_DTOs import CompanyResponse
from app.Repo.user_repo import UserRepo
from app.Repo.Companey_Repo import CompanyRepo
from app.Repo.UserRoleRepo import UserRoleRepo
from app.Repo.Role_Repo import RoleRepo
from app.services.User_services.auth_service import AuthService
from app.services.User_services.password_service import PasswordService
from app.services.User_services.validation_service import ValidationService
from app.services.User_services.role_assignment_service import RoleAssignmentService
from app.services.User_services.UserProfileUpdate_service import UserProfileUpdateService
from app.services.Jwt_Services.Jwt_service import JWTService
from app.api.Auth_middleware import get_current_user
from app.config import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_profile_service(db: Session = Depends(get_db)) -> UserProfileUpdateService:
    return UserProfileUpdateService(UserRepo(db), CompanyRepo(db))


@router.patch("/profile/email", response_model=UserResponse)
def update_email(
    data        : ProfileUpdate,
    service     : UserProfileUpdateService = Depends(get_profile_service),
    current_user: dict                     = Depends(get_current_user)
):
    try:
        return service.update_email(current_user["user_id"], data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/profile/company", response_model=CompanyResponse)
def update_company(
    data        : ProfileUpdate,
    service     : UserProfileUpdateService = Depends(get_profile_service),
    current_user: dict                     = Depends(get_current_user)
):
    try:
        return service.update_company_name(current_user["company_id"], data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))