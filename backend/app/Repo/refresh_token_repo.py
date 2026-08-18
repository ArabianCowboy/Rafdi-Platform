from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.refresh_token_model import RefreshToken


class RefreshTokenRepo:

    def __init__(self, db: Session):
        self.db = db


    def add(self, user_id: int, token: str, expires_at: datetime) -> RefreshToken:
        refresh_token = RefreshToken(
            UserID    = user_id,
            Token     = token,
            ExpiresAt = expires_at,
        )
        self.db.add(refresh_token)
        self.db.flush()
        return refresh_token


    def get_by_token(self, token: str) -> Optional[RefreshToken]:
        return self.db.query(RefreshToken).filter(
            RefreshToken.Token == token
        ).first()


    def delete(self, token: str) -> None:
        record = self.get_by_token(token)
        if record:
            self.db.delete(record)
            self.db.flush()

    def delete_all_for_user(self, user_id: int) -> None:
        self.db.query(RefreshToken).filter(
            RefreshToken.UserID == user_id
        ).delete()
        self.db.flush()