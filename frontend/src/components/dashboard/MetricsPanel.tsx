import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Droplets, Leaf, Thermometer, Wind } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { EnvironmentalMetrics } from '@/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'neutral';
  accentColor: string; // tailwind border-l color class
  icon: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, value, unit, trend = 'neutral', accentColor, icon, isLoading, hasError,
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[88px]">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-surface-slate border border-surface-border ${accentColor} border-l-4 rounded-xl p-4 h-[88px] flex items-center justify-center`}>
        <span className="text-body text-text-muted text-xs">Unavailable</span>
      </div>
    );
  }

  return (
    <div className={`bg-surface-slate border border-surface-border ${accentColor} border-l-[3px] rounded-xl p-3 flex flex-col justify-between h-[88px] group hover:border-opacity-100 transition-all`}>
      <div className="flex justify-between items-center">
        <span className="text-mono text-text-secondary text-[9px] tracking-widest">{title}</span>
        <span className="text-text-muted opacity-50 group-hover:opacity-80 transition-opacity">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-text-primary font-bold" style={{ fontSize: '22px', lineHeight: 1 }}>{value}</span>
        <span className="text-mono text-text-secondary text-[10px]">{unit}</span>
        <span className="ml-auto">
          {trend === 'up'      && <ArrowUpRight   className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === 'down'    && <ArrowDownRight  className="w-3.5 h-3.5 text-red-400" />}
          {trend === 'neutral' && <ArrowRight      className="w-3.5 h-3.5 text-text-muted" />}
        </span>
      </div>
    </div>
  );
};

interface MetricsPanelProps {
  data?: EnvironmentalMetrics;
  isLoading: boolean;
  error?: Error | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = React.memo(({ data, isLoading, error }) => {
  const hasError = !!error;

  // Derive trend directions from actual data values
  const ndviTrend   = !data ? 'neutral' : data.ndvi >= 0.5 ? 'up' : data.ndvi < 0.2 ? 'down' : 'neutral';
  const ndwiTrend   = !data ? 'neutral' : data.ndwi >= 0   ? 'up' : 'down';
  const waterTrend  = !data ? 'neutral' : data.waterAreaHa > 0 ? 'up' : 'neutral';
  const greenTrend  = !data ? 'neutral' : data.greenCoverPercent >= 40 ? 'up' : data.greenCoverPercent < 20 ? 'down' : 'neutral';
  const tempTrend   = !data ? 'neutral' : data.temperature > 35 ? 'down' : data.temperature < 20 ? 'neutral' : 'up';
  const rainTrend   = !data ? 'neutral' : data.rainfall > 1000 ? 'up' : data.rainfall < 400 ? 'down' : 'neutral';

  return (
    <div className="flex flex-col gap-5">
      {/* Vegetation & Water section */}
      <div>
        <h3 className="text-mono text-text-primary mb-3 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ENVIRONMENTAL METRICS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="NDVI HEALTH"
            value={data?.ndvi?.toFixed(2) ?? '—'}
            unit=""
            accentColor="border-l-emerald-500"
            icon={<Leaf className="w-3.5 h-3.5" />}
            trend={ndviTrend as 'up' | 'down' | 'neutral'}
            isLoading={isLoading}
            hasError={hasError}
          />
          <MetricCard
            title="NDWI MOISTURE"
            value={data?.ndwi?.toFixed(2) ?? '—'}
            unit=""
            accentColor="border-l-blue-500"
            icon={<Droplets className="w-3.5 h-3.5" />}
            trend={ndwiTrend as 'up' | 'down' | 'neutral'}
            isLoading={isLoading}
            hasError={hasError}
          />
          <MetricCard
            title="SURFACE WATER"
            value={data?.waterAreaHa?.toFixed(1) ?? '—'}
            unit="HA"
            accentColor="border-l-blue-400"
            icon={<Droplets className="w-3.5 h-3.5" />}
            trend={waterTrend as 'up' | 'down' | 'neutral'}
            isLoading={isLoading}
            hasError={hasError}
          />
          <MetricCard
            title="GREEN COVER"
            value={data?.greenCoverPercent?.toFixed(1) ?? '—'}
            unit="%"
            accentColor="border-l-lime-500"
            icon={<Leaf className="w-3.5 h-3.5" />}
            trend={greenTrend as 'up' | 'down' | 'neutral'}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
      </div>

      {/* Climate section */}
      <div>
        <h3 className="text-mono text-text-primary mb-3 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          CLIMATE &amp; WEATHER
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="TEMPERATURE"
            value={data?.temperature?.toFixed(1) ?? '—'}
            unit="°C"
            accentColor="border-l-amber-500"
            icon={<Thermometer className="w-3.5 h-3.5" />}
            trend={tempTrend as 'up' | 'down' | 'neutral'}
            isLoading={isLoading}
            hasError={hasError}
          />
          <MetricCard
            title="RAINFALL"
            value={data?.rainfall?.toFixed(1) ?? '—'}
            unit="MM"
            accentColor="border-l-sky-500"
            icon={<Droplets className="w-3.5 h-3.5" />}
            trend={rainTrend as 'up' | 'down' | 'neutral'}
            isLoading={isLoading}
            hasError={hasError}
          />
          <MetricCard
            title="HUMIDITY"
            value={data?.humidity?.toFixed(0) ?? '—'}
            unit="%"
            accentColor="border-l-cyan-500"
            icon={<Droplets className="w-3.5 h-3.5" />}
            trend="neutral"
            isLoading={isLoading}
            hasError={hasError}
          />
          <MetricCard
            title="WIND SPEED"
            value={data?.windSpeed?.toFixed(1) ?? '—'}
            unit="KM/H"
            accentColor="border-l-slate-400"
            icon={<Wind className="w-3.5 h-3.5" />}
            trend="neutral"
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
      </div>
    </div>
  );
});

MetricsPanel.displayName = 'MetricsPanel';