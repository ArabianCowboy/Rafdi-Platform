import os
import httpx

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL     = os.getenv("FROM_EMAIL", "onboarding@resend.dev")


class EmailService:

    def send_otp(self, to_email: str, otp: str) -> None:
        httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": FROM_EMAIL,
                "to": [to_email],
                "subject": "رمز التحقق - رفدي",
                "html": f"""
                    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 24px; background: #f7f8fa; border-radius: 12px;">
                        <div style="background: #1a3a5c; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">رفدي</h1>
                        </div>
                        <h2 style="color: #1a3a5c; text-align: right;">رمز التحقق الخاص بك</h2>
                        <p style="color: #6b7280; text-align: right;">استخدم الرمز التالي لإعادة تعيين كلمة مرورك:</p>
                        <div style="background: white; border: 2px solid #1a3a5c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: bold; color: #1a3a5c; letter-spacing: 8px;">{otp}</span>
                        </div>
                        <p style="color: #ef4444; text-align: right; font-size: 13px;">⚠️ الرمز صالح لمدة 10 دقائق فقط</p>
                        <p style="color: #9ca3af; text-align: right; font-size: 12px;">إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا الإيميل.</p>
                    </div>
                """,
            },
        )