"""Health check endpoints"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import HealthResponse
from analysis.llm_handler import llm_manager

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """Check API and LLM health status"""
    
    llm_loaded = False
    db_connected = False
    
    # Check database connection
    try:
        db.execute("SELECT 1")
        db_connected = True
    except Exception as e:
        pass
    
    # Check LLM
    try:
        llm_loaded = llm_manager.is_loaded()
    except Exception as e:
        pass
    
    status = "healthy" if (db_connected and llm_loaded) else "degraded"
    
    return HealthResponse(
        status=status,
        message="AI Agreement Analyzer is running",
        llm_loaded=llm_loaded,
        database_connected=db_connected
    )
