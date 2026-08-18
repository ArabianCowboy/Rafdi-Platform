from app.repo.user_role_repo import UserRoleRepo
from app.repo.role_repo import RoleRepo


class RoleAssignmentService:

    def __init__(self, user_role_repo: UserRoleRepo, role_repo: RoleRepo):
        self.user_role_repo = user_role_repo
        self.role_repo      = role_repo

    def assign_roles(self, user_id: int, account_types: list[str]) -> None:
        role_ids = []
        for account_type in account_types:
            role = self.role_repo.get_by_name(account_type)
            if role:
                role_ids.append(role.RolesID)
                
        if role_ids:
            self.user_role_repo.add(user_id, role_ids)
