import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { HistoricalData, ChangeStatistics } from '@/types';

export const useHistoricalData = (villageId: string | undefined) => {
  const queryResult = useQuery<HistoricalData, Error>({
    queryKey: ['history', villageId],
    queryFn: () => apiService.get<HistoricalData>(`/api/v1/history/${villageId}`),
    enabled: !!villageId,
    staleTime: Infinity, // History won't change often
    retry: 1,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};

export const useHistoricalChanges = (villageId: string | undefined) => {
  const queryResult = useQuery<ChangeStatistics, Error>({
    queryKey: ['history', 'changes', villageId],
    queryFn: () => apiService.get<ChangeStatistics>(`/api/v1/history/${villageId}/changes`),
    enabled: !!villageId,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};