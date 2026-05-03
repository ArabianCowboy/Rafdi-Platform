from app.Repo import UserRepo, CompanyRepo
from app.Dtos.Auth_DTOs import RegisterCreate


class ValidationService:

    def __init__(self, user_repo: UserRepo, company_repo: CompanyRepo):
        self.user_repo    = user_repo
        self.company_repo = company_repo

    def validate_register(self, data: RegisterCreate) -> None:
        existing_user = self.user_repo.get_by_email(data.email)
        if existing_user:
            raise ValueError("البريد الإلكتروني مستخدم مسبقاً")

        existing_company = self.company_repo.get_by_commercial_registration(
            data.commercial_registration
        )
        if existing_company:
            raise ValueError("رقم السجل التجاري مستخدم مسبقاً")