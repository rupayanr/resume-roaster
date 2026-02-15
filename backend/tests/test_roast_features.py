"""Tests for the new roasting features: intensity, industry, hot takes, reactions."""
import pytest
from unittest.mock import patch
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.roast import Roast


@pytest.mark.asyncio
class TestRoastWithIntensity:
    async def test_roast_with_mild_intensity(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                data={"intensity": "mild", "industry": "general"},
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["intensity"] == "mild"
            mock_generate.assert_called_once()
            call_args = mock_generate.call_args
            assert call_args[1]["intensity"] == "mild"

    async def test_roast_with_brutal_intensity(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                data={"intensity": "brutal", "industry": "general"},
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["intensity"] == "brutal"

    async def test_roast_default_intensity(
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
            assert data["intensity"] == "medium"

    async def test_roast_invalid_intensity(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
    ):
        response = await client.post(
            "/api/v1/roast",
            data={"intensity": "invalid", "industry": "general"},
            files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
        )

        assert response.status_code == 400
        assert "intensity" in response.json()["detail"].lower()


@pytest.mark.asyncio
class TestRoastWithIndustry:
    async def test_roast_with_tech_industry(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                data={"intensity": "medium", "industry": "tech"},
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["industry"] == "tech"
            mock_generate.assert_called_once()
            call_args = mock_generate.call_args
            assert call_args[1]["industry"] == "tech"

    async def test_roast_with_finance_industry(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                data={"intensity": "medium", "industry": "finance"},
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["industry"] == "finance"

    async def test_roast_default_industry(
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
            # General industry is stored as None
            assert data["industry"] is None

    async def test_roast_invalid_industry(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
    ):
        response = await client.post(
            "/api/v1/roast",
            data={"intensity": "medium", "industry": "invalid"},
            files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
        )

        assert response.status_code == 400
        assert "industry" in response.json()["detail"].lower()


@pytest.mark.asyncio
class TestRoastBadges:
    async def test_roast_returns_badges(
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
            assert "badges" in data
            assert isinstance(data["badges"], list)


@pytest.mark.asyncio
class TestHotTakes:
    async def test_get_hot_takes_empty(self, client: AsyncClient):
        response = await client.get("/api/v1/hot-takes")
        assert response.status_code == 200
        data = response.json()
        assert "hot_takes" in data
        assert data["hot_takes"] == []

    async def test_get_hot_takes_with_public_roasts(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        # Create public roasts
        roast1 = Roast(
            share_id="public_roast_1",
            score=45,
            score_breakdown={"clarity": 45, "impact": 45, "relevance": 45, "ats": 45},
            headline="Your resume needs serious work!",
            sections=[],
            suggestions=[],
            ats_tips=[],
            is_headline_public=True,
        )
        roast2 = Roast(
            share_id="public_roast_2",
            score=80,
            score_breakdown={"clarity": 80, "impact": 80, "relevance": 80, "ats": 80},
            headline="Impressive resume, minor tweaks needed.",
            sections=[],
            suggestions=[],
            ats_tips=[],
            is_headline_public=True,
        )
        # Private roast - should not appear
        roast3 = Roast(
            share_id="private_roast",
            score=60,
            score_breakdown={"clarity": 60, "impact": 60, "relevance": 60, "ats": 60},
            headline="This should not appear",
            sections=[],
            suggestions=[],
            ats_tips=[],
            is_headline_public=False,
        )

        db_session.add_all([roast1, roast2, roast3])
        await db_session.commit()

        response = await client.get("/api/v1/hot-takes")
        assert response.status_code == 200
        data = response.json()
        assert len(data["hot_takes"]) == 2
        headlines = [ht["headline"] for ht in data["hot_takes"]]
        assert "This should not appear" not in headlines

    async def test_get_hot_takes_with_limit(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        # Create 5 public roasts
        for i in range(5):
            roast = Roast(
                share_id=f"hot_take_{i}",
                score=50 + i,
                score_breakdown={"clarity": 50, "impact": 50, "relevance": 50, "ats": 50},
                headline=f"Headline {i}",
                sections=[],
                suggestions=[],
                ats_tips=[],
                is_headline_public=True,
            )
            db_session.add(roast)
        await db_session.commit()

        response = await client.get("/api/v1/hot-takes?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data["hot_takes"]) == 3


@pytest.mark.asyncio
class TestTogglePublicHeadline:
    async def test_toggle_headline_public(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="toggle_test",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
            is_headline_public=False,
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.patch(
            "/api/v1/roast/toggle_test/public?is_public=true"
        )
        assert response.status_code == 200
        assert response.json()["is_headline_public"] is True

    async def test_toggle_headline_private(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="toggle_test_2",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
            is_headline_public=True,
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.patch(
            "/api/v1/roast/toggle_test_2/public?is_public=false"
        )
        assert response.status_code == 200
        assert response.json()["is_headline_public"] is False

    async def test_toggle_headline_not_found(self, client: AsyncClient):
        response = await client.patch(
            "/api/v1/roast/nonexistent/public?is_public=true"
        )
        assert response.status_code == 404


@pytest.mark.asyncio
class TestReactions:
    async def test_add_reaction(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="reaction_test",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
            reactions={},
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.post(
            "/api/v1/roast/reaction_test/react",
            json={"reaction": "fire"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["reactions"]["fire"] == 1

    async def test_add_multiple_reactions(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="multi_reaction_test",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
            reactions={"fire": 2},
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.post(
            "/api/v1/roast/multi_reaction_test/react",
            json={"reaction": "fire"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["reactions"]["fire"] == 3

    async def test_add_different_reaction_types(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="diff_reaction_test",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
            reactions={},
        )
        db_session.add(roast)
        await db_session.commit()

        # Add different reactions
        for reaction in ["fire", "crying_laughing", "ouch", "facts", "survived"]:
            response = await client.post(
                "/api/v1/roast/diff_reaction_test/react",
                json={"reaction": reaction},
            )
            assert response.status_code == 200

        # Get the roast to verify
        response = await client.get("/api/v1/roast/diff_reaction_test")
        data = response.json()
        assert data["reactions"]["fire"] == 1
        assert data["reactions"]["crying_laughing"] == 1
        assert data["reactions"]["ouch"] == 1
        assert data["reactions"]["facts"] == 1
        assert data["reactions"]["survived"] == 1

    async def test_add_invalid_reaction(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="invalid_reaction_test",
            score=70,
            score_breakdown={"clarity": 70, "impact": 70, "relevance": 70, "ats": 70},
            headline="Test headline",
            sections=[],
            suggestions=[],
            ats_tips=[],
            reactions={},
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.post(
            "/api/v1/roast/invalid_reaction_test/react",
            json={"reaction": "invalid_reaction"},
        )
        assert response.status_code == 400
        assert "reaction" in response.json()["detail"].lower()

    async def test_add_reaction_not_found(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/roast/nonexistent/react",
            json={"reaction": "fire"},
        )
        assert response.status_code == 404


@pytest.mark.asyncio
class TestOGImage:
    async def test_get_og_image(
        self, client: AsyncClient, db_session: AsyncSession
    ):
        roast = Roast(
            share_id="og_image_test",
            score=75,
            score_breakdown={"clarity": 75, "impact": 75, "relevance": 75, "ats": 75},
            headline="Your resume is on fire!",
            sections=[],
            suggestions=[],
            ats_tips=[],
            intensity="brutal",
        )
        db_session.add(roast)
        await db_session.commit()

        response = await client.get("/api/v1/roast/og_image_test/og-image")
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
        # Check it returns actual image data
        assert len(response.content) > 100

    async def test_get_og_image_not_found(self, client: AsyncClient):
        response = await client.get("/api/v1/roast/nonexistent/og-image")
        assert response.status_code == 404


@pytest.mark.asyncio
class TestRoastResponseIncludes:
    async def test_roast_response_includes_new_fields(
        self,
        client: AsyncClient,
        sample_pdf_bytes: bytes,
        mock_roast_response: dict,
    ):
        with patch("app.api.routes.roast.generate_roast") as mock_generate:
            mock_generate.return_value = mock_roast_response

            response = await client.post(
                "/api/v1/roast",
                data={"intensity": "brutal", "industry": "tech"},
                files={"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")},
            )

            assert response.status_code == 200
            data = response.json()

            # Check all new fields are present
            assert "intensity" in data
            assert "industry" in data
            assert "badges" in data
            assert "is_headline_public" in data
            assert "reactions" in data

            # Check default values
            assert data["intensity"] == "brutal"
            assert data["industry"] == "tech"
            assert isinstance(data["badges"], list)
            assert data["is_headline_public"] is False
            assert data["reactions"] == {}
