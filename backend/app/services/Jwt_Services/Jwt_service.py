from datetime import datetime, timedelta
from jose import JWTError, jwt

from app.config import SECRET_KEY

ALGORITHM          = "HS256"
ACCESS_TOKEN_EXPIRE  = 15    # دقيقة
REFRESH_TOKEN_EXPIRE = 7     # أيام


class JWTService:
    """
    S — Single Responsibility
    مسؤول فقط عن إنشاء والتحقق من JWT tokens
    """

    # ─────────────────────────────────────────
    # Access Token — 15 دقيقة
    # ─────────────────────────────────────────

    def create_access_token(self, user_id: int, company_id: int, roles: list[str]) -> str:
        payload = {
            "user_id"   : user_id,
            "company_id": company_id,
            "roles"     : roles,
            "type"      : "access",
            "exp"       : datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # ─────────────────────────────────────────
    # Refresh Token — 7 أيام
    # ─────────────────────────────────────────

    def create_refresh_token(self, user_id: int) -> str:
        payload = {
            "user_id": user_id,
            "type"   : "refresh",
            "exp"    : datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # ─────────────────────────────────────────
    # Decode
    # ─────────────────────────────────────────

    def decode_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise ValueError("Token غير صالح أو منتهي الصلاحية")

    def decode_refresh_token(self, token: str) -> dict:
        payload = self.decode_token(token)
        if payload.get("type") != "refresh":
            raise ValueError("Token غير صالح")
        return payload

    # ─────────────────────────────────────────
    # Backward compatible — للكود القديم
    # ─────────────────────────────────────────

    def create_token(self, user_id: int, company_id: int, roles: list[str]) -> str:
        return self.create_access_token(user_id, company_id, roles)