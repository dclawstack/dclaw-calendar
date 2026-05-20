import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CalendarCreate(BaseModel):
    name: str
    owner_id: str | None = None
    color: str | None = None
    is_default: bool = False


class CalendarUpdate(BaseModel):
    name: str | None = None
    owner_id: str | None = None
    color: str | None = None
    is_default: bool | None = None


class CalendarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    owner_id: str | None
    color: str | None
    is_default: bool
    created_at: datetime
    updated_at: datetime
