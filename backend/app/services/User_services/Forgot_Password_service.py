from app.Repo.user_repo import UserRepo
from app.services.User_services.Otp_Service import OTPService
from app.services.User_services.Email_Service import EmailService
from app.services.User_services.password_service import PasswordService


class ForgotPasswordService:


    def __init__(
        self,
        user_repo       : UserRepo,
        otp_service     : OTPService,
        email_service   : EmailService,
        password_service: PasswordService,
    ):
        self.user_repo        = user_repo
        self.otp_service      = otp_service
        self.email_service    = email_service
        self.password_service = password_service


    def send_otp(self, email: str) -> None:
        user = self.user_repo.get_by_email(email)
        if not user:
            return

        otp = self.otp_service.generate(email)
        self.email_service.send_otp(email, otp)


    def reset_password(self, email: str, otp: str, new_password: str) -> None:
        self.otp_service.verify(email, otp)

        user = self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("المستخدم غير موجود")

        user.PasswordHash = self.password_service.hash_password(new_password)
        self.user_repo.db.commit()