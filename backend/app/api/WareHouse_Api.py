from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.Dtos.Warehouse_DTOs import WarehouseCreate, WarehouseUpdate, WarehouseResponse, WarehouseToggleResponse
from app.Repo.WarehouseRepo import WarehouseRepo
from app.services.Warehouse_services.Warehouse_service import WarehouseService
from app.services.Warehouse_services.Warehouse_access_service import WarehouseAccessService
from app.api.Auth_middleware import get_current_user, require_owner
from app.config import get_db

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


def get_warehouse_service(db: Session = Depends(get_db)) -> WarehouseService:
    warehouse_repo = WarehouseRepo(db)
    return WarehouseService(
        warehouse_repo = warehouse_repo,
        access_service = WarehouseAccessService(warehouse_repo),
    )


@router.get("/", response_model=list[WarehouseResponse])
def get_all(
    service     : WarehouseService = Depends(get_warehouse_service),
    current_user: dict             = Depends(get_current_user)
):
    return service.get_all()

@router.get("/my", response_model=list[WarehouseResponse])
def get_my_warehouses(
    service     : WarehouseService = Depends(get_warehouse_service),
    current_user: dict             = Depends(require_owner)
):
    return service.get_by_company(current_user["company_id"])

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_by_id(
    warehouse_id: int,
    service     : WarehouseService = Depends(get_warehouse_service),
    current_user: dict             = Depends(get_current_user)
):
    try:
        return service.get_by_id(warehouse_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    


@router.post("/", response_model=WarehouseResponse)
def create(
    data        : WarehouseCreate,
    service     : WarehouseService = Depends(get_warehouse_service),
    current_user: dict             = Depends(require_owner)
):
    try:
        return service.create(data, current_user["company_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{warehouse_id}", response_model=WarehouseResponse)
def update(
    warehouse_id: int,
    data        : WarehouseUpdate,
    service     : WarehouseService = Depends(get_warehouse_service),
    current_user: dict             = Depends(require_owner)
):
    try:
        return service.update(warehouse_id, data, current_user["company_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{warehouse_id}/toggle", response_model=WarehouseToggleResponse)
def toggle(
    warehouse_id: int,
    service     : WarehouseService = Depends(get_warehouse_service),
    current_user: dict             = Depends(require_owner)
):
    try:
        return service.toggle(warehouse_id, current_user["company_id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))