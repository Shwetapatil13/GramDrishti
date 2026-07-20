import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export interface LayerMetadata {
  id: string;
  provider: string;
  category: string;
  name: string;
  description: string;
  visualization: {
    palette: string[];
    min: number;
    max: number;
    opacity: number;
    smoothing: boolean;
  };
  temporal: {
    supportsHistorical: boolean;
    supportsTimeSeries: boolean;
  };
  analytics: {
    supportsStatistics: boolean;
    supportsExport: boolean;
    supportsComparison: boolean;
  };
  ai_context?: {
    interpretation: string;
    thresholds: Record<string, string>;
  };
}

export function useLayersMetadata() {
  const [layers, setLayers] = useState<LayerMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchLayers = async () => {
      try {
        setIsLoading(true);
        const res = await apiService.get<{ layers: LayerMetadata[] }>('/api/v1/satellite/layers');
        console.log("Fetched layers response:", res);
        if (mounted && res?.layers && res.layers.length > 0) {
          setLayers(res.layers);
        } else if (mounted) {
          console.error("No layers in response", res);
          // FALLBACK FOR DEBUGGING
          setLayers([{
            id: 'DEBUG', provider: 'DebugProvider', category: 'Optical',
            name: 'Debug Layer (API Empty)', description: 'Debug',
            visualization: { palette: [], min: 0, max: 1, opacity: 1, smoothing: true },
            temporal: { supportsHistorical: false, supportsTimeSeries: false },
            analytics: { supportsStatistics: false, supportsExport: false, supportsComparison: false }
          }]);
        }
      } catch (err) {
        console.error("Failed to fetch layers", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch layers metadata');
          setLayers([{
            id: 'DEBUG_ERR', provider: 'DebugProvider', category: 'Optical',
            name: 'Debug Layer (API Error)', description: String(err),
            visualization: { palette: [], min: 0, max: 1, opacity: 1, smoothing: true },
            temporal: { supportsHistorical: false, supportsTimeSeries: false },
            analytics: { supportsStatistics: false, supportsExport: false, supportsComparison: false }
          }]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayers();
    return () => { mounted = false; };
  }, []);

  return { layers, isLoading, error };
}
