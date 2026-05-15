from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.ai.openai_service import generate_ai_insight
from backend.auth.deps import get_current_user, require_role
from backend.database.models import User
from backend.database.session import get_db
from backend.schemas.ai import AIRequest, AIResponse

router = APIRouter()


@router.post("/assist", response_model=AIResponse)
def ai_assistant(
    payload: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))  # ADMIN ONLY - AI has full access
):
    """AI assistant endpoint - ADMIN ONLY with full CRUD capabilities."""
    # Log AI action for audit trail
    print(f"AI action by admin {current_user.email}: {payload.prompt}")

    insight, recommendation = generate_ai_insight(payload.prompt, db)
    return AIResponse(insight=insight, recommendation=recommendation)
