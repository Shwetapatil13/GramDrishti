import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-canvas-black">
      {/* Left Side - Brand & Mission */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-surface-slate overflow-hidden border-r border-surface-border flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-brand-violet/10 to-brand-mint/10 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 inline-block">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            <h1 className="text-heading-lg text-text-primary tracking-tight text-3xl pt-1">GRAMDRISHTI</h1>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mt-auto">
          <img src="/logo.png" alt="GramDrishti Logo Large" className="h-48 md:h-72 w-auto object-contain mb-8 opacity-90 drop-shadow-xl" />
          <h2 className="text-display text-text-primary text-4xl mb-6">
            Empowering Rural India with Climate Intelligence.
          </h2>
          <p className="text-body text-text-secondary text-lg mb-8">
            Access real-time satellite data, predictive environmental analytics, and AI-driven recommendations for any village.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-body text-text-primary">
              <div className="w-6 h-6 rounded-full bg-brand-mint/20 border border-brand-mint/50 flex items-center justify-center shrink-0">✓</div>
              <span>Google Earth Engine Integration</span>
            </div>
            <div className="flex items-center gap-3 text-body text-text-primary">
              <div className="w-6 h-6 rounded-full bg-brand-mint/20 border border-brand-mint/50 flex items-center justify-center shrink-0">✓</div>
              <span>AI-Powered Recommendations</span>
            </div>
            <div className="flex items-center gap-3 text-body text-text-primary">
              <div className="w-6 h-6 rounded-full bg-brand-mint/20 border border-brand-mint/50 flex items-center justify-center shrink-0">✓</div>
              <span>Instant PDF Report Generation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-12 relative">
        <Link to="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
           <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
           <h1 className="text-heading-lg text-text-primary tracking-tight text-xl pt-0.5">GRAMDRISHTI</h1>
        </Link>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};