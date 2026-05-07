from enum import Enum

class AccountTypeEnum(str, Enum):
    warehouse_owner = "warehouse_owner"
    renter_company  = "renter_company"

class NotificationTypeEnum(str, Enum):
    info    = "info"
    warning = "warning"
    success = "success"
    error   = "error"
 
 
class BookingStatusEnum(str, Enum):
    pending   = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
 
 
class PaymentStatusEnum(str, Enum):
    pending  = "pending"
    paid     = "paid"
    failed   = "failed"
    refunded = "refunded"
