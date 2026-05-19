from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Dtos.Admin_DTOs import AdminCompanyResponse
from app.Repo.Companey_Repo import CompanyRepo
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