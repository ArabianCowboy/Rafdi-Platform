from app.Repo import WarehouseRepo


class WarehouseAccessService:

    def __init__(self, warehouse_repo: WarehouseRepo):

        self.warehouse_repo = warehouse_repo

    def check_owner(self, warehouse_id: int, company_id: int) -> None:

        warehouse = self.warehouse_repo.get_by_id(warehouse_id)

        if not warehouse:
            raise ValueError("المستودع غير موجود")
        
        if warehouse.CompanyID != company_id:
            raise ValueError("ما عندك صلاحية لتعديل هذا المستودع")
