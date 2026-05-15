from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.models import Order, Product
from backend.schemas.report import InventoryReportResponse, SalesReportResponse

router = APIRouter()


@router.get("/sales", response_model=SalesReportResponse)
def sales_report(db: Session = Depends(get_db)):
    total_sales = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    average_order_value = total_sales / total_orders if total_orders else 0.0
    monthly_sales = {
        "current_month": float(total_sales),
        "last_month": 0.0,
    }
    category_breakdown = {"sample_category": 0.0}
    return SalesReportResponse(
        total_sales=total_sales,
        total_orders=total_orders,
        average_order_value=average_order_value,
        monthly_sales=monthly_sales,
        category_breakdown=category_breakdown,
    )


@router.get("/inventory", response_model=InventoryReportResponse)
def inventory_report(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    low_stock_count = db.query(func.count(Product.id)).filter(Product.quantity <= Product.reorder_level).scalar() or 0
    expiring_soon_count = 0
    reorder_recommendations = {"sample_product": 10}
    return InventoryReportResponse(
        total_products=total_products,
        low_stock_count=low_stock_count,
        expiring_soon_count=expiring_soon_count,
        reorder_recommendations=reorder_recommendations,
    )
