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
  const { theme } = useTheme();

  useEffect(() => {
    if (polygon && geoJsonRef.current) {
      try {
        // Small delay to allow react-leaflet to render the layer
        requestAnimationFrame(() => {
          if (!geoJsonRef.current) return;
          const bounds = geoJsonRef.current.getBounds();
          console.log('[VillageBoundary] Computed bounds:', bounds.isValid() ? `SW: ${bounds.getSouthWest()}, NE: ${bounds.getNorthEast()}` : 'INVALID');
          if (bounds && bounds.isValid()) {
            console.log('[VillageBoundary] ✅ Fitting map to polygon bounds');
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
          } else {
            console.warn('[VillageBoundary] ⚠️ Bounds are invalid — cannot fit map. Polygon type:', polygon?.type);
          }
        });
      } catch (err) {
        console.error('[VillageBoundary] ❌ Error computing bounds from GeoJSON layer:', err);
      }
    }
  }, [polygon, map]);

  if (!polygon) {
    console.log('[VillageBoundary] No polygon — rendering nothing.');
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

  console.log('[VillageBoundary] Rendering polygon type:', polygon.type, '→ wrapped as:', geoJsonData.type);

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
        smoothFactor: 1.5,
      }}
    />
  );
};