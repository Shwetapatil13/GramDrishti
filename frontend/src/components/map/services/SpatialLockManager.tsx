import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { getPolygonBounds, unlockToIndia } from './mapBounds';

const FLY_DURATION_S = 1.5;

export const SpatialLockManager: React.FC = () => {
  const map = useMap();
  const { selectedVillage, selectedVillagePolygon } = useVillageSelection();
  const coordinates = selectedVillage?.coordinates;
  const lat = coordinates?.[0];
  const lng = coordinates?.[1];

  useEffect(() => {
    // Always release the previous village's lock first, otherwise the old
    // maxBounds/minZoom clamp the camera and it can't fly to the new village.
    unlockToIndia(map);

    let bounds: L.LatLngBounds | null = null;
    try {
      bounds = getPolygonBounds(selectedVillagePolygon);
    } catch (e) {
      console.error('Error computing village bounds:', e);
    }

    if (!bounds) {
      // Village without a polygon: still move the camera to its point location
      if (lat !== undefined && lng !== undefined && Number.isFinite(lat) && Number.isFinite(lng)) {
        map.flyTo([lat, lng], 14, { duration: FLY_DURATION_S });
      }
      return;
    }

    const lockBounds = bounds.pad(0.1);
    const applyLock = () => {
      map.setMaxBounds(lockBounds);
      // Never force the user to zoom in past where the fly animation ended
      map.setMinZoom(Math.min(map.getBoundsZoom(lockBounds) - 1, map.getZoom()));
      map.options.maxBoundsViscosity = 1.0;
    };

    map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 14, duration: FLY_DURATION_S });
    map.once('moveend', applyLock);

    return () => {
      map.off('moveend', applyLock);
    };
  }, [selectedVillagePolygon, lat, lng, map]);

  return null;
};
