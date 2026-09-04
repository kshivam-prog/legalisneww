import React from 'react';
import { AnalysisResult } from '../services/api';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getRiskIcon = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'high':
      return '⚠️';
    case 'medium':
      return '⚡';
    case 'low':
      return '✅';
    default:
      return 'ℹ️';
  }
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{result.document_name}</h2>
        <div className="flex items-center gap-4">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getRiskColor(
              result.risk_level
            )}`}
          >
            <span className="text-xl">{getRiskIcon(result.risk_level)}</span>
            <span className="font-semibold capitalize">
              {result.risk_level} Risk
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Analyzed: {new Date(result.analyzed_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">📋 Summary</h3>
        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
      </div>

      {/* Pros and Cons */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-green-700 mb-3">✅ Pros</h3>
          <ul className="space-y-2">
            {result.pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-red-700 mb-3">❌ Cons</h3>
          <ul className="space-y-2">
            {result.cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Clauses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Key Clauses</h3>
        <div className="space-y-4">
          {result.key_clauses.map((clause, idx) => (
            <div
              key={idx}
              className={`border-l-4 pl-4 py-2 ${
                clause.risk_level === 'high'
                  ? 'border-red-500'
                  : clause.risk_level === 'medium'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <h4 className="font-semibold text-gray-800 mb-1">{clause.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{clause.content}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {clause.pro && (
                  <div>
                    <span className="font-semibold text-green-700">Pro:</span>
                    <p className="text-gray-700">{clause.pro}</p>
                  </div>
                )}
                {clause.con && (
                  <div>
                    <span className="font-semibold text-red-700">Con:</span>
                    <p className="text-gray-700">{clause.con}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
        <h3 className="text-xl font-bold text-blue-900 mb-3">💡 Recommendations</h3>
        <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
          {result.recommendations}
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
