import pytest
from unittest.mock import patch
from io import BytesIO
from httpx import AsyncClient


@pytest.mark.asyncio
class TestHealthEndpoint:
    async def test_health_check_returns_healthy(self, client: AsyncClient):
        """Test that health endpoint returns healthy status."""
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


@pytest.mark.asyncio
class TestRoastEndpoint:
    @patch("app.api.routes.roast.generate_roast")
    @patch("app.api.routes.roast.extract_text_from_pdf")
    async def test_roast_endpoint_success(
        self, mock_extract, mock_generate, client: AsyncClient, sample_pdf_bytes, mock_roast_response
    ):
        """Test successful resume roast."""
        mock_extract.return_value = "John Doe\nSoftware Engineer"
        mock_generate.return_value = mock_roast_response

        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", BytesIO(sample_pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "share_id" in data
        assert data["score"] == 72
        assert "headline" in data
        assert "sections" in data
        assert "suggestions" in data

    async def test_roast_endpoint_rejects_non_pdf(self, client: AsyncClient):
        """Test that non-PDF files are rejected."""
        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.txt", BytesIO(b"Not a PDF"), "text/plain")},
        )

        assert response.status_code == 400
        assert "PDF" in response.json()["detail"]

    async def test_roast_endpoint_rejects_large_file(self, client: AsyncClient):
        """Test that files exceeding max size are rejected."""
        # Create a file larger than 5MB (default limit)
        large_content = b"x" * (6 * 1024 * 1024)  # 6MB

        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", BytesIO(large_content), "application/pdf")},
        )

        assert response.status_code == 400
        assert "large" in response.json()["detail"].lower()

    @patch("app.api.routes.roast.extract_text_from_pdf")
    async def test_roast_endpoint_handles_pdf_parse_error(
        self, mock_extract, client: AsyncClient, sample_pdf_bytes
    ):
        """Test handling of PDF parsing errors."""
        mock_extract.side_effect = Exception("PDF parsing failed")

        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", BytesIO(sample_pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 400
        assert "parse" in response.json()["detail"].lower()

    @patch("app.api.routes.roast.extract_text_from_pdf")
    async def test_roast_endpoint_rejects_empty_pdf(
        self, mock_extract, client: AsyncClient, sample_pdf_bytes
    ):
        """Test that PDFs with no extractable text are rejected."""
        mock_extract.return_value = ""

        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", BytesIO(sample_pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 400
        assert "extract" in response.json()["detail"].lower()

    @patch("app.api.routes.roast.generate_roast")
    @patch("app.api.routes.roast.extract_text_from_pdf")
    async def test_roast_endpoint_handles_ai_error(
        self, mock_extract, mock_generate, client: AsyncClient, sample_pdf_bytes
    ):
        """Test handling of AI generation errors."""
        mock_extract.return_value = "Resume text"
        mock_generate.side_effect = Exception("AI API error")

        response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", BytesIO(sample_pdf_bytes), "application/pdf")},
        )

        assert response.status_code == 500
        assert "roast" in response.json()["detail"].lower()

    async def test_roast_endpoint_requires_file(self, client: AsyncClient):
        """Test that file is required."""
        response = await client.post("/api/v1/roast")
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
class TestGetRoastEndpoint:
    @patch("app.api.routes.roast.generate_roast")
    @patch("app.api.routes.roast.extract_text_from_pdf")
    async def test_get_roast_returns_stored_roast(
        self, mock_extract, mock_generate, client: AsyncClient, sample_pdf_bytes, mock_roast_response
    ):
        """Test retrieving a stored roast by share_id."""
        mock_extract.return_value = "Resume text"
        mock_generate.return_value = mock_roast_response

        # First, create a roast
        create_response = await client.post(
            "/api/v1/roast",
            files={"file": ("resume.pdf", BytesIO(sample_pdf_bytes), "application/pdf")},
        )
        share_id = create_response.json()["share_id"]

        # Then retrieve it
        get_response = await client.get(f"/api/v1/roast/{share_id}")

        assert get_response.status_code == 200
        assert get_response.json()["share_id"] == share_id
        assert get_response.json()["score"] == mock_roast_response["score"]

    async def test_get_roast_returns_404_for_unknown_id(self, client: AsyncClient):
        """Test that unknown roast ID returns 404."""
        response = await client.get("/api/v1/roast/unknown_share_id")

        assert response.status_code == 404
