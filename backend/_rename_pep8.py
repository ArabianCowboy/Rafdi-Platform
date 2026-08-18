"""One-shot PEP 8 rename. Kept as a project tool; re-runnable."""
from __future__ import annotations

import os
import re
from pathlib import Path

APP = Path(__file__).resolve().parent / "app"

FILE_MAP = {
    "Repo/Base_Repo.py": "repo/base_repo.py",
    "Repo/Companey_Repo.py": "repo/company_repo.py",
    "Repo/user_repo.py": "repo/user_repo.py",
    "Repo/WarehouseRepo.py": "repo/warehouse_repo.py",
    "Repo/Booking_Repo.py": "repo/booking_repo.py",
    "Repo/Payment_Repo.py": "repo/payment_repo.py",
    "Repo/Notification_Repo.py": "repo/notification_repo.py",
    "Repo/Role_Repo.py": "repo/role_repo.py",
    "Repo/UserRoleRepo.py": "repo/user_role_repo.py",
    "Repo/RefreshToken_Repo.py": "repo/refresh_token_repo.py",
    "Repo/__init__.py": "repo/__init__.py",
    "Dtos/Admin_DTOs.py": "dtos/admin_dtos.py",
    "Dtos/Auth_DTOs.py": "dtos/auth_dtos.py",
    "Dtos/Booking_DTOs.py": "dtos/booking_dtos.py",
    "Dtos/Company_DTOs.py": "dtos/company_dtos.py",
    "Dtos/Notification_DTOs.py": "dtos/notification_dtos.py",
    "Dtos/Payment_DTOs.py": "dtos/payment_dtos.py",
    "Dtos/Role_DTOs.py": "dtos/role_dtos.py",
    "Dtos/Shared_DTOs.py": "dtos/shared_dtos.py",
    "Dtos/User_DTOs.py": "dtos/user_dtos.py",
    "Dtos/User_Role_DTOs.py": "dtos/user_role_dtos.py",
    "Dtos/Warehouse_DTOs.py": "dtos/warehouse_dtos.py",
    "Dtos/__init__.py": "dtos/__init__.py",
    "Enums/EnumTypes.py": "enums/enum_types.py",
    "api/Auth_Api.py": "api/auth_api.py",
    "api/WareHouse_Api.py": "api/warehouse_api.py",
    "api/Booking_Api.py": "api/booking_api.py",
    "api/Payment_Api.py": "api/payment_api.py",
    "api/Admin_Api.py": "api/admin_api.py",
    "api/Notification_Api.py": "api/notification_api.py",
    "api/Auth_middleware.py": "api/auth_middleware.py",
    "models/Base_Model.py": "models/base_model.py",
    "models/User_Model.py": "models/user_model.py",
    "models/Company_Model.py": "models/company_model.py",
    "models/Role_Model.py": "models/role_model.py",
    "models/User_Role_Model.py": "models/user_role_model.py",
    "models/Warehouse_Model.py": "models/warehouse_model.py",
    "models/Booking_Model.py": "models/booking_model.py",
    "models/Payment_Model.py": "models/payment_model.py",
    "models/Notification_Model.py": "models/notification_model.py",
    "models/RefreshToken_Model.py": "models/refresh_token_model.py",
    "services/User_services/Forgot_Password_service.py": "services/user_services/forgot_password_service.py",
    "services/User_services/UserProfileUpdate_service.py": "services/user_services/user_profile_update_service.py",
    "services/User_services/Email_Service.py": "services/user_services/email_service.py",
    "services/User_services/Otp_Service.py": "services/user_services/otp_service.py",
    "services/User_services/auth_service.py": "services/user_services/auth_service.py",
    "services/User_services/password_service.py": "services/user_services/password_service.py",
    "services/User_services/validation_service.py": "services/user_services/validation_service.py",
    "services/User_services/role_assignment_service.py": "services/user_services/role_assignment_service.py",
    "services/User_services/user_service.py": "services/user_services/user_service.py",
    "services/User_services/__init__.py": "services/user_services/__init__.py",
    "services/Jwt_Services/Jwt_service.py": "services/jwt_services/jwt_service.py",
    "services/Booking_Services/Booking_Service.py": "services/booking_services/booking_service.py",
    "services/Booking_Services/BookingOverlap_Service.py": "services/booking_services/booking_overlap_service.py",
    "services/Booking_Services/BookingPrice_Service.py": "services/booking_services/booking_price_service.py",
    "services/Payment_Services/Payment_Service.py": "services/payment_services/payment_service.py",
    "services/Payment_Services/Commission_Service.py": "services/payment_services/commission_service.py",
    "services/Notification_Services/Notification_Service.py": "services/notification_services/notification_service.py",
    "services/Notification_Services/NotificationTrigger_Service.py": "services/notification_services/notification_trigger_service.py",
    "services/Warehouse_services/Warehouse_service.py": "services/warehouse_services/warehouse_service.py",
    "services/Warehouse_services/Warehouse_access_service.py": "services/warehouse_services/warehouse_access_service.py",
}

DIR_RENAMES = [
    "repo",
    "dtos",
    "enums",
    "services/user_services",
    "services/jwt_services",
    "services/booking_services",
    "services/payment_services",
    "services/notification_services",
    "services/warehouse_services",
]

REPLACEMENTS = [
    ("from app.services.Notification_Services import NotificationTrigger_Service",
     "from app.services.notification_services.notification_trigger_service import NotificationTriggerService"),
    ("from app.services.Notification_Services import Notification_Service",
     "from app.services.notification_services.notification_service import NotificationService"),
    ("from app.services.Warehouse_services import Warehouse_access_service",
     "from app.services.warehouse_services.warehouse_access_service import WarehouseAccessService"),
    ("from app.api import Admin_Api as admin_api",
     "from app.api import admin_api"),
    ("app.Repo.Companey_Repo", "app.repo.company_repo"),
    ("app.Repo.WarehouseRepo", "app.repo.warehouse_repo"),
    ("app.Repo.UserRoleRepo", "app.repo.user_role_repo"),
    ("app.Repo.RefreshToken_Repo", "app.repo.refresh_token_repo"),
    ("app.Repo.Notification_Repo", "app.repo.notification_repo"),
    ("app.Repo.Booking_Repo", "app.repo.booking_repo"),
    ("app.Repo.Payment_Repo", "app.repo.payment_repo"),
    ("app.Repo.Role_Repo", "app.repo.role_repo"),
    ("app.Repo.Base_Repo", "app.repo.base_repo"),
    ("app.Repo.user_repo", "app.repo.user_repo"),
    ("app.Repo", "app.repo"),
    ("app.Dtos.User_Role_DTOs", "app.dtos.user_role_dtos"),
    ("app.Dtos.Warehouse_DTOs", "app.dtos.warehouse_dtos"),
    ("app.Dtos.Notification_DTOs", "app.dtos.notification_dtos"),
    ("app.Dtos.Company_DTOs", "app.dtos.company_dtos"),
    ("app.Dtos.Booking_DTOs", "app.dtos.booking_dtos"),
    ("app.Dtos.Payment_DTOs", "app.dtos.payment_dtos"),
    ("app.Dtos.Shared_DTOs", "app.dtos.shared_dtos"),
    ("app.Dtos.Admin_DTOs", "app.dtos.admin_dtos"),
    ("app.Dtos.User_DTOs", "app.dtos.user_dtos"),
    ("app.Dtos.Auth_DTOs", "app.dtos.auth_dtos"),
    ("app.Dtos.Role_DTOs", "app.dtos.role_dtos"),
    ("app.Dtos", "app.dtos"),
    ("app.Enums.EnumTypes", "app.enums.enum_types"),
    ("app.models.RefreshToken_Model", "app.models.refresh_token_model"),
    ("app.models.User_Role_Model", "app.models.user_role_model"),
    ("app.models.Notification_Model", "app.models.notification_model"),
    ("app.models.Warehouse_Model", "app.models.warehouse_model"),
    ("app.models.Company_Model", "app.models.company_model"),
    ("app.models.Booking_Model", "app.models.booking_model"),
    ("app.models.Payment_Model", "app.models.payment_model"),
    ("app.models.User_Model", "app.models.user_model"),
    ("app.models.Role_Model", "app.models.role_model"),
    ("app.models.Base_Model", "app.models.base_model"),
    ("app.api.Auth_middleware", "app.api.auth_middleware"),
    ("app.api.Notification_Api", "app.api.notification_api"),
    ("app.api.WareHouse_Api", "app.api.warehouse_api"),
    ("app.api.Payment_Api", "app.api.payment_api"),
    ("app.api.Booking_Api", "app.api.booking_api"),
    ("app.api.Admin_Api", "app.api.admin_api"),
    ("app.api.Auth_Api", "app.api.auth_api"),
    ("app.services.Notification_Services.NotificationTrigger_Service",
     "app.services.notification_services.notification_trigger_service"),
    ("app.services.Notification_Services.Notification_Service",
     "app.services.notification_services.notification_service"),
    ("app.services.Warehouse_services.Warehouse_access_service",
     "app.services.warehouse_services.warehouse_access_service"),
    ("app.services.Warehouse_services.Warehouse_service",
     "app.services.warehouse_services.warehouse_service"),
    ("app.services.Booking_Services.BookingOverlap_Service",
     "app.services.booking_services.booking_overlap_service"),
    ("app.services.Booking_Services.BookingPrice_Service",
     "app.services.booking_services.booking_price_service"),
    ("app.services.Booking_Services.Booking_Service",
     "app.services.booking_services.booking_service"),
    ("app.services.Payment_Services.Commission_Service",
     "app.services.payment_services.commission_service"),
    ("app.services.Payment_Services.Payment_Service",
     "app.services.payment_services.payment_service"),
    ("app.services.User_services.Forgot_Password_service",
     "app.services.user_services.forgot_password_service"),
    ("app.services.User_services.UserProfileUpdate_service",
     "app.services.user_services.user_profile_update_service"),
    ("app.services.User_services.Email_Service",
     "app.services.user_services.email_service"),
    ("app.services.User_services.Otp_Service",
     "app.services.user_services.otp_service"),
    ("app.services.User_services", "app.services.user_services"),
    ("app.services.Jwt_Services.Jwt_service", "app.services.jwt_services.jwt_service"),
    ("app.services.Jwt_Services", "app.services.jwt_services"),
    ("app.services.Notification_Services", "app.services.notification_services"),
    ("app.services.Warehouse_services", "app.services.warehouse_services"),
    ("app.services.Booking_Services", "app.services.booking_services"),
    ("app.services.Payment_Services", "app.services.payment_services"),
]

CLASS_RENAMES = {
    r"\bBooking_Repo\b": "BookingRepo",
    r"\bPayment_Repo\b": "PaymentRepo",
    r"\bRole_Repo\b": "RoleRepo",
    r"\bNotification_Service\b": "NotificationService",
    r"\bNotificationTrigger_Service\b": "NotificationTriggerService",
    r"\bWarehouse_access_service\b": "WarehouseAccessService",
    r"\bUser_Role\b": "UserRole",
}

REPO_IMPORT_MODULES = {
    "BaseRepo": "base_repo",
    "UserRepo": "user_repo",
    "CompanyRepo": "company_repo",
    "WarehouseRepo": "warehouse_repo",
    "BookingRepo": "booking_repo",
    "PaymentRepo": "payment_repo",
    "NotificationRepo": "notification_repo",
    "RoleRepo": "role_repo",
    "UserRoleRepo": "user_role_repo",
    "RefreshTokenRepo": "refresh_token_repo",
}

DTO_IMPORT_MODULES = {
    "RegisterCreate": "auth_dtos", "LoginCreate": "auth_dtos", "TokenResponse": "auth_dtos",
    "ProfileUpdate": "auth_dtos", "RefreshTokenRequest": "auth_dtos",
    "ForgotPasswordRequest": "auth_dtos", "ResetPasswordRequest": "auth_dtos",
    "UserUpdate": "user_dtos", "UserResponse": "user_dtos",
    "CompanyCreate": "company_dtos", "CompanyUpdate": "company_dtos",
    "CompanyResponse": "company_dtos", "CompanyStatusUpdate": "company_dtos",
    "RoleCreate": "role_dtos", "RoleUpdate": "role_dtos", "RoleResponse": "role_dtos",
    "UserRoleCreate": "user_role_dtos", "UserRoleUpdate": "user_role_dtos",
    "UserRoleResponse": "user_role_dtos",
    "WarehouseCreate": "warehouse_dtos", "WarehouseUpdate": "warehouse_dtos",
    "WarehouseResponse": "warehouse_dtos", "WarehouseToggleResponse": "warehouse_dtos",
    "WarehouseStatusUpdate": "warehouse_dtos",
    "BookingCreate": "booking_dtos", "BookingUpdate": "booking_dtos",
    "BookingResponse": "booking_dtos", "BookingStatusUpdate": "booking_dtos",
    "PaymentCreate": "payment_dtos", "PaymentUpdate": "payment_dtos",
    "PaymentResponse": "payment_dtos", "BookingPaymentCreate": "payment_dtos",
    "MessageResponse": "shared_dtos",
    "DashboardResponse": "admin_dtos", "AdminCompanyResponse": "admin_dtos",
    "AdminUserResponse": "admin_dtos",
    "NotificationCreate": "notification_dtos", "NotificationUpdate": "notification_dtos",
    "NotificationResponse": "notification_dtos",
}

BARE_IMPORT_PACKAGES = [("repo", REPO_IMPORT_MODULES), ("dtos", DTO_IMPORT_MODULES)]


def expand_bare_imports(text: str) -> str:
    for pkg, mapping in BARE_IMPORT_PACKAGES:
        pattern = rf"from app\.{pkg} import ([A-Za-z_]+(?:\s*,\s*[A-Za-z_]+)*)"

        def repl(m: re.Match) -> str:
            names = [n.strip() for n in m.group(1).split(",") if n.strip()]
            if any(n not in mapping for n in names):
                return m.group(0)
            return "\n".join(f"from app.{pkg}.{mapping[n]} import {n}" for n in names)

        text = re.sub(pattern, repl, text)
    return text


def rewrite(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    for pattern, new in CLASS_RENAMES.items():
        text = re.sub(pattern, new, text)
    return expand_bare_imports(text)


def write_case_safe(src: Path, dst: Path, content: str) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.exists() and src.resolve() == dst.resolve():
        tmp = dst.with_name(dst.name + ".renametmp")
        tmp.write_text(content, encoding="utf-8")
        src.unlink()
        tmp.rename(dst)
        return
    dst.write_text(content, encoding="utf-8")
    if src.exists() and src != dst:
        src.unlink()


def rename_dirs() -> None:
    for rel in DIR_RENAMES:
        dst = APP / rel
        parent = dst.parent
        if not parent.exists():
            continue
        for entry in os.listdir(parent):
            actual = parent / entry
            if (actual.is_dir() and os.path.normcase(entry) == os.path.normcase(dst.name)
                    and entry != dst.name):
                os.rename(actual, dst)
                print(f"renamed dir {actual.relative_to(APP.parent)} -> {dst.relative_to(APP.parent)}")
                break


def main() -> None:
    for path in APP.rglob("*.py"):
        path.write_text(rewrite(path.read_text(encoding="utf-8")), encoding="utf-8")

    for old, new in FILE_MAP.items():
        src = APP / old
        dst = APP / new
        if not src.exists():
            if dst.exists():
                continue
            raise SystemExit(f"missing source: {src}")
        write_case_safe(src, dst, src.read_text(encoding="utf-8"))
        print(f"{old} -> {new}")

    rename_dirs()

    extra = [
        APP / "main.py",
        APP.parent / "test_notifications_api.py",
    ]
    for path in extra:
        path.write_text(rewrite(path.read_text(encoding="utf-8")), encoding="utf-8")
        print(f"rewrote {path.relative_to(APP.parent)}")

    for name in ("enums", "jwt_services", "booking_services", "payment_services",
                 "notification_services", "warehouse_services"):
        if name == "enums":
            init = APP / "enums" / "__init__.py"
        else:
            init = APP / "services" / name / "__init__.py"
        if not init.exists():
            init.write_text("", encoding="utf-8")

    print("\nDone. Verify with:")
    print('  python -c "from app.main import app"')
    print("  python test_notifications_api.py")


if __name__ == "__main__":
    main()
