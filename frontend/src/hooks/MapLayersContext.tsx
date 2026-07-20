import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import React from 'react';

export type BaseLayer = 'dark' | 'satellite' | 'osm';

interface MapLayersContextType {
  activeBaseLayer: BaseLayer;
  setActiveBaseLayer: (layer: BaseLayer) => void;
  activeSatelliteLayer: string | null;
  setActiveSatelliteLayer: (layer: string | null) => void;
  toggleSatelliteLayer: (layerId: string) => void;
}

const MapLayersContext = createContext<MapLayersContextType | undefined>(undefined);

export const MapLayersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayer>('dark');
  const [activeSatelliteLayer, setActiveSatelliteLayer] = useState<string | null>(null);

  const toggleSatelliteLayer = useCallback((layerId: string) => {
    setActiveSatelliteLayer((prev) => prev === layerId ? null : layerId);
  }, []);

  const value = useMemo(() => ({
    activeBaseLayer,
    setActiveBaseLayer,
    activeSatelliteLayer,
    setActiveSatelliteLayer,
    toggleSatelliteLayer,
  }), [activeBaseLayer, activeSatelliteLayer, toggleSatelliteLayer]);

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
