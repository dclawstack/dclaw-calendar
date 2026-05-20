import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.core.utils import utc_now


class Calendar(Base):
    __tablename__ = "calendars"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(nullable=False)
    owner_id: Mapped[str | None] = mapped_column(nullable=True)
    color: Mapped[str | None] = mapped_column(nullable=True)
    is_default: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    events: Mapped[list["Event"]] = relationship(
        "Event", back_populates="calendar", cascade="all, delete-orphan", lazy="selectin"
    )
