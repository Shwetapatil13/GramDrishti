import React from 'react';
import { CheckCircle, Database } from 'lucide-react';

export const DataQualityPanel: React.FC = () => {
  return (
    <div className="bg-surface-slate border border-surface-border rounded-2xl p-6 mb-8 mt-8">
      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Data Quality & Sources
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-canvas-black border border-surface-border rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-sm text-text-primary">Sentinel-2 (ESA)</h4>
            <Database className="w-4 h-4 text-text-muted" />
          </div>
          <p className="text-xs text-text-secondary mb-3">10m resolution multispectral imaging used for NDVI and NDWI calculations.</p>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-text-muted">Cloud Cover: &lt;5%</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" /> High Confidence</span>
          </div>
        </div>
        
        <div className="bg-canvas-black border border-surface-border rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-sm text-text-primary">ERA5 (ECMWF)</h4>
            <Database className="w-4 h-4 text-text-muted" />
          </div>
          <p className="text-xs text-text-secondary mb-3">0.1° resolution climate reanalysis used for temperature and historical trends.</p>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-text-muted">Latency: 5 days</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" /> Reliable</span>
          </div>
        </div>

        <div className="bg-canvas-black border border-surface-border rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-sm text-text-primary">CHIRPS</h4>
            <Database className="w-4 h-4 text-text-muted" />
          </div>
          <p className="text-xs text-text-secondary mb-3">0.05° resolution precipitation dataset used for highly accurate rainfall metrics.</p>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-text-muted">Update: Monthly</span>
            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" /> Calibrated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
