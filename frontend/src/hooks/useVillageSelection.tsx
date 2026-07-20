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
  hoverValue: { value: number; lat: number; lng: number } | null;
  setHoverValue: (v: { value: number; lat: number; lng: number } | null) => void;
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
  const [hoverValue, setHoverValue] = useState<{ value: number; lat: number; lng: number } | null>(null);



  useEffect(() => {
    console.log('[INSTRUMENT 2/3 - useVillageSelection] State render:', {
      selectedVillageId: selectedVillage?.id,
      selectedVillageName: selectedVillage?.name,
      polygonFirstCoord: selectedVillagePolygon?.coordinates?.[0]?.[0] || selectedVillagePolygon?.coordinates?.[0]?.[0]?.[0] || null,
    });
  }, [selectedVillage, selectedVillagePolygon]);

  const handleSetSelectedVillage = useCallback(async (village: Village | null) => {
    console.log('[INSTRUMENT 2 - useVillageSelection] ENTRY incoming village:', village?.id, village?.name, 'source:', village?.source);
    if (!village) {
      setSelectedVillage(null);
      setSelectedVillagePolygon(null);
      return;
    }

    // Set village and its boundary immediately to prevent stale polygon data & UI lag
    console.log('[INSTRUMENT 2 - useVillageSelection] Calling setSelectedVillage & setSelectedVillagePolygon with:', village.id);
    setSelectedVillage(village);
    setSelectedVillagePolygon(village.boundary ?? null);

    // If it's a Nominatim village, register it asynchronously in the background
    if (village.source === 'nominatim' && village.boundary) {
      console.log('[INSTRUMENT 3 - useVillageSelection] TAKEN BRANCH: nominatim with boundary', village.id, 'coords first point:', (village.boundary.coordinates as any)?.[0]?.[0]);
      apiService.post('/api/v1/villages/register', {
        id: village.id,
        name: village.name,
        nameHindi: village.nameHindi ?? village.name,
        district: village.district ?? '',
        state: village.state ?? 'India',
        coordinates: [village.coordinates?.[0] ?? 20.0, village.coordinates?.[1] ?? 78.0] as [number, number],
        boundary: village.boundary,
        area: village.area ?? 50.0,
      }).then(() => {
        console.log('[INSTRUMENT 3 - useVillageSelection] Register success for:', village.id);
      }).catch((err) => {
        console.error('[INSTRUMENT 3 - useVillageSelection] Register failed for:', village.id, err);
      });
    } else if (!village.boundary && village.id) {
      console.log('[INSTRUMENT 3 - useVillageSelection] TAKEN BRANCH: fetch from backend (no boundary in object)', village.id);
      try {
        const fullVillage = await apiService.get<Village>(`/api/v1/villages/${village.id}`);
        if (fullVillage) {
          console.log('[INSTRUMENT 3 - useVillageSelection] Backend fetched fullVillage:', fullVillage.id, 'has boundary:', !!fullVillage.boundary);
          setSelectedVillage((prev) => (prev?.id === village.id ? { ...prev, ...fullVillage } : prev));
          if (fullVillage.boundary) {
            setSelectedVillagePolygon(fullVillage.boundary);
          }
        }
      } catch (err) {
        console.error('[INSTRUMENT 3 - useVillageSelection] Backend fetch failed for:', village.id, err);
      }
    } else {
      console.log('[INSTRUMENT 3 - useVillageSelection] TAKEN BRANCH: local village with existing boundary', village.id);
    }
  }, []);

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
        hoverValue,
        setHoverValue,
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
