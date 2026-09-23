from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.expense import Expense
from app.core.dependencies import (
    require_role,
    get_current_user
)
from app.models.user import User

router = APIRouter(prefix = "/dashboard", tags = ["Dashboard"])

@router.get("")
def dashboard(
    current_user=Depends(
        require_role(
            ["ADMIN"]
        )
    ),
    db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if current_user.role == "MANAGER":
        query = query.join(Expense.employee).filter(User.manager_id == current_user.id)
    total_count = query.count()
    approved = query.filter(Expense.status == "APPROVED").count()
    rejected = query.filter(Expense.status == "REJECTED").count()
    pending = query.filter(Expense.status == "PENDING").count()
    total_amount = query.with_entities(func.sum(Expense.amount)).scalar()
    highest_expense = query.with_entities(func.max(Expense.amount)).scalar()

    category_result = (
        query.with_entities(
            Expense.category,
            func.count(Expense.id).label("count")
        )
        .group_by(Expense.category)
        .order_by(func.count(Expense.id).desc())
        .first()
    )

    active_employees = (
        db.query(func.count(
            func.distinct(Expense.employee_id)
        ))
        .scalar()
    )

    pending_approvals = query.filter(Expense.status == "PENDING").count()

    return {
        "total_expenses": total_count,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "total_amount": total_amount or 0,
        "highest_expense": highest_expense or 0,
        "most_used_category":
            category_result.category
            if category_result
            else "N/A",

        "active_employees": active_employees or 0,
        "pending_approvals":pending_approvals or 0
    }


@router.get("/manager_dashboard")
def manager_dashboard(current_user=Depends(require_role(["MANAGER"])), db: Session = Depends(get_db)):
    query = (
        db.query(Expense)
        .join(Expense.employee)
        .filter(User.manager_id == current_user.id)
    )
    total_count = query.count()
    approved = query.filter(Expense.status == "APPROVED").count()
    rejected = query.filter(Expense.status == "REJECTED").count()
    pending = query.filter(Expense.status == "PENDING").count()
    total_amount = query.with_entities(func.sum(Expense.amount)).scalar()
    highest_expense = query.with_entities(func.max(Expense.amount)).scalar()

    category_result = (
        query.with_entities(
            Expense.category,
            func.count(Expense.id).label("count")
        )
        .group_by(Expense.category)
        .order_by(func.count(Expense.id).desc())
        .first()
    )

    return {
        "manager_name": current_user.name,
        "team_size": db.query(User).filter(
            User.role == "EMPLOYEE",
            User.manager_id == current_user.id,
            User.is_active.is_(True),
        ).count(),
        "total_expenses": total_count,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "total_amount": total_amount or 0,
        "highest_expense": highest_expense or 0,
        "most_used_category": category_result.category if category_result else "N/A",
    }


@router.get("/employee_dashboard")
def employee_dashboard(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    total_expenses = db.query(Expense).filter(Expense.employee_id == current_user.id).count()
    approved = db.query(Expense).filter(Expense.employee_id == current_user.id, Expense.status == "APPROVED").count()
    rejected = db.query(Expense).filter(Expense.employee_id == current_user.id, Expense.status == "REJECTED").count()
    pending = db.query(Expense).filter(Expense.employee_id == current_user.id, Expense.status == "PENDING").count()
    total_amount = db.query(func.sum(Expense.amount)).filter(Expense.employee_id == current_user.id).scalar()

    return {
        "employee_name": current_user.name,
        "total_expenses": total_expenses,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "total_amount": total_amount or 0
    }