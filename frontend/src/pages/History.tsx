import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisCard from '../components/AnalysisCard';
import ResultsDisplay from '../components/ResultsDisplay';
import api, { AnalysisResult } from '../services/api';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchHistory();
  }, [riskFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getHistory(0, 50, riskFilter);
      setAnalyses(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (selectedAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-6">
          <button
            onClick={() => setSelectedAnalysis(null)}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to History
          </button>
          <ResultsDisplay result={selectedAnalysis} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto py-6">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Analysis History</h1>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRiskFilter(undefined)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskFilter === undefined
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {['low', 'medium', 'high'].map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  riskFilter === risk
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {risk} Risk
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading analysis history...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No analyses found</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Analyze Your First Document
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Found {analyses.length} analysis(es)
              </p>
            </div>
          )}
        </div>

        {/* Cards Grid */}
        {!loading && analyses.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onView={setSelectedAnalysis}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
