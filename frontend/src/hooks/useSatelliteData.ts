import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { EnvironmentalMetrics, GEEStatus } from '@/types';
import { useVillageSelection } from './useVillageSelection';

export const useSatelliteData = (villageId: string | undefined, year: number) => {
  const { selectedVillagePolygon } = useVillageSelection();

  const queryKey = ['satellite', villageId, year, selectedVillagePolygon ? JSON.stringify(selectedVillagePolygon).slice(0, 50) : null];
  console.log('[INSTRUMENT 5 - useSatelliteData] queryKey:', queryKey);

  const queryResult = useQuery<EnvironmentalMetrics, Error>({
    queryKey,
    queryFn: async () => {
      // If we have a polygon, send it to the new analyze endpoint
      if (selectedVillagePolygon) {
        const url = `/api/v1/analyze`;
        console.log('[INSTRUMENT 5 - useSatelliteData] Sending POST to', url, 'payload:', { village_id: villageId, year });
        const res = await apiService.post<{ metrics: EnvironmentalMetrics }>(url, {
          village_id: villageId,
          polygon: selectedVillagePolygon,
          year: year
        });
        return res.metrics;
      }
      // Fallback to legacy GET endpoint if polygon is not available yet
      const url = `/api/v1/satellite/${villageId}/metrics`;
      console.log('[INSTRUMENT 5 - useSatelliteData] Sending GET to', url);
      return apiService.get<EnvironmentalMetrics>(url, { year });
    },
    enabled: !!villageId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  const geeStatus: GEEStatus = {
    loading: queryResult.isLoading || queryResult.isFetching,
    cached: queryResult.data?.dataSource === 'cached' || queryResult.data?.dataSource === 'mock',
    error: queryResult.error?.message,
  };

  return {
    data: queryResult.data,
    geeStatus,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
  };
};