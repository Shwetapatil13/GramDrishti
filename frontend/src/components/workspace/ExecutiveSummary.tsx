import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useScores } from '@/hooks/useScores';
import { ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export const ExecutiveSummary: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data: scoreData, isLoading } = useScores(selectedVillage?.id, selectedYear);

  if (isLoading) {
    return (
      <div className="w-full bg-surface-slate border border-surface-border rounded-2xl p-6 mb-8 h-[200px]">
        <Skeleton borderRadius="16px" />
      </div>
    );
  }

  const score = scoreData?.overall ?? scoreData?.totalScore ?? 85; // Fallback for UI if no data
  const isHealthy = score >= 75;

  return (
    <div className="w-full bg-surface-slate border border-surface-border rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-all duration-1000 group-hover:opacity-20 ${isHealthy ? 'bg-brand-mint' : 'bg-amber-500'}`} />

      {/* Score Circle */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center relative">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r="56" className="stroke-surface-border" strokeWidth="8" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="56"
            className={`stroke-current ${isHealthy ? 'text-brand-mint' : 'text-amber-500'}`}
            strokeWidth="8"
            fill="none"
            strokeDasharray="351.86"
            strokeDashoffset={351.86 - (351.86 * score) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono tracking-tighter text-text-primary">{score}</span>
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Health</span>
        </div>
      </div>

      {/* Summary Content */}
      <div className="flex-1 z-10">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl font-bold text-text-primary">Executive Summary</h2>
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {isHealthy ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {isHealthy ? 'EXCELLENT CONDITION' : 'ATTENTION REQUIRED'}
          </span>
        </div>
        
        <p className="text-body text-text-secondary leading-relaxed mb-4">
          <strong className="text-text-primary">{selectedVillage?.name}</strong> is currently in excellent environmental condition. 
          Vegetation health remains <span className="text-emerald-400 font-medium">above historical average</span>. 
          Surface water has declined slightly since last season, but remains within safe margins. 
          Western watershed shows moderate moisture stress. No major environmental risks detected.
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            High Confidence (94%)
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Stable Trend
          </div>
        </div>
      </div>
    </div>
  );
};
