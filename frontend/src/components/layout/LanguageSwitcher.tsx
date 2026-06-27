import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', symbol: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', symbol: '🇮🇳' },
  { code: 'mr', label: 'मराठी', symbol: '🇮🇳' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.resolvedLanguage) || LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
      >
        <Languages className="w-5 h-5" />
        <span className="text-sm font-medium">{currentLang.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-surface-elevated border border-surface-border rounded-xl shadow-xl overflow-hidden min-w-[120px] z-[500]">
          <div className="flex flex-col">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left
                  ${i18n.resolvedLanguage === lang.code 
                    ? 'bg-brand-mint/10 text-brand-mint font-medium' 
                    : 'text-text-primary hover:bg-surface-slate'
                  }
                `}
              >
                <span>{lang.label}</span>
                {i18n.resolvedLanguage === lang.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-mint"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
