"""
SQLAlchemy ORM models for agreement analysis
"""

from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, JSON, Integer
from sqlalchemy.sql import func
from database import Base
from schemas import RiskLevel, DocumentType
from datetime import datetime
import uuid


class Agreement(Base):
    """Agreement document record"""
    __tablename__ = "agreements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False, index=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    original_content = Column(Text, nullable=True)  # For text/url
    file_path = Column(String(500), nullable=True)  # For uploaded files
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Agreement(id={self.id}, filename={self.filename})>"


class Analysis(Base):
    """Agreement analysis result"""
    __tablename__ = "analyses"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agreement_id = Column(String(36), nullable=False, index=True)
    
    # Analysis metadata
    summary = Column(Text, nullable=False)
    risk_level = Column(SQLEnum(RiskLevel), nullable=False)
    recommendations = Column(Text, nullable=False)
    
    # Structured results (JSON)
    key_clauses = Column(JSON, nullable=False, default=list)  # List of key clauses
    pros = Column(JSON, nullable=False, default=list)  # List of pros
    cons = Column(JSON, nullable=False, default=list)  # List of cons
    
    # Metadata
    processing_time_seconds = Column(Integer, nullable=True)
    token_count = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Analysis(id={self.id}, agreement_id={self.agreement_id}, risk={self.risk_level})>"
