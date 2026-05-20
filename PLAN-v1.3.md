# DClaw Calendar — v1.3 Feature Roadmap

> **Supersedes:** `PLAN-v1.2.md` for implementation guidance.
> **Incorporates:** `PATCH-2026-05-15-shared-hub-postgres.md` (shared-hub postgres conventions rolled up).
> **Design Authority:** `colors_and_type.css` — all frontend work MUST use DKube tokens (`--dk-*`). Light mode only. Font: Poppins.
> **Architecture Authority:** `AGENTS.md` — all stack rules apply without exception.

---

## YC Gap Analysis

### Competitive Landscape
| Competitor | Core Advantage | DClaw Gap |
|------------|---------------|-----------|
| Calendly | Scheduling link UX, booking pages | No booking links, no availability sharing |
| Reclaim.ai | AI time blocking, habit defense | No time blocking, no AI optimization |
| Clockwise | Team scheduling intelligence | No team view, no group availability |
| Motion | Task + calendar unification | No task integration, no AI prioritization |
| Google Calendar | Native integrations, ubiquity | No external sync, no oauth flows |

### Critical Gaps vs. YC Standard (Ranked by Severity)

| # | Gap | Severity | Impact |
|---|-----|----------|--------|
| 1 | **Backend uses MOCK DATA** — `app/api/v1/calendar.py` returns hardcoded responses with no DB persistence. Directly violates AGENTS.md anti-patterns. Blocks all demos. | 🔴 Critical | Blocks everything |
| 2 | **v1 router not wired** — `app/api/main.py` has a TODO comment; the calendar router is imported but never registered. API returns 404 for all v1 routes. | 🔴 Critical | No working API |
| 3 | **No models, schemas, or repositories** — `app/models/`, `app/schemas/`, `app/repositories/` are empty stubs. Zero DB persistence. | 🔴 Critical | No data layer |
| 4 | **No alembic migration** — `alembic/versions/` is empty. DB schema will never be created. | 🔴 Critical | No tables |
| 5 | **Frontend is a placeholder** — `page.tsx` shows "DClaw App / Replace this page". No calendar UI, no pages, no API calls. | 🔴 Critical | Zero UI value |
| 6 | **Design system not integrated** — Tailwind config ignores `colors_and_type.css` DKube tokens. All brand colors and typography are unused. | 🟠 High | Off-brand UI |
| 7 | **Missing `dclaw-manifest.json`** — App cannot register with DPanel. Blocks platform integration. | 🟠 High | No platform visibility |
| 8 | **Port discrepancy** — AGENTS.md App Identity section says `8023/3023`; Port Registry table says `8108/3021`; REVISED-PRD says `18151/3081`. The docker-compose.yml is the tie-breaker. | 🟡 Medium | Dev confusion |
| 9 | **Test DB name mismatch** — `conftest.py` uses `dclaw_app_test`; should be `dclaw_calendar_test` per naming conventions. | 🟡 Medium | CI failure |
| 10 | **No AI differentiation** — Every P0 feature in REVISED-PRD.md requires an AI component. Without AI, this is a worse Google Calendar. YC S25/W26 RFS explicitly requires AI Copilot as P0.1. | 🟡 Medium | No moat |
| 11 | **No scheduling links** — The #1 Calendly feature. Without it, there is no way to onboard external users or demonstrate booking value. | 🟡 Medium | No viral loop |
| 12 | **No conflict detection** — Even a rule-based overlap detector is absent. Basic calendar correctness is unverified. | 🟡 Medium | Data integrity |
| 13 | **No auth layer** — REVISED-PRD mandates Logto JWT on all protected routes. Currently zero authentication. | 🟡 Medium | Security gap |

---

## Complexity Legend

| Level | Label | Description |
|-------|-------|-------------|
| **0** | Quick Win / Foundation | Low complexity. Fixes critical gaps, scaffold completion, data layer, DKube integration. Must be done before anything else. |
| **1** | Core Differentiator | Medium complexity. Features that make DClaw Calendar useful and competitive. No AI required. |
| **2** | AI / Advanced | High complexity. AI integrations, external sync, complex workflows. Requires Complexity 0+1 complete first. |

---

## Complexity 0 — Foundation & Critical Fixes

> Ship these first. Nothing else works until these are done.

### 0.1 — Fix Mock Data Violation & Wire Router
**Priority:** P0 — Blocks all other backend work  
**Files:** `backend/app/api/v1/calendar.py`, `backend/app/api/main.py`  
**What:** Delete the mock Pydantic-in-router pattern in `calendar.py`. Wire the v1 router prefix in `main.py`. Replace TODO comment.  
**Acceptance:** `GET /api/v1/events` returns a real DB response (empty list `[]` is correct). `GET /health` → `{"status":"ok"}`.

### 0.2 — Calendar, Event, Attendee Models
**Priority:** P0 — Data layer foundation  
**Files:** `backend/app/models/calendar.py`, `backend/app/models/event.py`, `backend/app/models/attendee.py`, `backend/app/models/__init__.py`  
**What:** Implement all three SQLAlchemy models exactly per PRODUCT-SPEC.md. All fields, types, and relationships. Rules:
- Inherit from `Base` in `app.models.base`
- Use `Mapped[...]` and `mapped_column()`
- Use `default=uuid.uuid4` (not `default_factory=`)
- Use `utc_now()` from `app.core.utils` for `created_at`/`updated_at`
- `Event.calendar_id` → `ondelete="CASCADE"`
- `Attendee.event_id` → `ondelete="CASCADE"`
- Relationships use `lazy="selectin"`
- Status and type fields use Python `Enum`

**Schema:**
```
Calendar: id(UUID), name(str), owner_id(str?), color(str?), is_default(bool), created_at, updated_at
Event: id(UUID), title(str), description(str?), start_time(datetime), end_time(datetime), timezone(str), location(str?), organizer_id(str?), calendar_id(FK→Calendar), recurrence_rule(str?), created_at, updated_at
Attendee: id(UUID), event_id(FK→Event), email(str), name(str?), status(enum), type(enum), created_at, updated_at
```

### 0.3 — Pydantic v2 Schemas
**Priority:** P0  
**Files:** `backend/app/schemas/calendar.py`, `backend/app/schemas/event.py`, `backend/app/schemas/attendee.py`  
**What:** Create `Create`, `Update`, and `Response` schemas for each entity using Pydantic v2 with `ConfigDict(from_attributes=True)`. Enums for `AttendeeStatus` and `AttendeeType`. No `from __future__ import annotations`.

### 0.4 — Repositories
**Priority:** P0  
**Files:** `backend/app/repositories/calendar_repo.py`, `backend/app/repositories/event_repo.py`, `backend/app/repositories/attendee_repo.py`  
**What:** Extend `BaseRepository` for each entity. Add domain-specific queries:
- `EventRepository.get_by_calendar_id(calendar_id)` — filter events by calendar
- `EventRepository.get_by_date_range(start, end)` — date range filter
- `AttendeeRepository.get_by_event_id(event_id)` — fetch attendees for event

### 0.5 — Full CRUD API Routers
**Priority:** P0  
**Files:** `backend/app/api/v1/calendars.py`, `backend/app/api/v1/events.py`, `backend/app/api/v1/attendees.py`  
**What:** Implement all 15 endpoints from PRODUCT-SPEC.md using `Depends(get_db)`. Return proper HTTP status codes (201 for create, 404 for not found, 204 for delete). Include `GET /api/v1/events?calendar_id=&start=&end=` query param filtering.

**Endpoints:**
```
GET/POST   /api/v1/calendars
GET/PATCH/DELETE /api/v1/calendars/{id}
GET/POST   /api/v1/events
GET/PATCH/DELETE /api/v1/events/{id}
GET/POST   /api/v1/attendees
PATCH/DELETE /api/v1/attendees/{id}
```

### 0.6 — Alembic Initial Migration
**Priority:** P0  
**Files:** `backend/alembic/versions/001_initial_schema.py`  
**What:** Run `alembic revision --autogenerate -m "initial schema: calendars, events, attendees"`. Verify it creates all three tables with correct columns, FKs, and indexes.

### 0.7 — Fix Test Harness
**Priority:** P0  
**Files:** `backend/tests/conftest.py`, `backend/tests/test_health.py`  
**What:** Fix `TEST_DATABASE_URL` default to use `dclaw_calendar_test` (not `dclaw_app_test`). Ensure `Base.metadata` now imports all models so test DB creates real tables. Add `pytest.ini` or `pyproject.toml` with `asyncio_mode = "auto"`.

### 0.8 — Backend Tests (70%+ Coverage)
**Priority:** P0  
**Files:** `backend/tests/test_calendars.py`, `backend/tests/test_events.py`, `backend/tests/test_attendees.py`  
**What:** Write async pytest tests for all CRUD endpoints. Use `httpx.AsyncClient` with `ASGITransport`. Cover happy paths, 404s, and cascade deletes. Tag with `@pytest.mark.asyncio`.

### 0.9 — DKube Design System Integration
**Priority:** P0 (all frontend work depends on this)  
**Files:** `frontend/tailwind.config.ts`, `frontend/src/app/globals.css`  
**What:** Extend Tailwind theme with DKube CSS variables from `colors_and_type.css`. Map tokens to Tailwind keys so components can use class names like `bg-dk-brand`, `text-dk-fg-1`, `border-dk-border`, `shadow-dk-sm`. Import Poppins via `globals.css`. Light mode only — no `dark:` variants.

**Tailwind mappings to add:**
```ts
colors: {
  'dk-brand': 'var(--dk-brand)',
  'dk-bg': 'var(--dk-bg)',
  'dk-bg-muted': 'var(--dk-bg-muted)',
  'dk-fg': 'var(--dk-fg)',
  'dk-fg-1': 'var(--dk-fg-1)',
  'dk-fg-2': 'var(--dk-fg-2)',
  'dk-border': 'var(--dk-border)',
  'dk-border-strong': 'var(--dk-border-strong)',
  // ... all semantic tokens
}
fontFamily: { sans: ['Poppins', 'system-ui', ...] }
```

### 0.10 — Dashboard / Calendar Landing Page
**Priority:** P0  
**Files:** `frontend/src/app/page.tsx`, `frontend/src/lib/api.ts`  
**What:** Replace placeholder with a real dashboard showing:
- Stat cards: total calendars, upcoming events (next 7 days), today's events, pending attendee invites
- "Add Event" quick action button
- Navigation to Calendar view, Events list, Calendars list
- Use DKube tokens and Poppins font. Use pre-built `Card`, `Button`, `Badge` components.

### 0.11 — Calendars Management Page
**Priority:** P0  
**Files:** `frontend/src/app/calendars/page.tsx`, `frontend/src/app/calendars/[id]/page.tsx`  
**What:** List page showing all calendars with color swatches. "Add Calendar" dialog with name + hex color picker (use `<input type="color">`). Toggle visibility per calendar. Edit/delete with confirmation dialog.

### 0.12 — Events List Page
**Priority:** P0  
**Files:** `frontend/src/app/events/page.tsx`, `frontend/src/app/events/[id]/page.tsx`  
**What:** Table view using `Table` component. Columns: title, calendar, start time, end time, attendee count, status. Pagination (20 per page). Search by title. Date range filter. "Add Event" modal with full form validation. Event detail page with attendee list and add-attendee form.

### 0.13 — `dclaw-manifest.json`
**Priority:** P0  
**Files:** `frontend/public/dclaw-manifest.json`  
**What:** Create DPanel registration manifest:
```json
{
  "app_id": "calendar",
  "name": "DClaw Calendar",
  "category": "Scheduling",
  "tagline": "AI scheduling",
  "color": "#7660A8",
  "version": "1.3.0",
  "backend_port": 8108,
  "frontend_port": 3021,
  "health_endpoint": "/health",
  "status": "active"
}
```

### 0.14 — Port Registry Alignment
**Priority:** P0  
**Files:** `AGENTS.md` (App Identity section), `docker-compose.yml`  
**What:** The App Identity section in AGENTS.md says `8023/3023` but the Port Registry table says `8108/3021`. Align: update the App Identity header to match the registry table (`8108/3021`). Verify `docker-compose.yml` uses these ports.

---

## Complexity 1 — Core Differentiators

> Features that make users choose DClaw Calendar over Google Calendar. No AI required.

### 1.1 — Interactive Calendar Grid (Month / Week / Day Views)
**Priority:** P1 — Most visible feature of any calendar app  
**Files:** `frontend/src/components/calendar/CalendarGrid.tsx`, `frontend/src/components/calendar/WeekView.tsx`, `frontend/src/components/calendar/DayView.tsx`, `frontend/src/components/calendar/MonthView.tsx`  
**What:** Full interactive calendar grid built from scratch (no external calendar library — scaffold prohibits shadcn CLI). Features:
- Month: grid of days, event chips on each day with color coding
- Week: 7-column time grid (00:00–24:00) with event blocks
- Day: single-column 30-min slot grid
- Click empty slot → pre-fill "Add Event" modal with that date/time
- Click event chip → open Event Detail panel
- Toggle views via `Tabs` component
- Navigate prev/next period with arrow buttons
- Color code by calendar (`--dk-brand` palette variants)
- **Backend:** Add `GET /api/v1/events?start_date=&end_date=&calendar_ids=` date range endpoint to support efficient grid queries

### 1.2 — Smart Scheduling Links
**Priority:** P1 — Core Calendly-equivalent, primary viral loop  
**Files:** `backend/app/models/scheduling_link.py`, `backend/app/schemas/scheduling_link.py`, `backend/app/repositories/scheduling_link_repo.py`, `backend/app/api/v1/scheduling.py`, `backend/app/services/availability.py`, `frontend/src/app/schedule/page.tsx`, `frontend/src/app/book/[slug]/page.tsx`  
**What:** 
- `SchedulingLink` model: `id`, `slug` (unique URL token), `owner_id`, `title`, `duration_minutes`, `buffer_minutes`, `timezone`, `active_hours_start/end`, `available_days` (bitmask), `is_active`, `created_at`
- Availability engine: given a `SchedulingLink`, compute free slots by subtracting existing events from available hours
- Public booking page at `/book/{slug}` (no auth required): show available time slots, collect attendee name/email, create `Event` + `Attendee` records on confirm
- Owner management at `/schedule`: create/edit/delete scheduling links, copy shareable URL
- **Alembic migration** for `SchedulingLink`

### 1.3 — Conflict Detection & Visual Warnings
**Priority:** P1 — Calendar correctness, prevents embarrassing double-bookings  
**Files:** `backend/app/services/conflict_detector.py`, `backend/app/api/v1/events.py` (add conflict check to create/update)  
**What:**
- On `POST /api/v1/events` and `PATCH /api/v1/events/{id}`, check for overlapping events in the same calendar and same time range
- Return HTTP `409 Conflict` with `conflicting_event_ids` in the response body if overlap detected
- Accept a `force=true` query param to allow override
- Frontend: show conflict warning banner on event detail; highlight conflicting events in red on calendar grid

### 1.4 — Attendee Invitation Status Flow
**Priority:** P1  
**Files:** `backend/app/api/v1/attendees.py`, `backend/app/services/invitation.py`, `frontend/src/app/events/[id]/page.tsx`  
**What:** 
- Add `PATCH /api/v1/attendees/{id}/respond` endpoint accepting `{"status": "accepted"|"declined"|"tentative"}`
- Add a public response endpoint: `GET /api/v1/invite/{token}` → `POST /api/v1/invite/{token}/respond` (no auth)
- Generate unique `invite_token` per attendee on creation (UUID stored in model)
- Frontend: show color-coded RSVP status badges. Show attendee count summary (Accepted/Declined/Pending).

### 1.5 — Event Recurrence (RRULE)
**Priority:** P1  
**Files:** `backend/app/services/recurrence.py`, `backend/requirements.txt` (add `rrule` via `python-dateutil`), `frontend/src/components/RecurrenceBuilder.tsx`  
**What:**
- `recurrence_rule` field already in `Event` model — wire it up
- Service: `expand_recurrence(event, start, end)` uses `dateutil.rrule` to generate virtual event instances for calendar grid display
- `GET /api/v1/events?expand_recurring=true&start=&end=` returns both real and virtual recurring instances
- Frontend: RecurrenceBuilder UI with preset options (Daily, Weekly, Monthly, Custom RRULE). Show recurrence badge on event chips.

### 1.6 — Smart Reminders
**Priority:** P1  
**Files:** `backend/app/models/reminder.py`, `backend/app/services/reminder_scheduler.py`, `backend/app/api/v1/reminders.py`  
**What:**
- `Reminder` model: `id`, `event_id(FK)`, `minutes_before`, `method` (enum: `popup`, `email`), `is_sent`, `created_at`
- `POST /api/v1/events/{id}/reminders` to add reminders to events
- Background task (FastAPI `BackgroundTasks` or APScheduler) that polls for due reminders and marks them sent
- Frontend: reminder configuration in event create/edit form (add N minutes before options)
- **Alembic migration** for `Reminder`

### 1.7 — Analytics Dashboard
**Priority:** P1 — Demonstrates ROI, key for retention  
**Files:** `backend/app/api/v1/analytics.py`, `backend/app/services/analytics.py`, `frontend/src/app/analytics/page.tsx`  
**What:**
- `GET /api/v1/analytics/summary?start=&end=` returns:
  - `total_meetings`: count of events in range
  - `total_meeting_hours`: sum of event durations
  - `busiest_day`: day of week with most meetings
  - `avg_attendees_per_meeting`: average attendee count
  - `focus_time_hours`: hours with no meetings (M–F, 9–17)
  - `meetings_by_calendar`: breakdown by calendar
- Frontend: stat cards using DKube tokens, simple bar chart for meetings per day (use `<canvas>` or a lightweight charting lib like `chart.js` if already in deps)

### 1.8 — Calendar Import / Export (iCal)
**Priority:** P1  
**Files:** `backend/app/services/ical.py`, `backend/app/api/v1/import_export.py`, `backend/requirements.txt` (add `icalendar`)  
**What:**
- `GET /api/v1/calendars/{id}/export.ics` — export calendar as `.ics` file (iCalendar format)
- `POST /api/v1/calendars/{id}/import` — accept `.ics` file upload, parse events, create them in DB
- Handles `VEVENT`, `RRULE`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`, `LOCATION`, `ATTENDEE` fields

### 1.9 — Team Availability View
**Priority:** P1 — B2B key feature  
**Files:** `backend/app/api/v1/team.py`, `backend/app/services/team_availability.py`, `frontend/src/app/team/page.tsx`  
**What:**
- `POST /api/v1/team/availability` accepts `{ "attendee_emails": [...], "duration_minutes": 60, "start": "...", "end": "..." }` 
- Looks up all events where those emails appear as attendees, computes free/busy windows
- Returns ranked list of available slots across all attendees
- Frontend: "Find Time" UI — add people by email, select duration, see available slots
- No external calendar sync needed (works within DClaw Calendar data only)

### 1.10 — Time Blocking (Manual)
**Priority:** P1  
**Files:** `backend/app/models/time_block.py`, `backend/app/api/v1/time_blocks.py`, `frontend/src/components/calendar/TimeBlock.tsx`  
**What:**
- `TimeBlock` model: `id`, `calendar_id(FK)`, `title`, `block_type` (enum: `focus`, `break`, `travel`, `prep`, `deep_work`), `start_time`, `end_time`, `color`, `is_recurring`, `recurrence_rule?`, `created_at`
- Full CRUD at `/api/v1/time-blocks`
- Visual distinction from events on calendar grid (different style: hatched pattern, `--dk-purple-100` fill)
- "Protect Time" quick action on calendar grid right-click or long-press
- **Alembic migration** for `TimeBlock`

---

## Complexity 2 — AI & Advanced Features

> Competitive moat. Requires Complexity 0 and 1 complete. LLM via OpenRouter + Kimi K2.5 (cloud) / Ollama (local fallback).

### 2.1 — AI Calendar Copilot (Chat Sidebar)
**Priority:** P2 — YC S25/W26 mandatory P0.1 per REVISED-PRD  
**Files:** `backend/app/services/calendar_ai.py`, `backend/app/api/v1/ai.py`, `frontend/src/components/CalendarCopilot.tsx`  
**What:**
- Streaming chat endpoint: `POST /api/v1/ai/chat` with `{"message": "...", "context_window_days": 7}`
- Context injection: inject user's next 7 days of events + time blocks into system prompt before LLM call
- Capabilities:
  - "Find me 2 hours of focus time tomorrow" → query events, find gap, suggest time block
  - "Schedule a 30-min call with john@example.com next week" → create scheduling link or event
  - "How many meetings did I have this week?" → call analytics service
  - "What's my busiest day?" → analytics query
- Tool use: LLM can call internal functions (`create_event`, `create_time_block`, `get_free_slots`, `get_analytics`)
- Frontend: floating chat bubble (bottom-right), expands to 380px sidebar, streams response tokens
- Local fallback: if `OLLAMA_URL` is set, route to Ollama instead of OpenRouter

### 2.2 — AI Intelligent Time Blocking
**Priority:** P2  
**Files:** `backend/app/services/smart_time_blocking.py`, `backend/app/api/v1/ai.py` (add endpoint)  
**What:**
- `POST /api/v1/ai/optimize-schedule` — analyzes the user's calendar for the next 14 days and returns a set of suggested time blocks
- AI considers: meeting density, gaps between meetings (protect from fragmentation), existing time blocks, time of day (morning = focus, afternoon = meetings)
- Returns `suggested_time_blocks: [...]` for user confirmation before applying
- User clicks "Apply suggestions" to batch-create time blocks

### 2.3 — AI Conflict Resolution
**Priority:** P2  
**Files:** `backend/app/services/conflict_resolver.py`, `backend/app/api/v1/ai.py` (add endpoint)  
**What:**
- `POST /api/v1/ai/resolve-conflict` accepts `{"conflicting_event_ids": [...]}`
- AI scores events by priority (attendee count, external vs internal, title keywords) and suggests which to reschedule
- Returns `reschedule_suggestions: [{"event_id": "...", "suggested_new_time": "...", "reason": "..."}]`
- Frontend: conflict banner on event detail now has "Ask AI to resolve" button

### 2.4 — AI Meeting Prep Briefs
**Priority:** P2  
**Files:** `backend/app/services/meeting_prep.py`, `backend/app/api/v1/ai.py` (add endpoint)  
**What:**
- `GET /api/v1/ai/meeting-prep/{event_id}` — generates a prep brief for an upcoming meeting
- Includes: agenda suggestions based on title, attendee context (past meetings with same attendees), action items from description parsing
- Returns structured JSON: `{ "agenda": [...], "talking_points": [...], "prep_time_estimate": "10 min" }`
- Frontend: "Get AI Prep Brief" button on event detail page; renders in a modal

### 2.5 — External Calendar Sync (Google Calendar OAuth)
**Priority:** P2 — Critical for adoption (users won't abandon Google Calendar)  
**Files:** `backend/app/integrations/google_calendar.py`, `backend/app/models/calendar_sync.py`, `backend/app/api/v1/integrations.py`, `backend/requirements.txt` (add `google-auth`, `google-api-python-client`)  
**What:**
- OAuth2 flow: `GET /api/v1/integrations/google/authorize` → redirect to Google → callback `GET /api/v1/integrations/google/callback`
- Store refresh tokens in `CalendarSync` model (encrypted at rest)
- Background sync job: pull events from Google Calendar every 15 minutes, merge into DClaw Calendar (dedup by `external_id`)
- Push new DClaw events to Google Calendar on create
- Conflict resolution: DClaw is the "source of truth" for DClaw-native events; Google is source for imported events
- **Alembic migration** for `CalendarSync`

### 2.6 — Energy-Based Scheduling (Chronotype)
**Priority:** P2  
**Files:** `backend/app/models/user_preferences.py`, `backend/app/services/energy_scheduler.py`, `backend/app/api/v1/preferences.py`  
**What:**
- `UserPreferences` model: `user_id`, `chronotype` (enum: `early_bird`, `night_owl`, `flexible`), `peak_hours_start/end`, `deep_work_preferred_days`
- AI uses chronotype data in `optimize-schedule` to place focus blocks during peak energy hours
- `GET/PUT /api/v1/preferences` for user settings
- Frontend: onboarding "What kind of person are you?" flow with chronotype quiz

### 2.7 — Voice Scheduling
**Priority:** P2  
**Files:** `backend/app/services/voice_scheduling.py`, `backend/app/api/v1/ai.py` (add voice endpoint)  
**What:**
- `POST /api/v1/ai/voice-schedule` — accepts audio file (`.wav`, `.mp3`)
- Transcribes via Whisper API (`openai.audio.transcriptions` or local Whisper)
- Feeds transcript to LLM with calendar context to extract scheduling intent
- Returns structured event data for user to confirm: `{"action": "create_event", "title": "...", "start": "...", "end": "...", "attendees": [...]}`
- Frontend: microphone button in CalendarCopilot sidebar

---

## Patch Rollup (from PATCH-2026-05-15-shared-hub-postgres.md)

The following guidance from the active patch is now canon for this app:

- **Hub database URL:** `postgresql+asyncpg://dclaw:dclaw@dclaw-calendar-db-rw:5432/dclaw_calendar`
- **Local/docker-compose URL:** `postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_calendar` (unchanged)
- **New hub app registration:** add `dclaw_calendar` to `dclaw-platform/services/postgres/postgres-shared.yaml` init script if not already present
- **End-user installs:** `docker-compose.yml` must include a bundled `postgres` service (already in scaffold — verify)

---

## Implementation Order

### Sprint 1 (Weeks 1–2): Foundation — All Complexity 0
1. 0.1 Fix mock data + wire router
2. 0.2 Models (Calendar, Event, Attendee)
3. 0.3 Schemas
4. 0.4 Repositories
5. 0.5 CRUD Routers
6. 0.6 Alembic migration
7. 0.7 Fix test harness
8. 0.8 Backend tests (70%+ coverage)
9. 0.9 DKube Tailwind integration
10. 0.10 Dashboard page
11. 0.11 Calendars page
12. 0.12 Events list + detail pages
13. 0.13 `dclaw-manifest.json`
14. 0.14 Port alignment

### Sprint 2 (Weeks 3–4): Core Features — Complexity 1 (Priority tier)
1. 1.1 Calendar Grid (Month/Week/Day) — **visual centerpiece**
2. 1.3 Conflict Detection — correctness guard
3. 1.4 Attendee RSVP flow
4. 1.6 Smart Reminders
5. 1.2 Scheduling Links — viral loop enabler

### Sprint 3 (Weeks 5–6): Growth Features — Complexity 1 (Secondary tier)
1. 1.5 Recurrence (RRULE)
2. 1.7 Analytics Dashboard
3. 1.8 iCal Import/Export
4. 1.9 Team Availability View
5. 1.10 Manual Time Blocking

### Sprint 4 (Weeks 7–8): AI Differentiation — Complexity 2
1. 2.1 AI Calendar Copilot (chat sidebar) — **YC mandatory P0**
2. 2.2 AI Intelligent Time Blocking
3. 2.3 AI Conflict Resolution

### Sprint 5 (Weeks 9–10): Scale & Integrations — Complexity 2
1. 2.4 AI Meeting Prep Briefs
2. 2.5 Google Calendar Sync
3. 2.6 Energy-Based Scheduling
4. 2.7 Voice Scheduling

---

## Pre-Flight Checklist (before marking Sprint complete)

- [ ] `pytest` passes with ≥70% coverage and zero mock data
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `docker compose up -d` starts all services with healthy status
- [ ] `docker compose config` validates cleanly
- [ ] `helm template .` renders without errors
- [ ] All endpoints listed respond correctly via `curl` or Postman
- [ ] `alembic upgrade head` runs without errors on a clean DB
- [ ] `frontend/public/dclaw-manifest.json` exists and is valid JSON
- [ ] `package-lock.json` committed after any `npm install`
- [ ] No hardcoded `localhost:PORT` in frontend
- [ ] No `MOCK_*` dicts anywhere in backend

---

## Design Constraints (All Sprints)

All frontend work MUST enforce:
- **Font:** Poppins only (`--dk-font-sans`, `--dk-font-display`)
- **Mode:** Light mode ONLY — no `dark:` Tailwind variants
- **Primary action color:** `--dk-brand` (`#7660A8`)
- **Backgrounds:** `--dk-bg` (white) or `--dk-bg-muted` (`#F8F8FA`)
- **Ink:** `--dk-fg` (`#0F0F12`) for headlines, `--dk-fg-1` (`#404049`) for body
- **Cards:** `--dk-radius-lg` (16px), `--dk-shadow-sm`
- **Buttons:** primary = `--dk-brand` fill + `--dk-fg-on-brand` text + `--dk-radius-pill`
- **Borders:** `--dk-border` (`#E8E8EC`)
- **Calendar accent color:** `#10B981` (from REVISED-PRD brand color) for calendar-specific highlights
