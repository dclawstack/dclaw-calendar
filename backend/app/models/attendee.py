import uuid
import enum
from datetime import datetime
from sqlalchemy import ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.core.utils import utc_now


class AttendeeStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    tentative = "tentative"


class AttendeeType(str, enum.Enum):
    required = "required"
    optional = "optional"


class Attendee(Base):
    __tablename__ = "attendees"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(nullable=False)
    name: Mapped[str | None] = mapped_column(nullable=True)
    status: Mapped[AttendeeStatus] = mapped_column(
        SAEnum(AttendeeStatus, name="attendeestatus"), default=AttendeeStatus.pending
    )
    type: Mapped[AttendeeType] = mapped_column(
        SAEnum(AttendeeType, name="attendeetype"), default=AttendeeType.required
    )
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    event: Mapped["Event"] = relationship(
        "Event", back_populates="attendees", lazy="selectin"
    )
