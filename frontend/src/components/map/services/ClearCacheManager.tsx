import React, { useEffect, useRef } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useMapLayers } from '@/hooks/MapLayersContext';

export const ClearCacheManager: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const { clearAllLayers } = useMapLayers();
  const prevVillageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedVillage?.id !== prevVillageIdRef.current) {
      // Village has changed, clear layers
      if (prevVillageIdRef.current !== null) {
        clearAllLayers();
      }
      prevVillageIdRef.current = selectedVillage?.id || null;
    }
  }, [selectedVillage, clearAllLayers]);

  return null;
};
