import { AnalysisResult } from "../types";

const processContract = async (content: string, mode: 'text' | 'url' | 'file' = 'text', mimeType?: string, fileName?: string): Promise<AnalysisResult> => {
  try {
    const formData = new FormData();

    if (mode === 'file') {
      const response = await fetch(content);
      if (!response.ok) throw new Error('Unable to read the uploaded document.');
      const blob = await response.blob();
      formData.append('file', blob, fileName || 'agreement');
    } else if (mode === 'url') {
      formData.append('url_input', content);
    } else {
      formData.append('text_input', content);
    }

    const response = await fetch('/api/agreements/upload', {
      method: 'POST',
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.detail || payload.error || 'Analysis failed.');
    }

    const data = payload.data;
    const riskScore = data.risk_level === 'high' ? 80 : data.risk_level === 'medium' ? 50 : 20;
    return {
      id: data.id,
      summary: data.summary,
      overallRiskScore: riskScore,
      verdict: data.risk_level === 'high' ? 'High Risk' : data.risk_level === 'medium' ? 'Caution' : 'Low Risk',
      clauses: data.key_clauses.map((clause: any) => ({
        originalText: clause.content,
        simplifiedExplanation: clause.content,
        severity: clause.risk_level.toUpperCase(),
        category: clause.title,
        recommendation: clause.con || 'Review this clause carefully.',
      })),
      input: { mode, value: mode === 'file' ? fileName || 'Uploaded Document' : content, mimeType },
    };

  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw error;
  }
};

export { processContract };