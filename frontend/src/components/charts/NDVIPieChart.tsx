import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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
        itemStyle: {
          color: NDVI_COLORS[key as keyof typeof NDVI_COLORS],
          opacity: selectedNDVICategory && selectedNDVICategory !== key ? 0.3 : 1,
          borderWidth: selectedNDVICategory === key ? 2 : 0,
          borderColor: selectedNDVICategory === key ? '#ffffff' : 'transparent',
        }
      }));
  }, [data, selectedNDVICategory]);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        formatter: '{b}: {c} regions ({d}%)',
        backgroundColor: 'var(--surface-bg)',
        borderColor: 'var(--brand-mint)',
        textStyle: {
          color: 'var(--text-primary)'
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        textStyle: {
          color: 'var(--text-secondary)',
          fontSize: 12
        }
      },
      series: [
        {
          name: 'NDVI Categories',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: 'var(--surface-slate)',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };
  }, [chartData]);

  const onEvents = useMemo(() => {
    return {
      click: (params: any) => {
        const id = params.data.id;
        if (selectedNDVICategory === id) {
          setSelectedNDVICategory(null);
        } else {
          setSelectedNDVICategory(id);
        }
      }
    };
  }, [selectedNDVICategory, setSelectedNDVICategory]);

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
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%', minHeight: '240px' }} 
        onEvents={onEvents}
      />
    </div>
  );
};
