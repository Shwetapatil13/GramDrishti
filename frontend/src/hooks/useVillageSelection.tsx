import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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
  isWorkspaceExpanded: boolean;
  setIsWorkspaceExpanded: (expanded: boolean) => void;
  timeRange: '30D' | '6M' | '12M' | '5Y';
  setTimeRange: (range: '30D' | '6M' | '12M' | '5Y') => void;
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
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'30D' | '6M' | '12M' | '5Y'>('12M');
  // Id of the most recently requested village, used to drop late async results
  const latestVillageIdRef = useRef<string | null>(null);


  const handleSetSelectedVillage = useCallback(async (village: Village | null) => {
    latestVillageIdRef.current = village?.id ?? null;
    if (!village) {
      setSelectedVillage(null);
      setSelectedVillagePolygon(null);
      setIsWorkspaceExpanded(false);
      return;
    }

    // Set village and its boundary immediately to prevent stale polygon data & UI lag
    setSelectedVillage(village);
    setSelectedVillagePolygon(village.boundary ?? null);

    // If it's a Nominatim village, register it asynchronously in the background
    if (village.source === 'nominatim' && village.boundary) {
      apiService.post('/api/v1/villages/register', {
        id: village.id,
        name: village.name,
        nameHindi: village.nameHindi ?? village.name,
        district: village.district ?? '',
        state: village.state ?? 'India',
        coordinates: [village.coordinates?.[0] ?? 20.0, village.coordinates?.[1] ?? 78.0] as [number, number],
        boundary: village.boundary,
        area: village.area ?? 50.0,
      }).catch((err) => {
        console.error('Village register failed for:', village.id, err);
      });
    } else if (!village.boundary && village.id) {
      try {
        const fullVillage = await apiService.get<Village>(`/api/v1/villages/${village.id}`);
        if (fullVillage) {
          setSelectedVillage((prev) => (prev?.id === village.id ? { ...prev, ...fullVillage } : prev));
          // Only apply the polygon if the user hasn't picked another village meanwhile
          if (fullVillage.boundary && latestVillageIdRef.current === village.id) {
            setSelectedVillagePolygon(fullVillage.boundary);
          }
        }
      } catch (err) {
        console.error('Village fetch failed for:', village.id, err);
      }
    }
  }, []);

  const clearSelection = useCallback(() => {
    latestVillageIdRef.current = null;
    setSelectedVillage(null);
    setSelectedVillagePolygon(null);
    setIsWorkspaceExpanded(false);
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
        isWorkspaceExpanded,
        setIsWorkspaceExpanded,
        timeRange,
        setTimeRange,
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
