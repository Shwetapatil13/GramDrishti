import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'neutral';
  colorType?: 'vegetation' | 'water' | 'climate';
  isLoading?: boolean;
  hasError?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, unit, trend = 'neutral', colorType = 'vegetation', isLoading, hasError 
}) => {
  const borderColors = {
    vegetation: 'border-l-[#166534]', // green
    water: 'border-l-[#3860be]', // blue
    climate: 'border-l-[#f59e0b]' // amber
  };

  if (isLoading) {
    return (
      <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[100px]">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-surface-slate border border-surface-border ${borderColors[colorType]} border-l-4 rounded-xl p-4 h-[100px] flex items-center justify-center`}>
        <span className="text-body text-text-muted">Metric unavailable</span>
      </div>
    );
  }

  return (
    <div className={`bg-surface-slate border border-surface-border ${borderColors[colorType]} border-l-[3px] rounded-xl p-4 flex flex-col justify-between h-[100px]`}>
      <div className="text-mono text-text-secondary">{title}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-heading-lg text-text-primary">{value}</span>
        <span className="text-mono text-text-secondary">{unit}</span>
        
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-semantic-success ml-auto" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-semantic-danger ml-auto" />}
        {trend === 'neutral' && <ArrowRight className="w-4 h-4 text-text-muted ml-auto" />}
      </div>
    </div>
  );
};

import { EnvironmentalMetrics } from '@/types';

interface MetricsPanelProps {
  data?: EnvironmentalMetrics;
  isLoading: boolean;
  error?: Error | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ data, isLoading, error }) => {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-mono text-text-primary mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
          ENVIRONMENTAL METRICS
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard title="NDVI HEALTH" value={data?.ndvi?.toFixed(2) || '0.00'} unit="" colorType="vegetation" isLoading={isLoading} hasError={hasError} trend="neutral" />
          <MetricCard title="NDWI MOISTURE" value={data?.ndwi?.toFixed(2) || '0.00'} unit="" colorType="water" isLoading={isLoading} hasError={hasError} trend="neutral" />
          <MetricCard title="SURFACE WATER" value={data?.waterAreaHa?.toFixed(1) || '0.0'} unit="HA" colorType="water" isLoading={isLoading} hasError={hasError} trend="neutral" />
          <MetricCard title="GREEN COVER" value={data?.greenCoverPercent?.toFixed(1) || '0.0'} unit="%" colorType="vegetation" isLoading={isLoading} hasError={hasError} trend="neutral" />
        </div>
      </div>

      <div>
        <h3 className="text-mono text-text-primary mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
          CLIMATE & WEATHER
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard title="TEMPERATURE" value={data?.temperature?.toFixed(1) || '--'} unit="°C" colorType="climate" isLoading={isLoading} hasError={hasError} trend="neutral" />
          <MetricCard title="RAINFALL" value={data?.rainfall?.toFixed(1) || '--'} unit="MM" colorType="climate" isLoading={isLoading} hasError={hasError} trend="neutral" />
          <MetricCard title="HUMIDITY" value={data?.humidity?.toFixed(0) || '--'} unit="%" colorType="climate" isLoading={isLoading} hasError={hasError} trend="neutral" />
          <MetricCard title="WIND SPEED" value={data?.windSpeed?.toFixed(1) || '--'} unit="KM/H" colorType="climate" isLoading={isLoading} hasError={hasError} trend="neutral" />
        </div>
      </div>
    </div>
  );
};