from typing import Optional
from sqlalchemy.orm import Session
 
from app.Repo.Base_Repo import BaseRepo
from app.models import Payment
from app.Dtos.Payment_DTOs import PaymentCreate

class PaymentRepo(BaseRepo[Payment]):
 
    def __init__(self, db: Session):
        super().__init__(db)
 
    def get_by_id(self, id: int) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.PaymentID == id).first()
 
    def get_by_booking(self, booking_id: int) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.BookingID == booking_id).first()
 
    def get_all(self) -> list[Payment]:
        return self.db.query(Payment).all()
 
    def add(self, obj: PaymentCreate) -> Payment:
        payment = Payment(
            BookingID   = obj.BookingID,
            Amount      = obj.Amount,
            PaymentDate = obj.PaymentDate,
            Status      = obj.Status,
        )
        self.db.add(payment)
        self.db.flush()
        self.db.refresh(payment)
        return payment
 
    def update(self, id: int, obj: PaymentCreate) -> Optional[Payment]:
        payment = self.get_by_id(id)
        
        if not payment:
            return None
        
        if obj.Amount: 
            payment.Amount = obj.Amount

        if obj.PaymentDate:
            payment.PaymentDate = obj.PaymentDate

        if obj.Status: 
            payment.Status = obj.Status

        self.db.commit()
        self.db.refresh(payment)
        return payment
 
    def delete(self, id: int) -> None:
        payment = self.get_by_id(id)
        if payment:
            self.db.delete(payment)
            self.db.commit()