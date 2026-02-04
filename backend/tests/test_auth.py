import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User


@pytest.mark.asyncio
class TestSignup:
    async def test_signup_success(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "newuser@example.com",
                "password": "securepassword123",
                "full_name": "New User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert data["is_active"] is True
        assert "id" in data
        assert "hashed_password" not in data

    async def test_signup_duplicate_email(self, client: AsyncClient, test_user: User):
        response = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": test_user.email,
                "password": "anotherpassword",
                "full_name": "Another User",
            },
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    async def test_signup_invalid_email(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/signup",
            json={
                "email": "notanemail",
                "password": "password123",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 422

    async def test_signup_missing_fields(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/signup",
            json={"email": "test@example.com"},
        )
        assert response.status_code == 422


@pytest.mark.asyncio
class TestLogin:
    async def test_login_success(self, client: AsyncClient, test_user: User):
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "testpassword123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 401

    async def test_login_inactive_user(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        from app.core.security import get_password_hash

        inactive_user = User(
            email="inactive@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Inactive User",
            is_active=False,
        )
        db_session.add(inactive_user)
        await db_session.commit()

        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "inactive@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 403
        assert "disabled" in response.json()["detail"]


@pytest.mark.asyncio
class TestMe:
    async def test_get_me_authenticated(
        self, client: AsyncClient, test_user: User, auth_headers: dict
    ):
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name

    async def test_get_me_no_token(self, client: AsyncClient):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalidtoken"},
        )
        assert response.status_code == 401
