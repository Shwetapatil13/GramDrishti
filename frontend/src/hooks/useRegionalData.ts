import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<RegionalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [featuresRes, metricsRes] = await Promise.all([
          apiService.get<FeatureCollection>('/api/v1/villages/boundaries/all'),
          apiService.get<Record<string, RegionalMetric>>('/api/v1/satellite/regions/metrics', { year })
        ]);

        if (mounted) {
          setData({
            features: featuresRes,
            metrics: metricsRes
          });
        }
      } catch (err: any) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, [year]);

  return { data, isLoading, error };
}
