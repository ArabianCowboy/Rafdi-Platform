from app.Repo import UserRepo, CompanyRepo,UserRoleRepo
from app.Dtos.User_DTOs import UserResponse
from app.Dtos.Shared_DTOs import MessageResponse
from app.Dtos.Auth_DTOs import RegisterCreate,TokenResponse
from app.services.User_services.password_service import PasswordService
from app.services.User_services.validation_service import ValidationService
from app.services.User_services.role_assignment_service import RoleAssignmentService
from app.services.Jwt_Services.Jwt_service import JWTService


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
    ):
        self.user_repo          = user_repo
        self.company_repo       = company_repo
        self.user_role_repo     = user_role_repo
        self.password_service   = password_service
        self.validation_service = validation_service
        self.role_service       = role_service
        self.jwt_service        = jwt_service

    def register(self, data: RegisterCreate) -> UserResponse:
        try:
            self.validation_service.validate_register(data)
            
            company = self.company_repo.add(data)

            password_hash = self.password_service.hash_password(data.password)

            user = self.user_repo.add(data, password_hash, company.CompanyID)

            self.role_service.assign_roles(user.UserID, data.account_types)

            self.user_repo.db.commit()

            return UserResponse.model_validate(user)

        except Exception as e:

            self.user_repo.db.rollback()
            raise ValueError(str(e))


    def login(self, email: str, password: str) -> MessageResponse:

        user = self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("البريد الإلكتروني أو كلمة المرور غلط")

        if not self.password_service.verify_password(password, user.PasswordHash):
            raise ValueError("البريد الإلكتروني أو كلمة المرور غلط")

        user_roles = self.user_role_repo.get_by_user(user.UserID)
        roles = [ur.role.RoleName for ur in user_roles if ur.role]

        token = self.jwt_service.create_token(
            user_id    = user.UserID,
            company_id = user.CompanyID,
            roles      = roles,
        )

        return TokenResponse(access_token=token)