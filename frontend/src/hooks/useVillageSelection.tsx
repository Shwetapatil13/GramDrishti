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
  selectedVillagePolygon: any | null;
}

const VillageContext = createContext<VillageContextType | undefined>(undefined);

export const VillageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [_mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [selectedVillagePolygon, setSelectedVillagePolygon] = useState<any | null>(null);

  const handleSetSelectedVillage = useCallback(async (village: Village | null) => {
    // If it's a Nominatim village, register it first so backend knows about it
    // before we set the state (which triggers the sidebar API calls).
    if (village?.source === 'nominatim' && village.boundary) {
      console.log(`[VillageSelection] Nominatim village selected. Registering with backend BEFORE setting state...`);
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
        console.log(`[VillageSelection] ✅ Nominatim village registered in backend: ${village.id}`);
      } catch (err: any) {
        console.warn(`[VillageSelection] ⚠️ Failed to register Nominatim village with backend (non-fatal):`, err?.message);
      }
    }
    
    // Now that backend is ready, update the state so sidebar components can fetch data
    setSelectedVillage(village);
  }, []);

  useEffect(() => {
    if (selectedVillage) {
      console.log(`[VillageSelection] Village changed → id: ${selectedVillage.id}, name: ${selectedVillage.name}, source: ${selectedVillage.source ?? 'unknown'}`);

      // If the village result came from Nominatim, we just use its boundary directly
      if (selectedVillage.source === 'nominatim' && selectedVillage.boundary) {
        console.log(`[VillageSelection] Using Nominatim boundary directly. Geometry type: ${selectedVillage.boundary.type}`);
        setSelectedVillagePolygon(selectedVillage.boundary);
        return;
      }

      // For all local villages, ALWAYS fetch the real polygon from the backend.
      const fetchPolygon = async () => {
        try {
          console.log(`[VillageSelection][BoundaryFetch] Requesting boundary for village: ${selectedVillage.id}`);
          const villageData = await apiService.get<Village>(`/api/v1/villages/${selectedVillage.id}`);
          console.log(`[VillageSelection][BoundaryFetch] Response received.`);
          if (villageData) {
            console.log(`[VillageSelection][BoundaryFetch] Geometry type: ${villageData.boundary?.type ?? 'null'}`);
            if (villageData.boundary) {
              const coordCount = (villageData.boundary as any)?.coordinates?.length ?? 0;
              console.log(`[VillageSelection][BoundaryFetch] Coordinate rings: ${coordCount}`);
            }
            // Update with enriched village data from backend
            setSelectedVillage({ ...selectedVillage, ...villageData });
            if (villageData.boundary) {
              console.log(`[VillageSelection][BoundaryFetch] ✅ Polygon stored in state.`);
              setSelectedVillagePolygon(villageData.boundary);
            } else {
              console.warn(`[VillageSelection][BoundaryFetch] ⚠️ Backend returned village but boundary is null.`);
              setSelectedVillagePolygon(null);
            }
          }
        } catch (error: any) {
          const msg = error?.response?.data?.detail || error?.message || String(error);
          console.error(`[VillageSelection][BoundaryFetch] ❌ Failed to fetch boundary for ${selectedVillage.id}:`, msg);
          console.error(`[VillageSelection][BoundaryFetch] Full error:`, error);
          setSelectedVillagePolygon(null);
        }
      };
      fetchPolygon();
    } else {
      console.log(`[VillageSelection] Village cleared.`);
      setSelectedVillagePolygon(null);
    }
  }, [selectedVillage?.id, selectedVillage?.source]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearSelection = useCallback(() => {
    setSelectedVillage(null);
    setSelectedVillagePolygon(null);
  }, []);

  const flyToVillage = useCallback(
    (_village: Village) => {
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
