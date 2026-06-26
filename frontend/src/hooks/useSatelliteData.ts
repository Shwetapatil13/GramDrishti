import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { EnvironmentalMetrics, GEEStatus } from '@/types';

export const useSatelliteData = (villageId: string | undefined, year: number) => {
  const queryResult = useQuery<EnvironmentalMetrics, Error>({
    queryKey: ['satellite', villageId, year],
    queryFn: () => apiService.get<EnvironmentalMetrics>(`/api/v1/satellite/${villageId}/metrics`, { year }),
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