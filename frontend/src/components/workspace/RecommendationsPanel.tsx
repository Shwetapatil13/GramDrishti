import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Skeleton } from '../ui/Skeleton';
import { Lightbulb, Navigation, CalendarClock, Zap } from 'lucide-react';
import { AIRecommendation } from '@/types';

const RecItem: React.FC<{ rec: AIRecommendation }> = ({ rec }) => {
  return (
    <div className="bg-canvas-black border border-surface-border hover:border-surface-border-hover transition-colors rounded-xl p-5 mb-3 cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm text-text-primary group-hover:text-brand-violet transition-colors">{rec.title}</h4>
        <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full border border-surface-border bg-surface-slate text-text-muted uppercase">
          {rec.category}
        </span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-4">{rec.description}</p>
      
      <div className="flex flex-wrap gap-4 text-xs font-mono text-text-muted">
        <div className="flex items-center gap-1.5" title="Impact">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {rec.impact_level.toUpperCase()}
        </div>
        <div className="flex items-center gap-1.5" title="Timeline">
          <CalendarClock className="w-3.5 h-3.5" />
          {rec.timeline}
        </div>
        <div className="flex items-center gap-1.5" title="Location">
          <Navigation className="w-3.5 h-3.5 text-brand-blue" />
          {rec.location_reference}
        </div>
      </div>
    </div>
  );
};

export const RecommendationsPanel: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data, isLoading } = useRecommendations(selectedVillage?.id, selectedYear);

  return (
    <div className="bg-surface-slate border border-surface-border rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
        AI Recommendations
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32"><Skeleton borderRadius="12px" /></div>)}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">No recommendations available.</div>
        ) : (
          data.map((rec, i) => <RecItem key={i} rec={rec} />)
        )}
      </div>
    </div>
  );
};
