from slowapi import Limiter
from starlette.requests import Request


def get_real_ip(request: Request) -> str:
    """
    Railway يمر الطلبات عبر proxy — لازم نقرأ IP المستخدم
    الحقيقي من X-Forwarded-For مو request.client.host
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host


limiter = Limiter(key_func=get_real_ip)