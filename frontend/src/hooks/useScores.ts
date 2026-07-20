import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { VillageHealthScore } from '@/types';
import { useVillageSelection } from './useVillageSelection';

export const useScores = (villageId: string | undefined, year: number) => {
  const { selectedVillagePolygon } = useVillageSelection();
  const queryKey = ['scores', villageId, year, selectedVillagePolygon ? JSON.stringify(selectedVillagePolygon).slice(0, 50) : null];
  console.log('[INSTRUMENT 5 - useScores] queryKey:', queryKey);

  const queryResult = useQuery<VillageHealthScore, Error>({
    queryKey,
    queryFn: async () => {
      if (selectedVillagePolygon) {
        const url = `/api/v1/scores/analyze`;
        console.log('[INSTRUMENT 5 - useScores] Sending POST to', url, 'payload:', { village_id: villageId, year });
        return apiService.post<VillageHealthScore>(url, {
          village_id: villageId,
          polygon: selectedVillagePolygon,
          year: year
        });
      }
      const url = `/api/v1/scores/${villageId}`;
      console.log('[INSTRUMENT 5 - useScores] Sending GET to', url);
      return apiService.get<VillageHealthScore>(url, { year });
    },
    enabled: !!villageId,
    staleTime: Infinity, // Scores don't change
    retry: 1,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};