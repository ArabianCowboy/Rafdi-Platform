import os
import unittest
from datetime import date
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient


os.environ.pop("MYSQL_URL", None)
os.environ["DATABASE_URL"] = "sqlite:///./test_notifications_api.db"
os.environ.setdefault("SECRET_KEY", "test-secret-key")

from app.api.auth_middleware import get_current_user
from app.api import admin_api
from app.dtos.auth_dtos import RegisterCreate
from app.dtos.booking_dtos import BookingStatusUpdate
from app.dtos.company_dtos import CompanyStatusUpdate
from app.enums.enum_types import AccountTypeEnum, BookingStatusEnum, PaymentStatusEnum
from app.config import SessionLocal, engine
from app.main import app
from app.models import Company, Notification, User
from app.models.base_model import Base
from app.services.payment_services.commission_service import CommissionService
from app.services.payment_services.payment_service import PaymentService
from app.services.booking_services.booking_service import BookingService
from app.services.user_services.auth_service import AuthService


class NotificationApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        app.dependency_overrides[get_current_user] = lambda: {
            "user_id": 1,
            "company_id": 1,
            "roles": ["renter_company"],
        }

        with SessionLocal() as db:
            db.add_all([
                Company(
                    CompanyID=1,
                    Name="Renter Co",
                    CommercialRegistration="REG-001",
                    Status=True,
                ),
                Company(
                    CompanyID=2,
                    Name="Owner Co",
                    CommercialRegistration="REG-002",
                    Status=True,
                ),
            ])
            db.add_all([
                User(
                    UserID=1,
                    CompanyID=1,
                    Email="renter@example.com",
                    PasswordHash="hash-1",
                ),
                User(
                    UserID=2,
                    CompanyID=2,
                    Email="owner@example.com",
                    PasswordHash="hash-2",
                ),
            ])
            db.add_all([
                Notification(
                    NotificationID=1,
                    UserID=1,
                    Type="info",
                    Message="Newest notification",
                    IsRead=False,
                ),
                Notification(
                    NotificationID=2,
                    UserID=1,
                    Type="success",
                    Message="Older notification",
                    IsRead=True,
                ),
                Notification(
                    NotificationID=3,
                    UserID=2,
                    Type="warning",
                    Message="Other user notification",
                    IsRead=False,
                ),
            ])
            db.commit()

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_get_notifications_returns_only_current_users_notifications_with_created_at(self):
        response = self.client.get("/notifications")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual([item["NotificationID"] for item in body], [2, 1])
        self.assertTrue(all(item["UserID"] == 1 for item in body))
        self.assertTrue(all("CreatedAt" in item for item in body))

    def test_mark_notification_read_marks_current_users_notification(self):
        response = self.client.patch("/notifications/1/read")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["IsRead"])

    def test_mark_notification_read_returns_403_for_other_users_notification(self):
        response = self.client.patch("/notifications/3/read")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["detail"], "ما عندك صلاحية لهذا الإشعار")

    def test_mark_notification_read_returns_404_for_missing_notification(self):
        response = self.client.patch("/notifications/9999/read")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "الإشعار غير موجود")

    def test_mark_all_notifications_read_marks_only_current_users_notifications(self):
        response = self.client.patch("/notifications/read-all")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "تم تعليم جميع الإشعارات كمقروءة"})

        with SessionLocal() as db:
            user_notification = db.get(Notification, 1)
            other_user_notification = db.get(Notification, 3)

            self.assertTrue(user_notification.IsRead)
            self.assertFalse(other_user_notification.IsRead)


if __name__ == "__main__":
    unittest.main()


class FakeDbSession:
    def __init__(self):
        self.committed = False
        self.rolled_back = False

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True


class RecordingTrigger:
    def __init__(self, should_raise: bool = False):
        self.should_raise = should_raise
        self.calls = []

    def _record(self, name: str, *args):
        self.calls.append((name, args))
        if self.should_raise:
            raise RuntimeError("notification failed")

    def on_booking_confirmed(self, renter_user_id: int, warehouse_name: str):
        self._record("on_booking_confirmed", renter_user_id, warehouse_name)

    def on_payment_success(self, renter_user_id: int, owner_user_id: int, amount: str):
        self._record("on_payment_success", renter_user_id, owner_user_id, amount)

    def on_booking_cancelled(self, renter_user_id: int, warehouse_name: str):
        self._record("on_booking_cancelled", renter_user_id, warehouse_name)

    def on_company_registered(self, admin_user_id: int, company_name: str):
        self._record("on_company_registered", admin_user_id, company_name)

    def on_company_disabled(self, user_id: int):
        self._record("on_company_disabled", user_id)


class PaymentNotificationWiringTests(unittest.TestCase):
    def make_service(self, trigger: RecordingTrigger):
        db = FakeDbSession()
        booking = SimpleNamespace(
            BookingID=10,
            WarehouseID=20,
            RenterCompanyID=30,
            TotalPrice=Decimal("150.00"),
            Status=BookingStatusEnum.pending,
        )
        payment = SimpleNamespace(
            PaymentID=40,
            BookingID=10,
            Amount=Decimal("0.00"),
            PaymentDate=date.today(),
            Status=PaymentStatusEnum.pending,
            MoyasarPaymentID=None,
            MoyasarStatus=None,
            PaymentMethod=None,
        )

        payment_repo = SimpleNamespace(
            db=db,
            get_by_booking=lambda booking_id: payment,
        )
        booking_repo = SimpleNamespace(get_by_id=lambda booking_id: booking)
        user_repo = SimpleNamespace(
            get_by_company_id=lambda company_id: {
                30: SimpleNamespace(UserID=1),
                50: SimpleNamespace(UserID=2),
            }.get(company_id)
        )
        warehouse_repo = SimpleNamespace(
            get_by_id=lambda warehouse_id: SimpleNamespace(WarehouseID=20, CompanyID=50, Name="Main Warehouse")
        )

        service = PaymentService(
            payment_repo=payment_repo,
            booking_repo=booking_repo,
            commission_service=CommissionService(),
            notification_trigger=trigger,
            user_repo=user_repo,
            warehouse_repo=warehouse_repo,
        )
        return service, booking

    def test_process_payment_triggers_booking_confirmed_and_payment_success_notifications(self):
        trigger = RecordingTrigger()
        service, _booking = self.make_service(trigger)

        service.process_payment(10, "pay_1", "paid", "card")

        self.assertEqual(
            trigger.calls,
            [
                ("on_booking_confirmed", (1, "Main Warehouse")),
                ("on_payment_success", (1, 2, "150.00")),
            ],
        )

    def test_process_payment_swallows_notification_failures(self):
        trigger = RecordingTrigger(should_raise=True)
        service, _booking = self.make_service(trigger)

        response = service.process_payment(10, "pay_1", "paid", "card")

        self.assertEqual(response.BookingID, 10)


class BookingNotificationWiringTests(unittest.TestCase):
    def make_service(self, trigger: RecordingTrigger):
        booking = SimpleNamespace(
            BookingID=10,
            WarehouseID=20,
            RenterCompanyID=30,
            StartDate=date(2026, 1, 1),
            EndDate=date(2026, 1, 2),
            TotalPrice=Decimal("150.00"),
            Status=BookingStatusEnum.pending,
        )
        updated = SimpleNamespace(
            BookingID=10,
            WarehouseID=20,
            RenterCompanyID=30,
            StartDate=date(2026, 1, 1),
            EndDate=date(2026, 1, 2),
            TotalPrice=Decimal("150.00"),
            Status=BookingStatusEnum.cancelled,
        )
        booking_repo = SimpleNamespace(
            db=FakeDbSession(),
            get_by_id=lambda booking_id: booking,
            update=lambda booking_id, data: updated,
        )

        return BookingService(
            booking_repo=booking_repo,
            payment_repo=SimpleNamespace(),
            warehouse_repo=SimpleNamespace(get_by_id=lambda warehouse_id: SimpleNamespace(Name="Main Warehouse")),
            user_repo=SimpleNamespace(get_by_company_id=lambda company_id: SimpleNamespace(UserID=1)),
            overlap_service=SimpleNamespace(),
            price_service=SimpleNamespace(),
            notification_trigger=trigger,
        )

    def test_update_status_triggers_booking_cancelled_notification(self):
        trigger = RecordingTrigger()
        service = self.make_service(trigger)

        service.update_status(10, BookingStatusUpdate(Status=BookingStatusEnum.cancelled))

        self.assertEqual(trigger.calls, [("on_booking_cancelled", (1, "Main Warehouse"))])

    def test_update_status_swallows_booking_cancelled_notification_failure(self):
        trigger = RecordingTrigger(should_raise=True)
        service = self.make_service(trigger)

        response = service.update_status(10, BookingStatusUpdate(Status=BookingStatusEnum.cancelled))

        self.assertEqual(response.BookingID, 10)


class AdminNotificationWiringTests(unittest.TestCase):
    def test_update_company_status_notifies_primary_user_when_disabled(self):
        trigger = RecordingTrigger()

        fake_company_repo = SimpleNamespace(
            update_status=lambda company_id, status: SimpleNamespace(CompanyID=company_id, Status=status)
        )
        fake_user_repo = SimpleNamespace(get_by_company_id=lambda company_id: SimpleNamespace(UserID=7))

        with patch.object(admin_api, "CompanyRepo", return_value=fake_company_repo), \
             patch.object(admin_api, "UserRepo", return_value=fake_user_repo), \
             patch.object(admin_api, "NotificationRepo", return_value=SimpleNamespace()), \
             patch.object(admin_api, "NotificationService", return_value=SimpleNamespace()), \
             patch.object(admin_api, "NotificationTriggerService", return_value=trigger):
            admin_api.update_company_status(
                9,
                CompanyStatusUpdate(Status=False),
                current_user={"roles": ["admin"]},
                db=SimpleNamespace(),
            )

        self.assertEqual(trigger.calls, [("on_company_disabled", (7,))])

    def test_update_company_status_swallows_notification_failure(self):
        trigger = RecordingTrigger(should_raise=True)

        fake_company_repo = SimpleNamespace(
            update_status=lambda company_id, status: SimpleNamespace(CompanyID=company_id, Status=status)
        )
        fake_user_repo = SimpleNamespace(get_by_company_id=lambda company_id: SimpleNamespace(UserID=7))

        with patch.object(admin_api, "CompanyRepo", return_value=fake_company_repo), \
             patch.object(admin_api, "UserRepo", return_value=fake_user_repo), \
             patch.object(admin_api, "NotificationRepo", return_value=SimpleNamespace()), \
             patch.object(admin_api, "NotificationService", return_value=SimpleNamespace()), \
             patch.object(admin_api, "NotificationTriggerService", return_value=trigger):
            response = admin_api.update_company_status(
                9,
                CompanyStatusUpdate(Status=False),
                current_user={"roles": ["admin"]},
                db=SimpleNamespace(),
            )

        self.assertFalse(response.Status)


class AuthNotificationWiringTests(unittest.TestCase):
    def make_service(self, trigger: RecordingTrigger):
        db = FakeDbSession()
        user_repo = SimpleNamespace(
            db=db,
            add=lambda data, password_hash, company_id: SimpleNamespace(
                UserID=5,
                CompanyID=company_id,
                Email=data.email,
            ),
            get_all_admin=lambda: [
                {"UserID": 1, "Roles": ["admin"]},
                {"UserID": 2, "Roles": ["warehouse_owner"]},
                {"UserID": 3, "Roles": ["admin", "warehouse_owner"]},
            ],
        )
        company_repo = SimpleNamespace(add=lambda data: SimpleNamespace(CompanyID=9, Name=data.company_name))

        service = AuthService(
            user_repo=user_repo,
            company_repo=company_repo,
            user_role_repo=SimpleNamespace(),
            password_service=SimpleNamespace(hash_password=lambda password: "hashed"),
            validation_service=SimpleNamespace(validate_register=lambda data: None),
            role_service=SimpleNamespace(assign_roles=lambda user_id, account_types: None),
            jwt_service=SimpleNamespace(),
            notification_trigger=trigger,
        )
        return service

    def test_register_notifies_only_admin_users(self):
        trigger = RecordingTrigger()
        service = self.make_service(trigger)

        service.register(
            RegisterCreate(
                company_name="New Co",
                commercial_registration="REG-100",
                account_types=[AccountTypeEnum.renter_company],
                email="user@example.com",
                password="secret123",
            )
        )

        self.assertEqual(
            trigger.calls,
            [
                ("on_company_registered", (1, "New Co")),
                ("on_company_registered", (3, "New Co")),
            ],
        )

    def test_register_swallows_notification_failure(self):
        trigger = RecordingTrigger(should_raise=True)
        service = self.make_service(trigger)

        response = service.register(
            RegisterCreate(
                company_name="New Co",
                commercial_registration="REG-100",
                account_types=[AccountTypeEnum.renter_company],
                email="user@example.com",
                password="secret123",
            )
        )

        self.assertEqual(response.CompanyID, 9)
