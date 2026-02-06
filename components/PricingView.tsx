import React from 'react';

interface PricingViewProps {
  onGetStarted: () => void;
}

const PricingView: React.FC<PricingViewProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 md:px-6 animate-fade-in-up">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600">Limited Time Offer</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-6 tracking-tight">
          Simple, Transparent Pricing.
        </h2>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
          Start identifying contract risks today. No credit card required for the trial.
        </p>
      </div>

      {/* Free Trial Banner */}
      <div className="relative mb-16 group cursor-default">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-stone-900 rounded-[1.8rem] p-8 md:p-12 overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-4 z-10">
              <h3 className="text-3xl font-serif font-bold text-white">First 2 Months Completely Free</h3>
              <p className="text-stone-300 max-w-xl text-lg">
                Experience the full power of Legalis AI. Unlimited scanning, unlimited analysis, and detailed PDF reports. on us.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <span>No commitment required</span>
              </div>
           </div>
           <div className="flex-shrink-0 z-10">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-stone-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Claim Free Access
              </button>
           </div>
           
           {/* Decorative bg elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Standard Plan */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-stone-200 hover:border-stone-300 hover:shadow-xl transition-all duration-300 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-stone-900">Standard</h3>
            <p className="text-sm text-stone-500 mt-2">Perfect for individuals & freelancers.</p>
          </div>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-stone-900">₹100</span>
            <span className="text-stone-500">/month</span>
          </div>
          <div className="flex-1 space-y-4 mb-8">
             <FeatureItem text="20 Scans per day" />
             <FeatureItem text="Standard Analysis Speed" />
             <FeatureItem text="Export to PDF" />
             <FeatureItem text="Email Support" />
          </div>
          <button 
            onClick={onGetStarted}
            className="w-full py-3 rounded-xl border border-stone-200 font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            Start Standard
          </button>
          <p className="text-[10px] text-center text-stone-400 mt-4">Billing starts after 2 months</p>
        </div>

        {/* Pro Plan */}
        <div className="relative bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl flex flex-col transform hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-stone-900">Pro Unlimited</h3>
            <p className="text-sm text-stone-500 mt-2">For heavy users & legal teams.</p>
          </div>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-stone-900">₹200</span>
            <span className="text-stone-500">/month</span>
          </div>
          <div className="flex-1 space-y-4 mb-8">
             <FeatureItem text="Unlimited Scans" highlight />
             <FeatureItem text="Priority Processing Speed" />
             <FeatureItem text="Advanced Risk Breakdown" />
             <FeatureItem text="Priority Support" />
             <FeatureItem text="Team Sharing (Coming Soon)" />
          </div>
          <button 
            onClick={onGetStarted}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-black shadow-lg shadow-indigo-500/20 transition-all"
          >
            Start Pro
          </button>
          <p className="text-[10px] text-center text-stone-400 mt-4">Billing starts after 2 months</p>
        </div>

      </div>

      {/* Enterprise Contact Section */}
      <div className="mt-16 md:mt-24">
        <div className="relative bg-stone-900 rounded-[2rem] p-8 md:p-12 overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10 md:gap-8 shadow-2xl shadow-stone-900/10">
           {/* Decor */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

           <div className="relative z-10 space-y-6 max-w-2xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4 backdrop-blur-md">
                   <span className="text-[10px] font-bold tracking-widest uppercase text-white">Enterprise</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
                  Need a custom solution?
                </h3>
                <p className="text-stone-400 text-lg leading-relaxed">
                  For large legal teams requiring API access, Single Sign-On (SSO), on-premise deployment, and custom model fine-tuning.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
                  <div className="flex items-center justify-center md:justify-start gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Email Sales</div>
                        <a href="mailto:sales@legalis.ai" className="text-stone-200 font-medium hover:text-white transition-colors">sales@legalis.ai</a>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Call Us</div>
                        <span className="text-stone-200 font-medium">+1 (888) LEGAL-AI</span>
                    </div>
                  </div>
              </div>
           </div>

           <div className="relative z-10 flex-shrink-0">
              <a 
                href="mailto:sales@legalis.ai?subject=Enterprise%20Inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-stone-900 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl"
              >
                <span>Contact Sales</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
           </div>
        </div>
      </div>
      
      {/* Footer copyright */}
      <div className="mt-16 text-center border-t border-stone-200 pt-8 pb-8">
        <p className="text-stone-400 text-xs">
          © {new Date().getFullYear()} Legalis AI Inc. All rights reserved.
        </p>
      </div>

    </div>
  );
};

const FeatureItem: React.FC<{ text: string; highlight?: boolean }> = ({ text, highlight }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-100 text-stone-500'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
      </svg>
    </div>
    <span className={`text-sm ${highlight ? 'font-semibold text-stone-900' : 'text-stone-600'}`}>{text}</span>
  </div>
);

export default PricingView;