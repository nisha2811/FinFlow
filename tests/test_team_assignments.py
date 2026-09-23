import uuid

from fastapi.testclient import TestClient

from app.core.security import hash_password, create_access_token
from app.db.database import SessionLocal
from app.main import app
from app.models.user import User


def test_manager_team_limit_is_enforced():
    suffix = uuid.uuid4().hex[:8]
    manager_email = f"manager_{suffix}@test.com"
    employee_emails = [f"employee_{suffix}_{index}@test.com" for index in range(11)]

    db = SessionLocal()
    manager = User(
        id=str(uuid.uuid4()),
        name="Test Manager",
        email=manager_email,
        password_hash=hash_password("Password@123!"),
        role="MANAGER",
        is_active=True,
    )
    employees = [
        User(
            id=str(uuid.uuid4()),
            name=f"Employee {index}",
            email=email,
            password_hash=hash_password("Password@123!"),
            role="EMPLOYEE",
            is_active=True,
        )
        for index, email in enumerate(employee_emails)
    ]
    db.add_all([manager, *employees])
    db.commit()
    manager_id = manager.id
    employee_ids = [employee.id for employee in employees]
    admin_user = db.query(User).filter(User.role == "ADMIN", User.is_active.is_(True)).first()
    admin_id = admin_user.id
    db.close()

    token = create_access_token({"sub": admin_id, "role": "ADMIN"})
    with TestClient(app) as client:
        headers = {"Authorization": f"Bearer {token}"}

        for employee_id in employee_ids[:10]:
            response = client.put(
                f"/api/v1/auth/employees/{employee_id}/manager",
                headers=headers,
                json={"manager_id": manager_id},
            )
            assert response.status_code == 200

        response = client.put(
            f"/api/v1/auth/employees/{employee_ids[10]}/manager",
            headers=headers,
            json={"manager_id": manager_id},
        )

    assert response.status_code == 409