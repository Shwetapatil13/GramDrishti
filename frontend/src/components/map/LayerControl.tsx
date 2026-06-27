import React from 'react';
import { Layers } from 'lucide-react';
import { useMapLayers, BaseLayer } from '@/hooks/useMapLayers';
import { useTranslation } from 'react-i18next';

interface LayerControlProps {
  layers: ReturnType<typeof useMapLayers>;
}

export const LayerControl: React.FC<LayerControlProps> = ({ layers }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();

  const baseLayers: { id: BaseLayer; labelKey: string; labelDefault: string }[] = [
    { id: 'dark', labelKey: 'map.layers.dark', labelDefault: 'Dark Matter' },
    { id: 'satellite', labelKey: 'map.layers.satellite', labelDefault: 'Satellite' },
    { id: 'osm', labelKey: 'map.layers.osm', labelDefault: 'Street Map' },
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
              <h4 className="text-mono text-text-secondary mb-2">{t('map.base_map', 'BASE MAP')}</h4>
              {baseLayers.map((layer) => (
                <label key={layer.id} className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="baseLayer"
                    checked={layers.activeBaseLayer === layer.id}
                    onChange={() => layers.setActiveBaseLayer(layer.id)}
                    className="accent-brand-mint"
                  />
                  <span className="text-body text-text-primary">{t(layer.labelKey, layer.labelDefault)}</span>
                </label>
              ))}
            </div>
            
            <div className="h-px bg-surface-border w-full my-1"></div>
            
            <div>
              <h4 className="text-mono text-text-secondary mb-2">{t('map.overlays', 'OVERLAYS')}</h4>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={layers.showNDVI}
                  onChange={layers.toggleNDVI}
                  className="accent-brand-mint"
                />
                <span className="text-body text-text-primary">{t('map.layers.ndvi', 'NDVI Health')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={layers.showWater}
                  onChange={layers.toggleWater}
                  className="accent-brand-mint"
                />
                <span className="text-body text-text-primary">{t('map.layers.water', 'Surface Water')}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};