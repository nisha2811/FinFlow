from fastapi import APIRouter
from fastapi import Depends
from app.core.dependencies import require_role
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db.database import get_db
from app.models.expense import Expense
from datetime import datetime
from app.services.audit_service import record_audit
from app.core.dependencies import ensure_expense_access

router = APIRouter(prefix = "/approvals", tags = ["Approvals"])

@router.post("/{expense_id}/approve")
def approve_expense(expense_id: str, 
                    current_user = Depends(require_role(["MANAGER", "ADMIN"])), 
                    db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(
            status_code = 404,
            detail = "Expense not found"
        )
    ensure_expense_access(expense, current_user)

    if expense.status != "PENDING":
        raise HTTPException(
            status_code = 400,
            detail = "Expense already processed"
        )

    expense.status = "APPROVED"
    expense.approved_by = current_user.name
    expense.approved_at = datetime.utcnow()
    record_audit(db, "EXPENSE_APPROVED", "EXPENSE", expense.id, current_user.id)

    db.commit()
    db.refresh(expense)

    return {
        "message": "Expense approved successfully",
        "approved_by": current_user.name
    }


@router.post("/{expense_id}/reject")
def reject_expense(expense_id: str, 
                   current_user = Depends(require_role(["MANAGER", "ADMIN"])), 
                   db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(
            status_code = 404,
            detail = "Expense not found"
        )
    ensure_expense_access(expense, current_user)

    if expense.status != "PENDING":
        raise HTTPException(
            status_code = 400,
            detail = "Expense already processed"
        )

    expense.status = "REJECTED"
    expense.approved_by = expense.approved_by = current_user.name
    expense.approved_at = datetime.utcnow()
    record_audit(db, "EXPENSE_REJECTED", "EXPENSE", expense.id, current_user.id)

    db.commit()
    db.refresh(expense)

    return {
        "message": "Expense rejected successfully",
        "approved_by": current_user.name
    }