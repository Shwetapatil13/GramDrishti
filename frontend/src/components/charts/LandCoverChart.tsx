import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';
import { LandCoverBreakdown } from '@/types';

interface LandCoverChartProps {
  data?: LandCoverBreakdown;
  isLoading: boolean;
}

export const LandCoverChart: React.FC<LandCoverChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-[200px] bg-surface-slate border border-surface-border rounded-xl p-4">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-[200px] bg-surface-slate border border-surface-border rounded-xl p-4 flex items-center justify-center">
        <span className="text-body text-text-muted">Data unavailable</span>
      </div>
    );
  }

  const chartData = [
    { value: data.cropland, name: 'Crops', itemStyle: { color: 'var(--semantic-warning)' } },
    { value: data.trees, name: 'Trees', itemStyle: { color: 'var(--brand-console)' } },
    { value: data.water, name: 'Water', itemStyle: { color: 'var(--brand-mint)' } },
    { value: data.builtArea, name: 'Built', itemStyle: { color: 'var(--text-muted)' } },
    { value: data.grassland, name: 'Grass', itemStyle: { color: 'var(--score-good)' } },
    { value: data.bareLand, name: 'Bare', itemStyle: { color: 'var(--semantic-warning)' } },
    { value: data.flooded, name: 'Flooded', itemStyle: { color: 'var(--brand-blue)' } },
  ].filter(item => item.value > 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'var(--surface-slate)',
      borderColor: 'var(--surface-border)',
      textStyle: { color: 'var(--text-primary)', fontFamily: 'Space Mono' },
      formatter: '{b}: {c}%'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'middle',
      textStyle: { color: 'var(--text-secondary)', fontFamily: 'Space Mono', fontSize: 10 },
      icon: 'circle'
    },
    series: [
      {
        name: 'Land Cover',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Space Mono',
            color: 'var(--text-primary)'
          }
        },
        labelLine: { show: false },
        data: chartData
      }
    ]
  };

  return (
    <div className="w-full h-[200px] bg-canvas-black border border-surface-border rounded-xl p-4 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};