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
    backgroundColor: '#131313',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1a1a',
      borderColor: '#2d2d2d',
      textStyle: { color: '#ffffff', fontFamily: 'Space Mono' },
    },
    grid: {
      top: 30, right: 30, bottom: 20, left: 40, containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: '#2d2d2d' } },
      axisLabel: { color: '#949494', fontFamily: 'Space Mono' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: '#2d2d2d', type: 'dashed' } },
      axisLabel: { color: '#949494', fontFamily: 'Space Mono' }
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 0, lte: 39, color: '#ef4444' },
        { gt: 39, lte: 59, color: '#f59e0b' },
        { gt: 59, lte: 79, color: '#86efac' },
        { gt: 79, lte: 100, color: '#3cffd0' }
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
          lineStyle: { color: '#949494', type: 'dashed' },
          label: { position: 'end', formatter: 'MH AVERAGE', color: '#949494', fontFamily: 'Space Mono', fontSize: 10 },
          data: [{ yAxis: 65 }]
        }
      }
    ]
  };

  return (
    <div className="w-full h-[250px] bg-[#131313] border border-surface-border rounded-xl p-4 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};