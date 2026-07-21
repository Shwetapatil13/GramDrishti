import React, { useEffect, useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { Village, EnvironmentalMetrics } from '@/types';
import { GEEProgress } from '../ui/GEEProgress';
import { apiService } from '@/services/api';
import { useLayersMetadata } from '@/hooks/useLayersMetadata';

interface SatelliteLayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
  activeLayerId: string | null;
}

export const SatelliteLayer: React.FC<SatelliteLayerProps> = ({ village, data, activeLayerId }) => {
  const [tileUrl, setTileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { layers } = useLayersMetadata();

  useEffect(() => {
    // Reset tile state when layer, village, or year changes
    setTileUrl(null);

    if (!village || !data?.year || !activeLayerId) return;
    
    let mounted = true;
    
    const fetchTiles = async () => {
      try {
        setIsLoading(true);
        // The new generic endpoint
        // GET /api/v1/satellite/tiles?layer={ID}&geometryType=village&geometryId={vid}&start={start}&end={end}&cloud=20
        const start = `${data.year}-01-01`;
        const end = `${data.year}-12-31`;
        
        const res = await apiService.get<{ urlFormat: string }>(
          `/api/v1/satellite/tiles?layer=${activeLayerId}&geometryType=village&geometryId=${village.id}&start=${start}&end=${end}&cloud=20`
        );
        
        if (mounted && res?.urlFormat) {
          setTileUrl(res.urlFormat);
        }
      } catch (err) {
        console.error("Failed to fetch tiles:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTiles();
    return () => { mounted = false; };
  }, [village?.id, data?.year, activeLayerId]);

  if (!village || !village.boundary || !activeLayerId) return null;

  const activeMetadata = layers.find(l => l.id === activeLayerId);
  const opacity = activeMetadata?.visualization?.opacity || 0.85;

  return (
    <>
      {tileUrl && (
        <TileLayer 
          key={tileUrl} // Force re-render if URL changes
          url={tileUrl} 
          zIndex={10} 
          opacity={opacity}
          maxZoom={21}
        />
      )}
      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400]">
          <GEEProgress message={`Retrieving ${activeMetadata?.name || 'satellite'} data...`} cached={false} />
        </div>
      )}
    </>
  );
};
