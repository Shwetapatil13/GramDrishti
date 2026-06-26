import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RegionalData } from '@/hooks/useRegionalData';
import { useVillageSelection } from '@/hooks/useVillageSelection';

interface NDVIPieChartProps {
  data: RegionalData | null;
  isLoading: boolean;
}

const NDVI_COLORS = {
  excellent: '#10b981',
  good: '#4ade80',
  fair: '#f59e0b',
  poor: '#ef4444',
  unknown: '#94a3b8'
};

const CATEGORY_NAMES = {
  excellent: 'Excellent (>0.6)',
  good: 'Good (0.4 - 0.6)',
  fair: 'Fair (0.2 - 0.4)',
  poor: 'Poor (<0.2)',
  unknown: 'Unknown'
};

export const NDVIPieChart: React.FC<NDVIPieChartProps> = ({ data, isLoading }) => {
  const { selectedNDVICategory, setSelectedNDVICategory } = useVillageSelection();

  const chartData = useMemo(() => {
    if (!data?.metrics) return [];

    const counts: Record<string, number> = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      unknown: 0
    };

    Object.values(data.metrics).forEach(metric => {
      if (counts[metric.category] !== undefined) {
        counts[metric.category]++;
      } else {
        counts.unknown++;
      }
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        id: key,
        name: CATEGORY_NAMES[key as keyof typeof CATEGORY_NAMES],
        value,
        color: NDVI_COLORS[key as keyof typeof NDVI_COLORS]
      }));
  }, [data]);

  const onPieEnter = (_: any, index: number) => {
    // Optional hover logic
  };

  const onClick = (data: any) => {
    if (selectedNDVICategory === data.id) {
      // Toggle off
      setSelectedNDVICategory(null);
    } else {
      setSelectedNDVICategory(data.id);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center bg-surface-slate rounded-card border border-surface-border animate-pulse">
        <span className="text-text-muted text-sm font-mono tracking-widest">AGGREGATING REGIONS...</span>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center bg-surface-slate rounded-card border border-surface-border">
        <span className="text-text-muted text-sm font-mono tracking-widest">NO DATA</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[280px] bg-surface-slate rounded-card border border-surface-border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onClick={onClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                opacity={selectedNDVICategory && selectedNDVICategory !== entry.id ? 0.3 : 1}
                stroke={selectedNDVICategory === entry.id ? '#ffffff' : 'none'}
                strokeWidth={selectedNDVICategory === entry.id ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-bg)',
              borderColor: 'var(--brand-mint)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
            formatter={(value: number) => [`${value} regions`, 'Count']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-text-secondary text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
