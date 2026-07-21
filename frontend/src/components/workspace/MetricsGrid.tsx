import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { useMapLayers } from '@/hooks/MapLayersContext';
import { Leaf, Droplets, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import ReactECharts from 'echarts-for-react';

interface MetricWorkspaceCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  changeStr: string;
  icon: React.ReactNode;
  color: string;
  sparklineData: number[];
  onClick?: () => void;
  isActive?: boolean;
}

const MetricWorkspaceCard: React.FC<MetricWorkspaceCardProps> = ({ title, value, unit, trend, changeStr, icon, color, sparklineData, onClick, isActive }) => {
  const chartOption = {
    grid: { top: 5, bottom: 5, left: 0, right: 0 },
    xAxis: { type: 'category', show: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    yAxis: { type: 'value', show: false, min: 'dataMin' },
    series: [{
      type: 'line',
      data: sparklineData,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${color}40` },
            { offset: 1, color: `${color}00` }
          ]
        }
      }
    }]
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-canvas-black border transition-all duration-300 rounded-2xl p-5 group cursor-pointer relative overflow-hidden flex flex-col h-[180px] ${isActive ? 'border-brand-mint shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-surface-border hover:border-surface-border-hover'}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: color }} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-text-secondary">
          <div className="p-1.5 rounded-lg bg-surface-slate" style={{ color }}>{icon}</div>
          <span className="font-mono text-xs tracking-widest font-semibold">{title}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold font-mono tracking-tight text-text-primary">{value}</span>
        <span className="text-sm font-mono text-text-muted">{unit}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-amber-400' : 'text-text-muted'}`}>
          {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
          {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend === 'neutral' && <ArrowRight className="w-3.5 h-3.5" />}
          {changeStr}
        </span>
        <span className="text-xs text-text-muted">vs last month</span>
      </div>

      <div className="mt-auto h-12 w-full opacity-60 group-hover:opacity-100 transition-opacity">
        <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
      </div>
    </div>
  );
};

export const MetricsGrid: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data, isLoading } = useSatelliteData(selectedVillage?.id, selectedYear);
  const { activeSatelliteLayer, toggleSatelliteLayer } = useMapLayers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-[180px] bg-surface-slate border border-surface-border rounded-2xl"><Skeleton borderRadius="16px" /></div>)}
      </div>
    );
  }

  // Mocks for sparklines since backend doesn't return full 12M series for these specific cards yet
  const mockSparklines = {
    ndvi: [0.4, 0.42, 0.5, 0.6, 0.65, 0.61, 0.58, 0.6, 0.62, 0.59, 0.55, 0.5],
    ndwi: [0.1, 0.15, 0.12, 0.1, 0.08, 0.15, 0.2, 0.25, 0.23, 0.18, 0.15, 0.1],
    water: [130, 128, 125, 120, 115, 135, 150, 145, 142, 139, 135, 132],
    green: [50, 52, 55, 60, 68, 70, 68, 65, 62, 58, 55, 52]
  };

  const ndviVal = data?.ndvi ?? 0.61;
  const ndwiVal = data?.ndwi ?? 0.23;
  const waterVal = data?.waterAreaHa ?? 139.8;
  const greenVal = data?.greenCoverPercent ?? 67.8;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricWorkspaceCard
        title="NDVI HEALTH"
        value={ndviVal.toFixed(2)}
        unit="IDX"
        trend={ndviVal >= 0.5 ? 'up' : 'down'}
        changeStr="+0.04"
        icon={<Leaf className="w-5 h-5" />}
        color="#10B981" // emerald
        sparklineData={mockSparklines.ndvi}
        isActive={activeSatelliteLayer === 'ndvi'}
        onClick={() => toggleSatelliteLayer('ndvi')}
      />
      <MetricWorkspaceCard
        title="NDWI MOISTURE"
        value={ndwiVal.toFixed(2)}
        unit="IDX"
        trend={ndwiVal >= 0 ? 'up' : 'down'}
        changeStr="+0.02"
        icon={<Droplets className="w-5 h-5" />}
        color="#3B82F6" // blue
        sparklineData={mockSparklines.ndwi}
        isActive={activeSatelliteLayer === 'ndwi'}
        onClick={() => toggleSatelliteLayer('ndwi')}
      />
      <MetricWorkspaceCard
        title="SURFACE WATER"
        value={waterVal.toFixed(1)}
        unit="HA"
        trend="down"
        changeStr="-2.4 ha"
        icon={<Droplets className="w-5 h-5" />}
        color="#60A5FA" // light blue
        sparklineData={mockSparklines.water}
        onClick={() => toggleSatelliteLayer('water')} // Mock water layer toggle
      />
      <MetricWorkspaceCard
        title="GREEN COVER"
        value={greenVal.toFixed(1)}
        unit="%"
        trend="up"
        changeStr="+5.2%"
        icon={<Leaf className="w-5 h-5" />}
        color="#84CC16" // lime
        sparklineData={mockSparklines.green}
      />
    </div>
  );
};
