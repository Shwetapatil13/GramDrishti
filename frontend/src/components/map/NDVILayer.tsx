import React from 'react';
import { Polygon } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';
import { GEEProgress } from '../ui/GEEProgress';

interface NDVILayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
  isLoading: boolean;
}

export const NDVILayer: React.FC<NDVILayerProps> = ({ village, data, isLoading }) => {
  if (!village || !village.boundary || !village.boundary.coordinates) return null;

  const positions = village.boundary.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]);

  // Determine color based on NDVI value
  let fillColor = 'var(--semantic-warning)'; // fair
  if (data) {
    if (data.ndvi > 0.6) fillColor = 'var(--score-excellent)'; // excellent
    else if (data.ndvi >= 0.4) fillColor = 'var(--score-good)'; // good
    else if (data.ndvi >= 0.2) fillColor = 'var(--semantic-warning)'; // fair
    else fillColor = 'var(--semantic-danger)'; // poor
  }

  return (
    <>
      <Polygon
        positions={positions}
        pathOptions={{
          color: fillColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: 0.5,
        }}
      />
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400]">
          <GEEProgress message="Retrieving satellite data (~45s on first load)…" cached={false} />
        </div>
      )}
    </>
  );
};