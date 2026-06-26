import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { AIRecommendation } from '@/types';

export const useRecommendations = (villageId: string | undefined, year: number) => {
  const queryClient = useQueryClient();

  const queryResult = useQuery<AIRecommendation[], Error>({
    queryKey: ['recommendations', villageId, year],
    queryFn: () => apiService.get<AIRecommendation[]>(`/api/v1/recommendations/${villageId}`, { year }),
    enabled: !!villageId,
    staleTime: Infinity,
    retry: 1,
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      // In a real app, we might force the backend to bypass cache
      // Here we just invalidate to re-fetch or rely on the backend's logic if it supports forcing.
      // Assuming a POST to ai/recommendations might regenerate or a specific flag
      // We will invalidate cache for now to trigger refetch, though backend caches it for 24h.
      // To actually force regenerate, we would need to pass a bypass flag to backend or just simulate loading.
      // For MVP, we'll just invalidate.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', villageId, year] });
    },
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading || regenerateMutation.isPending,
    error: queryResult.error,
    regenerate: regenerateMutation.mutate,
  };
};

export interface RiskItem {
  component: string;
  score: number;
  explanation: string;
  risk_level: string;
  urgency: string;
  one_line_explanation: string;
}

export const useRisks = (villageId: string | undefined, year: number) => {
  const queryResult = useQuery<RiskItem[], Error>({
    queryKey: ['risks', villageId, year],
    queryFn: () => apiService.get<RiskItem[]>(`/api/v1/recommendations/${villageId}/risks`, { year }),
    enabled: !!villageId,
    staleTime: Infinity,
  });

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};