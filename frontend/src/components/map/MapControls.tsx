import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus, Focus } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { getPolygonBounds } from './services/mapBounds';

export const MapControls: React.FC = () => {
  const map = useMap();
  const { selectedVillage, selectedVillagePolygon } = useVillageSelection();
  const containerRef = useRef<HTMLDivElement>(null);

  // Stop clicks/double-clicks/scrolls on the buttons from reaching the map
  // (otherwise they trigger map clicks, inspection popups and double-click zoom)
  useEffect(() => {
    if (!containerRef.current) return;
    L.DomEvent.disableClickPropagation(containerRef.current);
    L.DomEvent.disableScrollPropagation(containerRef.current);
  }, []);

  const handleRecenter = () => {
    const bounds = getPolygonBounds(selectedVillagePolygon);
    if (bounds) {
      // Re-center on the locked village; India view is outside the lock bounds
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    } else if (selectedVillage?.coordinates) {
      map.flyTo(selectedVillage.coordinates, 14);
    } else {
      map.setView([20.5937, 78.9629], 5);
    }
  };

  return (
    <div ref={containerRef} className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        className="w-10 h-10 bg-surface-slate border border-surface-border rounded-xl flex items-center justify-center text-text-primary hover:border-brand-mint hover:text-brand-mint transition-colors"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        className="w-10 h-10 bg-surface-slate border border-surface-border rounded-xl flex items-center justify-center text-text-primary hover:border-brand-mint hover:text-brand-mint transition-colors"
      >
        <Minus className="w-5 h-5" />
      </button>
      <button
        onClick={handleRecenter}
        aria-label="Re-center map"
        className="w-10 h-10 mt-2 bg-surface-slate border border-surface-border rounded-xl flex items-center justify-center text-text-primary hover:border-brand-mint hover:text-brand-mint transition-colors"
      >
        <Focus className="w-5 h-5" />
      </button>
    </div>
  );
};
