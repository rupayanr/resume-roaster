import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base, GUID


class Roast(Base):
    __tablename__ = "roasts"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    resume_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    share_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    score: Mapped[int] = mapped_column(Integer)
    score_breakdown: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    headline: Mapped[str] = mapped_column(Text)
    sections: Mapped[list[Any]] = mapped_column(JSON, default=list)
    suggestions: Mapped[list[Any]] = mapped_column(JSON, default=list)
    ats_tips: Mapped[list[Any]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    resume: Mapped["Resume | None"] = relationship("Resume", back_populates="roasts")
