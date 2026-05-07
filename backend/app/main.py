from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import engine
from app.models.Base_Model import Base, TimestampMixin
from app.api.Auth_Api import router as auth_router

from app.models import User, Company, Role, User_Role, Warehouse, Booking, Payment, Notification

app = FastAPI(title="Rafdi Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.rafdi.com",
        "https://rafdi-platform-frontend-production.up.railway.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
