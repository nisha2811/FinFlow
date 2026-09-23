import uuid

from app.models.expense import Expense
from app.repositories.expense_repository import (ExpenseRepository)
from app.services.audit_service import record_audit

class ExpenseService:
    @staticmethod
    def create_expense(request, current_user, db):
        expense = Expense(
            id=str(uuid.uuid4()),
            title=request.title,
            amount=request.amount,
            category=request.category,
            description=request.description,
            status="PENDING",
            employee_id=current_user.id
        )

        result = ExpenseRepository.create(db, expense)
        record_audit(db, "EXPENSE_CREATED", "EXPENSE", expense.id, current_user.id)
        db.commit()
        return result

    @staticmethod
    def get_expense(expense_id, db):
        return ExpenseRepository.get_by_id(db, expense_id)