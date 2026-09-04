import React from 'react';
import { AnalysisResult } from '../services/api';

interface AnalysisCardProps {
  analysis: AnalysisResult;
  onView: (analysis: AnalysisResult) => void;
}

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 truncate">
            {analysis.document_name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(analysis.analyzed_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRiskColor(
            analysis.risk_level
          )}`}
        >
          {analysis.risk_level} Risk
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {analysis.summary}
      </p>

      <div className="flex gap-3 text-xs text-gray-600 mb-3 pb-3 border-b">
        <span>✅ {analysis.pros.length} Pros</span>
        <span>❌ {analysis.cons.length} Cons</span>
      </div>

      <button
        onClick={() => onView(analysis)}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        View Full Analysis
      </button>
    </div>
  );
};

export default AnalysisCard;
