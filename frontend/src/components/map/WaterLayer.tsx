import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';

interface WaterLayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
}

export const WaterLayer: React.FC<WaterLayerProps> = ({ village, data }) => {
  if (!village || !village.boundary || !village.boundary.coordinates) return null;

  const positions = village.boundary.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]);

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: 'var(--brand-mint)',
        weight: 1,
        fillColor: 'var(--brand-mint)',
        fillOpacity: 0.6,
      }}
    >
      {data && (
        <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-leaflet-popup">
          <div className="bg-surface-slate border border-brand-mint rounded-md p-2 text-text-primary text-mono">
            WATER: {data.waterAreaHa.toFixed(1)} HA
          </div>
        </Tooltip>
      )}
    </Polygon>
  );
};