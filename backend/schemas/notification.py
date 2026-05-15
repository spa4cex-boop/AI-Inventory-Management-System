from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    title: str = Field(..., max_length=200)
    message: str
    type: str = Field("info", max_length=50)


class NotificationRead(NotificationBase):
    id: int
    is_read: bool
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
