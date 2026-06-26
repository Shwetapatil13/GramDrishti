import React, { useState } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { selectedVillage, selectedYear, setSelectedYear } = useVillageSelection();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const years = [2026, 2025, 2024, 2023, 2022];

  return (
    <header className="h-[56px] bg-canvas-black border-b border-surface-border flex items-center justify-between px-4 md:px-6 shrink-0 relative z-[500]">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button className="md:hidden text-text-primary p-1 -ml-1" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-baseline gap-2 md:gap-3">
          <h1 className="text-heading-lg text-text-primary tracking-tight text-lg md:text-2xl">GRAMDRISHTI</h1>
          <span className="text-brand-mint text-xs md:text-sm font-medium">ग्रामदृष्टि</span>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center">
        <span className="text-body text-text-secondary">
          {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : 'Select a village'}
        </span>
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={toggleTheme}
          className="text-text-muted hover:text-brand-mint transition-colors p-1"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

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