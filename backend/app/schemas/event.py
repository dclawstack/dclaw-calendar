import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"
    location: str | None = None
    organizer_id: str | None = None
    calendar_id: uuid.UUID
    recurrence_rule: str | None = None


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    timezone: str | None = None
    location: str | None = None
    organizer_id: str | None = None
    calendar_id: uuid.UUID | None = None
    recurrence_rule: str | None = None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime
    timezone: str
    location: str | None
    organizer_id: str | None
    calendar_id: uuid.UUID
    recurrence_rule: str | None
    created_at: datetime
    updated_at: datetime
