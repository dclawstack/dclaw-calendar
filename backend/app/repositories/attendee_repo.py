import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.attendee import Attendee
from app.repositories.base_repo import BaseRepository


class AttendeeRepository(BaseRepository[Attendee]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Attendee)

    async def get_by_event_id(self, event_id: uuid.UUID) -> list[Attendee]:
        result = await self.db.execute(
            select(Attendee).where(Attendee.event_id == event_id)
        )
        return list(result.scalars().all())
