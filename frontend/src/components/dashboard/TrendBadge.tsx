import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface TrendBadgeProps {
  trend: 'improving' | 'stable' | 'declining';
  className?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ trend, className = '' }) => {
  let colorClass = 'bg-surface-border text-text-muted'; // stable
  let Icon = ArrowRight;

  if (trend === 'improving') {
    colorClass = 'bg-semantic-success/20 text-semantic-success'; // mint/green
    Icon = ArrowUpRight;
  } else if (trend === 'declining') {
    colorClass = 'bg-semantic-danger/20 text-semantic-danger'; // red
    Icon = ArrowDownRight;
  }

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-tag text-mono text-xs uppercase ${colorClass} ${className}`}>
      {trend} <Icon className="w-3 h-3" />
    </div>
  );
};