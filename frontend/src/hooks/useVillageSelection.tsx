import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Village } from '@/types';
import { apiService } from '@/services/api';

interface VillageContextType {
  selectedVillage: Village | null;
  setSelectedVillage: (village: Village | null) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  clearSelection: () => void;
  flyToVillage: (village: Village) => void;
  setMapInstance: (map: L.Map) => void;
  selectedVillagePolygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  selectedNDVICategory: string | null;
  setSelectedNDVICategory: (category: string | null) => void;
  clickedLocation: { lat: number; lng: number } | null;
  setClickedLocation: (location: { lat: number; lng: number } | null) => void;
  activeLayers: string[];
  setActiveLayers: (layers: string[]) => void;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [_mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [selectedVillagePolygon, setSelectedVillagePolygon] = useState<GeoJSON.Polygon | GeoJSON.MultiPolygon | null>(null);
  const [selectedNDVICategory, setSelectedNDVICategory] = useState<string | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);



  const handleSetSelectedVillage = useCallback(async (village: Village | null) => {
    // If it's a Nominatim village, register it first so backend knows about it
    // before we set the state (which triggers the sidebar API calls).
    if (village?.source === 'nominatim' && village.boundary) {

      try {
        const lat = village.coordinates?.[0] ?? 20.0;
        const lon = village.coordinates?.[1] ?? 78.0;
        await apiService.post('/api/v1/villages/register', {
          id: village.id,
          name: village.name,
          nameHindi: village.nameHindi ?? village.name,
          district: village.district ?? '',
          state: village.state ?? 'India',
          coordinates: [lat, lon] as [number, number],
          boundary: village.boundary,
          area: village.area ?? 50.0,
        });

      } catch {

      }
    }
    
    // Now that backend is ready, update the state so sidebar components can fetch data
    setSelectedVillage(village);
  }, []);

  useEffect(() => {
    if (selectedVillage) {

      // If the village result came from Nominatim, we just use its boundary directly
      if (selectedVillage.source === 'nominatim' && selectedVillage.boundary) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedVillagePolygon(selectedVillage.boundary);
        return;
      }

      // For all local villages, ALWAYS fetch the real polygon from the backend.
      const fetchPolygon = async () => {
        try {
          const villageData = await apiService.get<Village>(`/api/v1/villages/${selectedVillage.id}`);

          if (villageData) {
            // Update with enriched village data from backend
            setSelectedVillage({ ...selectedVillage, ...villageData });
            if (villageData.boundary) {
              setSelectedVillagePolygon(villageData.boundary);
            } else {
              setSelectedVillagePolygon(null);
            }
          }
        } catch {
          setSelectedVillagePolygon(null);
        }
      };
      fetchPolygon();
    } else {

      setSelectedVillagePolygon(null);
    }
  }, [selectedVillage?.id, selectedVillage?.source]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearSelection = useCallback(() => {
    setSelectedVillage(null);
    setSelectedVillagePolygon(null);
  }, []);

  const flyToVillage = useCallback(
    () => {
      // Automatic zoom is handled by VillageBoundary now
    },
    []
  );

  return (
    <VillageContext.Provider
      value={{
        selectedVillage,
        setSelectedVillage: handleSetSelectedVillage as (village: Village | null) => void,
        selectedYear,
        setSelectedYear,
        clearSelection,
        flyToVillage,
        setMapInstance,
        selectedVillagePolygon,
        selectedNDVICategory,
        setSelectedNDVICategory,
        clickedLocation,
        setClickedLocation,
        activeLayers,
        setActiveLayers,
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
