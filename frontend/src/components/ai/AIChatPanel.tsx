import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useAIChat } from '@/hooks/useAIChat';
import { SuggestedQuestions } from './SuggestedQuestions';
import { useTranslation } from 'react-i18next';
import { MessageCard } from './MessageCard';

export const AIChatPanel: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { messages, isLoading, loadingStatus, sendMessage } = useAIChat(selectedVillage?.id, selectedYear);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-canvas-black overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-surface-border flex items-center gap-2 bg-surface-elevated">
        <div className="w-2 h-2 rounded-full bg-brand-mint"></div>
        <h3 className="text-mono text-text-primary text-sm">{t('chat.title', 'GRAMDRISHTI AI')}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-center">
            <span className="text-body text-text-muted">
              {t('chat.empty_state', "Ask GramDrishti AI about {{villageName}}'s environmental health.", { villageName: selectedVillage?.name })}
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <MessageCard key={msg.id} message={msg} onFollowUpClick={sendMessage} />
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] p-4 bg-transparent border border-brand-console rounded-[16px_16px_16px_4px] flex flex-col items-start gap-2">
              <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce"></span>
              </div>
              {loadingStatus && (
                <span className="text-xs text-brand-mint font-mono uppercase tracking-widest animate-pulse">
                  {loadingStatus}...
                </span>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-surface-border bg-surface-elevated">
        {messages.length === 0 && <SuggestedQuestions onSelect={sendMessage} />}
        
        <form onSubmit={handleSubmit} className="mt-3 relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('chat.placeholder', 'Ask a question...')}
            disabled={isLoading}
            className="w-full bg-canvas-black border border-surface-border rounded-button py-3 pl-4 pr-12 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 text-text-secondary hover:text-brand-mint disabled:opacity-50 disabled:hover:text-text-secondary transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};