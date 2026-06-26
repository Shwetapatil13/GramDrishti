import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';
import { LandCoverBreakdown } from '@/types';

interface LandCoverChartProps {
  data?: LandCoverBreakdown;
  isLoading: boolean;
}

// Explicit hex colors shared with map layer — CSS vars don't resolve in ECharts SVG renderer
export const LAND_COVER_COLORS: Record<keyof LandCoverBreakdown, string> = {
  cropland:  '#F59E0B', // amber
  trees:     '#10B981', // emerald
  water:     '#3B82F6', // blue
  builtArea: '#6B7280', // slate
  grassland: '#84CC16', // lime
  bareLand:  '#D97706', // orange
  flooded:   '#06B6D4', // cyan
};

export const LAND_COVER_LABELS: Record<keyof LandCoverBreakdown, string> = {
  cropland:  'Crops',
  trees:     'Trees',
  water:     'Water',
  builtArea: 'Built',
  grassland: 'Grass',
  bareLand:  'Bare',
  flooded:   'Flooded',
};

export const LandCoverChart: React.FC<LandCoverChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-[280px] bg-surface-slate border border-surface-border rounded-xl p-4">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-[280px] bg-surface-slate border border-surface-border rounded-xl p-4 flex items-center justify-center">
        <span className="text-body text-text-muted">Land cover data unavailable</span>
      </div>
    );
  }

  const chartData = (Object.keys(LAND_COVER_COLORS) as Array<keyof LandCoverBreakdown>)
    .map(key => ({
      value: Math.round((data[key] ?? 0) * 10) / 10,
      name: LAND_COVER_LABELS[key],
      itemStyle: { color: LAND_COVER_COLORS[key] },
    }))
    .filter(item => item.value > 0.1);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1a1f2e',
      borderColor: '#2e3347',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontFamily: 'Space Mono, monospace', fontSize: 11 },
      formatter: (params: { name: string; value: number; percent: number }) => {
        const pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : params.percent?.toFixed(1);
        return `<div style="padding:4px 2px">
          <span style="font-weight:600;color:#f1f5f9">${params.name}</span><br/>
          <span style="color:#94a3b8">Area: </span><span style="color:#f1f5f9">${params.value.toFixed(1)}%</span><br/>
          <span style="color:#94a3b8">Share: </span><span style="color:#f1f5f9">${pct}%</span>
        </div>`;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      pageIconColor: '#94a3b8',
      pageTextStyle: { color: '#94a3b8' },
      textStyle: { color: '#94a3b8', fontFamily: 'Space Mono, monospace', fontSize: 10 },
      icon: 'circle',
    },
    series: [
      {
        name: 'Land Cover',
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '44%'],
        minAngle: 4,
        avoidLabelOverlap: true,
        padAngle: 1,
        label: {
          show: true,
          position: 'outside',
          fontFamily: 'Space Mono, monospace',
          fontSize: 10,
          color: '#94a3b8',
          formatter: (params: { name: string; value: number }) => {
            if (params.value < 3) return ''; // hide tiny labels
            return `${params.name}\n${params.value.toFixed(0)}%`;
          },
          overflow: 'truncate',
          lineHeight: 14,
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 12,
          lineStyle: { color: '#4b5563', width: 1 },
          smooth: true,
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Space Mono, monospace',
            color: '#f1f5f9',
            formatter: (params: { name: string; value: number }) =>
              `${params.name}\n${params.value.toFixed(1)}%`,
          },
        },
        data: chartData,
      },
    ],
  };

  return (
    <div className="w-full h-[280px] bg-canvas-black border border-surface-border rounded-xl overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};