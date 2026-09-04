"""
Pydantic schemas for API requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DocumentType(str, Enum):
    """Document type enumeration"""
    PDF = "pdf"
    DOCX = "docx"
    TEXT = "text"
    URL = "url"


# Request schemas
class AnalyzeRequest(BaseModel):
    """Request body for analyzing a document"""
    document_type: DocumentType = Field(..., description="Type of document")
    content: Optional[str] = Field(None, description="Text content or URL")
    filename: Optional[str] = Field(None, description="Original filename")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_type": "text",
                "content": "Your agreement text here...",
                "filename": "agreement.txt"
            }
        }


class AnalysisHistoryFilter(BaseModel):
    """Filter for analysis history"""
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)
    risk_level: Optional[RiskLevel] = None


# Response schemas
class KeyClause(BaseModel):
    """Key clause in agreement"""
    title: str
    content: str
    risk_level: RiskLevel
    pro: str
    con: str


class AnalysisResult(BaseModel):
    """Analysis result response"""
    id: str
    document_name: str
    document_type: DocumentType
    summary: str
    risk_level: RiskLevel
    key_clauses: List[KeyClause]
    pros: List[str]
    cons: List[str]
    recommendations: str
    analyzed_at: datetime
    
    class Config:
        from_attributes = True


class AnalysisResponse(BaseModel):
    """Response for analysis endpoint"""
    success: bool
    message: str
    data: Optional[AnalysisResult] = None
    error: Optional[str] = None


class HistoryResponse(BaseModel):
    """Response for history endpoint"""
    total: int
    items: List[AnalysisResult]
    
    class Config:
        from_attributes = True


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
    llm_loaded: bool
    database_connected: bool
