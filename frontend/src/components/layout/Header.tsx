import React, { useState } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';

export const Header: React.FC = () => {
  const { selectedVillage, selectedYear, setSelectedYear } = useVillageSelection();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const years = [2026, 2025, 2024, 2023, 2022];

  return (
    <header className="h-[56px] bg-canvas-black border-b border-surface-border flex items-center justify-between px-6 shrink-0 relative z-[500]">
      <div className="flex items-baseline gap-3">
        <h1 className="text-heading-lg text-text-primary tracking-tight">GRAMDRISHTI</h1>
        <span className="text-brand-mint text-sm font-medium">ग्रामदृष्टि</span>
      </div>
      
      <div className="flex-1 flex justify-center">
        <span className="text-body text-text-secondary">
          {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : 'Select a village'}
        </span>
      </div>

      <div className="flex items-center gap-4 relative">
        <div 
          className="text-mono text-text-muted cursor-pointer hover:text-brand-mint transition-colors flex items-center gap-1 bg-surface-slate px-3 py-1.5 rounded-tag border border-surface-border"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {selectedYear} <span className="text-[10px]">▼</span>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 bg-surface-slate border border-surface-border rounded-xl shadow-lg overflow-hidden py-1 w-24">
            {years.map(year => (
              <div 
                key={year}
                className={`px-4 py-2 text-mono text-sm cursor-pointer hover:bg-surface-elevated transition-colors ${selectedYear === year ? 'text-brand-mint font-bold bg-surface-elevated' : 'text-text-primary'}`}
                onClick={() => {
                  setSelectedYear(year);
                  setIsDropdownOpen(false);
                }}
              >
                {year}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};