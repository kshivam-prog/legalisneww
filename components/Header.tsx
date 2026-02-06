import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onNavigate: (view: 'home' | 'pricing') => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLoginClick, onLogoutClick }) => {
  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-stone-900 p-1.5 rounded-lg shadow-sm group-hover:bg-stone-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight leading-none">Legalis<span className="text-indigo-600">.ai</span></h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <button onClick={() => onNavigate('pricing')} className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">Pricing</button>
           
           {user ? (
             <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
               <div className="flex flex-col items-end">
                 <span className="text-xs font-bold text-stone-900">{user.name}</span>
                 <span className="text-[10px] text-stone-500 uppercase tracking-wider">{user.plan} Plan</span>
               </div>
               <button 
                 onClick={onLogoutClick}
                 className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                 title="Log Out"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                 </svg>
               </button>
             </div>
           ) : (
             <div className="flex items-center gap-3">
               <button 
                 onClick={onLoginClick} 
                 className="text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors"
               >
                 Log in
               </button>
               <button 
                 onClick={onLoginClick}
                 className="px-4 py-2 rounded-full bg-stone-900 text-white text-sm font-bold shadow-lg hover:bg-black hover:scale-105 transition-all"
               >
                 Get Started
               </button>
             </div>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;