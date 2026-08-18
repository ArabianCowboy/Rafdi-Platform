from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import engine
from app.models.base_model import Base
from app.models import User, Company, Role, UserRole, Warehouse, Booking, Payment, Notification

from app.api.auth_api         import router as auth_router
from app.api.warehouse_api    import router as warehouse_router
from app.api.booking_api      import router as booking_router
from app.api.payment_api      import router as payment_router
from app.api.admin_api        import router as admin_router
from app.api.notification_api import router as notification_router

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter


app = FastAPI(title="Rafdi Platform")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.rafdi.com", "www.rafdi.com", "rafdi.com", "localhost", "127.0.0.1"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.rafdi.com",
        "https://rafdi.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(warehouse_router)
app.include_router(booking_router)
app.include_router(payment_router)
app.include_router(admin_router)
app.include_router(notification_router)