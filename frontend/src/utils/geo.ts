// Ray-casting algorithm for Point in Polygon
export function booleanPointInPolygon(point: [number, number], polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | null): boolean {
  if (!polygon) return false;

  const [lng, lat] = point;
  let isInside = false;

  const checkRing = (ring: number[][]) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  if (polygon.type === 'Polygon') {
    // Check exterior ring
    if (!checkRing(polygon.coordinates[0] as number[][])) return false;
    // Check interior rings (holes)
    for (let i = 1; i < polygon.coordinates.length; i++) {
      if (checkRing(polygon.coordinates[i] as number[][])) return false;
    }
    return true;
  } else if (polygon.type === 'MultiPolygon') {
    for (const poly of polygon.coordinates) {
      if (checkRing(poly[0] as number[][])) {
        // Assume no holes for simplicity or check them if needed
        let inHole = false;
        for (let i = 1; i < poly.length; i++) {
          if (checkRing(poly[i] as number[][])) inHole = true;
        }
        if (!inHole) return true;
      }
    }
  }

  return false;
}
