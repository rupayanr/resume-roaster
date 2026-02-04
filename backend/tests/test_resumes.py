import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.db.models.resume import Resume


@pytest.mark.asyncio
class TestResumeList:
    async def test_list_resumes_empty(
        self, client: AsyncClient, auth_headers: dict
    ):
        response = await client.get("/api/v1/resumes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["resumes"] == []
        assert data["total"] == 0

    async def test_list_resumes_with_data(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        auth_headers: dict,
    ):
        # Create test resumes
        resume1 = Resume(
            user_id=test_user.id,
            filename="resume_v1.pdf",
            version=1,
            pdf_content=b"test content 1",
            extracted_text="Test resume content 1",
            is_latest=False,
        )
        resume2 = Resume(
            user_id=test_user.id,
            filename="resume_v2.pdf",
            version=2,
            pdf_content=b"test content 2",
            extracted_text="Test resume content 2",
            is_latest=True,
        )
        db_session.add_all([resume1, resume2])
        await db_session.commit()

        response = await client.get("/api/v1/resumes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["resumes"]) == 2
        # Should be ordered by version desc
        assert data["resumes"][0]["version"] == 2
        assert data["resumes"][1]["version"] == 1

    async def test_list_resumes_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/v1/resumes")
        assert response.status_code == 401


@pytest.mark.asyncio
class TestResumeGet:
    async def test_get_resume(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        auth_headers: dict,
    ):
        resume = Resume(
            user_id=test_user.id,
            filename="test_resume.pdf",
            version=1,
            pdf_content=b"test content",
            extracted_text="Test resume content",
            is_latest=True,
        )
        db_session.add(resume)
        await db_session.commit()
        await db_session.refresh(resume)

        response = await client.get(
            f"/api/v1/resumes/{resume.id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "test_resume.pdf"
        assert data["version"] == 1

    async def test_get_resume_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        import uuid

        fake_id = uuid.uuid4()
        response = await client.get(
            f"/api/v1/resumes/{fake_id}", headers=auth_headers
        )
        assert response.status_code == 404


@pytest.mark.asyncio
class TestResumeDelete:
    async def test_delete_resume(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        auth_headers: dict,
    ):
        resume = Resume(
            user_id=test_user.id,
            filename="to_delete.pdf",
            version=1,
            pdf_content=b"test content",
            extracted_text="Test resume content",
            is_latest=True,
        )
        db_session.add(resume)
        await db_session.commit()
        await db_session.refresh(resume)

        response = await client.delete(
            f"/api/v1/resumes/{resume.id}", headers=auth_headers
        )
        assert response.status_code == 204

    async def test_delete_resume_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        import uuid

        fake_id = uuid.uuid4()
        response = await client.delete(
            f"/api/v1/resumes/{fake_id}", headers=auth_headers
        )
        assert response.status_code == 404
