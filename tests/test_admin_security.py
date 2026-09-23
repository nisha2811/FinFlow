import uuid

from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.user import User


def _admin_credentials():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "ADMIN", User.is_active.is_(True)).first()
        assert admin is not None
        return admin.email
    finally:
        db.close()


def test_admin_can_login_and_access_admin_dashboard():
    # The shipped development database has a seeded administrator.
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "admin@finflow.local", "password": "FinFlow@Admin123!"},
        )
        assert response.status_code == 200
        token = response.json()["access_token"]
        dashboard = client.get(
            "/api/v1/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert dashboard.status_code == 200


def test_manager_cannot_access_admin_dashboard():
    email = f"manager_{uuid.uuid4().hex[:8]}@test.com"
    password = "Password@123!"
    with TestClient(app) as client:
        register = client.post(
            "/api/v1/auth/register",
            json={"name": "Manager Test", "email": email, "password": password, "role": "MANAGER"},
        )
        assert register.status_code == 200
        login = client.post("/api/v1/auth/login", data={"username": email, "password": password})
        assert login.status_code == 200
        response = client.get(
            "/api/v1/dashboard",
            headers={"Authorization": f"Bearer {login.json()['access_token']}"},
        )
        assert response.status_code == 403


def test_admin_cannot_be_created_from_public_registration():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Second Admin",
                "email": f"second_admin_{uuid.uuid4().hex[:8]}@test.com",
                "password": "Password@123!",
                "role": "ADMIN",
            },
        )
        assert response.status_code == 403


def test_admin_cannot_be_deactivated_from_profile():
    with TestClient(app) as client:
        login = client.post(
            "/api/v1/auth/login",
            data={"username": "admin@finflow.local", "password": "FinFlow@Admin123!"},
        )
        assert login.status_code == 200
        response = client.delete(
            "/api/v1/auth/profile",
            headers={"Authorization": f"Bearer {login.json()['access_token']}"},
        )
        assert response.status_code == 403
