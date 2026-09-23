from sqlalchemy import Boolean, Column, ForeignKey, String
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password_hash = Column(String)
    role = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    manager_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)

    expenses = relationship(
        "Expense",
        back_populates="employee"
    )
    manager = relationship(
        "User",
        remote_side=[id],
        back_populates="team_members",
        foreign_keys=[manager_id],
    )
    team_members = relationship(
        "User",
        back_populates="manager",
        foreign_keys=[manager_id],
    )