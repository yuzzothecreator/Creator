import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_login_me(client: AsyncClient) -> None:
    register = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepass1",
            "full_name": "New User",
        },
    )
    assert register.status_code == 201
    token = register.json()["access_token"]
    assert token

    me = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "newuser@example.com"

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@example.com", "password": "securepass1"},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


@pytest.mark.asyncio
async def test_login_invalid(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "demo@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401
