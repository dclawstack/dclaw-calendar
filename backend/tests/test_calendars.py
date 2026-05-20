import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_calendars_empty(client: AsyncClient):
    response = await client.get("/api/v1/calendars/")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_calendar(client: AsyncClient):
    payload = {"name": "Work", "color": "#7660A8", "is_default": True}
    response = await client.post("/api/v1/calendars/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Work"
    assert data["color"] == "#7660A8"
    assert data["is_default"] is True
    assert "id" in data


@pytest.mark.asyncio
async def test_get_calendar(client: AsyncClient):
    create = await client.post("/api/v1/calendars/", json={"name": "Personal"})
    calendar_id = create.json()["id"]

    response = await client.get(f"/api/v1/calendars/{calendar_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Personal"


@pytest.mark.asyncio
async def test_get_calendar_not_found(client: AsyncClient):
    response = await client.get("/api/v1/calendars/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_calendar(client: AsyncClient):
    create = await client.post("/api/v1/calendars/", json={"name": "Old Name"})
    calendar_id = create.json()["id"]

    response = await client.patch(
        f"/api/v1/calendars/{calendar_id}", json={"name": "New Name", "color": "#10B981"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["color"] == "#10B981"


@pytest.mark.asyncio
async def test_delete_calendar(client: AsyncClient):
    create = await client.post("/api/v1/calendars/", json={"name": "To Delete"})
    calendar_id = create.json()["id"]

    response = await client.delete(f"/api/v1/calendars/{calendar_id}")
    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/calendars/{calendar_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_list_calendars_multiple(client: AsyncClient):
    await client.post("/api/v1/calendars/", json={"name": "Work"})
    await client.post("/api/v1/calendars/", json={"name": "Personal"})

    response = await client.get("/api/v1/calendars/")
    assert response.status_code == 200
    assert len(response.json()) == 2
