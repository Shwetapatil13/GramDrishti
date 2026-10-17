import React, { useEffect, useState } from 'react';
import { useMapEvents, GeoJSON } from 'react-leaflet';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import L from 'leaflet';
import { HoverAnalyticsService } from './HoverAnalyticsService';
import { API_BASE_URL } from '@/services/api';

const farmCache: Record<string, any> = {};
const FARM_MIN_ZOOM = 17;

export const FarmBoundaryService: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const villageId = selectedVillage?.id;
  const [zoom, setZoom] = useState<number>(0);
  // Farms are stored with the village they belong to so a late response for a
  // previously selected village can never be drawn on the current one.
  const [farms, setFarms] = useState<{ villageId: string; data: any } | null>(null);
  // Callback ref (state) so HoverAnalyticsService re-renders once the layer exists
  const [farmsLayer, setFarmsLayer] = useState<L.GeoJSON | null>(null);

  // Track map zoom events for progressive loading
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  // Initialize zoom on mount
  useEffect(() => {
    setZoom(map.getZoom());
  }, [map]);

  const hasFarmsForVillage = !!villageId && farms?.villageId === villageId;
  const shouldLoad = !!villageId && zoom >= FARM_MIN_ZOOM;

  // Fetch farms (or load from cache) once zoomed in far enough
  useEffect(() => {
    if (!villageId || !shouldLoad || hasFarmsForVillage) return;

    if (farmCache[villageId]) {
      setFarms({ villageId, data: farmCache[villageId] });
      return;
    }

    const controller = new AbortController();
    const fetchFarms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/villages/${encodeURIComponent(villageId)}/farms`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          farmCache[villageId] = data; // store in cache
          setFarms({ villageId, data });
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          console.error("Failed to load farm boundaries:", e);
        }
      }
    };

    fetchFarms();
    return () => controller.abort();
  }, [villageId, shouldLoad, hasFarmsForVillage]);

  if (!hasFarmsForVillage || zoom < FARM_MIN_ZOOM) {
    return null; // Don't render polygons unless zoomed in enough
  }

  return (
    <>
      <GeoJSON
        key={`${villageId}-farms`}
        ref={setFarmsLayer}
        data={farms!.data}
        style={{
          color: '#22c55e',
          weight: 1,
          fillOpacity: 0.1,
          opacity: 0.6
        }}
        onEachFeature={(_, layer) => {
          // Hover analytics handler
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle({
                weight: 2,
                color: '#4ade80',
                fillOpacity: 0.4
              });
              layer.bringToFront();
            },
            mouseout: (e) => {
              (e.target as L.Path).setStyle({
                weight: 1,
                color: '#22c55e',
                fillOpacity: 0.1,
              });
            }
          });
        }}
      />
      {zoom >= 18 && <HoverAnalyticsService farmsLayer={farmsLayer} />}
    </>
  );
};
