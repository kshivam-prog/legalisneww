"""
Agreement analysis API endpoints
Handles document upload, analysis, and history management
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
import os
import uuid
import logging
from typing import Optional, List
import asyncio

from database import get_db
from models import Agreement, Analysis
from schemas import (
    AnalyzeRequest,
    AnalysisResponse,
    AnalysisResult,
    HistoryResponse,
    DocumentType,
    RiskLevel
)
from documents.parser import DocumentParser
from documents.scraper import WebScraper
from analysis.analyzer import AgreementAnalyzer
from analysis.llm_handler import llm_manager
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/agreements/upload", response_model=AnalysisResponse)
async def upload_agreement(
    file: Optional[UploadFile] = File(None),
    text_input: Optional[str] = None,
    url_input: Optional[str] = None,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
) -> AnalysisResponse:
    """
    Upload and analyze an agreement document
    
    Supports:
    - PDF file upload
    - DOCX file upload
    - Plain text input
    - URL/webpage scraping
    
    Args:
        file: Optional file upload (PDF or DOCX)
        text_input: Optional text content
        url_input: Optional URL to scrape
        db: Database session
        
    Returns:
        Analysis response with results
    """
    
    # Ensure LLM is loaded
    if not llm_manager.is_loaded():
        logger.info("Loading LLM model...")
        if not llm_manager.load_model():
            raise HTTPException(
                status_code=503,
                detail="LLM model not available. Please check configuration."
            )
    
    try:
        document_text = ""
        document_type = None
        filename = "unknown"
        
        # Handle file upload
        if file:
            if file.size > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            filename = file.filename or "uploaded_file"
            
            # Save uploaded file
            file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{filename}")
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            
            with open(file_path, 'wb') as f:
                content = await file.read()
                f.write(content)
            
            # Parse file
            try:
                document_text, file_type = DocumentParser.parse_file(file_path)
                document_type = DocumentType[file_type.upper()]
            except Exception as e:
                logger.error(f"Failed to parse file: {str(e)}")
                os.remove(file_path)
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to parse file: {str(e)}"
                )
        
        # Handle text input
        elif text_input:
            document_text = DocumentParser.parse_text(text_input)
            document_type = DocumentType.TEXT
            filename = "text_input"
        
        # Handle URL input
        elif url_input:
            try:
                document_text = WebScraper.scrape_url(url_input)
                document_type = DocumentType.URL
                filename = url_input
            except Exception as e:
                logger.error(f"Failed to scrape URL: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to scrape URL: {str(e)}"
                )
        
        else:
            raise HTTPException(
                status_code=400,
                detail="Must provide either file, text_input, or url_input"
            )
        
        # Validate content
        if not document_text or len(document_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Document content too short. Minimum 100 characters required."
            )
        
        # Save agreement to database
        agreement = Agreement(
            filename=filename,
            document_type=document_type,
            original_content=document_text if document_type != DocumentType.PDF else None,
            file_path=file_path if file else None
        )
        db.add(agreement)
        db.commit()
        db.refresh(agreement)
        
        logger.info(f"Agreement saved with ID: {agreement.id}")
        
        # Perform analysis
        analyzer = AgreementAnalyzer()
        
        try:
            results = analyzer.analyze_full(document_text, filename)
            
            # Save analysis to database
            analysis = Analysis(
                agreement_id=agreement.id,
                summary=results["summary"],
                risk_level=results["risk_level"],
                recommendations=results["recommendations"],
                key_clauses=[
                    {
                        "title": kc.title,
                        "content": kc.content,
                        "risk_level": kc.risk_level.value,
                        "pro": kc.pro,
                        "con": kc.con
                    }
                    for kc in results["key_clauses"]
                ],
                pros=results["pros"],
                cons=results["cons"],
                processing_time_seconds=results["processing_time_seconds"],
                token_count=results["token_count"]
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            
            logger.info(f"Analysis saved with ID: {analysis.id}")
            
            # Build response
            analysis_result = AnalysisResult(
                id=analysis.id,
                document_name=filename,
                document_type=document_type,
                summary=analysis.summary,
                risk_level=analysis.risk_level,
                key_clauses=results["key_clauses"],
                pros=analysis.pros,
                cons=analysis.cons,
                recommendations=analysis.recommendations,
                analyzed_at=analysis.created_at
            )
            
            return AnalysisResponse(
                success=True,
                message="Agreement analyzed successfully",
                data=analysis_result
            )
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload_agreement: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/agreements/{agreement_id}", response_model=AnalysisResponse)
async def get_agreement_analysis(
    agreement_id: str,
    db: Session = Depends(get_db)
) -> AnalysisResponse:
    """
    Retrieve a previously analyzed agreement
    
    Args:
        agreement_id: ID of the agreement analysis
        db: Database session
        
    Returns:
        Analysis result
    """
    
    try:
        # Get analysis from database
        analysis = db.query(Analysis).filter(Analysis.id == agreement_id).first()
        
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail=f"Analysis not found: {agreement_id}"
            )
        
        # Get agreement details
        agreement = db.query(Agreement).filter(Agreement.id == analysis.agreement_id).first()
        
        if not agreement:
            raise HTTPException(
                status_code=404,
                detail=f"Agreement not found"
            )
        
        # Reconstruct KeyClause objects from JSON
        key_clauses = [
            KeyClause(
                title=kc["title"],
                content=kc["content"],
                risk_level=RiskLevel(kc["risk_level"]),
                pro=kc["pro"],
                con=kc["con"]
            )
            for kc in analysis.key_clauses
        ]
        
        analysis_result = AnalysisResult(
            id=analysis.id,
            document_name=agreement.filename,
            document_type=agreement.document_type,
            summary=analysis.summary,
            risk_level=analysis.risk_level,
            key_clauses=key_clauses,
            pros=analysis.pros,
            cons=analysis.cons,
            recommendations=analysis.recommendations,
            analyzed_at=analysis.created_at
        )
        
        return AnalysisResponse(
            success=True,
            message="Analysis retrieved successfully",
            data=analysis_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analysis: {str(e)}"
        )


@router.get("/agreements/history", response_model=HistoryResponse)
async def get_agreements_history(
    skip: int = 0,
    limit: int = 10,
    risk_level: Optional[RiskLevel] = None,
    db: Session = Depends(get_db)
) -> HistoryResponse:
    """
    Get history of analyzed agreements
    
    Args:
        skip: Number of records to skip (pagination)
        limit: Number of records to return (max 100)
        risk_level: Optional filter by risk level
        db: Database session
        
    Returns:
        List of analysis results
    """
    
    try:
        # Validate pagination
        if skip < 0:
            skip = 0
        if limit < 1 or limit > 100:
            limit = 10
        
        # Build query
        query = db.query(Analysis)
        
        if risk_level:
            query = query.filter(Analysis.risk_level == risk_level)
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        analyses = query.order_by(desc(Analysis.created_at)).offset(skip).limit(limit).all()
        
        # Convert to response format
        items = []
        for analysis in analyses:
            agreement = db.query(Agreement).filter(Agreement.id == analysis.agreement_id).first()
            
            if agreement:
                key_clauses = [
                    KeyClause(
                        title=kc["title"],
                        content=kc["content"],
                        risk_level=RiskLevel(kc["risk_level"]),
                        pro=kc["pro"],
                        con=kc["con"]
                    )
                    for kc in analysis.key_clauses
                ]
                
                item = AnalysisResult(
                    id=analysis.id,
                    document_name=agreement.filename,
                    document_type=agreement.document_type,
                    summary=analysis.summary,
                    risk_level=analysis.risk_level,
                    key_clauses=key_clauses,
                    pros=analysis.pros,
                    cons=analysis.cons,
                    recommendations=analysis.recommendations,
                    analyzed_at=analysis.created_at
                )
                items.append(item)
        
        return HistoryResponse(
            total=total,
            items=items
        )
        
    except Exception as e:
        logger.error(f"Error retrieving history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving history: {str(e)}"
        )


from schemas import KeyClause
