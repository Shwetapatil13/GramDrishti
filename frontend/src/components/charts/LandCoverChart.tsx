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
    { value: data.cropland, name: 'Crops', itemStyle: { color: '#ca8a04' } },
    { value: data.trees, name: 'Trees', itemStyle: { color: '#166534' } },
    { value: data.water, name: 'Water', itemStyle: { color: '#3cffd0' } },
    { value: data.builtArea, name: 'Built', itemStyle: { color: '#6b7280' } },
    { value: data.grassland, name: 'Grass', itemStyle: { color: '#86efac' } },
    { value: data.bareLand, name: 'Bare', itemStyle: { color: '#a16207' } },
    { value: data.flooded, name: 'Flooded', itemStyle: { color: '#3860be' } },
  ].filter(item => item.value > 0);

  const option = {
    backgroundColor: '#131313',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1a1a1a',
      borderColor: '#2d2d2d',
      textStyle: { color: '#ffffff', fontFamily: 'Space Mono' },
      formatter: '{b}: {c}%'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 'middle',
      textStyle: { color: '#949494', fontFamily: 'Space Mono', fontSize: 10 },
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
            color: '#ffffff'
          }
        },
        labelLine: { show: false },
        data: chartData
      }
    ]
  };

  return (
    <div className="w-full h-[200px] bg-[#131313] border border-surface-border rounded-xl p-4 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};