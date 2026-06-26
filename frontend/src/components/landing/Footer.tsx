import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas-black border-t border-surface-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-heading-lg text-text-primary tracking-tight text-xl">GRAMDRISHTI</h2>
              <span className="text-brand-mint text-xs font-medium">ग्रामदृष्टि</span>
            </div>
            <p className="text-body text-text-secondary max-w-sm">
              AI-powered Climate Intelligence Platform for Indian villages. Built for the Build for Good Hackathon 2026.
            </p>
          </div>
          
          <div>
            <h4 className="text-mono text-text-primary mb-4 text-sm">QUICK LINKS</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#features" className="text-body text-text-secondary hover:text-brand-mint transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-body text-text-secondary hover:text-brand-mint transition-colors">How It Works</a></li>
              <li><Link to="/auth" className="text-body text-text-secondary hover:text-brand-mint transition-colors">Dashboard Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-mono text-text-primary mb-4 text-sm">LEGAL</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-body text-text-secondary hover:text-brand-mint transition-colors">Documentation</a></li>
              <li><a href="#" className="text-body text-text-secondary hover:text-brand-mint transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-body text-text-secondary hover:text-brand-mint transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-mono text-text-muted text-xs">
            © {new Date().getFullYear()} GramDrishti. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-text-muted hover:text-text-primary transition-colors">Twitter</a>
            <a href="#" className="text-text-muted hover:text-text-primary transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};