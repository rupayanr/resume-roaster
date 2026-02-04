from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: UUID
    filename: str
    version: int
    is_latest: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeListResponse(BaseModel):
    resumes: list[ResumeResponse]
    total: int
