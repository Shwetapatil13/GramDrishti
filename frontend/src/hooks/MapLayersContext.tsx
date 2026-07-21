import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import React from 'react';

export type BaseLayer = 'dark' | 'satellite' | 'osm';

export interface MapLayersContextType {
  activeBaseLayer: BaseLayer;
  setActiveBaseLayer: (layer: BaseLayer) => void;
  activeSatelliteLayer: string | null;
  setActiveSatelliteLayer: (layer: string | null) => void;
  toggleSatelliteLayer: (layerId: string) => void;
  showNDVI: boolean;
  clearAllLayers: () => void;
}

const MapLayersContext = createContext<MapLayersContextType | undefined>(undefined);

export const MapLayersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayer>('dark');
  const [activeSatelliteLayer, setActiveSatelliteLayer] = useState<string | null>(null);

  const toggleSatelliteLayer = useCallback((layerId: string) => {
    setActiveSatelliteLayer((prev) => prev === layerId ? null : layerId);
  }, []);

  const clearAllLayers = useCallback(() => {
    setActiveSatelliteLayer(null);
  }, []);

  const showNDVI = activeSatelliteLayer === 'ndvi';

  const value = useMemo(() => ({
    activeBaseLayer,
    setActiveBaseLayer,
    activeSatelliteLayer,
    setActiveSatelliteLayer,
    toggleSatelliteLayer,
    showNDVI,
    clearAllLayers,
  }), [activeBaseLayer, activeSatelliteLayer, toggleSatelliteLayer, clearAllLayers, showNDVI]);

  return (
    <MapLayersContext.Provider value={value}>
      {children}
    </MapLayersContext.Provider>
  );
};

export const useMapLayers = () => {
  const context = useContext(MapLayersContext);
  if (context === undefined) {
    throw new Error('useMapLayers must be used within a MapLayersProvider');
  }
  return context;
};
