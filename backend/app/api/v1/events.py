import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.models.event import Event
from app.repositories.event_repo import EventRepository
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter()


@router.get("/", response_model=list[EventResponse])
async def list_events(
    calendar_id: uuid.UUID | None = Query(default=None),
    start: datetime | None = Query(default=None),
    end: datetime | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    repo = EventRepository(db)
    if calendar_id:
        return await repo.get_by_calendar_id(calendar_id)
    if start and end:
        return await repo.get_by_date_range(start, end)
    items, _ = await repo.list_all(limit=200)
    return items


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(data: EventCreate, db: AsyncSession = Depends(get_db)):
    repo = EventRepository(db)
    event = Event(**data.model_dump())
    return await repo.create(event)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = EventRepository(db)
    event = await repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: uuid.UUID, data: EventUpdate, db: AsyncSession = Depends(get_db)
):
    repo = EventRepository(db)
    event = await repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    event.updated_at = utc_now()
    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = EventRepository(db)
    event = await repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    await repo.delete(event)
