from app.Repo import UserRoleRepo
from app.Dtos.User_DTOs import UserResponse
from app.Dtos.Shared_DTOs import MessageResponse
from app.Dtos.Auth_DTOs import RegisterCreate,TokenResponse
from app.services.User_services.password_service import PasswordService
from app.services.User_services.validation_service import ValidationService
from app.services.User_services.role_assignment_service import RoleAssignmentService
from app.services.Jwt_Services.Jwt_service import JWTService
from app.Repo import CompanyRepo, UserRepo
from app.services.Notification_Services.NotificationTrigger_Service import NotificationTriggerService


class AuthService:


    def __init__(
        self,
        user_repo          : UserRepo,
        company_repo       : CompanyRepo,
        user_role_repo     : UserRoleRepo,
        password_service   : PasswordService,
        validation_service : ValidationService,
        role_service       : RoleAssignmentService,
        jwt_service        : JWTService,
        notification_trigger: NotificationTriggerService = None,
    ):
        self.user_repo          = user_repo
        self.company_repo       = company_repo
        self.user_role_repo     = user_role_repo
        self.password_service   = password_service
        self.validation_service = validation_service
        self.role_service       = role_service
        self.jwt_service        = jwt_service
        self.notification_trigger = notification_trigger

    def register(self, data: RegisterCreate) -> UserResponse:
        try:
            self.validation_service.validate_register(data)
            
            company = self.company_repo.add(data)

            password_hash = self.password_service.hash_password(data.password)

            user = self.user_repo.add(data, password_hash, company.CompanyID)

            self.role_service.assign_roles(user.UserID, data.account_types)

            self.user_repo.db.commit()

            if self.notification_trigger:
                try:
                    admins = self.user_repo.get_all_admin()
                    for admin in admins:
                        if "admin" in admin["Roles"]:
                            self.notification_trigger.on_company_registered(
                                admin["UserID"],
                                company.Name,
                            )
                except Exception:
                    pass

            return UserResponse.model_validate(user)

        except Exception as e:

            self.user_repo.db.rollback()
            raise ValueError(str(e))


    def login(self, email: str, password: str) -> TokenResponse:

        user = self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("البريد الإلكتروني أو كلمة المرور غلط")

        if not self.password_service.verify_password(password, user.PasswordHash):
            raise ValueError("البريد الإلكتروني أو كلمة المرور غلط")

        user_roles = self.user_role_repo.get_by_user(user.UserID)
        roles = [ur.role.RoleName for ur in user_roles if ur.role]

        access_token = self.jwt_service.create_access_token(
            user_id    = user.UserID,
            company_id = user.CompanyID,
            roles      = roles,
        )
        refresh_token = self.jwt_service.create_refresh_token(
            user_id = user.UserID,
        )

        return TokenResponse(
            access_token  = access_token,
            refresh_token = refresh_token,
        )

    # ─────────────────────────────────────────
    # Refresh Access Token
    # ─────────────────────────────────────────

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        payload = self.jwt_service.decode_refresh_token(refresh_token)

        user = self.user_repo.get_by_id(payload["user_id"])
        if not user:
            raise ValueError("المستخدم غير موجود")

        user_roles = self.user_role_repo.get_by_user(user.UserID)
        roles = [ur.role.RoleName for ur in user_roles if ur.role]

        access_token = self.jwt_service.create_access_token(
            user_id    = user.UserID,
            company_id = user.CompanyID,
            roles      = roles,
        )
        new_refresh_token = self.jwt_service.create_refresh_token(
            user_id = user.UserID,
        )

        return TokenResponse(
            access_token  = access_token,
            refresh_token = new_refresh_token,
        )