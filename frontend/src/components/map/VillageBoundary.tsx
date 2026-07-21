import React, { useEffect, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '@/hooks/useTheme';

interface VillageBoundaryProps {
  polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}

export const VillageBoundary: React.FC<VillageBoundaryProps> = ({ polygon }) => {
  const map = useMap();
  const geoJsonRef = useRef<L.GeoJSON>(null);
  useTheme();

  useEffect(() => {
    // Bounds manipulation is now handled by SpatialLockManager
  }, [polygon, map]);

  if (!polygon) {

    return null;
  }

  // Normalize: ensure it's a Feature or FeatureCollection so Leaflet handles it correctly.
  // This also handles bare Geometry objects (Polygon, MultiPolygon).
  const geoJsonData: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: polygon }] };

  // Use green for the boundary (spec requirement: green outline, semi-transparent fill)
  const boundaryColor = '#22c55e'; // Tailwind green-500
  const fillColor = '#22c55e';

  return (
    <GeoJSON
      // Key forces re-mount when polygon changes, removing the old layer entirely
      key={polygon ? JSON.stringify(polygon) : 'empty-boundary'}
      ref={geoJsonRef}
      data={geoJsonData}
      style={{
        color: boundaryColor,
        weight: 2.5,
        fillColor: fillColor,
        fillOpacity: 0.15,
      }}
    />
  );
};