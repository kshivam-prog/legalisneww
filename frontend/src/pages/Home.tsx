import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import TextInput from '../components/TextInput';
import api from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');

  const handleFileSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadFile(file);
      if (response.success && response.data) {
        navigate(`/results/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to analyze document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadText(text);
      if (response.success && response.data) {
        navigate(`/results/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to analyze document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadURL(urlInput);
      if (response.success && response.data) {
        navigate(`/results/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to analyze document');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setUrlInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">⚖️</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Agreement Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Understand your agreements with simple English explanations
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Analyzing your agreement... This may take a minute.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow">
          {(['file', 'text', 'url'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-blue-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab === 'file' ? '📄 Upload File' : tab === 'text' ? '📝 Paste Text' : '🔗 URL'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'file' && (
            <FileUpload onFileSelected={handleFileSelected} disabled={loading} />
          )}

          {activeTab === 'text' && (
            <TextInput onTextSubmit={handleTextSubmit} disabled={loading} />
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleURLSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webpage URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/agreement"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !urlInput.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Analyze URL
              </button>
            </form>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-800 mb-2">Simple English</h3>
            <p className="text-gray-600 text-sm">
              No legal jargon - explanations anyone can understand
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-semibold text-gray-800 mb-2">Risk Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify potential risks and unfavorable terms
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-2">Private & Secure</h3>
            <p className="text-gray-600 text-sm">
              No external APIs - all processing done locally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
