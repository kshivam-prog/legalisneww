"""
Prompt templates and engineering for agreement analysis
"""

import logging

logger = logging.getLogger(__name__)


class PromptTemplates:
    """Prompt templates for agreement analysis"""
    
    # System message for all prompts
    SYSTEM_MESSAGE = """You are an expert legal contract analyst. You analyze agreements and provide clear, 
simple English explanations suitable for non-lawyers. You identify key clauses, assess risks, and provide 
balanced pros and cons assessment.

Important guidelines:
- Use simple, non-technical language
- Be concise but thorough
- Identify real risks and benefits
- Provide actionable insights
- Focus on what matters most to the reader"""
    
    @staticmethod
    def extract_clauses_prompt(document_text: str) -> str:
        """
        Prompt for extracting key clauses from document
        
        Args:
            document_text: The agreement document text
            
        Returns:
            Formatted prompt
        """
        return f"""{PromptTemplates.SYSTEM_MESSAGE}

TASK: Extract the 5-8 most important clauses from this agreement. For each clause:
1. Give it a clear title
2. Quote the relevant text (or summarize if too long)
3. Explain what it means in simple English
4. Identify if it's favorable (PRO), unfavorable (CON), or neutral

AGREEMENT TEXT:
{document_text}

RESPONSE FORMAT:
Clause 1: [TITLE]
Risk Level: [LOW/MEDIUM/HIGH]
Summary: [Simple English explanation]
Pro: [Positive aspect or nil]
Con: [Negative aspect or nil]

Clause 2: [repeat format]
...

Now analyze the agreement and extract clauses:"""
    
    @staticmethod
    def pros_cons_prompt(document_text: str, clauses_summary: str) -> str:
        """
        Prompt for generating balanced pros and cons
        
        Args:
            document_text: The agreement text
            clauses_summary: Summary of key clauses
            
        Returns:
            Formatted prompt
        """
        return f"""{PromptTemplates.SYSTEM_MESSAGE}

TASK: Analyze this agreement and provide a balanced list of PROS and CONS.

AGREEMENT SUMMARY:
{clauses_summary}

FULL TEXT:
{document_text}

Generate 3-5 main PROS (advantages, protections, beneficial clauses):
- Pro 1: [explain in simple terms]
- Pro 2: [explain in simple terms]
- Pro 3: [explain in simple terms]

Generate 3-5 main CONS (risks, unfavorable terms, potential issues):
- Con 1: [explain in simple terms]
- Con 2: [explain in simple terms]
- Con 3: [explain in simple terms]

Format your response exactly as shown above with numbered pros and cons."""
    
    @staticmethod
    def risk_assessment_prompt(document_text: str, clauses_summary: str) -> str:
        """
        Prompt for risk level assessment
        
        Args:
            document_text: The agreement text
            clauses_summary: Summary of key clauses
            
        Returns:
            Formatted prompt
        """
        return f"""{PromptTemplates.SYSTEM_MESSAGE}

TASK: Assess the overall risk level of this agreement.

Risk Assessment Criteria:
- LOW: Standard terms, well-balanced, no major red flags
- MEDIUM: Some unfavorable terms but negotiable, moderate risks
- HIGH: Significant risks, very unfavorable terms, major concerns

AGREEMENT SUMMARY:
{clauses_summary}

FULL TEXT:
{document_text}

Provide:
1. Risk Level: [LOW/MEDIUM/HIGH]
2. Key Concerns: [List 2-3 main risk areas]
3. Recommendation: [What should the reader do?]

Be specific and direct. Format exactly as shown."""
    
    @staticmethod
    def summary_prompt(document_text: str, clauses_summary: str, pros: str, cons: str, risk_level: str) -> str:
        """
        Prompt for generating executive summary
        
        Args:
            document_text: The agreement text
            clauses_summary: Summary of key clauses
            pros: Pros assessment
            cons: Cons assessment
            risk_level: Risk level assessment
            
        Returns:
            Formatted prompt
        """
        return f"""{PromptTemplates.SYSTEM_MESSAGE}

TASK: Write a concise executive summary of this agreement for a non-lawyer.

AGREEMENT TEXT:
{document_text}

KEY CLAUSES:
{clauses_summary}

PROS:
{pros}

CONS:
{cons}

RISK LEVEL: {risk_level}

Write a 2-3 sentence summary that explains:
1. What this agreement is about
2. The key obligation or protection
3. Whether it's worth signing (yes/no/with conditions)

Use simple language. No legal jargon. Keep it practical.

Summary:"""
    
    @staticmethod
    def recommendations_prompt(
        document_text: str,
        clauses_summary: str,
        pros: str,
        cons: str,
        risk_level: str
    ) -> str:
        """
        Prompt for generating recommendations
        
        Args:
            document_text: The agreement text
            clauses_summary: Summary of key clauses
            pros: Pros assessment
            cons: Cons assessment
            risk_level: Risk level assessment
            
        Returns:
            Formatted prompt
        """
        return f"""{PromptTemplates.SYSTEM_MESSAGE}

TASK: Provide actionable recommendations for dealing with this agreement.

AGREEMENT SUMMARY:
{clauses_summary}

RISK LEVEL: {risk_level}

PROS:
{pros}

CONS:
{cons}

Based on this analysis, provide 3-4 specific recommendations:

1. If risk level is LOW: What's good about this agreement?
2. If risk level is MEDIUM: What should be negotiated?
3. If risk level is HIGH: Should they sign? What changes are needed?
4. Any other important actions?

Format:
Recommendation 1: [Action and reasoning]
Recommendation 2: [Action and reasoning]
...

Be direct and practical. Avoid legal jargon."""


class PromptBuilder:
    """Build and manage prompts for analysis"""
    
    @staticmethod
    def build_extraction_prompt(document_text: str, max_length: int = 4000) -> str:
        """Build prompt for clause extraction"""
        # Truncate if needed
        if len(document_text) > max_length:
            text = document_text[:max_length] + "... [document truncated]"
        else:
            text = document_text
        
        return PromptTemplates.extract_clauses_prompt(text)
    
    @staticmethod
    def build_pros_cons_prompt(
        document_text: str,
        clauses_summary: str,
        max_doc_length: int = 3000
    ) -> str:
        """Build prompt for pros/cons analysis"""
        if len(document_text) > max_doc_length:
            text = document_text[:max_doc_length] + "... [truncated]"
        else:
            text = document_text
        
        return PromptTemplates.pros_cons_prompt(text, clauses_summary)
    
    @staticmethod
    def build_risk_prompt(
        document_text: str,
        clauses_summary: str,
        max_doc_length: int = 2000
    ) -> str:
        """Build prompt for risk assessment"""
        if len(document_text) > max_doc_length:
            text = document_text[:max_doc_length] + "... [truncated]"
        else:
            text = document_text
        
        return PromptTemplates.risk_assessment_prompt(text, clauses_summary)
    
    @staticmethod
    def build_summary_prompt(
        document_text: str,
        clauses_summary: str,
        pros: str,
        cons: str,
        risk_level: str
    ) -> str:
        """Build prompt for summary"""
        return PromptTemplates.summary_prompt(
            document_text,
            clauses_summary,
            pros,
            cons,
            risk_level
        )
    
    @staticmethod
    def build_recommendations_prompt(
        document_text: str,
        clauses_summary: str,
        pros: str,
        cons: str,
        risk_level: str
    ) -> str:
        """Build prompt for recommendations"""
        return PromptTemplates.recommendations_prompt(
            document_text,
            clauses_summary,
            pros,
            cons,
            risk_level
        )
