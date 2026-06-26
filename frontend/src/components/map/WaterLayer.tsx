import React, { useEffect, useState } from 'react';
import { GeoJSON, Tooltip, TileLayer } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';
import { apiService } from '@/services/api';

interface WaterLayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
}

export const WaterLayer: React.FC<WaterLayerProps> = ({ village, data }) => {
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
        const boundary: any = village.boundary;
        const geometry = (boundary?.type === 'Feature')
          ? boundary.geometry
          : boundary;

        const res = await apiService.post<{ urlFormat: string }>(
          `/api/v1/satellite/water/tiles`,
          { boundary: geometry, year: data.year }
        );
        if (mounted && res?.urlFormat) {
          setTileUrl(res.urlFormat);
        }
      } catch (err) {
        // Tiles unavailable — polygon fill will act as fallback
        console.warn('Water tiles unavailable, using polygon fill fallback.');
      }
    };

    fetchTiles();
    return () => { mounted = false; };
  }, [village?.id, data?.year]);

  if (!village || !village.boundary) return null;

  const boundary: any = village.boundary;
  const geoJsonData = boundary.type === 'Feature' || boundary.type === 'FeatureCollection'
    ? boundary
    : {
        type: "Feature",
        properties: {},
        geometry: boundary
      };

  // Show blue fill when no raster tiles; fade it out once tiles render
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
      <GeoJSON
        key={`water-${village.id}`}
        data={geoJsonData as any}
        style={{
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: polygonFillOpacity,
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
    </>
  );
};