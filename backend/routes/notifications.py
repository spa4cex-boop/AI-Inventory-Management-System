from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.database.models import Notification
from backend.schemas.notification import NotificationBase, NotificationRead

router = APIRouter()


@router.get("/", response_model=List[NotificationRead])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(100).all()


@router.post("/", response_model=NotificationRead)
def create_notification(payload: NotificationBase, db: Session = Depends(get_db)):
    notification = Notification(**payload.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = 1
    db.commit()
    return {"detail": "Notification marked read"}
