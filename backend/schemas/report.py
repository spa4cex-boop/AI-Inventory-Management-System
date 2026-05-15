from pydantic import BaseModel


class SalesReportResponse(BaseModel):
    total_sales: float
    total_orders: int
    average_order_value: float
    monthly_sales: dict
    category_breakdown: dict


class InventoryReportResponse(BaseModel):
    total_products: int
    low_stock_count: int
    expiring_soon_count: int
    reorder_recommendations: dict
