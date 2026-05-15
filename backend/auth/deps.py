import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from backend.database.models import User
from backend.database.session import get_db

AUTH_MODE = os.getenv("AUTH_MODE", "firebase").lower()
http_bearer = HTTPBearer()


def get_current_user(db: Session = Depends(get_db)) -> User:
    """Get current user - returns default user or creates from auth."""
    # For now, return default system user
    # Firebase validation will be added when credentials are fully configured
    user = db.query(User).filter(User.email == "system@inventory.local").first()
    if not user:
        user = User(
            name="System User",
            email="system@inventory.local",
            role="admin",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


def require_role(role: str):
    """Role requirement - with role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user

    return role_checker
