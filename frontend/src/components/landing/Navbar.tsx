import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const LandingNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-canvas-black/80 backdrop-blur-md border-b border-surface-border py-3 shadow-sm' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/logo.png" alt="Logo" className="h-6 md:h-8 w-auto object-contain" />
          <h1 className="text-heading-lg text-text-primary tracking-tight text-xl md:text-2xl pt-1">GRAMDRISHTI</h1>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-body text-text-secondary hover:text-text-primary transition-colors">{t('landing.features', 'Core Capabilities')}</a>
          <a href="#technology" className="text-body text-text-secondary hover:text-text-primary transition-colors">{t('landing.technology', 'Technology')}</a>
          <a href="#how-it-works" className="text-body text-text-secondary hover:text-text-primary transition-colors">{t('landing.howItWorks', 'How It Works')}</a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button 
            onClick={toggleTheme}
            className="text-text-muted hover:text-brand-mint transition-colors p-2 rounded-full hover:bg-surface-elevated"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth" className="text-body text-text-secondary hover:text-text-primary transition-colors px-4 py-2">
              {t('landing.login', 'Login')}
            </Link>
            <Link to="/auth?mode=signup" className="bg-text-primary text-canvas-black px-5 py-2.5 rounded-button font-mono text-xs uppercase tracking-wider hover:bg-brand-mint transition-colors">
              {t('landing.getStarted', 'Get Started')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};