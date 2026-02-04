import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.user import User
from app.db.models.roast import Roast


@pytest.mark.asyncio
class TestRoastEndpoint:
    async def test_roast_anonymous(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            )

            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert "share_id" in data
            assert data["score"] == 72
            assert "headline" in data
            assert "sections" in data
            assert "suggestions" in data
            # Anonymous users don't have resume_id
            assert data["resume_id"] is None

    async def test_roast_authenticated(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        auth_headers: dict,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
                headers=auth_headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert data["resume_id"] is not None

    async def test_roast_invalid_file_type(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/roast",
            files={"file": ("document.txt", b"not a pdf", "text/plain")},
        )
        assert response.status_code == 400
        assert "PDF" in response.json()["detail"]

    async def test_roast_file_too_large(self, client: AsyncClient):
        # Create a file larger than 5MB
        large_content = b"x" * (6 * 1024 * 1024)
        response = await client.post(
            "/api/v1/roast",
            files={"file": ("large.pdf", large_content, "application/pdf")},
        )
        assert response.status_code == 400
        assert "too large" in response.json()["detail"]


@pytest.mark.asyncio
class TestGetRoast:
    async def test_get_roast_by_share_id(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="test_share_123",
            score=75,
            score_breakdown={"clarity": 75, "impact": 75, "relevance": 75, "ats": 75},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.get("/api/v1/roast/test_share_123")
        assert response.status_code == 200
        data = response.json()
        assert data["share_id"] == "test_share_123"
        assert data["score"] == 75

    async def test_get_roast_not_found(self, client: AsyncClient):
        response = await client.get("/api/v1/roast/nonexistent")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestMyRoasts:
    async def test_get_my_roasts_empty(
        self, client: AsyncClient, auth_headers: dict
    ):
        response = await client.get("/api/v1/my-roasts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["roasts"] == []
        assert data["total"] == 0

    async def test_get_my_roasts_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/v1/my-roasts")
        assert response.status_code == 401
