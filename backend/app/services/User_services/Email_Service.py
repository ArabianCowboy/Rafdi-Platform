import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
FROM_EMAIL       = os.getenv("FROM_EMAIL", "noreply@rafdi.com")


class EmailService:

    def send_otp(self, to_email: str, otp: str) -> None:
        message = Mail(
            from_email         = FROM_EMAIL,
            to_emails          = to_email,
            subject            = "رمز التحقق - رفدي",
            plain_text_content = f"رمز التحقق الخاص بك: {otp}\nصالح لمدة 10 دقائق فقط."
        )
        client = SendGridAPIClient(SENDGRID_API_KEY)
        client.send(message)