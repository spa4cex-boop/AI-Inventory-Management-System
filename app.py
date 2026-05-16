# Railway entry point for AI Inventory Management System
# This file allows Railway to auto-detect and run our FastAPI application

import os
import uvicorn
from backend.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=1
    )