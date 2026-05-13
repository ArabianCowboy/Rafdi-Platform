import random
import string
from datetime import datetime, timedelta


_otp_store: dict = {}

OTP_EXPIRE_MINUTES = 10


class OTPService:

    def generate(self, email: str) -> str:
        otp = "".join(random.choices(string.digits, k=6))
        _otp_store[email] = {
            "otp"       : otp,
            "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
        }
        return otp

    def verify(self, email: str, otp: str) -> bool:
        record = _otp_store.get(email)
        if not record:
            raise ValueError("لم يتم طلب رمز التحقق لهذا البريد")
        if datetime.utcnow() > record["expires_at"]:
            del _otp_store[email]
            raise ValueError("انتهت صلاحية رمز التحقق")
        if record["otp"] != otp:
            raise ValueError("رمز التحقق غير صحيح")
        del _otp_store[email]
        return True