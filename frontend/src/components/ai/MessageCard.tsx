import React from 'react';
import { ChatMessage } from '@/hooks/useAIChat';
import { DynamicChart } from './DynamicChart';
import { ActionPanel } from './ActionPanel';
import { FollowUpChips } from './FollowUpChips';
import { motion } from 'framer-motion';
import { Info, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Database } from 'lucide-react';

interface Props {
  message: ChatMessage;
  onFollowUpClick: (q: string) => void;
}

export const MessageCard: React.FC<Props> = ({ message, onFollowUpClick }) => {
  if (message.role === 'user') {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[85%] p-3 text-body bg-surface-border text-text-primary rounded-[16px_16px_4px_16px] text-right">
          {message.content}
        </div>
      </div>
    );
  }

  const { structuredData, followUpQuestions, content } = message;

  // Extract all metrics and charts from processor outputs
  const allMetrics: {name: string, value: string|number, unit: string, source: string}[] = [];
  const allCharts: any[] = [];
  const allActions: any[] = [];
  const allRecs: {title: string, reason: string}[] = [];

  if (structuredData?.processor_insights) {
    Object.values(structuredData.processor_insights).forEach((domain: any) => {
      if (domain.metrics) allMetrics.push(...domain.metrics);
      if (domain.charts) allCharts.push(...domain.charts);
      if (domain.actions) allActions.push(...domain.actions);
      if (domain.recommendations) allRecs.push(...domain.recommendations);
    });
  }

  return (
    <div className="flex w-full justify-start">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[95%] p-4 bg-transparent border border-brand-console text-text-primary rounded-[16px_16px_16px_4px] flex flex-col gap-4"
      >
        {/* Answer Summary */}
        <div className="text-body leading-relaxed">
          {(() => {
            if (!content) return null;
            const lines = content.split('\n');
            return lines.map((line, i) => {
              if (line.trim() === '') return <div key={i} className="h-2"></div>;
              
              if (line.trim().startsWith('### ')) {
                const headingText = line.trim().replace(/^###\s+/, '');
                return <div key={i} className="text-sm font-bold text-brand-mint mt-4 mb-2 uppercase tracking-wider">{headingText}</div>;
              }
              
              const parts = line.split(/(\*\*.*?\*\*)/g);
              const isListItem = line.trim().startsWith('-') || line.trim().startsWith('*');
              const isIndented = line.startsWith('  ') || line.startsWith('\t');
              const indentClass = isIndented ? 'ml-6' : (isListItem ? 'ml-2' : '');

              return (
                <div key={i} className={`mb-1 leading-relaxed ${indentClass}`}>
                  {parts.map((part, k) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={k} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={k}>{part}</span>;
                  })}
                </div>
              );
            });
          })()}
        </div>

        {/* Metric Cards */}
        {allMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {allMetrics.map((m, idx) => (
              <div key={idx} className="p-3 bg-surface-elevated rounded-md border border-surface-border flex flex-col group relative">
                <span className="text-xs text-text-secondary uppercase tracking-wider">{m.name}</span>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-lg font-mono text-brand-mint">{m.value}</span>
                  <span className="text-xs text-text-muted mb-1">{m.unit}</span>
                </div>
                {/* Tooltip for source */}
                <div className="absolute top-[-30px] left-0 bg-canvas-black border border-surface-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 flex items-center gap-1">
                    <Database className="w-3 h-3 text-brand-mint"/> {m.source}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        {allCharts.length > 0 && (
          <div className="mt-2 flex flex-col gap-3">
             {allCharts.map((chart, idx) => (
                 <DynamicChart key={idx} config={chart} />
             ))}
          </div>
        )}

        {/* Recommendations */}
        {allRecs.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
             <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Recommendations</span>
             {allRecs.map((rec, idx) => (
                 <div key={idx} className="p-3 rounded-md bg-canvas-black border-l-2 border-brand-accent flex gap-2">
                     <AlertTriangle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                     <div>
                        <div className="text-sm font-medium">{rec.title}</div>
                        <div className="text-xs text-text-muted mt-1">{rec.reason}</div>
                     </div>
                 </div>
             ))}
          </div>
        )}

        {/* Action Panel */}
        {allActions.length > 0 && (
            <ActionPanel actions={allActions} />
        )}

        {/* Follow Up Questions */}
        {followUpQuestions && followUpQuestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-surface-border">
                <FollowUpChips questions={followUpQuestions} onClick={onFollowUpClick} />
            </div>
        )}
      </motion.div>
    </div>
  );
};
