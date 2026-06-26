import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';

import { ChangeMetric } from '@/types';

interface TrendChartProps {
  data?: ChangeMetric[]; // e.g. [{year: 2022, value: 0.5}, ...]
  isLoading: boolean;
  valueKey: keyof ChangeMetric;
  color: string;
  name: string;
  yAxisName?: string;
  chartType?: 'line' | 'bar';
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  data, isLoading, valueKey, color, name, yAxisName = '', chartType = 'line' 
}) => {

  if (isLoading) {
    return (
      <div className="w-full h-full bg-surface-slate border border-surface-border rounded-xl p-4">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full bg-surface-slate border border-surface-border rounded-xl p-4 flex items-center justify-center">
        <span className="text-body text-text-muted">Data unavailable</span>
      </div>
    );
  }

  const years = data.map(d => d.year);
  const values = data.map(d => d[valueKey]);

  const seriesObj: Record<string, unknown> = {
    name,
    type: chartType,
    data: values,
    itemStyle: { color },
  };

  if (chartType === 'line') {
    seriesObj.lineStyle = { color, width: 2 };
    seriesObj.areaStyle = {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: color }, { offset: 1, color: 'transparent' }],
      },
      opacity: 0.1
    };
    seriesObj.symbol = 'circle';
    seriesObj.symbolSize = 8;
  }

  // Handle water loss years explicitly if it's a water chart and type is bar
  if (chartType === 'bar' && name === 'Water Area') {
    seriesObj.itemStyle = {
      color: (params: { name: string }) => {
        // Find if this year was a loss
        const item = data.find(d => d.year === Number(params.name));
        if (item && item.delta_ha !== undefined && item.delta_ha < 0) {
          return 'var(--semantic-danger)'; // Red for loss
        }
        return color;
      }
    };
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--surface-slate)',
      borderColor: 'var(--surface-border)',
      textStyle: { color: 'var(--text-primary)', fontFamily: 'Space Mono' },
      axisPointer: { type: 'line', lineStyle: { color: 'var(--surface-border)' } }
    },
    grid: {
      top: 30, right: 20, bottom: 20, left: 40, containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: 'var(--surface-border)' } },
      axisLabel: { color: 'var(--text-secondary)', fontFamily: 'Space Mono' }
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: { color: 'var(--text-secondary)', fontFamily: 'Space Mono', align: 'left' },
      splitLine: { lineStyle: { color: 'var(--surface-border)', type: 'dashed' } },
      axisLabel: { color: 'var(--text-secondary)', fontFamily: 'Space Mono' }
    },
    series: [seriesObj]
  };

  return (
    <div className="w-full h-full bg-canvas-black border border-surface-border rounded-xl p-4 overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};