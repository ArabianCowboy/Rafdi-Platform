from slowapi import Limiter
from starlette.requests import Request


def get_real_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ips = [ip.strip() for ip in forwarded.split(",")]
        return ips[-1]
    return request.client.host


limiter = Limiter(key_func=get_real_ip)