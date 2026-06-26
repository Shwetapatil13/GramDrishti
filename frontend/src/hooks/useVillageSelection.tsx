import React, { createContext, useContext, useState, useCallback } from 'react';
import { Village } from '@/types';

interface VillageContextType {
  selectedVillage: Village | null;
  setSelectedVillage: (village: Village | null) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  clearSelection: () => void;
  flyToVillage: (village: Village) => void;
  setMapInstance: (map: L.Map) => void;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedVillage(null);
  }, []);

  const flyToVillage = useCallback(
    (village: Village) => {
      if (mapInstance) {
        mapInstance.flyTo(village.coordinates, 12, { duration: 1.5 });
      }
    },
    [mapInstance]
  );

  return (
    <VillageContext.Provider
      value={{
        selectedVillage,
        setSelectedVillage,
        selectedYear,
        setSelectedYear,
        clearSelection,
        flyToVillage,
        setMapInstance,
      }}
    >
      {children}
    </VillageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVillageSelection = () => {
  const context = useContext(VillageContext);
  if (context === undefined) {
    throw new Error('useVillageSelection must be used within a VillageProvider');
  }
  return context;
};
