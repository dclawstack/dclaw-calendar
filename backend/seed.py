"""
Seed script: 10 realistic users, 2 calendars each + 1 shared team calendar,
rich event history (past May 6-19 2026 + future May 21 - Jun 20 2026),
multi-attendee events, back-to-back and overlap edge cases.

Run from /backend:
    python3 seed.py
"""

import asyncio
import uuid
from datetime import datetime, timedelta

import bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import NullPool

import app.models  # noqa: F401 — registers all models with Base.metadata
from app.models.base import Base
from app.models.user import User
from app.models.calendar import Calendar
from app.models.event import Event
from app.models.attendee import Attendee, AttendeeStatus, AttendeeType

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_calendar"


def hp(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def dt(y: int, mo: int, d: int, h: int, mi: int = 0) -> datetime:
    return datetime(y, mo, d, h, mi)  # naive — DB column is TIMESTAMP WITHOUT TIME ZONE


NOW = datetime(2026, 5, 20, 12, 0)

USERS = [
    {"name": "Alice Chen",      "email": "alice@dclaw.dev",   "role": "admin"},
    {"name": "Bob Kumar",       "email": "bob@dclaw.dev",     "role": "member"},
    {"name": "Carol Santos",    "email": "carol@dclaw.dev",   "role": "member"},
    {"name": "David Park",      "email": "david@dclaw.dev",   "role": "member"},
    {"name": "Emma Wilson",     "email": "emma@dclaw.dev",    "role": "member"},
    {"name": "Frank Torres",    "email": "frank@dclaw.dev",   "role": "admin"},
    {"name": "Grace Liu",       "email": "grace@dclaw.dev",   "role": "member"},
    {"name": "Henry Okonkwo",   "email": "henry@dclaw.dev",   "role": "member"},
    {"name": "Isabel Reyes",    "email": "isabel@dclaw.dev",  "role": "member"},
    {"name": "James Miller",    "email": "james@dclaw.dev",   "role": "member"},
]

CALENDAR_COLORS = [
    "#7660A8", "#2E8B57", "#2C6CB0", "#C28A00", "#B3261E",
    "#5C4A8E", "#2E8B57", "#404049", "#7660A8", "#2C6CB0",
]


async def seed():
    engine = create_async_engine(DATABASE_URL, poolclass=NullPool)

    async with engine.begin() as conn:
        print("Dropping all tables…")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables…")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine, expire_on_commit=False) as db:
        # ── Users ──────────────────────────────────────────────────────────
        print("Creating users…")
        users: list[User] = []
        for i, u in enumerate(USERS):
            user = User(
                id=uuid.uuid4(),
                email=u["email"],
                name=u["name"],
                hashed_password=hp("dclaw123"),
                role=u["role"],
                is_active=True,
                created_at=NOW - timedelta(days=60),
                updated_at=NOW - timedelta(days=60),
            )
            db.add(user)
            users.append(user)
        await db.flush()

        alice, bob, carol, david, emma, frank, grace, henry, isabel, james = users

        # ── Calendars ──────────────────────────────────────────────────────
        print("Creating calendars…")
        personal_cals: list[Calendar] = []
        work_cals: list[Calendar] = []

        for i, user in enumerate(users):
            personal = Calendar(
                id=uuid.uuid4(),
                name="Personal",
                owner_id=str(user.id),
                color="#9384BD",
                is_default=True,
                created_at=NOW - timedelta(days=59),
                updated_at=NOW - timedelta(days=59),
            )
            work = Calendar(
                id=uuid.uuid4(),
                name="Work",
                owner_id=str(user.id),
                color=CALENDAR_COLORS[i],
                is_default=False,
                created_at=NOW - timedelta(days=59),
                updated_at=NOW - timedelta(days=59),
            )
            db.add(personal)
            db.add(work)
            personal_cals.append(personal)
            work_cals.append(work)

        # Shared team calendar (owned by Alice / admin)
        team_cal = Calendar(
            id=uuid.uuid4(),
            name="Team Events",
            owner_id=str(alice.id),
            color="#7660A8",
            is_default=False,
            created_at=NOW - timedelta(days=58),
            updated_at=NOW - timedelta(days=58),
        )
        db.add(team_cal)
        await db.flush()

        alice_work = work_cals[0]
        bob_work   = work_cals[1]
        carol_work = work_cals[2]
        david_work = work_cals[3]
        emma_work  = work_cals[4]
        frank_work = work_cals[5]

        # ── Events ─────────────────────────────────────────────────────────
        print("Creating events…")
        events: list[Event] = []

        def mkevent(title, cal, start, end, desc=None, org=None, loc=None):
            e = Event(
                id=uuid.uuid4(),
                title=title,
                description=desc,
                start_time=start,
                end_time=end,
                timezone="UTC",
                location=loc,
                organizer_id=str(org.id) if org else None,
                calendar_id=cal.id,
                created_at=start - timedelta(days=3),
                updated_at=start - timedelta(days=3),
            )
            db.add(e)
            events.append(e)
            return e

        # ── PAST EVENTS (May 6–19) ─────────────────────────────────────────

        # Daily standups M-F May 6–9 (past week 1)
        for day in [6, 7, 8, 9]:
            mkevent(
                "Daily Standup",
                team_cal,
                dt(2026, 5, day, 9, 0),
                dt(2026, 5, day, 9, 15),
                "15-min sync — blockers, priorities",
                alice,
                "Zoom",
            )

        # Product review May 6
        pr1 = mkevent(
            "Product Review — Q2 Features",
            alice_work,
            dt(2026, 5, 6, 14, 0),
            dt(2026, 5, 6, 15, 30),
            "Review upcoming Q2 milestones with PM and design.",
            alice,
            "Conf Room A",
        )

        # 1:1 Alice ↔ Bob May 7
        one1 = mkevent(
            "1:1 Alice ↔ Bob",
            alice_work,
            dt(2026, 5, 7, 11, 0),
            dt(2026, 5, 7, 11, 30),
            "Weekly check-in.",
            alice,
        )

        # Design review May 8
        dr1 = mkevent(
            "Design Review — Dashboard v2",
            carol_work,
            dt(2026, 5, 8, 13, 0),
            dt(2026, 5, 8, 14, 0),
            "Carol walks through new dashboard mocks.",
            carol,
            "Design Studio",
        )

        # Backend sync May 9 (back-to-back with 1:1)
        back1 = mkevent(
            "Backend Sync",
            david_work,
            dt(2026, 5, 9, 10, 0),
            dt(2026, 5, 9, 10, 45),
            "DB migration planning.",
            david,
        )
        # back-to-back: immediately after
        back2 = mkevent(
            "API Spec Review",
            david_work,
            dt(2026, 5, 9, 10, 45),
            dt(2026, 5, 9, 11, 30),
            "Review OpenAPI spec changes.",
            david,
        )

        # Carol overlap edge case: two meetings at the same time May 9
        overlap1 = mkevent(
            "Marketing Sync",
            emma_work,
            dt(2026, 5, 9, 14, 0),
            dt(2026, 5, 9, 15, 0),
            "Content calendar planning.",
            emma,
        )
        overlap2 = mkevent(
            "Customer Demo — Acme Corp",
            carol_work,
            dt(2026, 5, 9, 14, 30),
            dt(2026, 5, 9, 15, 30),
            "Live product demo for Acme.",
            carol,
            "Google Meet",
        )

        # All-hands May 12
        allhands = mkevent(
            "Company All-Hands",
            team_cal,
            dt(2026, 5, 12, 10, 0),
            dt(2026, 5, 12, 11, 30),
            "Monthly company update — roadmap, metrics, shoutouts.",
            frank,
            "Main Hall",
        )

        # Sprint planning May 13
        sprint = mkevent(
            "Sprint Planning — Sprint 23",
            alice_work,
            dt(2026, 5, 13, 9, 30),
            dt(2026, 5, 13, 11, 0),
            "Story estimation and sprint commitment.",
            alice,
            "Conf Room B",
        )

        # Lunch & learn May 14
        lunch = mkevent(
            "Lunch & Learn: AI in Scheduling",
            team_cal,
            dt(2026, 5, 14, 12, 0),
            dt(2026, 5, 14, 13, 0),
            "Grace presents latest AI scheduling research.",
            grace,
            "Kitchen",
        )

        # Long strategy session May 15 (3.5 hrs)
        strategy = mkevent(
            "Annual Strategy Workshop",
            frank_work,
            dt(2026, 5, 15, 9, 0),
            dt(2026, 5, 15, 12, 30),
            "Full leadership strategy session — 2027 roadmap.",
            frank,
            "Boardroom",
        )

        # Bob back-to-back triple May 15
        bob1 = mkevent("PR Review: auth module", bob_work, dt(2026, 5, 15, 14, 0), dt(2026, 5, 15, 14, 30), org=bob)
        bob2 = mkevent("Infra standup", bob_work, dt(2026, 5, 15, 14, 30), dt(2026, 5, 15, 14, 45), org=bob)
        bob3 = mkevent("Interview: Senior Engineer", bob_work, dt(2026, 5, 15, 15, 0), dt(2026, 5, 15, 16, 0), org=bob)

        # Retro May 16
        retro = mkevent(
            "Sprint 22 Retrospective",
            alice_work,
            dt(2026, 5, 16, 14, 0),
            dt(2026, 5, 16, 15, 0),
            "What went well, what to improve.",
            alice,
        )

        # Daily standups May 13–16
        for day in [13, 14, 15, 16]:
            mkevent("Daily Standup", team_cal, dt(2026, 5, day, 9, 0), dt(2026, 5, day, 9, 15), org=alice, loc="Zoom")

        # ── FUTURE EVENTS (May 21 – Jun 20) ───────────────────────────────

        # Daily standups May 21–23
        for day in [21, 22, 23]:
            mkevent("Daily Standup", team_cal, dt(2026, 5, day, 9, 0), dt(2026, 5, day, 9, 15), org=alice, loc="Zoom")

        # Product roadmap review May 21
        roadmap = mkevent(
            "Product Roadmap Review — Q3",
            alice_work,
            dt(2026, 5, 21, 14, 0),
            dt(2026, 5, 21, 15, 30),
            "Review Q3 feature priorities with stakeholders.",
            alice,
            "Conf Room A",
        )

        # Customer success call May 22
        cs_call = mkevent(
            "Customer Success: TechCorp Check-in",
            isabel_reyes := personal_cals[8],
            dt(2026, 5, 22, 11, 0),
            dt(2026, 5, 22, 11, 45),
            "Quarterly success review with TechCorp.",
            users[8],
            "Zoom",
        )

        # Design sprint kickoff May 23
        ds_kick = mkevent(
            "Design Sprint Kickoff — Mobile App",
            carol_work,
            dt(2026, 5, 23, 10, 0),
            dt(2026, 5, 23, 12, 0),
            "5-day design sprint for the mobile calendar app.",
            carol,
            "Design Studio",
        )

        # Engineering demo May 26
        eng_demo = mkevent(
            "Engineering Demo Day",
            team_cal,
            dt(2026, 5, 26, 15, 0),
            dt(2026, 5, 26, 16, 30),
            "Bi-weekly demos: new features shipped this sprint.",
            david,
            "Auditorium",
        )

        # 1:1 Frank ↔ Alice May 27
        frank_alice = mkevent(
            "1:1 Frank ↔ Alice",
            frank_work,
            dt(2026, 5, 27, 9, 0),
            dt(2026, 5, 27, 9, 30),
            org=frank,
        )

        # Board meeting June 3
        board = mkevent(
            "Board Meeting — Q2 Review",
            frank_work,
            dt(2026, 6, 3, 10, 0),
            dt(2026, 6, 3, 13, 0),
            "Quarterly board presentation — financials, product, hiring.",
            frank,
            "Boardroom",
        )

        # Hackathon June 5–6
        hackathon1 = mkevent(
            "Internal Hackathon — Day 1",
            team_cal,
            dt(2026, 6, 5, 9, 0),
            dt(2026, 6, 5, 18, 0),
            "Build something cool! Theme: AI + Scheduling.",
            grace,
            "Entire Office",
        )
        hackathon2 = mkevent(
            "Internal Hackathon — Day 2 + Demo",
            team_cal,
            dt(2026, 6, 6, 9, 0),
            dt(2026, 6, 6, 17, 0),
            "Final builds + team presentations at 3 PM.",
            grace,
            "Entire Office",
        )

        # Offsite June 10
        offsite = mkevent(
            "Leadership Offsite — Strategy 2027",
            frank_work,
            dt(2026, 6, 10, 8, 0),
            dt(2026, 6, 11, 17, 0),
            "2-day leadership offsite. 2027 strategy and OKRs.",
            frank,
            "Napa Valley Resort",
        )

        # Sprint planning June 17
        sprint24 = mkevent(
            "Sprint Planning — Sprint 24",
            alice_work,
            dt(2026, 6, 17, 9, 30),
            dt(2026, 6, 17, 11, 0),
            org=alice,
            loc="Conf Room B",
        )

        await db.flush()

        # ── Attendees ──────────────────────────────────────────────────────
        print("Creating attendees…")

        def attend(event, user, status=AttendeeStatus.accepted, atype=AttendeeType.required):
            a = Attendee(
                id=uuid.uuid4(),
                event_id=event.id,
                email=user.email,
                name=user.name,
                status=status,
                type=atype,
                created_at=event.created_at,
                updated_at=event.created_at,
            )
            db.add(a)

        # standups — all team attends
        for evt in events:
            if evt.title == "Daily Standup":
                for u in [alice, bob, carol, david, emma]:
                    attend(evt, u)

        # product review
        attend(pr1, alice)
        attend(pr1, bob)
        attend(pr1, carol)
        attend(pr1, frank)

        # 1:1
        attend(one1, alice)
        attend(one1, bob)

        # design review
        attend(dr1, carol)
        attend(dr1, alice)
        attend(dr1, emma, status=AttendeeStatus.tentative, atype=AttendeeType.optional)

        # backend events (back-to-back)
        for evt in [back1, back2]:
            attend(evt, david)
            attend(evt, bob)
            attend(evt, henry)

        # overlapping events (Carol in two meetings)
        attend(overlap1, emma)
        attend(overlap1, grace)
        attend(overlap2, carol)
        attend(overlap2, isabel := users[8])
        attend(overlap2, frank, status=AttendeeStatus.declined, atype=AttendeeType.optional)

        # all-hands — everyone
        for u in users:
            attend(allhands, u)

        # sprint planning
        for u in [alice, bob, david, james := users[9], carol]:
            attend(sprint, u)

        # lunch & learn
        for u in [grace, alice, carol, emma, henry]:
            attend(lunch, u, atype=AttendeeType.optional)

        # strategy workshop
        for u in [frank, alice, bob, carol, david, emma]:
            attend(strategy, u)

        # bob back-to-back
        attend(bob1, bob)
        attend(bob1, david)
        attend(bob2, bob)
        attend(bob2, henry)
        attend(bob3, bob)
        attend(bob3, alice, atype=AttendeeType.optional)

        # retro
        for u in [alice, bob, carol, david, emma, james]:
            attend(retro, u)

        # roadmap review
        for u in [alice, frank, carol, emma, grace]:
            attend(roadmap, u)

        # customer success call
        attend(cs_call, users[8])
        attend(cs_call, alice, atype=AttendeeType.optional)

        # design sprint
        attend(ds_kick, carol)
        attend(ds_kick, alice)
        attend(ds_kick, emma, status=AttendeeStatus.tentative)
        attend(ds_kick, james)

        # eng demo
        for u in users:
            attend(eng_demo, u, atype=AttendeeType.optional)

        # frank-alice 1:1
        attend(frank_alice, frank)
        attend(frank_alice, alice)

        # board
        for u in [frank, alice]:
            attend(board, u)

        # hackathon — all
        for u in users:
            attend(hackathon1, u, atype=AttendeeType.optional)
            attend(hackathon2, u, atype=AttendeeType.optional)

        # offsite
        for u in [frank, alice, bob, carol, david, emma]:
            attend(offsite, u)

        # sprint 24
        for u in [alice, bob, david, james, carol]:
            attend(sprint24, u)

        await db.commit()

    await engine.dispose()
    print("✓ Seed complete!")
    print(f"  {len(users)} users  |  {len(events)} events")
    print()
    print("Credentials for all users: password = dclaw123")
    print("  alice@dclaw.dev  (admin)")
    print("  bob@dclaw.dev    (member)")
    print("  carol@dclaw.dev  (member)")
    print("  frank@dclaw.dev  (admin)")
    print("  … and 6 more")


if __name__ == "__main__":
    asyncio.run(seed())
