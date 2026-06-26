import React from 'react';
import { VillageHealthScore } from '@/types';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface ScoreBreakdownProps {
  score?: VillageHealthScore;
  isLoading: boolean;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10">
            <Skeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!score) {
    return (
      <div className="w-full flex items-center justify-center h-full">
        <span className="text-body text-text-muted">Breakdown unavailable</span>
      </div>
    );
  }

  const components = [
    { name: 'WATER SECURITY', detail: score.water },
    { name: 'VEGETATION HEALTH', detail: score.vegetation },
    { name: 'CLIMATE STABILITY', detail: score.climate },
    { name: 'FLOOD PREPAREDNESS', detail: score.flood },
    { name: 'LAND SUSTAINABILITY', detail: score.land },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      {components.map((comp) => {
        const value = comp.detail.score;
        let color = 'var(--semantic-danger)'; // poor
        if (value >= 80) color = 'var(--score-excellent)'; // excellent
        else if (value >= 60) color = 'var(--score-good)'; // good
        else if (value >= 40) color = 'var(--score-medium)'; // medium

        return (
          <div key={comp.name} className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-end">
              <span className="text-mono text-text-secondary text-[10px]">{comp.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-mono text-text-primary text-[10px]">{value.toFixed(0)}</span>
                {comp.detail.trend === 'improving' && <ArrowUpRight className="w-3 h-3 text-semantic-success" />}
                {comp.detail.trend === 'declining' && <ArrowDownRight className="w-3 h-3 text-semantic-danger" />}
                {comp.detail.trend === 'stable' && <ArrowRight className="w-3 h-3 text-text-muted" />}
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${value}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-body text-text-secondary text-[13px] mt-1 leading-snug">
              {comp.detail.explanation}
            </p>
          </div>
        );
      })}
    </div>
  );
};