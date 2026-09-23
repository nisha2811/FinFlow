from sqlalchemy.orm import Session
from app.models.expense import Expense

class ExpenseRepository:
    @staticmethod
    def create(db: Session, expense: Expense):
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def get_by_id(db: Session, expense_id: str):
        return db.query(Expense).filter(Expense.id == expense_id).first()

    @staticmethod
    def get_all(db: Session):
        return db.query(Expense).all()

    @staticmethod
    def delete(db: Session,expense: Expense):
        db.delete(expense)
        db.commit()