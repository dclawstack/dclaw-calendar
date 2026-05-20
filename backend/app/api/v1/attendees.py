import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.models.attendee import Attendee
from app.repositories.attendee_repo import AttendeeRepository
from app.schemas.attendee import AttendeeCreate, AttendeeUpdate, AttendeeResponse

router = APIRouter()


@router.get("/", response_model=list[AttendeeResponse])
async def list_attendees(
    event_id: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    repo = AttendeeRepository(db)
    if event_id:
        return await repo.get_by_event_id(event_id)
    items, _ = await repo.list_all(limit=200)
    return items


@router.post("/", response_model=AttendeeResponse, status_code=status.HTTP_201_CREATED)
async def create_attendee(data: AttendeeCreate, db: AsyncSession = Depends(get_db)):
    repo = AttendeeRepository(db)
    attendee = Attendee(**data.model_dump())
    return await repo.create(attendee)


@router.patch("/{attendee_id}", response_model=AttendeeResponse)
async def update_attendee(
    attendee_id: uuid.UUID, data: AttendeeUpdate, db: AsyncSession = Depends(get_db)
):
    repo = AttendeeRepository(db)
    attendee = await repo.get_by_id(attendee_id)
    if not attendee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(attendee, field, value)
    attendee.updated_at = utc_now()
    await db.commit()
    await db.refresh(attendee)
    return attendee


@router.delete("/{attendee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendee(attendee_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = AttendeeRepository(db)
    attendee = await repo.get_by_id(attendee_id)
    if not attendee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")
    await repo.delete(attendee)
