import React, { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';

interface VillageBoundaryProps {
  polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  /** Draw only the outline (used while a satellite overlay is shown underneath) */
  outlineOnly?: boolean;
}

// Use green for the boundary (spec requirement: green outline, semi-transparent fill)
const BOUNDARY_COLOR = '#22c55e'; // Tailwind green-500

export const VillageBoundary: React.FC<VillageBoundaryProps> = ({ polygon, outlineOnly = false }) => {
  // Normalize: wrap the bare geometry in a FeatureCollection so Leaflet handles it correctly.
  const geoJsonData = useMemo<GeoJSON.FeatureCollection | null>(
    () => (polygon ? { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: polygon }] } : null),
    [polygon]
  );

  // react-leaflet's GeoJSON ignores `data` updates, so remount whenever the polygon changes
  const polygonKey = useMemo(() => (polygon ? JSON.stringify(polygon) : 'empty-boundary'), [polygon]);

  if (!geoJsonData) {
    return null;
  }

  return (
    <GeoJSON
      key={polygonKey}
      data={geoJsonData}
      // Don't swallow clicks/hover meant for the map's pixel inspector
      interactive={false}
      style={{
        color: BOUNDARY_COLOR,
        weight: 2.5,
        fillColor: BOUNDARY_COLOR,
        fillOpacity: outlineOnly ? 0 : 0.15,
      }}
    />
  );
};
