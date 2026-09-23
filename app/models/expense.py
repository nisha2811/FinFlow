from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy import DateTime
from datetime import datetime

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True)
    title = Column(String)
    amount = Column(Float)
    category = Column(String)
    description = Column(String)
    status = Column(String)
    receipt_path = Column(String, nullable=True)
    employee_id = Column(String, ForeignKey("users.id"))
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True )
    employee = relationship("User", back_populates="expenses")