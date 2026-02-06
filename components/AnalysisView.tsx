import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { AnalysisResult, RiskSeverity } from '../types';
import RiskMeter from './RiskMeter';

interface AnalysisViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const getSeverityColor = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.CRITICAL: return 'bg-rose-50/50 border-rose-100 text-rose-900';
      case RiskSeverity.HIGH: return 'bg-orange-50/50 border-orange-100 text-orange-900';
      case RiskSeverity.MEDIUM: return 'bg-amber-50/50 border-amber-100 text-amber-900';
      case RiskSeverity.LOW: return 'bg-blue-50/50 border-blue-100 text-blue-900';
      default: return 'bg-stone-50/50 border-stone-200 text-stone-900';
    }
  };

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.CRITICAL: return 'bg-rose-100 text-rose-700 border-rose-200';
      case RiskSeverity.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case RiskSeverity.MEDIUM: return 'bg-amber-100 text-amber-700 border-amber-200';
      case RiskSeverity.LOW: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const handleShare = () => {
    if (result.input?.mode === 'url') {
      const url = new URL(window.location.href);
      url.searchParams.set('url', result.input.value);
      navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);

        doc.setFont("times", "bold");
        doc.setFontSize(24);
        doc.text("Legalis AI Report", margin, 25);

        doc.setFont("helvetica", "normal"); 
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 35);
        if (result.input?.value) {
          const sourceText = result.input.mode === 'url' ? result.input.value : "Uploaded Document";
          doc.text(`Source: ${sourceText}`, margin, 40);
        }

        doc.setFillColor(245, 245, 244);
        doc.rect(margin, 50, maxLineWidth, 40, 'F');
        doc.setDrawColor(231, 229, 228);
        doc.rect(margin, 50, maxLineWidth, 40, 'S');

        doc.setFontSize(14);
        doc.setTextColor(28, 25, 23);
        doc.text("Risk Score", margin + 10, 65);
        
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        const scoreColor = result.overallRiskScore > 70 ? [220, 38, 38] : result.overallRiskScore > 30 ? [217, 119, 6] : [22, 163, 74];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(`${result.overallRiskScore}/100`, margin + 10, 80);

        doc.setFontSize(14);
        doc.setTextColor(28, 25, 23);
        doc.setFont("helvetica", "normal");
        doc.text("Verdict", margin + 80, 65);
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(result.verdict, margin + 80, 78);

        let yPos = 105;
        doc.setFontSize(14);
        doc.setTextColor(28, 25, 23);
        doc.setFont("times", "bold");
        doc.text("Executive Summary", margin, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(68, 64, 60);
        const summaryLines = doc.splitTextToSize(result.summary, maxLineWidth);
        doc.text(summaryLines, margin, yPos);
        yPos += (summaryLines.length * 6) + 15;

        if (result.specificRisks) {
          doc.setFontSize(14);
          doc.setTextColor(28, 25, 23);
          doc.setFont("times", "bold");
          doc.text("Impact Analysis", margin, yPos);
          yPos += 10;
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const categories = [
            { name: "Rights & Privacy", val: result.specificRisks.human },
            { name: "Money & Costs", val: result.specificRisks.financial },
            { name: "Data Safety", val: result.specificRisks.cyber },
            { name: "Peace of Mind", val: result.specificRisks.mental },
          ];

          categories.forEach((cat) => {
             doc.setFont("helvetica", "bold");
             doc.text(`${cat.name}:`, margin, yPos);
             doc.setFont("helvetica", "normal");
             const line = doc.splitTextToSize(cat.val, maxLineWidth - 40);
             doc.text(line, margin + 35, yPos);
             yPos += (line.length * 5) + 3;
          });
          yPos += 10;
        }

        if (result.clauses.length > 0) {
          if (yPos > 240) { doc.addPage(); yPos = 20; }

          doc.setFontSize(14);
          doc.setTextColor(28, 25, 23);
          doc.setFont("times", "bold");
          doc.text("Detailed Risk Findings", margin, yPos);
          yPos += 10;

          result.clauses.forEach((clause, index) => {
            if (yPos > 240) { doc.addPage(); yPos = 20; }

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            
            let severityColor = [71, 85, 105];
            if (clause.severity === 'CRITICAL') severityColor = [153, 27, 27];
            if (clause.severity === 'HIGH') severityColor = [194, 65, 12];
            if (clause.severity === 'MEDIUM') severityColor = [180, 83, 9];
            if (clause.severity === 'LOW') severityColor = [30, 64, 175];
            
            doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
            doc.text(`${index + 1}. ${clause.category} - ${clause.severity}`, margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("Analysis:", margin + 5, yPos);
            
            doc.setFont("helvetica", "normal");
            const expLines = doc.splitTextToSize(clause.simplifiedExplanation, maxLineWidth - 10);
            doc.text(expLines, margin + 25, yPos);
            yPos += (expLines.length * 5) + 5;

            doc.setFont("helvetica", "bold");
            doc.text("Advice:", margin + 5, yPos);
            
            doc.setFont("helvetica", "normal");
            const recLines = doc.splitTextToSize(clause.recommendation, maxLineWidth - 10);
            doc.text(recLines, margin + 25, yPos);
            yPos += (recLines.length * 5) + 5;

            doc.setFont("times", "italic");
            doc.setTextColor(120, 113, 108);
            const origLines = doc.splitTextToSize(`"${clause.originalText}"`, maxLineWidth - 10);
            doc.text(origLines, margin + 5, yPos);
            yPos += (origLines.length * 5) + 15;
          });
        }

        doc.save("legalis-risk-report.pdf");
      } catch (err) {
        console.error("PDF generation failed", err);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 100);
  };

  const canShare = result.input?.mode === 'url';

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-stone-50 animate-fade-in">
      
      {/* Sticky Header - Responsive */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 p-3 md:p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={onReset} className="group flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              <div className="p-1.5 rounded-full bg-white group-hover:bg-stone-100 shadow-sm border border-stone-100 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                 </svg>
              </div>
              <span className="hidden md:inline">Back</span>
            </button>

            <div className="flex items-center gap-2 md:gap-3">
               <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 rounded-lg text-xs font-semibold bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-all shadow-sm"
                >
                   {isGeneratingPdf ? <div className="animate-spin w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full" /> : (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                     </svg>
                   )}
                   <span className="hidden md:inline">Export PDF</span>
                </button>
                {canShare && (
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-black transition-all shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
                  </button>
                )}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
          
          {/* Executive Summary Card - Responsive Layout */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 border border-white/60 animate-fade-in-up">
             
             <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">
                <div className="flex-1 space-y-4 md:space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                         </svg>
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900">Analysis Summary</h2>
                        <p className="text-[10px] md:text-xs font-medium text-stone-400 uppercase tracking-widest">AI Audit Report</p>
                      </div>
                   </div>
                   
                   <p className="text-base md:text-lg text-stone-700 leading-relaxed font-light border-l-2 border-stone-200 pl-4 md:pl-6">
                      {result.summary}
                   </p>
                   
                   {/* Sources List */}
                   {result.sources && result.sources.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Sources</h4>
                        <div className="flex flex-wrap gap-2">
                           {result.sources.map((src, i) => {
                             let hostname = src;
                             try { hostname = new URL(src).hostname; } catch(e){}
                             return (
                               <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-stone-500 text-[10px] md:text-xs hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm">
                                 {hostname}
                               </a>
                             )
                           })}
                        </div>
                      </div>
                   )}
                </div>

                {/* Score Panel */}
                <div className="w-full lg:w-72 flex-shrink-0">
                   <div className="bg-white/50 rounded-2xl p-6 border border-white/60 text-center shadow-sm">
                      <div className="w-32 h-32 md:w-32 md:h-32 mx-auto mb-4 relative">
                         <RiskMeter score={result.overallRiskScore} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Verdict</div>
                        <div className={`text-xl font-serif font-bold ${result.overallRiskScore > 70 ? 'text-rose-600' : result.overallRiskScore > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {result.verdict}
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Impact Grid */}
          {result.specificRisks && (
            <div className="animate-fade-in-up delay-100">
               <h3 className="text-lg font-serif font-bold text-stone-800 mb-4 md:mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-sans font-bold">1</span>
                  Risk Impact Assessment
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Rights & Privacy", icon: "👤", color: "bg-indigo-50/40 border-indigo-100 text-indigo-900", text: result.specificRisks.human },
                    { title: "Money & Costs", icon: "💰", color: "bg-emerald-50/40 border-emerald-100 text-emerald-900", text: result.specificRisks.financial },
                    { title: "Data Safety", icon: "🔒", color: "bg-sky-50/40 border-sky-100 text-sky-900", text: result.specificRisks.cyber },
                    { title: "Peace of Mind", icon: "🧠", color: "bg-rose-50/40 border-rose-100 text-rose-900", text: result.specificRisks.mental }
                  ].map((item, i) => (
                    <div key={i} className={`p-5 md:p-6 rounded-2xl border ${item.color} backdrop-blur-sm shadow-sm transition-all hover:shadow-md`}>
                       <div className="flex items-center gap-3 mb-3 md:block md:mb-3">
                           <div className="text-xl">{item.icon}</div>
                           <h4 className="font-bold text-xs uppercase tracking-wide opacity-70 md:mt-2">{item.title}</h4>
                       </div>
                       <p className="text-sm font-medium leading-relaxed opacity-90">{item.text}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Detailed Clauses */}
          <div className="animate-fade-in-up delay-200">
            <h3 className="text-lg font-serif font-bold text-stone-800 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-sans font-bold">2</span>
              Flagged Clauses ({result.clauses.length})
            </h3>
            
            <div className="space-y-4">
              {result.clauses.map((clause, index) => (
                <div key={index} className={`group bg-white/80 backdrop-blur-sm rounded-xl p-5 md:p-6 border transition-all duration-300 hover:shadow-lg ${getSeverityColor(clause.severity)}`}>
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Clause Content */}
                    <div className="flex-1 space-y-3">
                       <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(clause.severity)}`}>
                            {clause.severity}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">
                            {clause.category}
                          </span>
                       </div>
                       
                       <div>
                          <p className="text-sm md:text-base font-medium text-stone-900 mb-3">
                             {clause.simplifiedExplanation}
                          </p>
                          <div className="flex gap-2 bg-white/50 p-3 rounded-lg border border-black/5">
                             <div className="mt-0.5 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-stone-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625v-8.19a2.25 2.25 0 00-2.742-2.219l-7.202 1.44a2.25 2.25 0 00-1.785 2.218V18m20.25-1.312l-5.636 1.127a2.25 2.25 0 01-2.583-1.631l-1.868-6.54a2.25 2.25 0 012.37-2.859l6.512 1.302c.866.173 1.201 1.22.656 1.84l-3.456 4.032z" />
                                </svg>
                             </div>
                             <p className="text-xs md:text-sm text-stone-600">
                               <span className="font-semibold text-stone-800">Recommendation:</span> {clause.recommendation}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Original Text Sidebar - Hidden on mobile, toggleable or just at bottom */}
                    <div className="lg:w-1/3 flex-shrink-0">
                       <div className="h-full bg-stone-50/50 rounded-lg p-3 md:p-4 border border-stone-100 text-[10px] md:text-xs font-mono text-stone-500 leading-relaxed overflow-hidden relative">
                          <div className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mb-2 select-none">Original Clause</div>
                          <div className="italic opacity-80 line-clamp-6 lg:line-clamp-none">"{clause.originalText}"</div>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.clauses.length === 0 && (
               <div className="text-center py-12 md:py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-stone-300">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-500">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">No Major Risks Found</h3>
                  <p className="text-sm text-stone-500 mt-1">AI scan complete. No high-risk clauses detected.</p>
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisView;