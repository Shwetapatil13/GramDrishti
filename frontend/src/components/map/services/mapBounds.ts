import L from 'leaflet';

export const INDIA_BOUNDS: L.LatLngBoundsExpression = [
  [6.5, 68.0],
  [38.5, 97.5]
];
export const INDIA_MIN_ZOOM = 4;

/** Remove any village lock so the camera can move freely across India. */
export function unlockToIndia(map: L.Map) {
  map.options.maxBoundsViscosity = 0;
  map.setMaxBounds(INDIA_BOUNDS);
  map.setMinZoom(INDIA_MIN_ZOOM);
}

/** Bounds of a village polygon, or null if it can't be computed. */
export function getPolygonBounds(polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | null): L.LatLngBounds | null {
  if (!polygon) return null;
  const bounds = L.geoJSON({ type: 'Feature', properties: {}, geometry: polygon } as GeoJSON.Feature).getBounds();
  return bounds.isValid() ? bounds : null;
}
