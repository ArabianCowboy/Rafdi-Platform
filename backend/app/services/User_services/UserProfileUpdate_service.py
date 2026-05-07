from app.Repo import UserRepo
from app.Dtos.Auth_DTOs import ProfileUpdate
from app.Dtos.User_DTOs import UserResponse


class UserProfileService:

    def __init__(self, user_repo: UserRepo):
        self.user_repo = user_repo

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
