import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.attendee import AttendeeStatus, AttendeeType


class AttendeeCreate(BaseModel):
    event_id: uuid.UUID
    email: str
    name: str | None = None
    status: AttendeeStatus = AttendeeStatus.pending
    type: AttendeeType = AttendeeType.required


class AttendeeUpdate(BaseModel):
    email: str | None = None
    name: str | None = None
    status: AttendeeStatus | None = None
    type: AttendeeType | None = None


class AttendeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID
    email: str
    name: str | None
    status: AttendeeStatus
    type: AttendeeType
    created_at: datetime
    updated_at: datetime
