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


class Badge(BaseModel):
    id: str
    name: str
    icon: str
    description: str | None = None


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
    intensity: str = "medium"
    industry: str | None = None
    badges: list[Badge] = []
    is_headline_public: bool = False
    reactions: dict[str, int] = {}

    model_config = {"from_attributes": True}


class HotTake(BaseModel):
    headline: str
    score: int


class HotTakesResponse(BaseModel):
    hot_takes: list[HotTake]


class ReactionRequest(BaseModel):
    reaction: str


class ReactionResponse(BaseModel):
    reactions: dict[str, int]
