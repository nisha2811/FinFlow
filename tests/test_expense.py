import uuid

from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_expense_validation_rejects_invalid_amount():
    email = f"validation_{uuid.uuid4().hex[:8]}@test.com"
    with TestClient(app) as client:
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Validation Employee",
                "email": email,
                "password": "Password@123!",
                "role": "EMPLOYEE",
            },
        )
        assert register_response.status_code == 200
        login_response = client.post(
            "/api/v1/auth/login",
            data={"username": email, "password": "Password@123!"},
        )
        token = login_response.json()["access_token"]
        response = client.post(
            "/api/v1/expenses",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Invalid expense",
                "amount": -1,
                "category": "Travel",
                "description": "Should be rejected",
            },
        )

    assert response.status_code == 422


def test_unauthenticated_expense_access_is_rejected():
    with TestClient(app) as client:
        response = client.get("/api/v1/expenses")

    assert response.status_code == 401