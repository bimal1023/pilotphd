import logging
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_user
from ..models.user import User
from ..schemas import ProfessorSearchRequest, ProfessorResult
from ..agents.professor_finder import find_professors

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/search", response_model=list[ProfessorResult])
async def search_professors(
    payload: ProfessorSearchRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        results = await find_professors(
            payload.research_interest,
            payload.universities,
            payload.profile,
        )
        if not results:
            raise HTTPException(
                status_code=404,
                detail="No professors found for this research area at the selected universities. Try different keywords or universities.",
            )
        return results
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"professor search failed: {e}")
        raise HTTPException(status_code=500, detail="Professor search failed. Please try again.")
