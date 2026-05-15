from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., max_length=120)
    email: EmailStr
    role: str = Field("staff", pattern="^(admin|manager|staff)$")


class UserRead(UserBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
