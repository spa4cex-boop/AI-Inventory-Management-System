from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemRead(OrderItemBase):
    id: int

    class Config:
        orm_mode = True


class OrderBase(BaseModel):
    customer_name: str = Field(..., max_length=200)
    status: str = Field("pending", max_length=60)


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderRead(OrderBase):
    id: int
    total_amount: float
    created_at: Optional[datetime]
    order_items: List[OrderItemRead] = []

    class Config:
        orm_mode = True
