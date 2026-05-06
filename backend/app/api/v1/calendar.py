import uuid
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CreateEventRequest(BaseModel):
    title: str
    duration_minutes: int
    attendee_emails: list[str]


class Event(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    attendees: list[str]
    conflicts: list[str]
    created_at: str


class TimeSlot(BaseModel):
    start_time: str
    end_time: str


@router.post("/events", response_model=Event)
async def create_event(req: CreateEventRequest) -> Event:
    return Event(
        id=str(uuid.uuid4()),
        title=req.title,
        start_time="2026-05-07T10:00:00Z",
        end_time="2026-05-07T11:00:00Z",
        attendees=req.attendee_emails,
        conflicts=["Existing meeting"],
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/events/{id}/slots", response_model=list[TimeSlot])
async def get_slots(id: str) -> list[TimeSlot]:
    return [
        TimeSlot(start_time="2026-05-07T10:00:00Z", end_time="2026-05-07T11:00:00Z"),
        TimeSlot(start_time="2026-05-07T14:00:00Z", end_time="2026-05-07T15:00:00Z"),
        TimeSlot(start_time="2026-05-08T09:00:00Z", end_time="2026-05-08T10:00:00Z"),
    ]
