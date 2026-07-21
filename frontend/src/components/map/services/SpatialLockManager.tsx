import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useVillageSelection } from '@/hooks/useVillageSelection';

export const SpatialLockManager: React.FC = () => {
  const map = useMap();
  const { selectedVillagePolygon } = useVillageSelection();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!selectedVillagePolygon) {
      // If no village is selected, remove bounds and allow zooming out to India
      map.setMaxBounds([
        [6.5, 68.0],
        [38.5, 97.5]
      ]);
      map.setMinZoom(4);
      setIsLocked(false);
      return;
    }

    try {
      // Create a GeoJSON layer just to calculate bounds
      const geoJsonLayer = L.geoJSON({
        type: 'Feature',
        properties: {},
        geometry: selectedVillagePolygon
      } as any);

      const bounds = geoJsonLayer.getBounds();
      
      if (bounds && bounds.isValid()) {
        // Fly smoothly to the bounds instead of jumping
        map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 14, duration: 1.5 });
        
        // Wait for fly animation to mostly finish before locking bounds
        setTimeout(() => {
          // Lock to the village with slight padding (viscosity 1.0 makes it rigid)
          const lockBounds = bounds.pad(0.1);
          map.setMaxBounds(lockBounds);
          map.setMinZoom(map.getBoundsZoom(lockBounds) - 1);
          map.options.maxBoundsViscosity = 1.0;
          setIsLocked(true);
        }, 1500);
      }
    } catch (e) {
      console.error("Error setting spatial locks:", e);
    }
  }, [selectedVillagePolygon, map]);

  return null;
};
