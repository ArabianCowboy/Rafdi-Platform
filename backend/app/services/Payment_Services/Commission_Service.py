from decimal import Decimal


class CommissionService:

    RENTER_COMMISSION = Decimal("0.05")
    OWNER_COMMISSION  = Decimal("0.07")

    def calculate(self, base_amount: Decimal) -> dict:
        renter_commission = round(base_amount * self.RENTER_COMMISSION, 2)
        owner_commission  = round(base_amount * self.OWNER_COMMISSION, 2)
        total_amount      = base_amount + renter_commission
        net_amount        = base_amount - owner_commission


        return {
            "base_amount"      : base_amount,
            "renter_commission": renter_commission,
            "owner_commission" : owner_commission,
            "total_amount"     : total_amount,
            "net_amount"       : net_amount,
        }
