import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';
import { ChangeMetric } from '@/types';

interface HealthScoreTrendChartProps {
  data?: ChangeMetric[];
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
        <span className="text-body text-text-muted">Trend data unavailable</span>
      </div>
    );
  }

  const years = data.map(d => String(d.year));
  const values = data.map(d => d.overall ?? 0);

  // Score-based color segments
  const scoreColor = (v: number) => {
    if (v >= 80) return '#10B981';
    if (v >= 60) return '#84CC16';
    if (v >= 40) return '#F59E0B';
    return '#EF4444';
  };

  // Overall color from last value
  const lastVal = values[values.length - 1] ?? 0;
  const lineColor = scoreColor(lastVal);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1f2e',
      borderColor: '#2e3347',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontFamily: 'Space Mono, monospace', fontSize: 11 },
      formatter: (params: any[]) => {
        const p = params[0];
        const color = scoreColor(p.value);
        const label = p.value >= 80 ? 'Excellent' : p.value >= 60 ? 'Good' : p.value >= 40 ? 'Fair' : 'Poor';
        return `<div style="padding:4px 2px">
          <span style="color:#94a3b8">Year: </span><span style="color:#f1f5f9;font-weight:600">${p.name}</span><br/>
          <span style="color:#94a3b8">Score: </span><span style="color:${color};font-weight:700">${p.value.toFixed(1)}</span>
          <span style="color:#6b7280"> / 100 (${label})</span>
        </div>`;
      },
    },
    grid: { top: 36, right: 24, bottom: 36, left: 12, containLabel: true },
    xAxis: {
      type: 'category',
      data: years,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#374151' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontFamily: 'Space Mono, monospace', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 25,
      splitLine: { lineStyle: { color: '#1f2937', type: 'dashed' } },
      axisLabel: { color: '#6b7280', fontFamily: 'Space Mono, monospace', fontSize: 10, formatter: '{value}' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    visualMap: {
      show: false,
      pieces: [
        { gt: 0,  lte: 39,  color: '#EF4444' },
        { gt: 39, lte: 59,  color: '#F59E0B' },
        { gt: 59, lte: 79,  color: '#84CC16' },
        { gt: 79, lte: 100, color: '#10B981' },
      ],
      seriesIndex: 0,
    },
    series: [
      {
        name: 'Health Score',
        type: 'line',
        data: values,
        lineStyle: { width: 3, color: lineColor },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { borderWidth: 2, borderColor: '#111827' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: lineColor + '44' },
              { offset: 1, color: lineColor + '00' },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#4b5563', type: 'dashed', width: 1 },
          label: {
            position: 'insideEndTop',
            formatter: 'STATE AVG',
            color: '#4b5563',
            fontFamily: 'Space Mono, monospace',
            fontSize: 9,
          },
          data: [{ yAxis: 65 }],
        },
      },
    ],
  };

  return (
    <div className="w-full h-[250px] bg-canvas-black border border-surface-border rounded-xl overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};