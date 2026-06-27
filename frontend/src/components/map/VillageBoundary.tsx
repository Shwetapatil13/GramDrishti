import React, { useEffect, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '@/hooks/useTheme';

interface VillageBoundaryProps {
  polygon: any | null;
}

export const VillageBoundary: React.FC<VillageBoundaryProps> = ({ polygon }) => {
  const map = useMap();
  const geoJsonRef = useRef<L.GeoJSON>(null);
  useTheme();

  useEffect(() => {
    if (polygon && geoJsonRef.current) {
      try {
        // Small delay to allow react-leaflet to render the layer
        requestAnimationFrame(() => {
          if (!geoJsonRef.current) return;
          const bounds = geoJsonRef.current.getBounds();

          if (bounds && bounds.isValid()) {

            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
          } else {

          }
        });
      } catch (err) {

      }
    }
  }, [polygon, map]);

  if (!polygon) {

    return null;
  }

  // Normalize: ensure it's a Feature or FeatureCollection so Leaflet handles it correctly.
  // This also handles bare Geometry objects (Polygon, MultiPolygon).
  const geoJsonData =
    polygon.type === 'Feature' || polygon.type === 'FeatureCollection'
      ? polygon
      : {
          type: 'Feature' as const,
          properties: {},
          geometry: polygon,
        };

  // Use green for the boundary (spec requirement: green outline, semi-transparent fill)
  const boundaryColor = '#22c55e'; // Tailwind green-500
  const fillColor = '#22c55e';

  return (
    <GeoJSON
      // Key forces re-mount when polygon changes, removing the old layer entirely
      key={JSON.stringify(polygon).slice(0, 100)}
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