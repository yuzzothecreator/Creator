import pytest
from httpx import AsyncClient


async def _login(client: AsyncClient, email: str, password: str) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_list_products_and_cart_checkout(client: AsyncClient) -> None:
    products = await client.get("/api/v1/products")
    assert products.status_code == 200
    items = products.json()
    assert len(items) >= 1
    product_id = items[0]["id"]

    token = await _login(client, "demo@example.com", "demopass123")
    headers = {"Authorization": f"Bearer {token}"}

    cart = await client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={"product_id": product_id, "quantity": 2},
    )
    assert cart.status_code == 200
    assert cart.json()["item_count"] == 2

    order = await client.post(
        "/api/v1/orders/checkout",
        headers=headers,
        json={"shipping_address": "123 Demo Street, Test City"},
    )
    assert order.status_code == 201
    body = order.json()
    assert body["status"] == "pending"
    assert len(body["items"]) == 1

    payment = await client.post(
        "/api/v1/payments/intents",
        headers=headers,
        json={"order_id": body["id"]},
    )
    assert payment.status_code == 201
    assert payment.json()["provider"] == "stub"
    assert payment.json()["status"] == "requires_confirmation"
