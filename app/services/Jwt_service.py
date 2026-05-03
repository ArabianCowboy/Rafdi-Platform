import os
from datetime import datetime, timedelta
from jose import JWTError, jwt


SECRET_KEY  = os.getenv("SECRET_KEY", "rafdi-secret-key-2026")
ALGORITHM   = "HS256"
EXPIRE_DAYS = 7


class JWTService:

    def create_token(self, user_id: int, company_id: int, roles: list[str]) -> str:
        payload = {
            "user_id"   : user_id,
            "company_id": company_id,
            "roles"     : roles,
            "exp"       : datetime.utcnow() + timedelta(days=EXPIRE_DAYS),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise ValueError("Token غير صالح أو منتهي الصلاحية")