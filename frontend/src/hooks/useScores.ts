import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { VillageHealthScore } from '@/types';
import { useVillageSelection } from './useVillageSelection';

export const useScores = (villageId: string | undefined, year: number) => {
  const { selectedVillagePolygon } = useVillageSelection();
  const queryResult = useQuery<VillageHealthScore, Error>({
    queryKey: ['scores', villageId, year, selectedVillagePolygon],
    queryFn: async () => {
      if (selectedVillagePolygon) {
        return apiService.post<VillageHealthScore>(`/api/v1/scores/analyze`, {
          village_id: villageId,
          polygon: selectedVillagePolygon,
          year: year
        });
      }
      return apiService.get<VillageHealthScore>(`/api/v1/scores/${villageId}`, { year });
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