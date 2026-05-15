from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AIRequest(BaseModel):
    prompt: str


class AIResponse(BaseModel):
    insight: str
    recommendation: Optional[str] = None
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
