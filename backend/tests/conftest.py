import asyncio
from collections.abc import AsyncGenerator, Generator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.models import User, Resume, Roast  # noqa: F401
from app.main import app
from app.api.deps import get_db
from app.core.security import get_password_hash, create_access_token

# Use SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_token(test_user: User) -> str:
    return create_access_token(data={"sub": str(test_user.id)})


@pytest_asyncio.fixture
async def auth_headers(auth_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    """Create a minimal valid PDF for testing."""
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(John Doe - Software Engineer) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000359 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
434
%%EOF"""
    return pdf_content


@pytest.fixture
def mock_roast_response() -> dict[str, Any]:
    """Standard mock response from the roaster."""
    return {
        "score": 72,
        "score_breakdown": {
            "clarity": 75,
            "impact": 70,
            "relevance": 72,
            "ats": 71,
        },
        "headline": "Your resume is decent, but it won't stand out in a crowd.",
        "sections": [
            {
                "title": "The Good",
                "icon": "✅",
                "points": ["Clear contact information", "Good use of action verbs"],
            },
            {
                "title": "The Bad",
                "icon": "😬",
                "points": ["Too generic objective statement", "Missing quantifiable achievements"],
            },
            {
                "title": "The Fixable",
                "icon": "🔧",
                "points": ["Add metrics to your accomplishments", "Tailor skills to job description"],
            },
        ],
        "suggestions": [
            {
                "original": "Responsible for software development",
                "improved": "Developed 5 microservices handling 10K requests/day",
                "why": "Numbers make achievements concrete",
            }
        ],
        "ats_tips": ["Use standard section headers", "Avoid tables and columns"],
    }
