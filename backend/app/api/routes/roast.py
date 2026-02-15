import logging
import re
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, Response, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from app.config import get_settings
from app.core.pdf_parser import extract_text_from_pdf
from app.core.roaster import generate_roast
from app.core.badges import detect_badges
from app.core.og_image import generate_og_image
from app.core.rate_limiter import limiter
from app.api.deps import get_db
from app.db.models.roast import Roast
from app.schemas.roast import (
    RoastResponse,
    HotTake,
    HotTakesResponse,
    ReactionRequest,
    ReactionResponse,
    Badge,
)

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_INTENSITIES = {"mild", "medium", "brutal"}
VALID_INDUSTRIES = {"tech", "finance", "creative", "healthcare", "general"}
VALID_REACTIONS = {"fire", "crying_laughing", "ouch", "facts", "survived"}

# PDF magic bytes (file signature)
PDF_MAGIC_BYTES = b"%PDF"

# Share ID validation pattern (alphanumeric, underscore, hyphen)
SHARE_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{10,32}$")


def generate_share_id() -> str:
    """Generate a cryptographically secure share ID (32 chars)."""
    return secrets.token_urlsafe(24)  # 32 chars after base64 encoding


def validate_share_id(share_id: str) -> bool:
    """Validate share ID format to prevent injection attacks."""
    return bool(SHARE_ID_PATTERN.match(share_id))


def validate_pdf_magic_bytes(file_bytes: bytes) -> bool:
    """Check if file starts with PDF magic bytes."""
    return file_bytes[:4] == PDF_MAGIC_BYTES


def badges_to_schema(badges_data: list) -> list[Badge]:
    """Convert badge dicts to Badge schema objects."""
    return [
        Badge(
            id=b.get("id", ""),
            name=b.get("name", ""),
            icon=b.get("icon", ""),
            description=b.get("description")
        )
        for b in badges_data
    ]


@router.post("/roast", response_model=RoastResponse)
@limiter.limit("10/minute")
async def roast_resume(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
    intensity: str = Form("medium"),
    industry: str = Form("general"),
):
    """Upload a resume PDF and get roasted.

    Args:
        file: The resume PDF file
        intensity: Roast intensity level - "mild", "medium", or "brutal" (default: medium)
        industry: Industry persona - "tech", "finance", "creative", "healthcare", or "general"
    """
    settings = get_settings()

    # Validate intensity
    if intensity not in VALID_INTENSITIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid intensity. Must be one of: {', '.join(VALID_INTENSITIES)}"
        )

    # Validate industry
    if industry not in VALID_INDUSTRIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid industry. Must be one of: {', '.join(VALID_INDUSTRIES)}"
        )

    # Validate file extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Check Content-Length header BEFORE reading file to prevent memory exhaustion
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            size_bytes = int(content_length)
            if size_bytes > settings.max_file_size_mb * 1024 * 1024:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Max size is {settings.max_file_size_mb}MB"
                )
        except ValueError:
            pass  # Invalid content-length header, will validate after read

    # Read file with size limit
    max_bytes = settings.max_file_size_mb * 1024 * 1024
    file_bytes = await file.read(max_bytes + 1)  # Read 1 extra byte to detect overflow

    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.max_file_size_mb}MB",
        )

    # Validate PDF magic bytes (file signature)
    if not validate_pdf_magic_bytes(file_bytes):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file. File does not appear to be a valid PDF."
        )

    # Extract text from PDF
    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        logger.error(f"PDF parse error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail="Failed to parse PDF file")

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Generate roast with intensity and industry
    try:
        roast_data = generate_roast(resume_text, intensity=intensity, industry=industry)
    except Exception as e:
        logger.error(f"Roast generation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate roast")

    # Detect badges based on resume content and score
    score = roast_data.get("score", 0)
    badges = detect_badges(resume_text, score)

    # Create roast record (standalone, no resume linking)
    roast = Roast(
        share_id=generate_share_id(),
        score=score,
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
        intensity=intensity,
        industry=industry if industry != "general" else None,
        badges=badges,
        is_headline_public=False,
        reactions={},
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
        intensity=roast.intensity,
        industry=roast.industry,
        badges=badges_to_schema(roast.badges),
        is_headline_public=roast.is_headline_public,
        reactions=roast.reactions,
    )


@router.get("/roast/{share_id}", response_model=RoastResponse)
@limiter.limit("60/minute")
async def get_roast(
    request: Request,
    share_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a roast by share ID (public)."""
    # Validate share_id format to prevent injection
    if not validate_share_id(share_id):
        raise HTTPException(status_code=400, detail="Invalid share ID format")

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
        intensity=roast.intensity,
        industry=roast.industry,
        badges=badges_to_schema(roast.badges or []),
        is_headline_public=roast.is_headline_public,
        reactions=roast.reactions or {},
    )


@router.get("/hot-takes", response_model=HotTakesResponse)
@limiter.limit("30/minute")
async def get_hot_takes(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 10,
):
    """Get random public roast headlines for the carousel."""
    # Validate and cap limit to prevent expensive queries
    if limit < 1:
        limit = 1
    elif limit > 50:
        limit = 50

    result = await db.execute(
        select(Roast.headline, Roast.score)
        .where(Roast.is_headline_public == True)
        .order_by(func.random())
        .limit(limit)
    )
    rows = result.all()

    hot_takes = [HotTake(headline=row.headline, score=row.score) for row in rows]

    return HotTakesResponse(hot_takes=hot_takes)


@router.patch("/roast/{share_id}/public")
@limiter.limit("20/minute")
async def toggle_public_headline(
    request: Request,
    share_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    is_public: bool = True,
):
    """Toggle whether a roast headline is public (for hot takes carousel)."""
    # Validate share_id format
    if not validate_share_id(share_id):
        raise HTTPException(status_code=400, detail="Invalid share ID format")

    result = await db.execute(
        select(Roast).where(Roast.share_id == share_id)
    )
    roast = result.scalar_one_or_none()

    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")

    roast.is_headline_public = is_public
    await db.commit()

    return {"message": "Updated", "is_headline_public": is_public}


@router.post("/roast/{share_id}/react", response_model=ReactionResponse)
@limiter.limit("30/minute")
async def add_reaction(
    request: Request,
    share_id: str,
    reaction_req: ReactionRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Add an anonymous reaction to a shared roast."""
    # Validate share_id format
    if not validate_share_id(share_id):
        raise HTTPException(status_code=400, detail="Invalid share ID format")

    if reaction_req.reaction not in VALID_REACTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid reaction. Must be one of: {', '.join(VALID_REACTIONS)}"
        )

    result = await db.execute(
        select(Roast).where(Roast.share_id == share_id)
    )
    roast = result.scalar_one_or_none()

    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")

    # Update reaction count
    # Create a new dict to ensure SQLAlchemy detects the change
    current_reactions = dict(roast.reactions or {})
    current_reactions[reaction_req.reaction] = current_reactions.get(reaction_req.reaction, 0) + 1
    roast.reactions = current_reactions

    # Flag the attribute as modified for SQLAlchemy
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(roast, "reactions")

    await db.commit()
    await db.refresh(roast)

    return ReactionResponse(reactions=roast.reactions)


@router.get("/roast/{share_id}/og-image")
@limiter.limit("60/minute")
async def get_og_image_endpoint(
    request: Request,
    share_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Generate shareable OG image for social media."""
    # Validate share_id format
    if not validate_share_id(share_id):
        raise HTTPException(status_code=400, detail="Invalid share ID format")

    result = await db.execute(
        select(Roast).where(Roast.share_id == share_id)
    )
    roast = result.scalar_one_or_none()

    if not roast:
        raise HTTPException(status_code=404, detail="Roast not found")

    image_bytes = generate_og_image(
        score=roast.score,
        headline=roast.headline,
        intensity=roast.intensity
    )

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=86400",  # Cache for 1 day
        }
    )
