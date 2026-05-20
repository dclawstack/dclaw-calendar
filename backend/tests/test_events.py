import pytest
from httpx import AsyncClient


async def _create_calendar(client: AsyncClient, name: str = "Work") -> str:
    r = await client.post("/api/v1/calendars/", json={"name": name})
    return r.json()["id"]


@pytest.mark.asyncio
async def test_list_events_empty(client: AsyncClient):
    response = await client.get("/api/v1/events/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_event(client: AsyncClient):
    cal_id = await _create_calendar(client)
    payload = {
        "title": "Team Standup",
        "start_time": "2026-06-01T09:00:00",
        "end_time": "2026-06-01T09:30:00",
        "calendar_id": cal_id,
        "timezone": "UTC",
    }
    response = await client.post("/api/v1/events/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Team Standup"
    assert data["calendar_id"] == cal_id


@pytest.mark.asyncio
async def test_get_event(client: AsyncClient):
    cal_id = await _create_calendar(client)
    create = await client.post(
        "/api/v1/events/",
        json={
            "title": "Sprint Review",
            "start_time": "2026-06-02T14:00:00",
            "end_time": "2026-06-02T15:00:00",
            "calendar_id": cal_id,
        },
    )
    event_id = create.json()["id"]

    response = await client.get(f"/api/v1/events/{event_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Sprint Review"


@pytest.mark.asyncio
async def test_get_event_not_found(client: AsyncClient):
    response = await client.get("/api/v1/events/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_event(client: AsyncClient):
    cal_id = await _create_calendar(client)
    create = await client.post(
        "/api/v1/events/",
        json={
            "title": "Old Title",
            "start_time": "2026-06-03T10:00:00",
            "end_time": "2026-06-03T11:00:00",
            "calendar_id": cal_id,
        },
    )
    event_id = create.json()["id"]

    response = await client.patch(
        f"/api/v1/events/{event_id}",
        json={"title": "New Title", "location": "Conference Room A"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["location"] == "Conference Room A"


@pytest.mark.asyncio
async def test_delete_event(client: AsyncClient):
    cal_id = await _create_calendar(client)
    create = await client.post(
        "/api/v1/events/",
        json={
            "title": "To Delete",
            "start_time": "2026-06-04T10:00:00",
            "end_time": "2026-06-04T11:00:00",
            "calendar_id": cal_id,
        },
    )
    event_id = create.json()["id"]

    response = await client.delete(f"/api/v1/events/{event_id}")
    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/events/{event_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_list_events_by_calendar(client: AsyncClient):
    cal1 = await _create_calendar(client, "Work")
    cal2 = await _create_calendar(client, "Personal")

    await client.post(
        "/api/v1/events/",
        json={"title": "Work Meeting", "start_time": "2026-06-05T09:00:00", "end_time": "2026-06-05T10:00:00", "calendar_id": cal1},
    )
    await client.post(
        "/api/v1/events/",
        json={"title": "Personal Gym", "start_time": "2026-06-05T07:00:00", "end_time": "2026-06-05T08:00:00", "calendar_id": cal2},
    )

    response = await client.get(f"/api/v1/events/?calendar_id={cal1}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Work Meeting"


@pytest.mark.asyncio
async def test_cascade_delete_calendar_removes_events(client: AsyncClient):
    cal_id = await _create_calendar(client)
    await client.post(
        "/api/v1/events/",
        json={"title": "Orphan Event", "start_time": "2026-06-06T09:00:00", "end_time": "2026-06-06T10:00:00", "calendar_id": cal_id},
    )

    await client.delete(f"/api/v1/calendars/{cal_id}")
    response = await client.get("/api/v1/events/")
    assert response.json() == []
