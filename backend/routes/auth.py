from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.auth.deps import get_current_user, get_db
from backend.database.models import User
from backend.schemas.user import UserRead

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return current_user


@router.get("/health")
def auth_health():
    """Health check for auth endpoint."""
    return {"status": "ok"}
