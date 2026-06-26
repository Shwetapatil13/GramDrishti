import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-[56px] bg-canvas-black border-b border-surface-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-baseline gap-3">
        <h1 className="text-heading-lg text-text-primary tracking-tight">GRAMDRISHTI</h1>
        <span className="text-brand-mint text-sm font-medium">ग्रामदृष्टि</span>
      </div>
      
      <div className="flex-1 flex justify-center">
        <span className="text-body text-text-secondary">Select a village</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Placeholder for year selector and settings */}
        <div className="text-mono text-text-muted cursor-pointer hover:text-brand-mint transition-colors">
          2024 ▼
        </div>
      </div>
    </header>
  );
};