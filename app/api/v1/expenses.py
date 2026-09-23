import os
import uuid
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import UploadFile
from fastapi import File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate
from app.services.expense_service import ExpenseService
from fastapi import Form, Query
from fastapi.responses import FileResponse
from fastapi.responses import FileResponse
from openpyxl import Workbook
from tempfile import NamedTemporaryFile
from app.core.dependencies import (
    ensure_expense_access,
    get_current_user,
    require_role
)
from app.services.audit_service import record_audit

router = APIRouter(prefix = "/expenses", tags = ["Expenses"])
MAX_RECEIPT_SIZE = 10 * 1024 * 1024
ALLOWED_RECEIPT_TYPES = {
    ".pdf": {"application/pdf"},
    ".jpg": {"image/jpeg"},
    ".jpeg": {"image/jpeg"},
    ".png": {"image/png"},
}


@router.post("")
def create_expense(request: ExpenseCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    return ExpenseService.create_expense(request, current_user, db)


@router.get("")
def get_expenses(
    page: int = Query(1, ge=1, le=100_000),
    limit: int = Query(10, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit
    query = db.query(Expense)
    if current_user.role == "EMPLOYEE":
        query = query.filter(Expense.employee_id == current_user.id)
    elif current_user.role == "MANAGER":
        query = query.join(Expense.employee).filter(User.manager_id == current_user.id)

    expenses = (query.offset(offset).limit(limit).all())
    total = query.count()

    return {
    "total": total,
    "page": page,
    "limit": limit,
    "data": [
        {
            "id": expense.id,
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "description": expense.description,
            "status": expense.status,
            "employee_id": expense.employee_id,
            "employee_name": expense.employee.name
            if expense.employee else None,
            "employee_email": expense.employee.email
            if expense.employee else None,
            "receipt_path": expense.receipt_path
        }
        for expense in expenses
    ]
    }


@router.put("/{expense_id}")
def update_expense(expense_id: str, request: ExpenseCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    ensure_expense_access(expense, current_user)

    if current_user.role == "EMPLOYEE" and expense.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can update only your expenses")

    if expense.status != "PENDING":
        raise HTTPException(status_code=400, detail="Approved or Rejected expenses cannot be modified")

    expense.title = request.title
    expense.amount = request.amount
    expense.category = request.category
    expense.description = request.description

    db.commit()
    record_audit(db, "EXPENSE_UPDATED", "EXPENSE", expense.id, current_user.id)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    ensure_expense_access(expense, current_user)

    if current_user.role == "EMPLOYEE" and expense.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can delete only your expenses")

    if expense.status != "PENDING":
        raise HTTPException(status_code=400, detail="Approved or Rejected expenses cannot be deleted")

    if (
        expense.receipt_path and
        os.path.exists(expense.receipt_path)
    ):
        os.remove(expense.receipt_path)
    db.delete(expense)
    record_audit(db, "EXPENSE_DELETED", "EXPENSE", expense.id, current_user.id)
    db.commit()
    return {
        "message": "Expense deleted successfully"
    }


@router.post("/{expense_id}/receipt")
def upload_receipt(expense_id: str, file: UploadFile = File(...), current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    ensure_expense_access(expense, current_user)

    if current_user.role == "EMPLOYEE" and expense.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can upload receipt only for your own expenses")

    file_extension = os.path.splitext(file.filename or "")[1].lower()

    if file_extension not in ALLOWED_RECEIPT_TYPES:
        raise HTTPException(status_code=400, detail="Only pdf, jpg, jpeg and png files are allowed")

    if file.content_type not in ALLOWED_RECEIPT_TYPES[file_extension]:
        raise HTTPException(status_code=400, detail="Uploaded file type does not match its extension")

    upload_dir = "uploads/receipts"
    os.makedirs(upload_dir, exist_ok=True)
    safe_filename = os.path.basename(file.filename or "receipt")
    file_path = os.path.join(upload_dir, f"{expense_id}_{safe_filename}")

    with open(file_path, "wb") as buffer:
        total_size = 0
        while chunk := file.file.read(1024 * 1024):
            total_size += len(chunk)
            if total_size > MAX_RECEIPT_SIZE:
                buffer.close()
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="Receipt must not exceed 10 MB")
            buffer.write(chunk)

    expense.receipt_path = file_path
    record_audit(db, "RECEIPT_UPLOADED", "EXPENSE", expense.id, current_user.id)

    db.commit()
    db.refresh(expense)

    return {
        "message": "Receipt uploaded successfully",
        "expense_id": expense_id,
        "file_name": file.filename,
        "file_path": file_path
    }


@router.get("/export/excel")
def export_excel(
    current_user=Depends(
        require_role(
            ["ADMIN", "MANAGER"]
        )
    ),
    db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if current_user.role == "MANAGER":
        query = query.join(Expense.employee).filter(User.manager_id == current_user.id)
    expenses = query.all()

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Expenses"

    worksheet.append([
        "Title",
        "Category",
        "Amount",
        "Status",
        "Employee ID"
    ])

    for expense in expenses:
        worksheet.append([
            expense.title,
            expense.category,
            expense.amount,
            expense.status,
            expense.employee_id
        ])

    temp_file = NamedTemporaryFile(
        delete=False,
        suffix=".xlsx"
    )

    workbook.save(temp_file.name)

    return FileResponse(
        path=temp_file.name,
        filename="expenses.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.get("/{expense_id}")
def get_expense(expense_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    expense = (db.query(Expense).filter(Expense.id == expense_id).first())

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    ensure_expense_access(expense, current_user)
    return expense


@router.post("/create-with-receipt")
def create_expense_with_receipt(
    title: str = Form(...),
    amount: float = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    employee_id: str = Form(None),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in ALLOWED_RECEIPT_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, JPEG and PNG files are allowed")
    if file.content_type not in ALLOWED_RECEIPT_TYPES[extension]:
        raise HTTPException(status_code=400, detail="Uploaded file type does not match its extension")

    expense_id = str(uuid.uuid4())
    upload_dir = "uploads/receipts"

    os.makedirs(upload_dir,exist_ok=True)

    safe_filename = os.path.basename(file.filename or "receipt")
    file_path = os.path.join(upload_dir, f"{expense_id}_{safe_filename}")

    with open(file_path, "wb") as buffer:
        total_size = 0
        while chunk := file.file.read(1024 * 1024):
            total_size += len(chunk)
            if total_size > MAX_RECEIPT_SIZE:
                buffer.close()
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="Receipt must not exceed 10 MB")
            buffer.write(chunk)

    selected_employee_id = (
        employee_id
        if (
            current_user.role in
            ["ADMIN", "MANAGER"]
            and employee_id
        )
        else current_user.id
    )

    selected_employee = db.query(User).filter(
        User.id == selected_employee_id,
        User.role == "EMPLOYEE",
        User.is_active.is_(True),
    ).first()
    if not selected_employee:
        os.remove(file_path)
        raise HTTPException(status_code=404, detail="Assigned employee not found")
    if current_user.role == "MANAGER" and selected_employee.manager_id != current_user.id:
        os.remove(file_path)
        raise HTTPException(status_code=403, detail="Employee is outside your team")

    expense = Expense(
        id=expense_id,
        title=title,
        amount=amount,
        category=category,
        description=description,
        status="PENDING",
        employee_id=selected_employee_id,
        receipt_path=file_path
    )

    db.add(expense)
    record_audit(db, "EXPENSE_CREATED_WITH_RECEIPT", "EXPENSE", expense.id, current_user.id)
    db.commit()
    db.refresh(expense)

    return {
        "message": "Expense created successfully"
    }


@router.get("/{expense_id}/receipt")
def view_receipt(
    expense_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense).filter(Expense.id == expense_id).first()
    )

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    ensure_expense_access(expense, current_user)

    if (current_user.role == "EMPLOYEE" and expense.employee_id != current_user.id):
        raise HTTPException(status_code=403, detail="You are not authorized to access this receipt")

    if not expense.receipt_path or not os.path.exists(expense.receipt_path):
        raise HTTPException(status_code=404, detail="Receipt not found")

    return FileResponse(
        path=expense.receipt_path,
        filename=os.path.basename(expense.receipt_path)
    )