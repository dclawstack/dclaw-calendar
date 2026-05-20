from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import auth, calendars, events, attendees
import app.models  # noqa: F401 — ensures all models register with Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(calendars.router, prefix="/api/v1/calendars", tags=["calendars"])
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(attendees.router, prefix="/api/v1/attendees", tags=["attendees"])
