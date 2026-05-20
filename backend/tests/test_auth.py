import pytest
from httpx import AsyncClient


REGISTER_URL = "/api/v1/auth/register"
LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"

VALID_USER = {"email": "alice@example.com", "name": "Alice Chen", "password": "secret123"}


async def register_and_login(client: AsyncClient, user: dict = VALID_USER) -> str:
    resp = await client.post(REGISTER_URL, json=user)
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_register_returns_token(client: AsyncClient):
    resp = await client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 201
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == VALID_USER["email"]
    assert body["user"]["name"] == VALID_USER["name"]
    assert "hashed_password" not in body["user"]


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_409(client: AsyncClient):
    await client.post(REGISTER_URL, json=VALID_USER)
    resp = await client.post(REGISTER_URL, json=VALID_USER)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_short_password_returns_422(client: AsyncClient):
    resp = await client.post(REGISTER_URL, json={**VALID_USER, "password": "abc"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_login_returns_token(client: AsyncClient):
    await client.post(REGISTER_URL, json=VALID_USER)
    resp = await client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": VALID_USER["password"]})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["user"]["email"] == VALID_USER["email"]


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client: AsyncClient):
    await client.post(REGISTER_URL, json=VALID_USER)
    resp = await client.post(LOGIN_URL, json={"email": VALID_USER["email"], "password": "wrongpass"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email_returns_401(client: AsyncClient):
    resp = await client.post(LOGIN_URL, json={"email": "nobody@example.com", "password": "anything"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_current_user(client: AsyncClient):
    token = await register_and_login(client)
    resp = await client.get(ME_URL, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == VALID_USER["email"]


@pytest.mark.asyncio
async def test_me_without_token_returns_401(client: AsyncClient):
    resp = await client.get(ME_URL)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_with_invalid_token_returns_401(client: AsyncClient):
    resp = await client.get(ME_URL, headers={"Authorization": "Bearer invalidtoken"})
    assert resp.status_code == 401
