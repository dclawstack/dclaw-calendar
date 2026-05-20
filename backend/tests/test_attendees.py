import pytest
from httpx import AsyncClient


async def _create_calendar_and_event(client: AsyncClient) -> tuple[str, str]:
    cal = await client.post("/api/v1/calendars/", json={"name": "Work"})
    cal_id = cal.json()["id"]
    event = await client.post(
        "/api/v1/events/",
        json={
            "title": "Team Meeting",
            "start_time": "2026-06-10T10:00:00",
            "end_time": "2026-06-10T11:00:00",
            "calendar_id": cal_id,
        },
    )
    return cal_id, event.json()["id"]


@pytest.mark.asyncio
async def test_list_attendees_empty(client: AsyncClient):
    response = await client.get("/api/v1/attendees/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_attendee(client: AsyncClient):
    _, event_id = await _create_calendar_and_event(client)
    payload = {"event_id": event_id, "email": "alice@example.com", "name": "Alice"}
    response = await client.post("/api/v1/attendees/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["status"] == "pending"
    assert data["type"] == "required"


@pytest.mark.asyncio
async def test_update_attendee_status(client: AsyncClient):
    _, event_id = await _create_calendar_and_event(client)
    create = await client.post(
        "/api/v1/attendees/",
        json={"event_id": event_id, "email": "bob@example.com"},
    )
    attendee_id = create.json()["id"]

    response = await client.patch(
        f"/api/v1/attendees/{attendee_id}", json={"status": "accepted"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"


@pytest.mark.asyncio
async def test_delete_attendee(client: AsyncClient):
    _, event_id = await _create_calendar_and_event(client)
    create = await client.post(
        "/api/v1/attendees/",
        json={"event_id": event_id, "email": "carol@example.com"},
    )
    attendee_id = create.json()["id"]

    response = await client.delete(f"/api/v1/attendees/{attendee_id}")
    assert response.status_code == 204

    not_found = await client.patch(f"/api/v1/attendees/{attendee_id}", json={"status": "accepted"})
    assert not_found.status_code == 404


@pytest.mark.asyncio
async def test_list_attendees_by_event(client: AsyncClient):
    _, event_id = await _create_calendar_and_event(client)
    await client.post("/api/v1/attendees/", json={"event_id": event_id, "email": "alice@example.com"})
    await client.post("/api/v1/attendees/", json={"event_id": event_id, "email": "bob@example.com"})

    response = await client.get(f"/api/v1/attendees/?event_id={event_id}")
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_cascade_delete_event_removes_attendees(client: AsyncClient):
    _, event_id = await _create_calendar_and_event(client)
    await client.post("/api/v1/attendees/", json={"event_id": event_id, "email": "alice@example.com"})

    await client.delete(f"/api/v1/events/{event_id}")
    response = await client.get("/api/v1/attendees/")
    assert response.json() == []


@pytest.mark.asyncio
async def test_attendee_not_found(client: AsyncClient):
    response = await client.patch(
        "/api/v1/attendees/00000000-0000-0000-0000-000000000000", json={"status": "accepted"}
    )
    assert response.status_code == 404
