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

// Layer metadata is static per session; share one request between all consumers
// (legend, layer control, hover inspector, ...) instead of fetching it per component.
let layersPromise: Promise<LayerMetadata[]> | null = null;

function fetchLayersOnce(): Promise<LayerMetadata[]> {
  if (!layersPromise) {
    layersPromise = apiService
      .get<{ layers: LayerMetadata[] }>('/api/v1/satellite/layers')
      .then((res) => res?.layers ?? [])
      .catch((err) => {
        layersPromise = null; // allow a retry on next mount
        throw err;
      });
  }
  return layersPromise;
}

export function useLayersMetadata() {
  const [layers, setLayers] = useState<LayerMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchLayersOnce()
      .then((result) => {
        if (!mounted) return;
        setLayers(result);
        setError(result.length === 0 ? 'No satellite layers available' : null);
      })
      .catch((err) => {
        console.error("Failed to fetch layers", err);
        if (mounted) {
          setLayers([]);
          setError(err instanceof Error ? err.message : 'Failed to fetch layers metadata');
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  return { layers, isLoading, error };
}
