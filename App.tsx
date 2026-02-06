import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadView from './components/UploadView';
import AnalysisView from './components/AnalysisView';
import PricingView from './components/PricingView';
import AuthModal from './components/AuthModal';
import { AnalysisResult, AnalysisState, User } from './types';
import { processContract } from './services/geminiService';
import { getHistory, saveToHistory } from './services/historyService';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'pricing'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  
  const [state, setState] = useState<AnalysisState>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('url')) {
      return { isLoading: true, error: null, result: null };
    }
    return { isLoading: false, error: null, result: null };
  });

  useEffect(() => {
    setHistory(getHistory());
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleAuthAction = (mode: 'signin' | 'signup' = 'signup') => {
    if (user) {
      // If already logged in, just go home
      setCurrentView('home');
    } else {
      setAuthMode(mode);
      setShowAuthModal(true);
    }
  };

  const handleLogin = (user: User) => {
    setUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('home');
  };

  const handleAnalyze = async (content: string, mode: 'text' | 'url' | 'file', mimeType?: string, fileName?: string) => {
    // Optional: Gate analysis behind login
    if (!user) {
      setAuthMode('signup');
      setShowAuthModal(true);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await processContract(content, mode, mimeType, fileName);
      
      const resultWithMeta: AnalysisResult = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };

      const updatedHistory = saveToHistory(resultWithMeta);
      setHistory(updatedHistory);
      
      setState({ isLoading: false, error: null, result: resultWithMeta });
    } catch (err: any) {
      setState({
        isLoading: false,
        error: err.message || "Analysis failed.",
        result: null
      });
    }
  };

  const handleLoadHistoryItem = (item: AnalysisResult) => {
    setState({ isLoading: false, error: null, result: item });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    // Only analyze if user is present, otherwise we might want to prompt login? 
    // For now, we allow deep links to try analysis, but `handleAnalyze` has a user check if we call it directly.
    // However, deep linking logic runs automatically here. Let's gate it too.
    
    if (urlParam && !state.result) {
      if (user) {
         handleAnalyze(urlParam, 'url');
      } 
      // Note: We don't auto-open modal on page load for deep links to avoid annoyance, 
      // but analysis won't run until they click button in UploadView which checks auth.
    }
  }, [user]); // Re-run if user logs in

  const handleReset = () => {
    setState({ isLoading: false, error: null, result: null });
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url.toString());
  };

  const navigateTo = (view: 'home' | 'pricing') => {
    if (state.result) {
      handleReset();
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    if (state.result) {
      return <AnalysisView result={state.result} onReset={handleReset} />;
    }

    if (currentView === 'pricing') {
      return <PricingView onGetStarted={() => handleAuthAction('signup')} />;
    }

    return (
      <UploadView 
        onAnalyze={handleAnalyze} 
        isLoading={state.isLoading} 
        history={history}
        onSelectHistory={handleLoadHistoryItem}
      />
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAF9] font-sans text-stone-900 flex flex-col">
      <Header 
        onNavigate={navigateTo} 
        user={user}
        onLoginClick={() => handleAuthAction('signin')}
        onLogoutClick={handleLogout}
      />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleLogin}
      />

      <main className="flex-1 relative">
        {state.error && (
          <div className="absolute top-4 left-4 right-4 z-50 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3 text-red-700 shadow-md max-w-4xl mx-auto">
            <div>
              <p className="text-sm font-bold">Analysis Error</p>
              <p className="text-xs">{state.error}</p>
            </div>
            <button onClick={() => setState(prev => ({...prev, error: null}))} className="text-red-500 hover:text-red-800">
               ✕
            </button>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  );
};

export default App;