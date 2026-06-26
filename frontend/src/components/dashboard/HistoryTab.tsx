import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useHistoricalChanges } from '@/hooks/useHistoricalData';
import { TimelineSlider } from './TimelineSlider';
import { TrendChart } from '../charts/TrendChart';
import { HealthScoreTrendChart } from '../charts/HealthScoreTrendChart';
import { ChangeDetection } from './ChangeDetection';

export const HistoryTab: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const { data: changesData, isLoading: changesLoading } = useHistoricalChanges(selectedVillage?.id);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-8">
      <TimelineSlider />

      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
          OVERALL TRAJECTORY
        </h3>
        <HealthScoreTrendChart data={changesData?.score_changes} isLoading={changesLoading} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-mint"></span>
          NOTABLE CHANGES (2022-2026)
        </h3>
        <ChangeDetection changes={changesData?.top_changes} isLoading={changesLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 h-[200px]">
          <h4 className="text-mono text-text-secondary text-xs">NDVI TREND</h4>
          <TrendChart 
            data={changesData?.ndvi_changes} 
            isLoading={changesLoading} 
            valueKey="value" 
            color="#3cffd0" 
            name="NDVI" 
            chartType="line" 
          />
        </div>
        <div className="flex flex-col gap-2 h-[200px]">
          <h4 className="text-mono text-text-secondary text-xs">SURFACE WATER (HA)</h4>
          <TrendChart 
            data={changesData?.water_area_changes} 
            isLoading={changesLoading} 
            valueKey="value_ha" 
            color="#3860be" 
            name="Water Area" 
            chartType="bar" 
          />
        </div>
      </div>
    </div>
  );
};