import React from 'react';
import { Thermometer, Droplets, Wind, Sun, CloudRain } from 'lucide-react';

interface ClimateCardProps {
  title: string;
  value: string;
  unit: string;
  avg: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const ClimateCard: React.FC<ClimateCardProps> = ({ title, value, unit, avg, icon, trend }) => (
  <div className="bg-canvas-black border border-surface-border rounded-xl p-4 flex flex-col justify-between h-full min-h-[130px] gap-2">
    <div className="flex justify-between items-center text-text-muted">
      <span className="text-[10px] font-mono tracking-widest uppercase">{title}</span>
      {icon}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold font-mono text-text-primary">{value}</span>
      <span className="text-xs text-text-muted font-mono">{unit}</span>
    </div>
    <div className="flex flex-col justify-start text-[11px] gap-0.5">
      <span className="text-text-secondary">Avg: {avg}</span>
      <span className={`font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-amber-500' : 'text-text-muted'}`}>
        {trend === 'up' ? '▲ Above Avg' : trend === 'down' ? '▼ Below Avg' : '— Normal'}
      </span>
    </div>
  </div>
);

export const ClimatePanel: React.FC = () => {
  return (
    <div className="bg-surface-slate border border-surface-border rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Climate Conditions
      </h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <ClimateCard title="Temperature" value="24.8" unit="°C" avg="22.5°C" icon={<Thermometer className="w-4 h-4" />} trend="up" />
        <ClimateCard title="Rainfall" value="1215" unit="mm" avg="1100mm" icon={<CloudRain className="w-4 h-4" />} trend="up" />
        <ClimateCard title="Humidity" value="50" unit="%" avg="55%" icon={<Droplets className="w-4 h-4" />} trend="down" />
        <ClimateCard title="Wind Speed" value="10.0" unit="km/h" avg="12.0km/h" icon={<Wind className="w-4 h-4" />} trend="down" />
        <ClimateCard title="Solar Rad." value="15.2" unit="MJ/m²" avg="14.8MJ/m²" icon={<Sun className="w-4 h-4" />} trend="neutral" />
        <ClimateCard title="Evapotrans." value="3.4" unit="mm/d" avg="3.6mm/d" icon={<Droplets className="w-4 h-4 opacity-50" />} trend="down" />
      </div>
    </div>
  );
};
