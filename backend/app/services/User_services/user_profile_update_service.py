from app.repo.user_repo import UserRepo
from app.repo.company_repo import CompanyRepo
from app.dtos.auth_dtos import ProfileUpdate
from app.dtos.user_dtos import UserResponse
from app.dtos.company_dtos import CompanyResponse


class UserProfileService:

    def __init__(self, user_repo: UserRepo, company_repo: CompanyRepo):
        self.user_repo = user_repo
        self.company_repo = company_repo

    def update_email(self, user_id: int, data: ProfileUpdate) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("المستخدم غير موجود")

        if data.email:
            existing = self.user_repo.get_by_email(data.email)

            if existing and existing.UserID != user_id:
                raise ValueError("البريد الإلكتروني مستخدم مسبقاً")

            user.Email = data.email
            self.user_repo.db.flush()

        self.user_repo.db.commit()
        return UserResponse.model_validate(self.user_repo.get_by_id(user_id))

    def update_company_name(self, company_id: int, data: ProfileUpdate) -> CompanyResponse:
        company = self.company_repo.get_by_id(company_id)
        if not company:
            raise ValueError("الشركة غير موجودة")

        if not data.company_name:
            raise ValueError("يرجى إدخال اسم الشركة")

        company.Name = data.company_name
        self.company_repo.db.flush()
        self.company_repo.db.commit()

        return CompanyResponse.model_validate(company)