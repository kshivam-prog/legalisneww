import axios, { AxiosInstance } from 'axios';

interface AnalysisResult {
  id: string;
  document_name: string;
  document_type: string;
  summary: string;
  risk_level: string;
  key_clauses: Array<{
    title: string;
    content: string;
    risk_level: string;
    pro: string;
    con: string;
  }>;
  pros: string[];
  cons: string[];
  recommendations: string;
  analyzed_at: string;
}

interface AnalysisResponse {
  success: boolean;
  message: string;
  data?: AnalysisResult;
  error?: string;
}

interface HistoryResponse {
  total: number;
  items: AnalysisResult[];
}

class AgreementAPI {
  private api: AxiosInstance;

  constructor(baseURL = '/api') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async uploadFile(file: File): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post<AnalysisResponse>(
        '/agreements/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minutes
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadText(content: string): Promise<AnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append('text_input', content);

      const response = await this.api.post<AnalysisResponse>(
        '/agreements/upload',
        formData,
        {
          timeout: 300000, // 5 minutes
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadURL(url: string): Promise<AnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append('url_input', url);

      const response = await this.api.post<AnalysisResponse>(
        '/agreements/upload',
        formData,
        {
          timeout: 300000, // 5 minutes
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAnalysis(analysisId: string): Promise<AnalysisResponse> {
    try {
      const response = await this.api.get<AnalysisResponse>(
        `/agreements/${analysisId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHistory(
    skip = 0,
    limit = 10,
    riskLevel?: string
  ): Promise<HistoryResponse> {
    try {
      const params: Record<string, any> = { skip, limit };
      if (riskLevel) {
        params.risk_level = riskLevel;
      }

      const response = await this.api.get<HistoryResponse>(
        '/agreements/history',
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      return new Error(message);
    }
    return error;
  }
}

export default new AgreementAPI();
export type { AnalysisResult, AnalysisResponse, HistoryResponse };
