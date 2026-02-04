import pytest
from datetime import timedelta

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)


class TestPasswordHashing:
    def test_hash_password(self):
        password = "mysecretpassword"
        hashed = get_password_hash(password)
        assert hashed != password
        assert hashed.startswith("$2b$")  # bcrypt prefix

    def test_verify_correct_password(self):
        password = "mysecretpassword"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        password = "mysecretpassword"
        hashed = get_password_hash(password)
        assert verify_password("wrongpassword", hashed) is False

    def test_different_hashes_for_same_password(self):
        password = "mysecretpassword"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        assert hash1 != hash2  # Salt should be different


class TestJWT:
    def test_create_access_token(self):
        data = {"sub": "user123"}
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_valid_token(self):
        data = {"sub": "user123"}
        token = create_access_token(data)
        payload = decode_access_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert "exp" in payload

    def test_decode_invalid_token(self):
        payload = decode_access_token("invalidtoken")
        assert payload is None

    def test_decode_expired_token(self):
        data = {"sub": "user123"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))
        payload = decode_access_token(token)
        assert payload is None

    def test_custom_expiry(self):
        data = {"sub": "user123"}
        token = create_access_token(data, expires_delta=timedelta(hours=1))
        payload = decode_access_token(token)
        assert payload is not None
