from pydantic import BaseModel, Field

class ExpenseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    amount: float = Field(gt=0, le=10_000_000)
    category: str = Field(min_length=2, max_length=50)
    description: str = Field(default="", max_length=2_000)
    
class ExpenseResponse(BaseModel):
    id: str
    title: str
    amount: float
    category: str
    description: str
    status: str
    receipt_path: str | None = None

class Config:
    from_attributes = True