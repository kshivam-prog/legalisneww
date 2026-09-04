"""
Main agreement analyzer module that orchestrates the analysis workflow
"""

import logging
import time
from typing import List, Optional, Dict, Any
from schemas import RiskLevel, KeyClause, AnalysisResult
from analysis.llm_handler import llm_manager
from analysis.prompts import PromptBuilder
from config import settings
import re
import json

logger = logging.getLogger(__name__)


class AgreementAnalyzer:
    """Analyze agreements and extract insights"""
    
    # Maximum document size to process (limit for LLM)
    MAX_DOCUMENT_SIZE = 8000
    
    def __init__(self):
        """Initialize analyzer"""
        self.document_text = ""
        self.clauses = []
        self.pros = []
        self.cons = []
        self.risk_level = RiskLevel.MEDIUM
        self.summary = ""
        self.recommendations = ""
        self.token_count = 0
    
    @staticmethod
    def _clean_response(response: str) -> str:
        """Clean LLM response by removing extra whitespace"""
        lines = response.strip().split('\n')
        cleaned = '\n'.join(line.strip() for line in lines if line.strip())
        return cleaned
    
    @staticmethod
    def _extract_risk_level(text: str) -> RiskLevel:
        """Extract risk level from text"""
        text_lower = text.lower()
        if "high" in text_lower:
            return RiskLevel.HIGH
        elif "medium" in text_lower:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    @staticmethod
    def _parse_clauses(clauses_text: str) -> List[Dict[str, Any]]:
        """Parse extracted clauses from LLM response"""
        clauses = []
        
        # Split by "Clause X:" pattern
        clause_blocks = re.split(r'Clause\s+\d+:', clauses_text)
        
        for block in clause_blocks[1:]:  # Skip first split (empty)
            try:
                # Extract components from the block
                lines = block.strip().split('\n')
                
                clause = {
                    "title": lines[0].strip() if lines else "Untitled",
                    "content": "",
                    "risk_level": RiskLevel.MEDIUM,
                    "pro": "",
                    "con": ""
                }
                
                for line in lines[1:]:
                    if line.startswith("Risk Level:"):
                        risk_text = line.replace("Risk Level:", "").strip()
                        clause["risk_level"] = AgreementAnalyzer._extract_risk_level(risk_text)
                    elif line.startswith("Summary:"):
                        clause["content"] = line.replace("Summary:", "").strip()
                    elif line.startswith("Pro:"):
                        clause["pro"] = line.replace("Pro:", "").strip()
                    elif line.startswith("Con:"):
                        clause["con"] = line.replace("Con:", "").strip()
                
                clauses.append(clause)
            except Exception as e:
                logger.warning(f"Error parsing clause block: {str(e)}")
        
        return clauses
    
    @staticmethod
    def _parse_pros_cons(text: str) -> tuple[List[str], List[str]]:
        """Parse pros and cons from LLM response"""
        pros = []
        cons = []
        
        try:
            # Split pros and cons sections
            sections = text.split("CONS:" if "CONS:" in text else "Con")
            
            # Parse pros
            if len(sections) > 0:
                pro_section = sections[0]
                pro_lines = [line.strip() for line in pro_section.split('\n') 
                           if line.strip().startswith('-') or line.strip().startswith('•')]
                pros = [line.replace('-', '').replace('•', '').strip() for line in pro_lines]
            
            # Parse cons
            if len(sections) > 1:
                con_section = sections[1]
                con_lines = [line.strip() for line in con_section.split('\n')
                           if line.strip().startswith('-') or line.strip().startswith('•')]
                cons = [line.replace('-', '').replace('•', '').strip() for line in con_lines]
        
        except Exception as e:
            logger.warning(f"Error parsing pros/cons: {str(e)}")
        
        return pros, cons
    
    def prepare_document(self, document_text: str) -> str:
        """
        Prepare document for analysis (truncate if needed)
        
        Args:
            document_text: Raw document text
            
        Returns:
            Prepared text for analysis
        """
        # Remove excessive whitespace
        text = '\n'.join(line.strip() for line in document_text.split('\n') if line.strip())
        
        # Truncate if necessary
        if len(text) > self.MAX_DOCUMENT_SIZE:
            logger.warning(f"Document truncated from {len(text)} to {self.MAX_DOCUMENT_SIZE} characters")
            text = text[:self.MAX_DOCUMENT_SIZE]
        
        self.document_text = text
        return text
    
    def extract_clauses(self) -> List[Dict[str, Any]]:
        """Extract key clauses from document"""
        if not self.document_text:
            raise ValueError("No document text. Call prepare_document() first")
        
        try:
            logger.info("Extracting key clauses...")
            
            prompt = PromptBuilder.build_extraction_prompt(self.document_text)
            
            response, tokens = llm_manager.generate_text(
                prompt,
                max_tokens=800,
                temperature=0.5
            )
            
            self.token_count += tokens
            
            # Parse and store clauses
            self.clauses = self._parse_clauses(response)
            
            logger.info(f"Extracted {len(self.clauses)} clauses")
            return self.clauses
            
        except Exception as e:
            logger.error(f"Error extracting clauses: {str(e)}")
            raise
    
    def analyze_pros_cons(self) -> tuple[List[str], List[str]]:
        """Analyze pros and cons"""
        if not self.document_text:
            raise ValueError("No document text loaded")
        
        try:
            logger.info("Analyzing pros and cons...")
            
            # Create summary of clauses
            clauses_summary = "\n".join(
                f"- {c.get('title', 'Clause')}: {c.get('content', '')}"
                for c in self.clauses[:5]
            )
            
            prompt = PromptBuilder.build_pros_cons_prompt(
                self.document_text,
                clauses_summary
            )
            
            response, tokens = llm_manager.generate_text(
                prompt,
                max_tokens=600,
                temperature=0.6
            )
            
            self.token_count += tokens
            
            # Parse pros and cons
            self.pros, self.cons = self._parse_pros_cons(response)
            
            logger.info(f"Identified {len(self.pros)} pros and {len(self.cons)} cons")
            return self.pros, self.cons
            
        except Exception as e:
            logger.error(f"Error analyzing pros/cons: {str(e)}")
            raise
    
    def assess_risk(self) -> RiskLevel:
        """Assess overall risk level"""
        if not self.document_text:
            raise ValueError("No document text loaded")
        
        try:
            logger.info("Assessing risk level...")
            
            clauses_summary = "\n".join(
                f"- {c.get('title')}: Risk {c.get('risk_level', RiskLevel.MEDIUM)}"
                for c in self.clauses[:5]
            )
            
            prompt = PromptBuilder.build_risk_prompt(
                self.document_text,
                clauses_summary
            )
            
            response, tokens = llm_manager.generate_text(
                prompt,
                max_tokens=400,
                temperature=0.4
            )
            
            self.token_count += tokens
            
            # Extract risk level
            self.risk_level = self._extract_risk_level(response)
            
            logger.info(f"Risk level assessed: {self.risk_level}")
            return self.risk_level
            
        except Exception as e:
            logger.error(f"Error assessing risk: {str(e)}")
            self.risk_level = RiskLevel.MEDIUM
            return self.risk_level
    
    def generate_summary(self) -> str:
        """Generate executive summary"""
        if not self.document_text:
            raise ValueError("No document text loaded")
        
        try:
            logger.info("Generating summary...")
            
            clauses_summary = "\n".join(
                f"- {c.get('title')}: {c.get('content', '')}"
                for c in self.clauses[:3]
            )
            
            pros_text = "\n".join(f"- {p}" for p in self.pros[:3])
            cons_text = "\n".join(f"- {c}" for c in self.cons[:3])
            
            prompt = PromptBuilder.build_summary_prompt(
                self.document_text,
                clauses_summary,
                pros_text,
                cons_text,
                str(self.risk_level)
            )
            
            response, tokens = llm_manager.generate_text(
                prompt,
                max_tokens=300,
                temperature=0.5
            )
            
            self.token_count += tokens
            self.summary = self._clean_response(response)
            
            logger.info("Summary generated")
            return self.summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            self.summary = "Unable to generate summary due to an error."
            return self.summary
    
    def generate_recommendations(self) -> str:
        """Generate recommendations"""
        if not self.document_text:
            raise ValueError("No document text loaded")
        
        try:
            logger.info("Generating recommendations...")
            
            clauses_summary = "\n".join(
                f"- {c.get('title')}"
                for c in self.clauses[:5]
            )
            
            pros_text = "\n".join(f"- {p}" for p in self.pros[:3])
            cons_text = "\n".join(f"- {c}" for c in self.cons[:3])
            
            prompt = PromptBuilder.build_recommendations_prompt(
                self.document_text,
                clauses_summary,
                pros_text,
                cons_text,
                str(self.risk_level)
            )
            
            response, tokens = llm_manager.generate_text(
                prompt,
                max_tokens=400,
                temperature=0.5
            )
            
            self.token_count += tokens
            self.recommendations = self._clean_response(response)
            
            logger.info("Recommendations generated")
            return self.recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            self.recommendations = "Review this agreement carefully with a legal advisor."
            return self.recommendations
    
    def analyze_full(self, document_text: str, filename: str = "agreement") -> Dict[str, Any]:
        """
        Perform complete analysis workflow
        
        Args:
            document_text: Document content
            filename: Original filename
            
        Returns:
            Dictionary with complete analysis results
        """
        start_time = time.time()
        
        try:
            logger.info(f"Starting full analysis: {filename}")
            
            # Prepare
            self.prepare_document(document_text)
            
            # Run analysis steps
            self.extract_clauses()
            self.analyze_pros_cons()
            self.assess_risk()
            self.generate_summary()
            self.generate_recommendations()
            
            elapsed = time.time() - start_time
            
            logger.info(f"Analysis complete in {elapsed:.2f}s")
            
            # Convert clauses to KeyClause objects
            key_clauses = [
                KeyClause(
                    title=c.get('title', 'Clause'),
                    content=c.get('content', ''),
                    risk_level=c.get('risk_level', RiskLevel.MEDIUM),
                    pro=c.get('pro', ''),
                    con=c.get('con', '')
                )
                for c in self.clauses[:5]
            ]
            
            return {
                "summary": self.summary,
                "risk_level": self.risk_level,
                "key_clauses": key_clauses,
                "pros": self.pros,
                "cons": self.cons,
                "recommendations": self.recommendations,
                "processing_time_seconds": int(elapsed),
                "token_count": self.token_count
            }
            
        except Exception as e:
            logger.error(f"Full analysis failed: {str(e)}")
            raise

    def analyze_without_model(self, document_text: str) -> Dict[str, Any]:
        """Analyze an agreement locally when the optional LLM is unavailable."""
        start_time = time.time()
        text = self.prepare_document(document_text)
        risk_terms = {
            "auto-renew": ("Automatic renewal", RiskLevel.MEDIUM),
            "arbitration": ("Arbitration", RiskLevel.MEDIUM),
            "indemn": ("Indemnity", RiskLevel.HIGH),
            "liability": ("Liability limits", RiskLevel.HIGH),
            "terminate": ("Termination", RiskLevel.MEDIUM),
            "penalt": ("Penalties", RiskLevel.HIGH),
            "personal data": ("Personal data", RiskLevel.HIGH),
            "privacy": ("Privacy", RiskLevel.MEDIUM),
            "governing law": ("Governing law", RiskLevel.LOW),
        }
        clauses = []
        lowered = text.lower()
        for term, (title, level) in risk_terms.items():
            if term in lowered:
                sentence = next(
                    (part.strip() for part in re.split(r"(?<=[.!?])\s+", text)
                     if term in part.lower()),
                    f"This agreement contains a {term} provision.",
                )
                clauses.append(KeyClause(
                    title=title,
                    content=sentence[:500],
                    risk_level=level,
                    pro="This provision may clarify the parties' responsibilities.",
                    con="Check the scope, cost, and exceptions before signing.",
                ))

        if not clauses:
            clauses.append(KeyClause(
                title="General review",
                content="No common high-risk terms were detected by the local review.",
                risk_level=RiskLevel.LOW,
                pro="The agreement has no obvious red flags in the supported checks.",
                con="A local automated review cannot replace legal advice.",
            ))

        highest = max((clause.risk_level for clause in clauses), key=lambda level: {
            RiskLevel.LOW: 0, RiskLevel.MEDIUM: 1, RiskLevel.HIGH: 2
        }[level])
        self.risk_level = highest
        return {
            "summary": "Local review found " + str(len(clauses)) + " agreement areas that need attention.",
            "risk_level": highest,
            "key_clauses": clauses[:5],
            "pros": ["The document was reviewed locally without sending it to an external service."],
            "cons": ["This fallback checks common risk terms and does not understand every legal nuance."],
            "recommendations": "Review each flagged clause and ask a qualified legal professional about any term you do not understand.",
            "processing_time_seconds": int(time.time() - start_time),
            "token_count": 0,
        }


# Global analyzer instance
analyzer = AgreementAnalyzer()
