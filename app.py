# Railway entry point for AI Inventory Management System
# This file allows Railway to auto-detect and run our FastAPI application

import uvicorn
from backend.main import app

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1
    )