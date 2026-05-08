# PRODUCT-SPEC: Calendar

## Overview

**App Name:** Calendar
**Domain:** Events, Scheduling & Availability
**Target User:** All teams — cross-cutting utility

## Core Entities

### Calendar
```
Calendar
├── id: UUID (PK)
├── name: str (required)
├── owner_id: str (optional)
├── color: str (optional) — hex color
├── is_default: bool (default false)
├── created_at: datetime
└── updated_at: datetime
```

### Event
```
Event
├── id: UUID (PK)
├── title: str (required)
├── description: str (optional)
├── start_time: datetime (required)
├── end_time: datetime (required)
├── timezone: str (default "UTC")
├── location: str (optional)
├── organizer_id: str (optional)
├── calendar_id: UUID (FK → Calendar, ondelete=CASCADE)
├── recurrence_rule: str (optional) — iCal RRULE string
├── created_at: datetime
└── updated_at: datetime
```

### Attendee
```
Attendee
├── id: UUID (PK)
├── event_id: UUID (FK → Event, ondelete=CASCADE)
├── email: str (required)
├── name: str (optional)
├── status: enum ["pending", "accepted", "declined", "tentative"] (default: "pending")
├── type: enum ["required", "optional"] (default: "required")
├── created_at: datetime
└── updated_at: datetime
```

## User Stories / Screens

### Screen 1: Dashboard / Main Calendar
- Calendar grid view (month/week/day toggle)
- Event cards on calendar
- Click to add event
- Sidebar with calendar list
- Color coding per calendar

### Screen 2: Event List
- Table view with pagination, search by title
- Date range filter
- Status filter
- "Add Event" modal/form

### Screen 3: Event Detail
- Event info with edit/delete
- Attendee list with status indicators
- Add attendee form
- Send invitation button

### Screen 4: Calendars
- List of calendars
- Toggle visibility
- "Add Calendar" form with color picker
- Edit/delete calendar

## API Endpoints

- `GET /api/v1/calendars` — list calendars
- `POST /api/v1/calendars` — create calendar
- `GET /api/v1/calendars/{id}` — get calendar
- `PATCH /api/v1/calendars/{id}` — update calendar
- `DELETE /api/v1/calendars/{id}` — delete calendar

- `GET /api/v1/events` — list events
- `POST /api/v1/events` — create event
- `GET /api/v1/events/{id}` — get event
- `PATCH /api/v1/events/{id}` — update event
- `DELETE /api/v1/events/{id}` — delete event

- `GET /api/v1/attendees` — list attendees
- `POST /api/v1/attendees` — create attendee
- `PATCH /api/v1/attendees/{id}` — update attendee status
- `DELETE /api/v1/attendees/{id}` — remove attendee
