import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Skeleton } from '../ui/Skeleton';
import { LandCoverBreakdown } from '@/types';

interface LandCoverChartProps {
  data?: LandCoverBreakdown;
  isLoading: boolean;
  totalAreaHa?: number;
  layout?: 'vertical' | 'horizontal';
}

export const LAND_COVER_COLORS: Record<keyof LandCoverBreakdown, string> = {
  trees: '#2F5233',      // Deep Green
  cropland: '#D98736',   // Golden Orange
  grassland: '#94C973',  // Light Green
  water: '#3B82F6',      // Blue
  builtArea: '#64748B',  // Slate Gray
  bareLand: '#E6D5B8',   // Sand Beige
  flooded: '#7B8E4D',    // Olive (Shrubs/Flooded)
};

export const LAND_COVER_LABELS: Record<keyof LandCoverBreakdown, string> = {
  trees: 'Trees',
  cropland: 'Crops',
  grassland: 'Grass',
  water: 'Water',
  builtArea: 'Built-up',
  bareLand: 'Bare Land',
  flooded: 'Shrubs',
};

const PREMIUM_COLORS = LAND_COVER_COLORS;
const LABELS = LAND_COVER_LABELS;

export const LandCoverChart: React.FC<LandCoverChartProps> = ({ data, isLoading, totalAreaHa, layout = 'vertical' }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[320px] bg-canvas-black border border-surface-border rounded-xl p-6">
        <Skeleton borderRadius="8px" />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="w-full h-full min-h-[320px] bg-canvas-black border border-surface-border rounded-xl p-6 flex flex-col items-center justify-center space-y-2">
        <span className="text-text-primary font-medium text-sm">No land cover data available</span>
        <span className="text-text-muted text-xs font-light">Try selecting a different region or year</span>
      </div>
    );
  }

  const chartData = useMemo(() => {
    const arr = (Object.keys(PREMIUM_COLORS) as Array<keyof LandCoverBreakdown>)
      .map(key => ({
        id: key,
        value: data[key] || 0,
        name: LABELS[key],
        color: PREMIUM_COLORS[key],
      }))
      .filter(item => item.value > 0);
      
    // Sort Highest to Lowest
    return arr.sort((a, b) => b.value - a.value);
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="w-full h-full min-h-[320px] bg-canvas-black border border-surface-border rounded-xl p-6 flex items-center justify-center">
        <span className="text-text-primary font-medium text-sm">No land cover data available</span>
      </div>
    );
  }

  // Calculate center text
  let centerTitle = '100%';
  let centerSubtext = 'Total Land';
  
  if (totalAreaHa && totalAreaHa > 0) {
    const km2 = totalAreaHa / 100;
    // Format appropriately depending on size
    centerTitle = km2 >= 1 ? `${km2.toFixed(1)}` : `${totalAreaHa.toFixed(0)}`;
    centerSubtext = km2 >= 1 ? 'km² Total' : 'ha Total';
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: 'var(--surface-slate)',
      borderColor: 'var(--surface-border)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit' },
      formatter: (params: any) => {
        const pct = ((params.value / total) * 100).toFixed(1);
        let areaText = '';
        if (totalAreaHa) {
           const valKm2 = (totalAreaHa * (params.value / total)) / 100;
           areaText = `<div style="color:var(--text-muted);font-size:11px;margin-top:4px;">${valKm2.toFixed(2)} km²</div>`;
        }
        return `<div style="display:flex;align-items:center;gap:8px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${params.color};"></span>
                  <span style="font-weight:500;">${params.name}</span>
                  <span style="margin-left:auto;font-weight:600;font-variant-numeric:tabular-nums;">${pct}%</span>
                </div>${areaText}`;
      },
      extraCssText: 'box-shadow: var(--shadow); backdrop-filter: blur(8px); border-radius: 8px;'
    },
    title: {
      text: centerTitle,
      subtext: centerSubtext,
      left: 'center',
      top: 'center',
      textStyle: {
        color: 'var(--text-primary)',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'inherit',
      },
      subtextStyle: {
        color: 'var(--text-muted)',
        fontSize: 10,
        fontWeight: 'normal',
        fontFamily: 'inherit',
        marginTop: 2
      },
      itemGap: 2
    },
    series: [
      {
        name: 'Land Cover',
        type: 'pie',
        radius: ['68%', '88%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'var(--canvas-black)', // Match canvas 
          borderWidth: 3,
        },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 5,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: chartData.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color }
        }))
      }
    ]
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <div 
      className={`w-full h-full bg-canvas-black border border-surface-border rounded-xl p-4 flex ${isHorizontal ? 'flex-row items-center justify-around' : 'flex-col items-center'} gap-6 overflow-hidden`}
      role="region"
      aria-label="Land Cover Breakdown"
    >
      <div className={`relative flex-shrink-0 ${isHorizontal ? 'w-1/2 h-[300px]' : 'w-full max-w-[240px] h-[200px]'}`}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
      
      <div className={`flex flex-col justify-center gap-2 px-2 ${isHorizontal ? 'w-1/2 overflow-y-auto pr-4 h-[90%]' : 'w-full'}`}>
        {chartData.map((item, index) => {
          const pct = ((item.value / total) * 100).toFixed(0);
          
          let areaDisplay = '';
          if (totalAreaHa) {
            const areaKm2 = (totalAreaHa * (item.value / total)) / 100;
            areaDisplay = areaKm2 >= 1 ? `${areaKm2.toFixed(1)} km²` : `${(areaKm2 * 100).toFixed(0)} ha`;
          }

          return (
            <div 
              key={item.id} 
              className="flex items-center justify-between group transition-opacity duration-300 animate-in fade-in py-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="text-text-primary font-medium text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-text-primary font-bold text-sm tracking-tight w-10">{pct}%</span>
                {areaDisplay && (
                  <span className="text-text-muted font-light text-xs w-16 text-right tabular-nums">
                    {areaDisplay}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};