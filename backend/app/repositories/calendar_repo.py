from sqlalchemy.ext.asyncio import AsyncSession
from app.models.calendar import Calendar
from app.repositories.base_repo import BaseRepository


class CalendarRepository(BaseRepository[Calendar]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Calendar)
