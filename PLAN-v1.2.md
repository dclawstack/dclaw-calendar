# DClaw Calendar — v1.2 Feature Roadmap

> 📘 **REVISED PRD v2.3 available:** See `REVISED-PRD.md` for complete gap analysis, current state, and full feature roadmap.


> Based on: Y Combinator vertical SaaS principles, trending GitHub repos (calcom, calendso), AI product research (Calendly, Reclaim.ai, Clockwise, Motion)

## Pre-Flight Checklist

- [ ] `frontend/package-lock.json` committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed
- [ ] `docker-compose.yml` healthchecks correct
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [ ] Calendar views (day/week/month)
- [ ] Event CRUD
- [ ] Basic scheduling
- [ ] Google/Outlook sync
- [ ] Real backend CRUD (no mocks)
- [ ] Docker + Helm deployment
- [ ] Alembic migrations
- [ ] Backend tests

---

## v1.2 Roadmap

### P0 — Must Have (Ship in v1.0, demo-ready)

#### 1. AI Calendar Copilot (Time Optimizer)
**Description:** AI assistant that optimizes your schedule, suggests focus time, and handles scheduling conflicts. "Find me 2 hours of focus time tomorrow."
- **AI Angle:** Schedule optimization with priorities. Conflict resolution suggestions.
- **Backend:** `/api/v1/ai/calendar-chat` endpoint. Optimization engine.
- **Frontend:** AI sidebar with schedule insights and suggestions.
- **Files:** `backend/app/services/calendar_ai.py`, `frontend/src/components/calendar-copilot.tsx`

#### 2. Smart Scheduling Links
**Description:** Share your availability with external parties. Auto-timezone handling. Buffer time.
- **Backend:** Availability calculation with rules. Booking page generation.
- **Frontend:** Scheduling link builder with customization.
- **Files:** `backend/app/services/scheduling_links.py`

#### 3. Intelligent Time Blocking
**Description:** AI auto-blocks focus time, travel buffers, and prep time around meetings.
- **Backend:** Time block optimization with user preferences.
- **Frontend:** Visual time blocks with labels.
- **Files:** `backend/app/services/time_blocking.py`

#### 4. Multi-Calendar Sync
**Description:** Sync with Google Calendar, Outlook, Apple Calendar. Resolve conflicts across calendars.
- **Backend:** Calendar API integrations. Conflict detection.
- **Frontend:** Unified calendar view with color-coded sources.
- **Files:** `backend/app/integrations/calendar_sync.py`

### P1 — Should Have (v1.1–1.2)

#### 5. AI Meeting Prep & Follow-Up
**Description:** Auto-prep meeting briefs from attendee profiles and agenda. Auto-draft follow-up emails.
- **AI Angle:** Attendee research + agenda analysis + draft generation.
- **Backend:** Prep generation pipeline.
- **Frontend:** Meeting card with prep checklist.

#### 6. Team Scheduling & Round-Robin
**Description:** Distribute meetings across team members. Round-robin, collective, and managed events.
- **Backend:** Team availability aggregation. Assignment rules.
- **Frontend:** Team scheduling page with member selection.

#### 7. Analytics & Time Insights
**Description:** Time spent in meetings, focus time, workload distribution. Weekly time reports.
- **Backend:** Time analysis engine.
- **Frontend:** Insights dashboard with time breakdown.

#### 8. Automated Reminders & Follow-Ups
**Description:** Smart reminders based on travel time, prep needs, and attendee status.
- **Backend:** Context-aware notification engine.
- **Frontend:** Notification preferences with smart defaults.

### P2 — Could Have (v1.3+)

#### 9. AI Suggested Agenda Builder
**Description:** AI generates meeting agendas based on attendees, previous meetings, and goals.

#### 10. Energy-Based Scheduling
**Description:** Schedule demanding tasks during peak energy hours based on chronotype analysis.

#### 11. External Appointment Marketplace
**Description:** Discover and book appointments with external service providers.

#### 12. Voice-Activated Scheduling
**Description:** Schedule, reschedule, and query calendar via voice commands.

---

## Implementation Priority

1. **Week 1–2:** AI Calendar Copilot (P0.1) + Smart Scheduling Links (P0.2)
2. **Week 3–4:** Time Blocking (P0.3) + Multi-Calendar Sync (P0.4)
3. **Week 5–6:** Meeting Prep (P1.5) + Team Scheduling (P1.6)
4. **Week 7–8:** Analytics (P1.7) + Smart Reminders (P1.8)
