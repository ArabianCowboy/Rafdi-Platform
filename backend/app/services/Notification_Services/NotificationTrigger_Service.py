from app.services.Notification_Services import NotificationService
from app.Enums.EnumTypes import NotificationTypeEnum


class NotificationTriggerService:

    def __init__(self, notification_service: NotificationService):
        self.notification_service = notification_service


    def on_booking_created(self, owner_user_id: int, warehouse_name: str) -> None:
        self.notification_service.send(
            user_id = owner_user_id,
            type    = NotificationTypeEnum.info,
            message = f"تم استلام طلب حجز جديد للمستودع: {warehouse_name}",
        )

    def on_booking_confirmed(self, renter_user_id: int, warehouse_name: str) -> None:
        self.notification_service.send(
            user_id = renter_user_id,
            type    = NotificationTypeEnum.success,
            message = f"تم تأكيد حجزك للمستودع: {warehouse_name}",
        )

    def on_booking_cancelled(self, renter_user_id: int, warehouse_name: str) -> None:
        self.notification_service.send(
            user_id = renter_user_id,
            type    = NotificationTypeEnum.warning,
            message = f"تم إلغاء حجزك للمستودع: {warehouse_name}",
        )

    def on_payment_success(self, renter_user_id: int, owner_user_id: int, amount: str) -> None:
        self.notification_service.send(
            user_id = renter_user_id,
            type    = NotificationTypeEnum.success,
            message = f"تم الدفع بنجاح بمبلغ {amount} ريال",
        )
        self.notification_service.send(
            user_id = owner_user_id,
            type    = NotificationTypeEnum.success,
            message = f"تم استلام دفعة بمبلغ {amount} ريال",
        )

    def on_company_registered(self, admin_user_id: int, company_name: str) -> None:
        self.notification_service.send(
            user_id = admin_user_id,
            type    = NotificationTypeEnum.info,
            message = f"شركة جديدة تنتظر المراجعة: {company_name}",
        )

    def on_company_disabled(self, user_id: int) -> None:
        self.notification_service.send(
            user_id = user_id,
            type    = NotificationTypeEnum.error,
            message = "تم تعطيل حساب شركتك من قبل الإدارة",
        )
