from typing import Optional

from app.Repo import UserRepo, CompanyRepo
from app.Dtos.User_DTOs import UserResponse, UserUpdate
from app.services.User_services.password_service import PasswordService
from app.services.User_services.validation_service import ValidationService
from app.services.User_services.role_assignment_service import RoleAssignmentService


class UserService:

    def __init__(
        self,
        user_repo          : UserRepo,
        company_repo       : CompanyRepo,
        password_service   : PasswordService,
        validation_service : ValidationService,
        role_service       : RoleAssignmentService,
    ):
        self.user_repo          = user_repo
        self.company_repo       = company_repo
        self.password_service   = password_service
        self.validation_service = validation_service
        self.role_service       = role_service


    def get_by_id(self, user_id: int) -> Optional[UserResponse]:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("المستخدم غير موجود")
        return UserResponse.model_validate(user)

    def get_all(self) -> list[UserResponse]:
        return [UserResponse.model_validate(u) for u in self.user_repo.get_all()]


    def update(self, user_id: int, data: UserUpdate) -> UserResponse:
        user = self.user_repo.update(user_id, data)
        if not user:
            raise ValueError("المستخدم غير موجود")
        return UserResponse.model_validate(user)


    def delete(self, user_id: int) -> None:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("المستخدم غير موجود")
        self.user_repo.delete(user_id)