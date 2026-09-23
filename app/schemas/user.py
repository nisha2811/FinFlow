import re
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

def validate_password_strength(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters")
    if len(value) > 128:
        raise ValueError("Password must not exceed 128 characters")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain an uppercase letter")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must contain a lowercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must contain a number")
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("Password must contain a special character")
    return value

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.EMPLOYEE

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str


class ManagerAssignment(BaseModel):
    manager_id: str

class Config:
    from_attributes = True

class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return validate_password_strength(value)
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value: str, info) -> str:
        if info.data.get("password") != value:
            raise ValueError("Passwords do not match")
        return value