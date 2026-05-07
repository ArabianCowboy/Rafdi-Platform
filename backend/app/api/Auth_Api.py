from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.Dtos.Auth_DTOs import RegisterCreate, LoginCreate,TokenResponse
from app.Dtos.User_DTOs import UserResponse
from app.Repo.user_repo import UserRepo
from app.Repo.Companey_Repo import CompanyRepo
from app.Repo.UserRoleRepo import UserRoleRepo
from app.Repo.Role_Repo import RoleRepo
from app.services.User_services.auth_service import AuthService
from app.services.User_services.password_service import PasswordService
from app.services.User_services.validation_service import ValidationService
from app.services.User_services.role_assignment_service import RoleAssignmentService
from app.services.Jwt_Services.Jwt_service import JWTService
from app.config import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    user_repo    = UserRepo(db)
    company_repo = CompanyRepo(db)
    user_role_repo = UserRoleRepo(db)
    role_repo      = RoleRepo(db)

    return AuthService(
        user_repo          = user_repo,
        company_repo       = company_repo,
        user_role_repo     = user_role_repo,
        password_service   = PasswordService(),
        validation_service = ValidationService(user_repo, company_repo),
        role_service       = RoleAssignmentService(user_role_repo, role_repo),
        jwt_service        = JWTService(),
    )

@router.post("/register", response_model=UserResponse)
def register(
    data   : RegisterCreate,
    service: AuthService = Depends(get_auth_service)
):
    try:
        return service.register(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    


@router.post("/login", response_model=TokenResponse)
def login(
    data   : LoginCreate,
    service: AuthService = Depends(get_auth_service)
):
    try:
        return service.login(data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
