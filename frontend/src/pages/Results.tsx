import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResultsDisplay from '../components/ResultsDisplay';
import api, { AnalysisResult } from '../services/api';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) {
        setError('No analysis ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.getAnalysis(id);
        if (response.success && response.data) {
          setResult(response.data);
        } else {
          setError(response.error || 'Failed to load analysis');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📋</div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-12">
          <button
            onClick={() => navigate('/')}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </button>
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-12">
          <button
            onClick={() => navigate('/')}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </button>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
            <p>No analysis found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-6">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <ResultsDisplay result={result} />

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Analyze Another Document
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
