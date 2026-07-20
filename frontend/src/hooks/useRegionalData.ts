import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { FeatureCollection } from 'geojson';

export interface RegionalMetric {
  id: string;
  name: string;
  ndvi: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  areaHa: number;
}

export interface RegionalData {
  features: FeatureCollection;
  metrics: Record<string, RegionalMetric>;
}

export function useRegionalData(year: number) {
  const queryResult = useQuery<RegionalData, Error>({
    queryKey: ['regionalData', year],
    queryFn: async () => {
      const [featuresRes, metricsRes] = await Promise.all([
        apiService.get<FeatureCollection>('/api/v1/villages/boundaries/all'),
        apiService.get<Record<string, RegionalMetric>>('/api/v1/satellite/regions/metrics', { year })
      ]);

      return {
        features: featuresRes,
        metrics: metricsRes
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  return {
    data: queryResult.data ?? null,
    isLoading: queryResult.isLoading,
    error: queryResult.error ?? null,
  };
}

