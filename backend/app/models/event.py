import uuid
from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.core.utils import utc_now


class Event(Base):
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(nullable=True)
    start_time: Mapped[datetime] = mapped_column(nullable=False)
    end_time: Mapped[datetime] = mapped_column(nullable=False)
    timezone: Mapped[str] = mapped_column(default="UTC")
    location: Mapped[str | None] = mapped_column(nullable=True)
    organizer_id: Mapped[str | None] = mapped_column(nullable=True)
    calendar_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("calendars.id", ondelete="CASCADE"), nullable=False
    )
    recurrence_rule: Mapped[str | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    calendar: Mapped["Calendar"] = relationship(
        "Calendar", back_populates="events", lazy="selectin"
    )
    attendees: Mapped[list["Attendee"]] = relationship(
        "Attendee", back_populates="event", cascade="all, delete-orphan", lazy="selectin"
    )
