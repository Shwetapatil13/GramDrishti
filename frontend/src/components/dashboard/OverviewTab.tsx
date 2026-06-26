import React from 'react';
import { ScoreCard } from './ScoreCard';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Skeleton } from '../ui/Skeleton';

export const OverviewTab: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data: weather } = useSatelliteData(selectedVillage?.id, selectedYear);
  const { data: recommendations, isLoading: recsLoading } = useRecommendations(selectedVillage?.id, selectedYear);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <ScoreCard />
      
      {/* Weather Quick Summary inside Overview */}
      <div className="flex flex-col gap-3 mt-2">
        <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
          QUICK CONDITIONS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-slate border border-surface-border rounded-xl p-3 flex justify-between items-center">
            <span className="text-mono text-text-secondary text-[10px]">TEMP</span>
            <span className="text-body text-text-primary text-sm">{weather?.temperature?.toFixed(1) || '--'}°C</span>
          </div>
          <div className="bg-surface-slate border border-surface-border rounded-xl p-3 flex justify-between items-center">
            <span className="text-mono text-text-secondary text-[10px]">RAIN</span>
            <span className="text-body text-text-primary text-sm">{weather?.rainfall?.toFixed(1) || '--'}mm</span>
          </div>
        </div>
      </div>

      {/* Recommendations Preview for Level 10 */}
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-violet"></span>
          TOP RECOMMENDATIONS
        </h3>
        
        {recsLoading && (
          <div className="flex flex-col gap-3">
            <div className="h-[150px] bg-surface-slate border border-surface-border rounded-xl">
              <Skeleton borderRadius="12px" />
            </div>
            <div className="h-[150px] bg-surface-slate border border-surface-border rounded-xl">
              <Skeleton borderRadius="12px" />
            </div>
          </div>
        )}

        {!recsLoading && recommendations && recommendations.length > 0 && (
          <div className="flex flex-col gap-3">
            {recommendations.slice(0, 2).map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        )}

        {!recsLoading && (!recommendations || recommendations.length === 0) && (
          <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[100px] flex items-center justify-center">
            <span className="text-body text-text-muted text-sm">Recommendations unavailable</span>
          </div>
        )}
      </div>
    </div>
  );
};