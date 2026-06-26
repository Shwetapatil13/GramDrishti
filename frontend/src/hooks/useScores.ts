import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { VillageHealthScore } from '@/types';

export const useScores = (villageId: string | undefined, year: number) => {
  const queryResult = useQuery<VillageHealthScore, Error>({
    queryKey: ['scores', villageId, year],
    queryFn: () => apiService.get<VillageHealthScore>(`/api/v1/scores/${villageId}`, { year }),
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