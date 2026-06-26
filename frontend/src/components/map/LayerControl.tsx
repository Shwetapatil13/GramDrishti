import React from 'react';
import { Layers } from 'lucide-react';
import { useMapLayers, BaseLayer } from '@/hooks/useMapLayers';

interface LayerControlProps {
  layers: ReturnType<typeof useMapLayers>;
}

export const LayerControl: React.FC<LayerControlProps> = ({ layers }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const baseLayers: { id: BaseLayer; label: string }[] = [
    { id: 'dark', label: 'Dark Matter' },
    { id: 'satellite', label: 'Satellite' },
    { id: 'osm', label: 'Street Map' },
  ];

  return (
    <div className="absolute top-4 right-4 z-[400]">
      <div 
        className="bg-surface-slate border border-surface-border rounded-xl shadow-lg overflow-hidden flex flex-col"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="p-3 bg-surface-elevated flex items-center justify-center cursor-pointer">
          <Layers className="w-5 h-5 text-text-primary" />
        </div>
        
        {isOpen && (
          <div className="p-4 flex flex-col gap-3 min-w-[160px]">
            <div>
              <h4 className="text-mono text-text-secondary mb-2">BASE MAP</h4>
              {baseLayers.map((layer) => (
                <label key={layer.id} className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="baseLayer"
                    checked={layers.activeBaseLayer === layer.id}
                    onChange={() => layers.setActiveBaseLayer(layer.id)}
                    className="accent-brand-mint"
                  />
                  <span className="text-body text-text-primary">{layer.label}</span>
                </label>
              ))}
            </div>
            
            <div className="h-px bg-surface-border w-full my-1"></div>
            
            <div>
              <h4 className="text-mono text-text-secondary mb-2">OVERLAYS</h4>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={layers.showNDVI}
                  onChange={layers.toggleNDVI}
                  className="accent-brand-mint"
                />
                <span className="text-body text-text-primary">NDVI Health</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={layers.showWater}
                  onChange={layers.toggleWater}
                  className="accent-brand-mint"
                />
                <span className="text-body text-text-primary">Surface Water</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};