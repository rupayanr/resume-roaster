import pytest
from unittest.mock import patch
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.roast import Roast


@pytest.mark.asyncio
class TestRoastEndpoint:
    async def test_roast_creates_record(
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

    async def test_roast_with_intensity(
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
                data={"intensity": "brutal"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["intensity"] == "brutal"
            mock_generate.assert_called_once()
            call_args = mock_generate.call_args
            assert call_args[1]["intensity"] == "brutal"

    async def test_roast_invalid_file_type(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/roast",
            files={"file": ("document.txt", b"not a pdf", "text/plain")},
        )
        assert response.status_code == 400
        assert "PDF" in response.json()["detail"]

    async def test_roast_file_too_large(self, client: AsyncClient):
        # Create a file larger than 5MB with PDF magic bytes
        large_content = b"%PDF" + b"x" * (6 * 1024 * 1024)
        response = await client.post(
            "/api/v1/roast",
            files={"file": ("large.pdf", large_content, "application/pdf")},
        )
        assert response.status_code == 413  # Request Entity Too Large
        assert "too large" in response.json()["detail"]

    async def test_roast_invalid_intensity(
        self, client: AsyncClient, sample_pdf_bytes: bytes
    ):
        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            data={"intensity": "extreme"},
        )
        assert response.status_code == 400
        assert "Invalid intensity" in response.json()["detail"]


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
        response = await client.get("/api/v1/roast/nonexistent_id_123")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestHotTakes:
    async def test_get_hot_takes_empty(self, client: AsyncClient):
        response = await client.get("/api/v1/hot-takes")
        assert response.status_code == 200
        data = response.json()
        assert data["hot_takes"] == []

    async def test_get_hot_takes_with_public_roasts(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="hot_take_123",
            score=80,
            score_breakdown={"clarity": 80, "impact": 80, "relevance": 80, "ats": 80},
            headline="A spicy hot take!",
            sections=[],
            suggestions=[],
            ats_tips=[],
            is_headline_public=True,
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.get("/api/v1/hot-takes")
        assert response.status_code == 200
        data = response.json()
        assert len(data["hot_takes"]) == 1
        assert data["hot_takes"][0]["headline"] == "A spicy hot take!"


@pytest.mark.asyncio
class TestReactions:
    async def test_add_reaction(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="react_test_123",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Reaction test",
            sections=[],
            suggestions=[],
            ats_tips=[],
            reactions={},
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.post(
            "/api/v1/roast/react_test_123/react",
            json={"reaction": "fire"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["reactions"]["fire"] == 1

    async def test_invalid_reaction(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="invalid_react_123",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Invalid reaction test",
            sections=[],
            suggestions=[],
            ats_tips=[],
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.post(
            "/api/v1/roast/invalid_react_123/react",
            json={"reaction": "invalid_emoji"},
        )
        assert response.status_code == 400
