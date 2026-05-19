from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.Dtos.Admin_DTOs import AdminCompanyResponse, AdminUserResponse, DashboardResponse
from app.Dtos.Company_DTOs import CompanyResponse, CompanyStatusUpdate
from app.Dtos.Warehouse_DTOs import WarehouseResponse, WarehouseStatusUpdate, WarehouseToggleResponse
from app.Repo.Companey_Repo import CompanyRepo
from app.Repo.WarehouseRepo import WarehouseRepo
from app.Repo.Notification_Repo import NotificationRepo
from app.Repo.user_repo import UserRepo
from app.services.Notification_Services.Notification_Service import NotificationService
from app.services.Notification_Services.NotificationTrigger_Service import NotificationTriggerService
from app.api.Auth_middleware import require_admin
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
