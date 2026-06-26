import React, { useEffect, useState } from 'react';
import { GeoJSON, TileLayer } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';
import { GEEProgress } from '../ui/GEEProgress';
import { apiService } from '@/services/api';

interface NDVILayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
  isLoading: boolean;
}

// Hardcoded hex values matching CSS variables for use inside Leaflet GeoJSON style
const NDVI_COLORS = {
  excellent: '#10b981', // --score-excellent
  good: '#4ade80',      // --score-good
  fair: '#f59e0b',      // --semantic-warning
  poor: '#ef4444',      // --semantic-danger
};

export const NDVILayer: React.FC<NDVILayerProps> = ({ village, data, isLoading }) => {
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  useEffect(() => {
    // Reset tile state when village/year changes
    setTileUrl(null);
    setTilesLoaded(false);

    if (!village || !data?.year) return;
    let mounted = true;
    
    const fetchTiles = async () => {
      try {
        // Extract raw GeoJSON geometry from the village boundary
        const boundary: any = village.boundary;
        const geometry = (boundary?.type === 'Feature')
          ? boundary.geometry
          : boundary; // already a Geometry object

        const res = await apiService.post<{ urlFormat: string }>(
          `/api/v1/satellite/ndvi/tiles`,
          { boundary: geometry, year: data.year }
        );
        if (mounted && res?.urlFormat) {
          setTileUrl(res.urlFormat);
        }
      } catch (err) {
        // Tiles not available (e.g. mock mode or GEE error) — use polygon fallback
        console.warn('NDVI tiles unavailable, using polygon fill fallback.');
      }
    };

    fetchTiles();
    return () => { mounted = false; };
  }, [village?.id, data?.year]);

  if (!village || !village.boundary) return null;

  // Pick fill color from NDVI value
  let fillColor = NDVI_COLORS.fair;
  let ndviLabel = 'fair';
  if (data) {
    if (data.ndvi > 0.6)       { fillColor = NDVI_COLORS.excellent; ndviLabel = 'excellent'; }
    else if (data.ndvi >= 0.4) { fillColor = NDVI_COLORS.good;      ndviLabel = 'good'; }
    else if (data.ndvi >= 0.2) { fillColor = NDVI_COLORS.fair;      ndviLabel = 'fair'; }
    else                       { fillColor = NDVI_COLORS.poor;      ndviLabel = 'poor'; }
  }

  const boundary: any = village.boundary;
  const geoJsonData = boundary.type === 'Feature' || boundary.type === 'FeatureCollection'
    ? boundary
    : {
        type: "Feature",
        properties: {},
        geometry: boundary
      };

  // When tiles load, reduce polygon opacity so the raster shows through clearly.
  // When no tiles, show the polygon with full color so the user sees NDVI class.
  const polygonFillOpacity = tilesLoaded ? 0.05 : 0.45;

  return (
    <>
      {tileUrl && (
        <TileLayer 
          url={tileUrl} 
          zIndex={10} 
          opacity={0.85}
          eventHandlers={{
            load: () => setTilesLoaded(true),
          }}
        />
      )}
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400]">
          <GEEProgress message="Retrieving satellite data (~45s on first load)…" cached={false} />
        </div>
      )}
    </>
  );
};