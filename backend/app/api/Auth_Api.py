from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.Dtos.Auth_DTOs import RegisterCreate, LoginCreate, TokenResponse, ProfileUpdate
from app.Dtos.User_DTOs import UserResponse
from app.Dtos.Auth_DTOs import ForgotPasswordRequest, ResetPasswordRequest
from app.Dtos.Auth_DTOs import RefreshTokenRequest
from app.Dtos.Company_DTOs import CompanyResponse
from app.Repo.user_repo import UserRepo
from app.Repo.Companey_Repo import CompanyRepo
from app.Repo.Notification_Repo import NotificationRepo
from app.Repo.UserRoleRepo import UserRoleRepo
from app.Repo.Role_Repo import RoleRepo
from app.services.User_services.auth_service import AuthService
from app.services.User_services.password_service import PasswordService
from app.services.User_services.validation_service import ValidationService
from app.services.User_services.role_assignment_service import RoleAssignmentService
from app.services.User_services.UserProfileUpdate_service import UserProfileService
from app.services.Jwt_Services.Jwt_service import JWTService
from app.services.User_services.Otp_Service import OTPService
from app.services.User_services.Email_Service import EmailService
from app.services.User_services.Forgot_Password_service import ForgotPasswordService
from app.services.Notification_Services.Notification_Service import NotificationService
from app.services.Notification_Services.NotificationTrigger_Service import NotificationTriggerService
from app.api.Auth_middleware import get_current_user
from app.config import get_db
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_forgot_password_service(db: Session = Depends(get_db)) -> ForgotPasswordService:
    return ForgotPasswordService(
        user_repo        = UserRepo(db),
        otp_service      = OTPService(),
        email_service    = EmailService(),
        password_service = PasswordService(),
    )


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    user_repo      = UserRepo(db)
    company_repo   = CompanyRepo(db)
    user_role_repo = UserRoleRepo(db)
    role_repo      = RoleRepo(db)
    notification_service = NotificationService(NotificationRepo(db))
    return AuthService(
        user_repo          = user_repo,
        company_repo       = company_repo,
        user_role_repo     = user_role_repo,
        password_service   = PasswordService(),
        validation_service = ValidationService(user_repo, company_repo),
        role_service       = RoleAssignmentService(user_role_repo, role_repo),
        jwt_service        = JWTService(),
        notification_trigger = NotificationTriggerService(notification_service),
    )

def get_profile_service(db: Session = Depends(get_db)) -> UserProfileService:
    return UserProfileService(UserRepo(db), CompanyRepo(db))


@router.post("/register", response_model=UserResponse)
@limiter.limit("3/minute")
def register(
    request: Request,
    data   : RegisterCreate,
    service: AuthService = Depends(get_auth_service)
):
    try:
        return service.register(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    data   : LoginCreate,
    service: AuthService = Depends(get_auth_service)
):
    
    print("IP:", request.headers.get("X-Forwarded-For"), "|", request.client.host)
    try:
        return service.login(data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.patch("/profile/email", response_model=UserResponse)
def update_email(
    data        : ProfileUpdate,
    service     : UserProfileService = Depends(get_profile_service),
    current_user: dict               = Depends(get_current_user)
):
    try:
        return service.update_email(current_user["user_id"], data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/profile/company", response_model=CompanyResponse)
def update_company(
    data        : ProfileUpdate,
    service     : UserProfileService = Depends(get_profile_service),
    current_user: dict               = Depends(get_current_user)
):
    try:
        return service.update_company_name(current_user["company_id"], data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_me(
    db          : Session = Depends(get_db),
    current_user: dict    = Depends(get_current_user)
):
    user = UserRepo(db).get_by_id_with_company(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return user


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    data   : ForgotPasswordRequest,
    service: ForgotPasswordService = Depends(get_forgot_password_service)
):
    service.send_otp(data.email)
    return {"message": " سيصلك رمز التحقق على الأيميل"}


@router.post("/reset-password")
def reset_password(
    data   : ResetPasswordRequest,
    service: ForgotPasswordService = Depends(get_forgot_password_service)
):
    try:
        service.reset_password(data.email, data.otp, data.new_password)
        return {"message": "تم تغيير كلمة المرور بنجاح"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    data   : RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service)
):
    try:
        return service.refresh_access_token(data.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))