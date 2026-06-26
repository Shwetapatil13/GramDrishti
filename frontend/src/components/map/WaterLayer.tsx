import React from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';

interface WaterLayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
}

export const WaterLayer: React.FC<WaterLayerProps> = ({ village, data }) => {
  if (!village || !village.boundary) return null;

  const boundary: any = village.boundary;
  const geoJsonData = boundary.type === 'Feature' || boundary.type === 'FeatureCollection'
    ? boundary
    : {
        type: "Feature",
        properties: {},
        geometry: boundary
      };

  return (
    <GeoJSON
      key={`water-${village.id}`}
      data={geoJsonData as any}
      style={{
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
    </GeoJSON>
  );
};