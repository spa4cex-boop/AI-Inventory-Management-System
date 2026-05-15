from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., max_length=200)
    sku: str = Field(..., max_length=100)
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    quantity: int = 0
    price: float = 0.0
    reorder_level: int = 0
    expiry_date: Optional[datetime] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    reorder_level: Optional[int] = None
    expiry_date: Optional[datetime] = None
    image_url: Optional[str] = None


class ProductRead(ProductBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
