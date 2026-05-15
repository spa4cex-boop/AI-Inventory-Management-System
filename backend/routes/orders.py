from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.deps import require_role
from backend.database.session import get_db
from backend.database.models import Order, OrderItem, Product, User
from backend.schemas.order import OrderCreate, OrderRead

router = APIRouter()


@router.get("/", response_model=List[OrderRead])
def list_orders(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("staff")),  # Requires staff or higher
):
    total_amount = sum(item.quantity * item.price for item in payload.items)
    order = Order(customer_name=payload.customer_name, total_amount=total_amount, status=payload.status)
    db.add(order)
    db.flush()

    for item_payload in payload.items:
        product = db.query(Product).filter(Product.id == item_payload.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_payload.product_id} not found")
        product.quantity = max(product.quantity - item_payload.quantity, 0)
        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=item_payload.quantity, price=item_payload.price)
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
