from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InventoryLogBase(BaseModel):
    product_id: int
    action: str
    quantity: int


class InventoryLogRead(InventoryLogBase):
    id: int
    timestamp: Optional[datetime]

    class Config:
        orm_mode = True


class InventoryThresholdUpdate(BaseModel):
    reorder_level: int


class InventoryCountResponse(BaseModel):
    product_id: int
    quantity: int
    reorder_level: int
    low_stock: bool
