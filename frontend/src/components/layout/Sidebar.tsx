import React from 'react';
import { X } from 'lucide-react';
import { AIChatPanel } from '../ai/AIChatPanel';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const sidebarClasses = `
    w-[320px] bg-canvas-black border-r border-surface-border flex flex-col h-full shrink-0
    absolute md:relative z-[600] md:z-auto transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[550] md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={sidebarClasses}>
        {onClose && (
          <div className="flex justify-between items-center md:hidden p-4 border-b border-surface-border">
            <span className="text-mono text-text-primary">{t('nav.ai_assistant', 'GRAMDRISHTI AI')}</span>
            <button onClick={onClose} className="text-text-muted"><X className="w-5 h-5"/></button>
          </div>
        )}
        
        {/* Fill the entire sidebar with the AI Chat Panel */}
        <div className="flex-1 h-full w-full overflow-hidden">
          <AIChatPanel />
        </div>
      </aside>
    </>
  );
};