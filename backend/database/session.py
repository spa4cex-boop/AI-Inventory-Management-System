import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise EnvironmentError(
        "DATABASE_URL is required for cloud deployment. "
        "Set DATABASE_URL to your PostgreSQL connection string."
    )

CLOUD_PLATFORM = os.getenv("CLOUD_PLATFORM", "railway").lower()
ENVIRONMENT = os.getenv("ENVIRONMENT", "production").lower()

if DATABASE_URL.lower().startswith(("sqlite://", "sqlite:///")):
    raise EnvironmentError(
        "SQLite is not supported for cloud deployment. "
        "Please use a PostgreSQL DATABASE_URL."
    )

engine = create_engine(
    DATABASE_URL,
    future=True,
    echo=ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_recycle=3600,
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
