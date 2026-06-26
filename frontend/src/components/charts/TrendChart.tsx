import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';
import { ChangeMetric } from '@/types';

interface TrendChartProps {
  data?: ChangeMetric[];
  isLoading: boolean;
  valueKey: keyof ChangeMetric;
  color: string;
  name: string;
  yAxisName?: string;
  chartType?: 'line' | 'bar';
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data, isLoading, valueKey, color, name, yAxisName = '', chartType = 'line',
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
        <span className="text-body text-text-muted text-sm">No data</span>
      </div>
    );
  }

  const years = data.map(d => String(d.year));
  const values = data.map(d => {
    const v = d[valueKey];
    return typeof v === 'number' ? Math.round(v * 1000) / 1000 : 0;
  });

  // Compute bar colors: red for water-loss years, provided color otherwise
  const barColors = data.map(d => {
    if (chartType === 'bar' && name === 'Water Area' && typeof d.delta_ha === 'number' && d.delta_ha < 0) {
      return '#EF4444';
    }
    return color;
  });

  const seriesObj: Record<string, unknown> = {
    name,
    type: chartType,
    data: values,
    itemStyle: chartType === 'bar' ? { color: (params: { dataIndex: number }) => barColors[params.dataIndex] } : { color },
  };

  if (chartType === 'line') {
    seriesObj.lineStyle = { color, width: 2 };
    seriesObj.symbol = 'circle';
    seriesObj.symbolSize = 6;
    seriesObj.areaStyle = {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: color + '40' },
          { offset: 1, color: color + '00' },
        ],
      },
    };
  }

  if (chartType === 'bar') {
    seriesObj.barMaxWidth = 32;
    seriesObj.barMinHeight = 2;
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1f2e',
      borderColor: '#2e3347',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontFamily: 'Space Mono, monospace', fontSize: 11 },
      axisPointer: { type: 'line', lineStyle: { color: '#374151' } },
      formatter: (params: any[]) => {
        const p = params[0];
        return `<div style="padding:4px 2px">
          <span style="color:#94a3b8">${p.seriesName} (${p.name}): </span>
          <span style="color:#f1f5f9;font-weight:600">${Number(p.value).toFixed(3)}</span>
          ${yAxisName ? `<span style="color:#6b7280"> ${yAxisName}</span>` : ''}
        </div>`;
      },
    },
    grid: { top: 20, right: 16, bottom: 4, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: years,
      boundaryGap: chartType === 'bar',
      axisLine: { lineStyle: { color: '#374151' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontFamily: 'Space Mono, monospace', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: { color: '#6b7280', fontFamily: 'Space Mono, monospace', fontSize: 9, align: 'left' },
      splitLine: { lineStyle: { color: '#1f2937', type: 'dashed' } },
      axisLabel: { color: '#6b7280', fontFamily: 'Space Mono, monospace', fontSize: 9 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [seriesObj],
  };

  return (
    <div className="w-full h-full bg-canvas-black border border-surface-border rounded-xl overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};