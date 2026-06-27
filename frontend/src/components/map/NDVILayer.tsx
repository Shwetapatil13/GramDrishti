import React, { useEffect, useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';
import { GEEProgress } from '../ui/GEEProgress';
import { apiService } from '@/services/api';

interface NDVILayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
  isLoading: boolean;
}

// Hardcoded hex values matching CSS variables for use inside Leaflet GeoJSON style


export const NDVILayer: React.FC<NDVILayerProps> = ({ village, data, isLoading }) => {
  const [tileUrl, setTileUrl] = useState<string | null>(null);


  useEffect(() => {
    // Reset tile state when village/year changes
    setTileUrl(null);


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

      }
    };

    fetchTiles();
    return () => { mounted = false; };
  }, [village?.id, data?.year]);

  if (!village || !village.boundary) return null;



  return (
    <>
      {tileUrl && (
        <TileLayer 
          url={tileUrl} 
          zIndex={10} 
          opacity={0.85}

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