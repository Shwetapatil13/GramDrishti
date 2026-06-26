import { useState, useCallback } from 'react';

export type BaseLayer = 'dark' | 'satellite' | 'osm';

export const useMapLayers = () => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayer>('dark');
  const [showNDVI, setShowNDVI] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [showLandCover, setShowLandCover] = useState(false);

  const toggleNDVI = useCallback(() => setShowNDVI((prev) => !prev), []);
  const toggleWater = useCallback(() => setShowWater((prev) => !prev), []);
  const toggleLandCover = useCallback(() => setShowLandCover((prev) => !prev), []);

  return {
    activeBaseLayer,
    setActiveBaseLayer,
    showNDVI,
    toggleNDVI,
    showWater,
    toggleWater,
    showLandCover,
    toggleLandCover,
  };
};