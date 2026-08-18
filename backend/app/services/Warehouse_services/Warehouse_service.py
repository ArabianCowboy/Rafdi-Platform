from typing import Optional
from app.repo.warehouse_repo import WarehouseRepo
from app.dtos.warehouse_dtos import WarehouseCreate, WarehouseUpdate, WarehouseResponse, WarehouseToggleResponse
from app.services.warehouse_services.warehouse_access_service import WarehouseAccessService

class WarehouseService:

    def __init__(
        self,
        warehouse_repo  : WarehouseRepo,
        access_service  : WarehouseAccessService,
    ):
        self.warehouse_repo = warehouse_repo
        self.access_service = access_service


    def get_all(self, exclude_company_id: Optional[int] = None) -> list[WarehouseResponse]:

        warehouses = self.warehouse_repo.get_all(exclude_company_id)

        return [WarehouseResponse.model_validate(w) for w in warehouses]

    def get_all_admin(self) -> list[WarehouseResponse]:

        warehouses = self.warehouse_repo.get_all_admin()

        return [WarehouseResponse.model_validate(w) for w in warehouses]

    def get_by_id(self, warehouse_id: int) -> WarehouseResponse:

        warehouse = self.warehouse_repo.get_by_id(warehouse_id)

        if not warehouse:

            raise ValueError("المستودع غير موجود")
        
        return WarehouseResponse.model_validate(warehouse)
    

    def get_by_company(self, company_id: int) -> list[WarehouseResponse]:
        warehouses = self.warehouse_repo.get_by_company(company_id)
        return [WarehouseResponse.model_validate(w) for w in warehouses]


    def create(self, data: WarehouseCreate, company_id: int) -> WarehouseResponse:

        data.CompanyID = company_id

        warehouse = self.warehouse_repo.add(data)

        self.warehouse_repo.db.commit()

        return WarehouseResponse.model_validate(warehouse)


    def update(self, warehouse_id: int, data: WarehouseUpdate, company_id: int) -> WarehouseResponse:

        self.access_service.check_owner(warehouse_id, company_id)

        updated = self.warehouse_repo.update(warehouse_id, data)

        self.warehouse_repo.db.commit()

        return WarehouseResponse.model_validate(updated)


    def toggle(self, warehouse_id: int, company_id: int) -> WarehouseToggleResponse:

        self.access_service.check_owner(warehouse_id, company_id)

        updated = self.warehouse_repo.toggle(warehouse_id)

        self.warehouse_repo.db.commit()

        return WarehouseToggleResponse.model_validate(updated)


    def delete(self, warehouse_id: int, company_id: int) -> None:

        self.access_service.check_owner(warehouse_id, company_id)

        self.warehouse_repo.delete(warehouse_id)