from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.dtos.auth_dtos import RegisterCreate, LoginCreate, TokenResponse, ProfileUpdate
from app.dtos.user_dtos import UserResponse
from app.dtos.auth_dtos import ForgotPasswordRequest, ResetPasswordRequest
from app.dtos.auth_dtos import RefreshTokenRequest
from app.dtos.company_dtos import CompanyResponse
from app.repo.user_repo import UserRepo
from app.repo.company_repo import CompanyRepo
from app.repo.notification_repo import NotificationRepo
from app.repo.user_role_repo import UserRoleRepo
from app.repo.role_repo import RoleRepo
from app.repo.refresh_token_repo import RefreshTokenRepo
from app.services.user_services.auth_service import AuthService
from app.services.user_services.password_service import PasswordService
from app.services.user_services.validation_service import ValidationService
from app.services.user_services.role_assignment_service import RoleAssignmentService
from app.services.user_services.user_profile_update_service import UserProfileService
from app.services.jwt_services.jwt_service import JWTService
from app.services.user_services.otp_service import OTPService
from app.services.user_services.email_service import EmailService
from app.services.user_services.forgot_password_service import ForgotPasswordService
from app.services.notification_services.notification_service import NotificationService
from app.services.notification_services.notification_trigger_service import NotificationTriggerService
from app.api.auth_middleware import get_current_user
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
    user_repo          = UserRepo(db)
    company_repo       = CompanyRepo(db)
    user_role_repo     = UserRoleRepo(db)
    role_repo          = RoleRepo(db)
    refresh_token_repo = RefreshTokenRepo(db)
    notification_service = NotificationService(NotificationRepo(db))
    return AuthService(
        user_repo            = user_repo,
        company_repo         = company_repo,
        user_role_repo       = user_role_repo,
        refresh_token_repo   = refresh_token_repo,
        password_service     = PasswordService(),
        validation_service   = ValidationService(user_repo, company_repo),
        role_service         = RoleAssignmentService(user_role_repo, role_repo),
        jwt_service          = JWTService(),
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


@router.post("/logout")
def logout(
    data   : RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service)
):
    service.logout(data.refresh_token)
    return {"message": "تم تسجيل الخروج بنجاح"}


@router.post("/logout-all")
def logout_all(
    service     : AuthService = Depends(get_auth_service),
    current_user: dict         = Depends(get_current_user)
):
    service.logout_all(current_user["user_id"])
    return {"message": "تم تسجيل الخروج من جميع الأجهزة"}