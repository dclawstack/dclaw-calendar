import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.models.calendar import Calendar
from app.repositories.calendar_repo import CalendarRepository
from app.schemas.calendar import CalendarCreate, CalendarUpdate, CalendarResponse

router = APIRouter()


@router.get("/", response_model=list[CalendarResponse])
async def list_calendars(db: AsyncSession = Depends(get_db)):
    repo = CalendarRepository(db)
    items, _ = await repo.list_all(limit=200)
    return items


@router.post("/", response_model=CalendarResponse, status_code=status.HTTP_201_CREATED)
async def create_calendar(data: CalendarCreate, db: AsyncSession = Depends(get_db)):
    repo = CalendarRepository(db)
    calendar = Calendar(**data.model_dump())
    return await repo.create(calendar)


@router.get("/{calendar_id}", response_model=CalendarResponse)
async def get_calendar(calendar_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = CalendarRepository(db)
    calendar = await repo.get_by_id(calendar_id)
    if not calendar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calendar not found")
    return calendar


@router.patch("/{calendar_id}", response_model=CalendarResponse)
async def update_calendar(
    calendar_id: uuid.UUID, data: CalendarUpdate, db: AsyncSession = Depends(get_db)
):
    repo = CalendarRepository(db)
    calendar = await repo.get_by_id(calendar_id)
    if not calendar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calendar not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(calendar, field, value)
    calendar.updated_at = utc_now()
    await db.commit()
    await db.refresh(calendar)
    return calendar


@router.delete("/{calendar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calendar(calendar_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = CalendarRepository(db)
    calendar = await repo.get_by_id(calendar_id)
    if not calendar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Calendar not found")
    await repo.delete(calendar)
