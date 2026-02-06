export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface RiskClause {
  originalText: string;
  simplifiedExplanation: string;
  severity: RiskSeverity;
  category: string;
  recommendation: string;
}

export interface SpecificRisks {
  human: string;
  financial: string;
  cyber: string;
  mental: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'standard' | 'pro';
  joinedAt: number;
}

export interface AnalysisResult {
  id?: string; // Unique ID for history
  timestamp?: number; // Date created
  summary: string;
  overallRiskScore: number; // 0 to 100
  verdict: string;
  specificRisks?: SpecificRisks; // Breakdown of specific impact areas
  clauses: RiskClause[];
  sources?: string[]; // URLs found via search
  input?: { 
    mode: 'text' | 'url' | 'file'; 
    value: string; // Text content, URL, or Filename (for file mode)
    mimeType?: string;
  }; 
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}