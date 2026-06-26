import React from 'react';
import { VillageHealthScore } from '@/types';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface ScoreBreakdownProps {
  score?: VillageHealthScore;
  isLoading: boolean;
}

const COMPONENT_CONFIG = [
  { key: 'water',      label: 'WATER SECURITY',     color: '#3B82F6' },
  { key: 'vegetation', label: 'VEGETATION HEALTH',  color: '#10B981' },
  { key: 'climate',    label: 'CLIMATE STABILITY',  color: '#F59E0B' },
  { key: 'flood',      label: 'FLOOD PREPAREDNESS', color: '#06B6D4' },
  { key: 'land',       label: 'LAND SUSTAINABILITY', color: '#84CC16' },
] as const;

const scoreColor = (v: number) => {
  if (v >= 80) return '#10B981';
  if (v >= 60) return '#84CC16';
  if (v >= 40) return '#F59E0B';
  return '#EF4444';
};

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4">
        {COMPONENT_CONFIG.map(c => (
          <div key={c.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <div className="h-2 w-24 bg-surface-border rounded animate-pulse" />
              <div className="h-2 w-8 bg-surface-border rounded animate-pulse" />
            </div>
            <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full w-1/2 rounded-full animate-pulse" style={{ backgroundColor: c.color + '60' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!score) {
    return (
      <div className="w-full flex flex-col gap-4">
        {COMPONENT_CONFIG.map(c => (
          <div key={c.key} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-mono text-text-secondary text-[10px]">{c.label}</span>
              <span className="text-mono text-text-muted text-[10px]">—</span>
            </div>
            <div className="h-1.5 w-full bg-surface-border rounded-full" />
          </div>
        ))}
        <p className="text-body text-text-muted text-xs text-center mt-1">Score data pending</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {COMPONENT_CONFIG.map(cfg => {
        const detail = score[cfg.key];
        const value  = detail.score;
        const color  = scoreColor(value);

        return (
          <div key={cfg.key} className="flex flex-col gap-1.5 group">
            <div className="flex justify-between items-center">
              <span className="text-mono text-text-secondary text-[10px] tracking-wide">{cfg.label}</span>
              <div className="flex items-center gap-1">
                <span className="text-mono text-[10px] font-semibold" style={{ color }}>{value.toFixed(0)}</span>
                {detail.trend === 'improving' && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                {detail.trend === 'declining' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                {detail.trend === 'stable'    && <ArrowRight    className="w-3 h-3 text-text-muted" />}
              </div>
            </div>

            {/* Progress bar with glow */}
            <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${value}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}80`,
                }}
              />
            </div>

            {/* Explanation text */}
            {detail.explanation && (
              <p className="text-body text-text-secondary text-[11px] leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-0.5 line-clamp-2">
                {detail.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};