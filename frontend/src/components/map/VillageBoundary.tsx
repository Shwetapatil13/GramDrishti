import React from 'react';
import { Polygon } from 'react-leaflet';
import { Village } from '@/types';

interface VillageBoundaryProps {
  village: Village | null;
}

export const VillageBoundary: React.FC<VillageBoundaryProps> = ({ village }) => {
  if (!village || !village.boundary || !village.boundary.coordinates) return null;

  // GeoJSON coordinates are usually [lng, lat], Leaflet wants [lat, lng]
  // Our mock data is [lng, lat] for GeoJSON standard.
  const positions = village.boundary.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]);

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: 'var(--brand-mint)',
        weight: 3,
        fillColor: 'var(--brand-mint)',
        fillOpacity: 0.12,
      }}
    />
  );
};