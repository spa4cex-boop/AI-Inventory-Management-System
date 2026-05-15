import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.models import Base
from backend.database.session import engine
from backend.routes import (
    ai_assistant,
    auth,
    inventory,
    notifications,
    orders,
    products,
    reports,
    suppliers,
)

app = FastAPI(
    title="AI Inventory Management System",
    version="0.1.0",
    description="Backend API for the AI Inventory Management System with analytics, authentication, and AI assistant capabilities.",
)

frontend_origins = [
    os.getenv("FRONTEND_URL", ""),
]
if os.getenv("FRONTEND_URLS"):
    frontend_origins.extend([origin.strip() for origin in os.getenv("FRONTEND_URLS").split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in frontend_origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def health_check():
    return {"status": "ok", "service": "AI Inventory Management System"}


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(ai_assistant.router, prefix="/ai", tags=["AI Assistant"])


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
