from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings
from app.core.security import hash_password, verify_password


def test_password_hash_is_not_plaintext_and_verifies():
    password = "Password@123!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPassword@123!", hashed)


def test_expired_jwt_cannot_be_decoded_as_valid_token():
    token = jwt.encode(
        {"sub": "user-id", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    try:
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        pass
    else:
        raise AssertionError("Expired JWT was accepted")