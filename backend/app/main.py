from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import engine
from app.models.Base_Model import Base
from app.models import User, Company, Role, User_Role, Warehouse, Booking, Payment, Notification

from app.api.Auth_Api         import router as auth_router
from app.api.WareHouse_Api    import router as warehouse_router
from app.api.Booking_Api      import router as booking_router

app = FastAPI(title="Rafdi Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.rafdi.com",
        "https://rafdi.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(warehouse_router)
app.include_router(booking_router)