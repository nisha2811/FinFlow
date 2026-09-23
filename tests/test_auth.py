import uuid

from fastapi.testclient import TestClient

from app.db.database import Base, engine
from app.main import app


def test_register():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"

    Base.metadata.create_all(bind=engine)
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Test User",
                "email": unique_email,
                "password": "Password@123",
                "role": "EMPLOYEE"
            }
        )

    assert response.status_code == 200


def test_manager_can_register_but_admin_cannot():
    with TestClient(app) as client:
        manager_response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Team Manager",
                "email": f"manager_{uuid.uuid4().hex[:8]}@test.com",
                "password": "Password@123!",
                "role": "MANAGER",
            },
        )
        admin_response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Unauthorized Admin",
                "email": f"admin_{uuid.uuid4().hex[:8]}@test.com",
                "password": "Password@123!",
                "role": "ADMIN",
            },
        )

    assert manager_response.status_code == 200
    assert admin_response.status_code == 403