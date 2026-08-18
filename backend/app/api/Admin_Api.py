from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dtos.admin_dtos import AdminCompanyResponse, AdminUserResponse, DashboardResponse
from app.dtos.company_dtos import CompanyResponse, CompanyStatusUpdate
from app.dtos.warehouse_dtos import WarehouseResponse, WarehouseStatusUpdate, WarehouseToggleResponse
from app.repo.company_repo import CompanyRepo
from app.repo.warehouse_repo import WarehouseRepo
from app.repo.notification_repo import NotificationRepo
from app.repo.user_repo import UserRepo
from app.services.notification_services.notification_service import NotificationService
from app.services.notification_services.notification_trigger_service import NotificationTriggerService
from app.api.auth_middleware import require_admin
from app.config import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/companies", response_model=list[AdminCompanyResponse])
def get_all_companies(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    company_repo = CompanyRepo(db)
    return company_repo.get_all_admin()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    company_repo = CompanyRepo(db)
    return company_repo.get_dashboard_stats()


@router.patch("/companies/{id}/status", response_model=CompanyResponse)
def update_company_status(
    id: int,
    data: CompanyStatusUpdate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    company_repo = CompanyRepo(db)
    company = company_repo.update_status(id, data.Status)
    if not company:
        raise HTTPException(status_code=404, detail="الشركة غير موجودة")

    if data.Status == False:
        try:
            user = UserRepo(db).get_by_company_id(id)
            if user:
                notification_service = NotificationService(NotificationRepo(db))
                trigger = NotificationTriggerService(notification_service)
                trigger.on_company_disabled(user.UserID)
        except Exception:
            pass

    return company


@router.get("/warehouses", response_model=list[WarehouseResponse])
def get_all_warehouses(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    warehouse_repo = WarehouseRepo(db)
    return warehouse_repo.get_all_admin()


@router.patch("/warehouses/{id}/status", response_model=WarehouseToggleResponse)
def update_warehouse_status(
    id: int,
    data: WarehouseStatusUpdate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    warehouse_repo = WarehouseRepo(db)
    warehouse = warehouse_repo.update_status(id, data.IsActive)
    if not warehouse:
        raise HTTPException(status_code=404, detail="المستودع غير موجود")
    return warehouse


@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user_repo = UserRepo(db)
    return user_repo.get_all_admin()
