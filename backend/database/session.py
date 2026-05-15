import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# Cloud platform detection
CLOUD_PLATFORM = os.getenv("CLOUD_PLATFORM", "local").lower()
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

if "sqlite" in DATABASE_URL:
    # SQLite configuration (local development)
    engine = create_engine(
        DATABASE_URL,
        future=True,
        echo=False,
        connect_args={
            "check_same_thread": False,
        },
        poolclass=StaticPool,
    )
else:
    # PostgreSQL configuration (cloud/production)
    engine = create_engine(
        DATABASE_URL,
        future=True,
        echo=ENVIRONMENT == "development",
        pool_pre_ping=True,
        pool_recycle=3600,  # Recycle connections hourly
        pool_size=5 if ENVIRONMENT == "development" else 10,
        max_overflow=10 if ENVIRONMENT == "development" else 20,
        connect_args={
            "connect_timeout": 10,
            "application_name": "ai_inventory_system",
            "sslmode": "require" if CLOUD_PLATFORM != "local" else "disable",
        },
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
