from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.models import InventoryLog, Product
from backend.schemas.inventory import InventoryCountResponse, InventoryLogRead, InventoryThresholdUpdate

router = APIRouter()


@router.get("/low-stock", response_model=List[InventoryCountResponse])
def low_stock_items(db: Session = Depends(get_db)):
    records = db.query(Product).filter(Product.quantity <= Product.reorder_level).all()
    return [
        InventoryCountResponse(
            product_id=item.id,
            quantity=item.quantity,
            reorder_level=item.reorder_level,
            low_stock=item.quantity <= item.reorder_level,
        )
        for item in records
    ]


@router.post("/logs", response_model=InventoryLogRead)
def create_log(payload: InventoryLogRead, db: Session = Depends(get_db)):
    log = InventoryLog(**payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.put("/products/{product_id}/threshold", response_model=InventoryThresholdUpdate)
def update_threshold(
    product_id: int,
    payload: InventoryThresholdUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.reorder_level = payload.reorder_level
    db.commit()
    db.refresh(product)
    return payload


@router.post("/transfer")
def transfer_stock():
    return {"detail": "Stock transfer endpoint placeholder"}
