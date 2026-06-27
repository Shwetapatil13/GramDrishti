import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-canvas-black border-t border-surface-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center gap-2 md:gap-3 mb-4">
            <h2 className="text-heading-lg text-text-primary tracking-tight text-xl">GRAMDRISHTI</h2>
          </div>
          <p className="text-body text-text-secondary max-w-md">
            {t('footer.description', 'AI-powered Climate Intelligence Platform for Indian villages.')}
          </p>
        </div>

        <div className="pt-8 border-t border-surface-border flex items-center justify-between">
          <p className="text-mono text-text-muted text-xs">
            {t('footer.copyright', '© {{year}} GramDrishti. All rights reserved.', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};