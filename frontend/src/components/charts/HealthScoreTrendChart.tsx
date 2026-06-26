import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';

import { ChangeMetric } from '@/types';

interface HealthScoreTrendChartProps {
  data?: ChangeMetric[]; // [{year, overall, delta}]
  isLoading: boolean;
}

export const HealthScoreTrendChart: React.FC<HealthScoreTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-[250px] bg-surface-slate border border-surface-border rounded-xl p-4">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[250px] bg-surface-slate border border-surface-border rounded-xl p-4 flex items-center justify-center">
        <span className="text-body text-text-muted">Data unavailable</span>
      </div>
    );
  }

  const years = data.map(d => d.year);
  const values = data.map(d => d.overall);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--surface-slate)',
      borderColor: 'var(--surface-border)',
      textStyle: { color: 'var(--text-primary)', fontFamily: 'Space Mono' },
    },
    grid: {
      top: 30, right: 30, bottom: 20, left: 40, containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: 'var(--surface-border)' } },
      axisLabel: { color: 'var(--text-secondary)', fontFamily: 'Space Mono' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: 'var(--surface-border)', type: 'dashed' } },
      axisLabel: { color: 'var(--text-secondary)', fontFamily: 'Space Mono' }
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 0, lte: 39, color: 'var(--semantic-danger)' },
        { gt: 39, lte: 59, color: 'var(--semantic-warning)' },
        { gt: 59, lte: 79, color: 'var(--score-good)' },
        { gt: 79, lte: 100, color: 'var(--score-excellent)' }
      ]
    },
    series: [
      {
        name: 'Health Score',
        type: 'line',
        data: values,
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        markLine: {
          silent: true,
          lineStyle: { color: 'var(--text-secondary)', type: 'dashed' },
          label: { position: 'end', formatter: 'MH AVERAGE', color: 'var(--text-secondary)', fontFamily: 'Space Mono', fontSize: 10 },
          data: [{ yAxis: 65 }]
        }
      }
    ]
  };

  return (
    <div className="w-full h-[250px] bg-canvas-black border border-surface-border rounded-xl p-4 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};