import secrets
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.core.pdf_parser import extract_text_from_pdf
from app.core.roaster import generate_roast
from app.api.deps import get_db, get_current_user_optional
from app.db.models.user import User
from app.db.models.resume import Resume
from app.db.models.roast import Roast
from app.schemas.roast import RoastResponse, RoastHistoryItem, RoastHistoryResponse

router = APIRouter()


def generate_share_id() -> str:
    return secrets.token_urlsafe(16)[:24]


@router.post("/roast", response_model=RoastResponse)
async def roast_resume(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
    file: UploadFile = File(...),
):
    """Upload a resume PDF and get roasted."""
    settings = get_settings()

    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Read and validate file size
    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)

    if file_size_mb > settings.max_file_size_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size is {settings.max_file_size_mb}MB",
        )

    # Extract text from PDF
    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Generate roast
    try:
        roast_data = generate_roast(resume_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roast: {str(e)}")

    resume_id = None

    # If authenticated, save resume with version control
    if current_user:
        # Get current max version for this user
        max_version_result = await db.execute(
            select(Resume.version)
            .where(Resume.user_id == current_user.id)
            .order_by(Resume.version.desc())
            .limit(1)
        )
        max_version = max_version_result.scalar_one_or_none() or 0

        # Mark all existing resumes as not latest
        await db.execute(
            Resume.__table__.update()
            .where(Resume.user_id == current_user.id)
            .values(is_latest=False)
        )

        # Create new resume
        resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            version=max_version + 1,
            pdf_content=file_bytes,
            extracted_text=resume_text,
            is_latest=True,
        )
        db.add(resume)
        await db.flush()
        resume_id = resume.id

    # Create roast record
    roast = Roast(
        resume_id=resume_id,
        share_id=generate_share_id(),
        score=roast_data.get("score", 0),
        score_breakdown=roast_data.get("score_breakdown", {
            "clarity": 0,
            "impact": 0,
            "relevance": 0,
            "ats": 0,
        }),
        headline=roast_data.get("headline", ""),
        sections=roast_data.get("sections", []),
        suggestions=roast_data.get("suggestions", []),
        ats_tips=roast_data.get("ats_tips", []),
    )
    db.add(roast)
    await db.flush()
    await db.refresh(roast)

    return RoastResponse(
        id=roast.id,
        share_id=roast.share_id,
        score=roast.score,
        score_breakdown=roast.score_breakdown,
        headline=roast.headline,
        sections=roast.sections,
        suggestions=roast.suggestions,
        ats_tips=roast.ats_tips,
        created_at=roast.created_at,
        resume_id=roast.resume_id,
    )


@router.get("/roast/{share_id}", response_model=RoastResponse)
async def get_roast(
    share_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a roast by share ID (public)."""
    result = await db.execute(
        select(Roast).where(Roast.share_id == share_id)
    )
    roast = result.scalar_one_or_none()

    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")

    return RoastResponse(
        id=roast.id,
        share_id=roast.share_id,
        score=roast.score,
        score_breakdown=roast.score_breakdown,
        headline=roast.headline,
        sections=roast.sections,
        suggestions=roast.suggestions,
        ats_tips=roast.ats_tips,
        created_at=roast.created_at,
        resume_id=roast.resume_id,
    )


@router.get("/my-roasts", response_model=RoastHistoryResponse)
async def get_my_roasts(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
):
    """Get authenticated user's roast history."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    # Get all roasts for user's resumes
    result = await db.execute(
        select(Roast)
        .join(Resume, Roast.resume_id == Resume.id)
        .where(Resume.user_id == current_user.id)
        .options(selectinload(Roast.resume))
        .order_by(Roast.created_at.desc())
    )
    roasts = result.scalars().all()

    history_items = [
        RoastHistoryItem(
            id=roast.id,
            share_id=roast.share_id,
            score=roast.score,
            headline=roast.headline,
            created_at=roast.created_at,
            resume_filename=roast.resume.filename if roast.resume else None,
            resume_version=roast.resume.version if roast.resume else None,
        )
        for roast in roasts
    ]

    return RoastHistoryResponse(roasts=history_items, total=len(history_items))
