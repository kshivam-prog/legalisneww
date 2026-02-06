import React, { useState, useCallback } from 'react';
import { AnalysisResult } from '../types';

interface UploadViewProps {
  onAnalyze: (content: string, mode: 'text' | 'url' | 'file', mimeType?: string, fileName?: string) => void;
  isLoading: boolean;
  history: AnalysisResult[];
  onSelectHistory: (item: AnalysisResult) => void;
}

interface FileState {
  name: string;
  data: string;
  type: string;
}

const UploadView: React.FC<UploadViewProps> = ({ onAnalyze, isLoading, history, onSelectHistory }) => {
  const [mode, setMode] = useState<'text' | 'url'>('text');
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<FileState | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const getMimeType = (file: File) => {
    if (file.type) return file.type;
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return 'application/pdf';
    if (name.endsWith('.ppt')) return 'application/vnd.ms-powerpoint';
    if (name.endsWith('.pptx')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    if (name.endsWith('.txt')) return 'text/plain';
    if (name.endsWith('.md')) return 'text/markdown';
    return 'application/octet-stream';
  };

  const isBinaryFile = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    return (
      type === 'application/pdf' ||
      type.includes('powerpoint') || 
      type.includes('presentation') ||
      name.endsWith('.pdf') ||
      name.endsWith('.ppt') ||
      name.endsWith('.pptx')
    );
  };

  const handleFile = (uploadedFile: File) => {
    if (isBinaryFile(uploadedFile)) {
       const reader = new FileReader();
       reader.onload = (e) => {
         setFile({
           name: uploadedFile.name,
           data: e.target?.result as string,
           type: getMimeType(uploadedFile)
         });
         setText('');
         setIsTyping(false);
       };
       reader.readAsDataURL(uploadedFile);
    } else {
       const reader = new FileReader();
       reader.onload = (e) => {
         setText(e.target?.result as string);
         setFile(null);
         setIsTyping(true); 
       };
       reader.readAsText(uploadedFile);
    }
    setMode('text');
  };

  const removeFile = () => {
    setFile(null);
    setIsTyping(false);
  };

  const handleScanCurrentTab = async () => {
    // Check if running as a Chrome Extension
    const chromeApi = (window as any).chrome;
    
    if (chromeApi && chromeApi.tabs && chromeApi.tabs.query) {
       try {
         // 1. Get Active Tab
         const [tab] = await chromeApi.tabs.query({ active: true, currentWindow: true });
         
         if (tab && tab.url) {
            // If we have scripting permission, try to extract text
            if (chromeApi.scripting && chromeApi.scripting.executeScript && tab.id) {
                const results = await chromeApi.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => document.body.innerText
                });
                
                if (results && results[0] && results[0].result) {
                    setMode('text');
                    onAnalyze(results[0].result, 'text');
                    return;
                }
            }
            
            // Fallback: Just use the URL
            setMode('url');
            setUrl(tab.url);
            onAnalyze(tab.url, 'url');
         }
       } catch (err) {
         console.error("Extension API Error:", err);
         alert("Could not access tab contents. Please paste URL manually.");
       }
    } else {
       // Fallback for Web App (Simulated)
       const isUrlMode = mode === 'url';
       if (!isUrlMode) setMode('url');
       
       // In a real web app, we can't read other tabs. 
       // We'll prompt the user or focus the input.
       alert("Browser Extension API not detected. Please install the extension or paste the URL manually.");
       setTimeout(() => {
          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (input) input.focus();
       }, 300);
    }
  };

  const handleSubmit = useCallback(() => {
    if (mode === 'url' && url.trim().length > 3) {
      onAnalyze(url, 'url');
    } else if (mode === 'text') {
      if (file) {
        onAnalyze(file.data, 'file', file.type, file.name);
      } else if (text.trim().length > 50) {
        onAnalyze(text, 'text');
      }
    }
  }, [mode, text, url, file, onAnalyze]);

  const isValid = mode === 'text' ? (text.length > 50 || !!file) : url.length > 3;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:py-12 md:px-6">
      
      {/* Header Section - Responsive Text */}
      <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-stone-200 backdrop-blur-md shadow-sm mb-4 md:mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-stone-600">AI Risk Analysis Engine</span>
        </div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 mb-4 md:mb-6 tracking-tight leading-tight">
          Contract Intelligence.
        </h2>
        <p className="text-base md:text-lg text-stone-500 max-w-xl md:max-w-2xl mx-auto font-light leading-relaxed">
          Instantly decode complex legal agreements into clear, actionable insights.
        </p>
      </div>

      {/* Main Glass Window */}
      <div className="relative group animate-fade-in-up delay-100">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-stone-100 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
        
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] border border-white/50 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Tabs */}
          <div className="flex items-center justify-center px-4 py-4 border-b border-stone-100/50 bg-white/40">
            <div className="flex p-1 bg-stone-100/80 rounded-xl w-full max-w-xs md:w-auto md:max-w-none">
               <button 
                 onClick={() => setMode('text')}
                 className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${mode === 'text' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
               >
                 Document
               </button>
               <button 
                 onClick={() => setMode('url')}
                 className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${mode === 'url' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
               >
                 Website URL
               </button>
            </div>
          </div>

          {/* Content Area - Responsive Height */}
          <div className="relative min-h-[400px] md:h-[500px] flex flex-col">
            
            {mode === 'text' ? (
              <div 
                className="flex-1 flex flex-col relative"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                
                {/* 1. Black Box Upload State (Default) */}
                {!file && !isTyping && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-6 animate-fade-in">
                      <label className="group relative cursor-pointer w-full max-w-[280px] md:max-w-xs aspect-square flex flex-col items-center justify-center bg-stone-900 rounded-[2rem] shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden z-10">
                          {/* Gradient Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-stone-800 opacity-100 group-hover:opacity-80 transition-opacity"></div>
                          
                          <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-5">
                              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all duration-300 shadow-inner">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                  </svg>
                              </div>
                              <div>
                                  <h3 className="text-xl font-serif font-bold text-white tracking-wide">Upload Contract</h3>
                                  <p className="text-stone-400 text-xs mt-2 font-medium tracking-wide">PDF, PPT, TXT, or MD</p>
                              </div>
                              <div className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] font-bold text-white tracking-wider uppercase group-hover:bg-white/10 transition-colors">
                                Browse Files
                              </div>
                          </div>
                          <input type="file" className="hidden" accept=".txt,.md,.pdf,.ppt,.pptx" onChange={handleFileUpload} />
                      </label>
                      
                      <div className="mt-8 flex flex-col items-center gap-2 z-10">
                         <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">or</span>
                         <button 
                           onClick={() => setIsTyping(true)}
                           className="text-sm font-semibold text-stone-600 hover:text-stone-900 border-b border-stone-300 hover:border-stone-900 transition-all pb-0.5"
                         >
                            Paste Text Manually
                         </button>
                      </div>
                   </div>
                )}

                {/* 2. Text Input State */}
                {!file && isTyping && (
                  <div className="flex-1 flex flex-col p-4 md:p-8 animate-fade-in h-full">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your contract text here..."
                        className="flex-1 w-full p-6 bg-stone-50/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none resize-none font-mono text-xs md:text-sm text-stone-800 leading-relaxed placeholder:text-stone-300 transition-all border border-stone-100"
                        autoFocus
                    />
                    <div className="flex justify-between items-center mt-4 px-2">
                       <button onClick={() => { setIsTyping(false); setText(''); }} className="text-xs font-medium text-stone-400 hover:text-stone-600">
                          ← Back to Upload
                       </button>
                       <span className="text-xs text-stone-300 font-mono">
                          {text.length} chars
                       </span>
                    </div>
                  </div>
                )}

                {/* 3. File Selected State */}
                {file && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 animate-fade-in">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-50 flex flex-col items-center gap-5 max-w-sm w-full transform transition-all hover:scale-105">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                {file.type.includes('presentation') || file.type.includes('powerpoint') ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-center w-full">
                                <p className="font-serif font-bold text-stone-900 truncate w-full text-lg">{file.name}</p>
                                <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-medium">Ready for analysis</p>
                            </div>
                            <button 
                                onClick={removeFile}
                                className="w-full py-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors uppercase tracking-wide"
                            >
                                Remove File
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Drag Overlay */}
                <div 
                    className={`absolute inset-0 bg-stone-900/90 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 z-50 ${dragActive ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                >
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-white">Drop File Here</h3>
                    <p className="text-stone-400 mt-2">PDF, PPT, TXT, or MD</p>
                </div>

              </div>
            ) : (
               /* URL MODE with NEW Tab Scan Logic */
               <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-stone-50/30">
                 <div className="w-full max-w-lg space-y-6 md:space-y-8">
                    <div className="text-center space-y-2">
                      <h3 className="font-serif text-2xl md:text-3xl text-stone-800">Analyze Website</h3>
                      <p className="text-stone-500 font-light text-sm md:text-base">Enter the URL of the Terms of Service or Privacy Policy.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative group">
                          <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/terms"
                            className="w-full pl-6 pr-14 py-4 md:py-5 bg-white border border-stone-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-stone-900 text-base md:text-lg transition-all placeholder:text-stone-300"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-indigo-500 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                             </svg>
                          </div>
                        </div>

                        {/* Scan Current Tab Button */}
                        <div className="flex flex-col items-center gap-4 pt-2">
                            <div className="flex items-center w-full gap-4">
                                <div className="h-px bg-stone-200 flex-1"></div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Extension Tools</span>
                                <div className="h-px bg-stone-200 flex-1"></div>
                            </div>
                            
                            <button 
                                onClick={handleScanCurrentTab}
                                className="group flex items-center justify-center gap-2.5 px-6 py-2.5 bg-white hover:bg-indigo-50 border border-stone-200 hover:border-indigo-200 rounded-xl text-stone-600 hover:text-indigo-600 text-sm font-semibold transition-all shadow-sm hover:shadow-md w-full md:w-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                </svg>
                                Scan Active Browser Tab
                            </button>
                        </div>
                    </div>

                 </div>
              </div>
            )}
            
            {/* Action Bar */}
            <div className="p-6 md:p-8 flex justify-center border-t border-stone-100 bg-white/40 backdrop-blur-sm">
              <button
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className={`
                  w-full md:w-auto
                  flex items-center justify-center gap-3 px-8 md:px-12 py-4 rounded-xl md:rounded-full font-bold text-white shadow-xl transition-all duration-300 transform
                  ${!isValid || isLoading 
                    ? 'bg-stone-300 cursor-not-allowed opacity-80' 
                    : 'bg-stone-900 hover:bg-black hover:scale-105 hover:shadow-2xl shadow-stone-900/20'}
                `}
              >
                {isLoading ? (
                   <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="tracking-wide text-sm">Analyzing...</span>
                   </div>
                ) : (
                  <>
                    <span className="tracking-wide text-sm md:text-base">Run Risk Analysis</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    
      {/* History and Footer */}
      {history.length > 0 && (
        <div className="mt-16 md:mt-24 animate-fade-in-up delay-200">
           <h3 className="text-lg md:text-xl font-serif font-bold text-stone-800 mb-6 md:mb-8 pl-2 border-l-4 border-stone-200">Recent Analyses</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {history.map((item, i) => (
              <button 
                key={item.id || Math.random()} 
                onClick={() => onSelectHistory(item)}
                className="group flex flex-col items-start text-left bg-white/60 hover:bg-white p-5 md:p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl backdrop-blur-sm transition-all duration-300 active:scale-95"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex w-full justify-between items-start mb-4">
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                     item.overallRiskScore > 70 ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                     item.overallRiskScore > 30 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                     'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    RISK SCORE: {item.overallRiskScore}
                  </div>
                  <span className="text-xs text-stone-400">{formatDate(item.timestamp)}</span>
                </div>
                
                 <h4 className="font-serif font-bold text-stone-900 text-base md:text-lg mb-2 truncate w-full">
                   {(() => {
                     const val = item.input?.value ?? '';
                     if (!val) return 'No input';
                     if (val.startsWith('http')) return (new URL(val).hostname);
                     if (val.length > 30) return (item.input?.mode === 'file' ? val : 'Uploaded Document');
                     return val;
                   })()}
                 </h4>
                <p className="text-xs md:text-sm text-stone-500 line-clamp-2 leading-relaxed">
                   {item.summary}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-16 md:mt-24 border-t border-stone-200 pt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-stone-400 pb-8">
         <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium tracking-wide">Gemini 3.0 Powered</span>
         </div>
         <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-xs font-medium tracking-wide">Private & Secure</span>
         </div>
      </div>
    </div>
  );
};

export default UploadView;