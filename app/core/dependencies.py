from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.models.expense import Expense

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token") from exc


def require_role(roles: list[str]):
    def role_checker(user=Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user

    return role_checker


def can_manage_employee(manager: User, employee: User) -> bool:
    return manager.role == "ADMIN" or (
        manager.role == "MANAGER" and employee.manager_id == manager.id
    )


def require_admin(user=Depends(get_current_user)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Administrator permission required")
    return user


def expense_is_visible_to_user(expense: Expense, user: User) -> bool:
    return user.role == "ADMIN" or (
        user.role == "MANAGER" and expense.employee and expense.employee.manager_id == user.id
    ) or expense.employee_id == user.id


def ensure_expense_access(expense: Expense, user: User) -> None:
    if not expense_is_visible_to_user(expense, user):
        raise HTTPException(status_code=403, detail="You are not authorized to access this expense")