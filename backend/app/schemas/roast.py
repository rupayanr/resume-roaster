from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RoastSection(BaseModel):
    title: str
    icon: str
    points: list[str]


class Suggestion(BaseModel):
    original: str
    improved: str
    why: str


class ScoreBreakdown(BaseModel):
    clarity: int
    impact: int
    relevance: int
    ats: int


class RoastResponse(BaseModel):
    id: UUID
    share_id: str
    score: int
    score_breakdown: ScoreBreakdown
    headline: str
    sections: list[RoastSection]
    suggestions: list[Suggestion]
    ats_tips: list[str]
    created_at: datetime
    resume_id: UUID | None = None

    model_config = {"from_attributes": True}


class RoastHistoryItem(BaseModel):
    id: UUID
    share_id: str
    score: int
    headline: str
    created_at: datetime
    resume_filename: str | None = None
    resume_version: int | None = None

    model_config = {"from_attributes": True}


class RoastHistoryResponse(BaseModel):
    roasts: list[RoastHistoryItem]
    total: int
