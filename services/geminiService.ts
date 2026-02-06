import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const processContract = async (content: string, mode: 'text' | 'url' | 'file' = 'text', mimeType?: string, fileName?: string): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });

    let parts: any[] = [];
    let tools: any[] | undefined = undefined;

    const riskCategoriesInstruction = `
      5. A specific breakdown of risks in these 4 categories. Keep descriptions extremely short (under 15 words) using simple, globally understood English:
         - Human Centric (impact on personal rights, freedom, privacy)
         - Financial (unexpected costs, penalties, money loss)
         - Cyber (data leaks, hacking, spying)
         - Mental (stress, unfair pressure, peace of mind)
         If no risk is detected in a category, state "No significant risk".
    `;

    const commonSystemInstruction = `
        You are an expert senior legal counsel and contract risk auditor. 
        Analyze the provided legal document or text. 
        Identify hidden risks, dangerous clauses, and unfair terms.
        
        CRITICAL INSTRUCTION: Use simple, universally understood English (CEFR Level B1). Avoid complex legal jargon. If a legal term is necessary, explain it simply.

        Provide a structured analysis including:
        1. A plain-English executive summary. Simple words only.
        2. An overall risk score (0-100, where 0 is Safe and 100 is Dangerous).
        3. A short verdict. Use ONLY one of these globally understood phrases: "Safe", "Low Risk", "Caution", "High Risk", "Critical".
        4. A list of specific risky clauses.
           - Simplified Explanation: Explain the danger as if speaking to a non-lawyer.
           - Recommendation: Clear, actionable advice using simple verbs (e.g., "Ask to remove this", "Change this to...").
        ${riskCategoriesInstruction}
    `;

    if (mode === 'url') {
      parts.push({ text: `
        ${commonSystemInstruction}
        
        TASK:
        The user has provided a URL or Company Name: "${content}".
        1. Search for the latest "Terms of Service", "Terms of Use", or "Privacy Policy" associated with this URL or Company.
        2. Analyze the content of that legal agreement.
      `});
      // Enable Google Search for URL mode
      tools = [{ googleSearch: {} }];
    } else if (mode === 'file' && mimeType) {
       // Extract base64 if it includes the data prefix
       const base64Data = content.includes('base64,') ? content.split('base64,')[1] : content;
       
       parts.push({ text: commonSystemInstruction });
       parts.push({
         inlineData: {
           mimeType: mimeType,
           data: base64Data
         }
       });
    } else {
      parts.push({ text: `
        ${commonSystemInstruction}

        Contract Text:
        "${content}"
      `});
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        tools: tools,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise, simple executive summary." },
            overallRiskScore: { type: Type.INTEGER, description: "A score from 0 (safe) to 100 (dangerous)." },
            verdict: { type: Type.STRING, description: "One of the allowed verdict phrases." },
            specificRisks: {
              type: Type.OBJECT,
              properties: {
                human: { type: Type.STRING, description: "Simple summary of rights risks." },
                financial: { type: Type.STRING, description: "Simple summary of money risks." },
                cyber: { type: Type.STRING, description: "Simple summary of data risks." },
                mental: { type: Type.STRING, description: "Simple summary of stress risks." },
              },
              required: ["human", "financial", "cyber", "mental"]
            },
            clauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalText: { type: Type.STRING, description: "The exact text of the clause." },
                  simplifiedExplanation: { type: Type.STRING, description: "Simple explanation of the risk." },
                  severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                  category: { type: Type.STRING, description: "e.g., Money, Privacy, Termination" },
                  recommendation: { type: Type.STRING, description: "Simple advice." }
                },
                required: ["originalText", "simplifiedExplanation", "severity", "category", "recommendation"]
              }
            }
          },
          required: ["summary", "overallRiskScore", "verdict", "clauses", "specificRisks"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI.");
    }

    const result = JSON.parse(responseText) as AnalysisResult;
    
    // Store input metadata. For files, we don't store the full base64 content in the input value to save space, just the filename.
    if (mode === 'file') {
        result.input = { mode, value: fileName || "Uploaded Document", mimeType };
    } else {
        result.input = { mode, value: content };
    }

    // Extract sources from grounding metadata if available (for URL mode)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      const chunks = groundingMetadata.groundingChunks as any[];
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: any): uri is string => typeof uri === 'string');
      
      // Deduplicate sources
      result.sources = [...new Set(sources)];
    }

    return result;

  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw error;
  }
};

export { processContract };