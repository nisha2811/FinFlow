from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.expense import Expense
from app.core.dependencies import require_role
from app.core.dependencies import get_current_user
from sqlalchemy import func
from app.models.user import User

router = APIRouter(prefix="/reports",tags=["Reports"])

@router.get("/summary")
def report(current_user=Depends(require_role(["ADMIN", "MANAGER"])), db: Session = Depends(get_db)):
    query = db.query(Expense)
    if current_user.role == "MANAGER":
        query = query.join(Expense.employee).filter(User.manager_id == current_user.id)
    total_amount = query.with_entities(func.sum(Expense.amount)).scalar()
    return {
        "total_amount": total_amount or 0
    }


@router.get("/employee_summary")
def employee_report(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    expenses = db.query(Expense).filter(Expense.employee_id == current_user.id).all()
    total_amount = db.query(func.sum(Expense.amount)).filter(Expense.employee_id == current_user.id).scalar()

    return {
        "employee_name": current_user.name,
        "expense_count": len(expenses),
        "total_amount": total_amount or 0,
        "expenses": expenses
    }


@router.get("/category-wise")
def category_wise_report(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(
        Expense.category,
        func.sum(
            Expense.amount
        ).label("amount")
    )

    if current_user.role == "EMPLOYEE":
        query = query.filter(
            Expense.employee_id == current_user.id
        )
    elif current_user.role == "MANAGER":
        query = query.join(Expense.employee).filter(User.manager_id == current_user.id)

    result = (query.group_by(Expense.category).all())

    return [
        {
            "category": row.category,
            "amount": row.amount
        }
        for row in result
    ]


@router.get("/employee-wise")
def employee_wise_report(current_user=Depends(require_role(["ADMIN", "MANAGER"])), db: Session = Depends(get_db)):
    query = db.query(
        User.name.label("employee"),
        func.count(Expense.id).label("count")
    ).join(Expense, Expense.employee_id == User.id)
    if current_user.role == "MANAGER":
        query = query.filter(User.manager_id == current_user.id)
    result = query.group_by(User.name).all()

    return [
        {
            "employee": row.employee,
            "count": row.count,
        }
        for row in result
    ]