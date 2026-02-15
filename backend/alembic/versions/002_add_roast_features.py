"""Add roast features: intensity, industry, badges, reactions

Revision ID: 002
Revises: 001
Create Date: 2025-02-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add intensity column with default
    op.add_column(
        "roasts",
        sa.Column("intensity", sa.String(16), nullable=False, server_default="medium")
    )

    # Add industry column (nullable)
    op.add_column(
        "roasts",
        sa.Column("industry", sa.String(32), nullable=True)
    )

    # Add badges column (JSON array)
    op.add_column(
        "roasts",
        sa.Column("badges", postgresql.JSONB(), nullable=False, server_default="[]")
    )

    # Add is_headline_public for hot takes carousel
    op.add_column(
        "roasts",
        sa.Column("is_headline_public", sa.Boolean(), nullable=False, server_default="false")
    )

    # Add reactions column (JSON object)
    op.add_column(
        "roasts",
        sa.Column("reactions", postgresql.JSONB(), nullable=False, server_default="{}")
    )


def downgrade() -> None:
    op.drop_column("roasts", "reactions")
    op.drop_column("roasts", "is_headline_public")
    op.drop_column("roasts", "badges")
    op.drop_column("roasts", "industry")
    op.drop_column("roasts", "intensity")
