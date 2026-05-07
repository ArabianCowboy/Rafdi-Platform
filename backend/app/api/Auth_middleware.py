from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
 
from app.services.Jwt_Services.Jwt_service import JWTService
 
bearer_scheme = HTTPBearer()
jwt_service   = JWTService()
 
 
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    try:
        payload = jwt_service.decode_token(credentials.credentials)
        return payload
    except ValueError:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Token غير صالح أو منتهي الصلاحية",
        )
 
def require_role(*roles: str):
    def checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_roles = current_user.get("roles", [])
        for role in roles:
            if role in user_roles:
                return current_user
        raise HTTPException(
            status_code = status.HTTP_403_FORBIDDEN,
            detail      = "ما عندك صلاحية للوصول لهذه الصفحة",
        )
    return checker
 
def require_owner(current_user: dict = Depends(require_role("warehouse_owner"))) -> dict:
    return current_user
 
def require_renter(current_user: dict = Depends(require_role("renter_company"))) -> dict:
    return current_user
 
def require_admin(current_user: dict = Depends(require_role("admin"))) -> dict:
    return current_user
