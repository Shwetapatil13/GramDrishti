import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { selectedVillage } = useVillageSelection();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="h-[56px] bg-canvas-black border-b border-surface-border flex items-center justify-between px-4 md:px-6 shrink-0 relative z-[500]">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button className="md:hidden text-text-primary p-1 -ml-1" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain" />
          <h1 className="text-heading-lg text-text-primary tracking-tight text-lg md:text-2xl pt-1">GRAMDRISHTI</h1>
        </div>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center">
        <span className="text-body text-text-secondary">
          {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : t('header.select_village', 'Select a village')}
        </span>
      </div>

      <div className="flex items-center gap-4 relative">
        <LanguageSwitcher />

        <button 
          onClick={toggleTheme}
          className="text-text-muted hover:text-brand-mint transition-colors p-1"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};