import enum
from datetime import datetime, date, timezone
from sqlalchemy import String, Text, Date, DateTime, Enum as SAEnum, ARRAY, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional
from ..database import Base


class ApplicationStatus(enum.Enum):
    PLANNING = "planning"
    APPLIED = "applied"
    WAITING = "waiting"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    university: Mapped[str] = mapped_column(String(200))
    program: Mapped[str] = mapped_column(String(200))
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus), default=ApplicationStatus.PLANNING
    )
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    applied_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    professors: Mapped[list[str]] = mapped_column(ARRAY(String), default=lambda: [])
    research_interest: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
