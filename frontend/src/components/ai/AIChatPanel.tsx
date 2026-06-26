import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useAIChat } from '@/hooks/useAIChat';
import { SuggestedQuestions } from './SuggestedQuestions';

export const AIChatPanel: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { messages, isLoading, sendMessage } = useAIChat(selectedVillage?.id, selectedYear);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        <h3 className="text-mono text-text-primary text-sm">GRAMDRISHTI AI</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-center">
            <span className="text-body text-text-muted">
              Ask GramDrishti AI about {selectedVillage?.name}'s environmental health.
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 text-body ${
                msg.role === 'user' 
                  ? 'bg-surface-border text-text-primary rounded-[16px_16px_4px_16px] text-right' 
                  : 'bg-transparent border border-brand-console text-text-primary rounded-[16px_16px_16px_4px]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] p-4 bg-transparent border border-brand-console rounded-[16px_16px_16px_4px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-brand-mint rounded-full animate-bounce"></span>
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
            placeholder="Ask a question..."
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