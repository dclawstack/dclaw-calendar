import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event
from app.repositories.base_repo import BaseRepository


class EventRepository(BaseRepository[Event]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Event)

    async def get_by_calendar_id(self, calendar_id: uuid.UUID) -> list[Event]:
        result = await self.db.execute(
            select(Event).where(Event.calendar_id == calendar_id)
        )
        return list(result.scalars().all())

    async def get_by_date_range(self, start: datetime, end: datetime) -> list[Event]:
        result = await self.db.execute(
            select(Event).where(Event.start_time >= start, Event.end_time <= end)
        )
        return list(result.scalars().all())
