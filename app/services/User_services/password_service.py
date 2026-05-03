import base64
import os

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class PasswordService:

    def hash_password(self, password: str) -> str:
        salt = os.urandom(16)
        kdf  = PBKDF2HMAC(
            algorithm  = hashes.SHA256(),
            length     = 32,
            salt       = salt,
            iterations = 480000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return f"{base64.urlsafe_b64encode(salt).decode()}${key.decode()}"

    def verify_password(self, password: str, hashed: str) -> bool:
        salt_b64, key_b64 = hashed.split("$")
        salt = base64.urlsafe_b64decode(salt_b64)
        kdf  = PBKDF2HMAC(
            algorithm  = hashes.SHA256(),
            length     = 32,
            salt       = salt,
            iterations = 480000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key.decode() == key_b64