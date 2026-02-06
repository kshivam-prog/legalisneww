import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: User;
      if (mode === 'signin') {
        user = await authService.login(formData.email, formData.password);
      } else {
        if (!formData.name || formData.name.length < 2) throw new Error("Please enter a valid name.");
        user = await authService.signup(formData.name, formData.email, formData.password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-stone-50 px-8 py-6 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-stone-900">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {mode === 'signin' ? 'Sign in to access your dashboard' : 'Start your 2-month free trial'}
              </p>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-stone-800"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-stone-800"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-stone-800"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-stone-900 text-white font-bold rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Get Started Free'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-stone-50 p-4 text-center border-t border-stone-100">
           <p className="text-xs text-stone-500">
             {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
             <button 
               type="button"
               onClick={() => {
                 setMode(mode === 'signin' ? 'signup' : 'signin');
                 setError(null);
               }}
               className="font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-2"
             >
               {mode === 'signin' ? 'Sign up' : 'Log in'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;