import uuid
from tempfile import NamedTemporaryFile
from openpyxl import Workbook
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    ProfileUpdate,
    ManagerAssignment,
)
from app.schemas.user import ResetPasswordRequest
from app.schemas.user import ForgotPasswordRequest
from app.core.security import (hash_password, verify_password, create_access_token)
from app.core.dependencies import get_current_user, require_role
from app.core.dependencies import require_admin
from app.core.email import send_reset_email
from app.core.security import create_reset_token
from app.core.config import settings
from app.services.audit_service import record_audit
from jose import JWTError, jwt

router = APIRouter(prefix = "/auth", tags = ["Authentication"])

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(
            User.email == request.email,
            User.is_active == True
        )
        .first()
    )

    if not user:
        return {
            "message":
            "If account exists, reset email sent"
        }

    token = create_reset_token(user.email)
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
    if not await send_reset_email(user.email, reset_link):
        raise HTTPException(
            status_code=503,
            detail="Password reset email service is not configured. Contact support.",
        )

    return {
        "message":
        "Reset email sent successfully"
    }


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token") from exc

    if payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")

    email = payload.get("sub")
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(request.password)
    record_audit(db, "PASSWORD_RESET", "USER", user.id, user.id)
    db.commit()

    return {
        "message":
        "Password updated successfully"
    }


@router.post("/register")
def register(request: UserCreate, db: Session = Depends(get_db)):
    normalized_email = str(request.email).strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()

    if existing_user:
        raise HTTPException(status_code = 400, detail = "Unable to process request")
        
    if request.role.value not in {"EMPLOYEE", "MANAGER"}:
        raise HTTPException(status_code=403, detail="Administrator accounts cannot self-register")

    user = User(
        id = str(uuid.uuid4()),
        name = request.name,
        email = normalized_email,
        password_hash = hash_password(request.password),
        role=request.role.value
    )

    db.add(user)
    record_audit(db, "USER_REGISTERED", "USER", user.id, user.id, {"role": user.role})
    db.commit()

    return {
        "message": "User Registered"
    }


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    token = create_access_token({
            "sub": user.id,
            "role": user.role
        })
    record_audit(db, "USER_LOGIN", "USER", user.id, user.id)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "email": user.email
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.put("/profile")
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
   
    user = (db.query(User).filter(User.id == current_user.id).first())

    user.name = profile.name

    if profile.password and profile.password.strip():
        user.password_hash = hash_password(profile.password)

    db.add(user)
    record_audit(db, "PROFILE_UPDATED", "USER", user.id, user.id)
    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "name": user.name,
        "email": user.email
    }


@router.get("/employees")
def get_employees(
    current_user = Depends(require_role(["ADMIN", "MANAGER"])),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == "EMPLOYEE", User.is_active.is_(True))
    if current_user.role == "MANAGER":
        query = query.filter(User.manager_id == current_user.id)
    employees = query.all()

    return [
        {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email
            ,"role": employee.role
            ,"manager_id": employee.manager_id
        }
        for employee in employees
    ]


@router.get("/employees/export")
def export_employees(
    current_user=Depends(require_role(["ADMIN", "MANAGER"])),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.role == "EMPLOYEE", User.is_active.is_(True))
    if current_user.role == "MANAGER":
        query = query.filter(User.manager_id == current_user.id)

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Employees"
    worksheet.append(["Employee Name", "Employee Email", "Employee ID", "Assigned Manager", "Manager Email"])

    for employee in query.order_by(User.name).all():
        manager = employee.manager
        worksheet.append([
            employee.name,
            employee.email,
            employee.id,
            manager.name if manager else "Unassigned",
            manager.email if manager else "-",
        ])

    temporary_file = NamedTemporaryFile(delete=False, suffix=".xlsx")
    workbook.save(temporary_file.name)
    return FileResponse(
        path=temporary_file.name,
        filename="employees.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/team")
def get_my_team(current_user=Depends(require_role(["MANAGER", "EMPLOYEE"])), db: Session = Depends(get_db)):
    if current_user.role == "EMPLOYEE":
        manager = current_user.manager
        return {
            "manager": {"id": manager.id, "name": manager.name} if manager else None
        }

    return {
        "manager": {"id": current_user.id, "name": current_user.name, "email": current_user.email},
        "employees": [
            {"id": employee.id, "name": employee.name, "email": employee.email}
            for employee in current_user.team_members
            if employee.is_active
        ],
    }


@router.get("/users")
def get_all_users(current_user=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.role, User.name).all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "manager_id": user.manager_id,
            "is_active": user.is_active,
        }
        for user in users
    ]


@router.post("/users")
def create_managed_user(
    request: UserCreate,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
):
    if request.role.value not in {"EMPLOYEE", "MANAGER"}:
        raise HTTPException(status_code=400, detail="Administrators cannot create another administrator")
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Unable to process request")

    user = User(
        id=str(uuid.uuid4()),
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role.value,
    )
    db.add(user)
    record_audit(db, "USER_CREATED_BY_ADMIN", "USER", user.id, current_user.id, {"role": user.role})
    db.commit()
    return {"message": "User created successfully", "id": user.id, "role": user.role}


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    is_active: bool,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "ADMIN":
        raise HTTPException(status_code=403, detail="The administrator account cannot be deactivated or modified.")
    user.is_active = is_active
    record_audit(
        db,
        "USER_ACTIVATED" if is_active else "USER_DEACTIVATED",
        "USER",
        user.id,
        current_user.id,
        {"role": user.role},
    )
    db.commit()
    return {"message": "User status updated successfully", "id": user.id, "is_active": user.is_active}


@router.put("/employees/{employee_id}/manager")
def assign_manager(
    employee_id: str,
    assignment: ManagerAssignment,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db),
):
    employee = db.query(User).filter(User.id == employee_id, User.role == "EMPLOYEE").first()
    manager = db.query(User).filter(User.id == assignment.manager_id, User.role == "MANAGER").first()
    if not employee or not manager:
        raise HTTPException(status_code=404, detail="Employee or manager not found")
    assigned_count = db.query(User).filter(
        User.manager_id == manager.id,
        User.role == "EMPLOYEE",
        User.is_active.is_(True),
    ).count()
    if employee.manager_id != manager.id and assigned_count >= 10:
        raise HTTPException(status_code=409, detail="A manager cannot have more than 10 employees")
    employee.manager_id = manager.id
    record_audit(db, "EMPLOYEE_ASSIGNED", "USER", employee.id, current_user.id, {"manager_id": manager.id})
    db.commit()
    return {"message": "Employee assigned successfully", "employee_id": employee.id, "manager_id": manager.id}


@router.delete("/profile")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = (db.query(User).filter(User.id == current_user.id).first())

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="The FinFlow administrator account cannot be deactivated.",
        )

    user.is_active = False
    record_audit(db, "ACCOUNT_DEACTIVATED", "USER", user.id, user.id)
    db.commit()

    return {
        "message":
        "Profile deleted successfully"
    }