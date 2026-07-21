import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface RiskItemProps {
  title: string;
  level: 'High' | 'Medium' | 'Low';
  desc: string;
}

const RiskItem: React.FC<RiskItemProps> = ({ title, level, desc }) => {
  const colors = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <div className="bg-canvas-black border border-surface-border rounded-xl p-4 flex gap-4">
      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${colors[level]}`}>
        {level === 'Low' ? <Info className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-sm text-text-primary">{title}</h4>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm border ${colors[level]}`}>{level.toUpperCase()} RISK</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export const RiskPanel: React.FC = () => {
  return (
    <div className="bg-surface-slate border border-surface-border rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        Risk Assessment Matrix
      </h3>
      
      <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar">
        <RiskItem title="Flood Vulnerability" level="Low" desc="Current topography and drainage patterns indicate minimal flooding risk for populated zones." />
        <RiskItem title="Drought Risk" level="Medium" desc="Surface water is trending slightly downward. Monitoring recommended for upcoming dry season." />
        <RiskItem title="Vegetation Stress" level="Low" desc="NDVI scores remain healthy and stable across 90% of agricultural zones." />
        <RiskItem title="Soil Erosion" level="Medium" desc="Moderate erosion risk detected in the steep southwestern gradients." />
        <RiskItem title="Heat Wave" level="Low" desc="Temperatures are within normal historical bounds for this month." />
      </div>
    </div>
  );
};
