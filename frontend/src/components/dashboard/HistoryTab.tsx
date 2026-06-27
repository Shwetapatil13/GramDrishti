import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useHistoricalChanges } from '@/hooks/useHistoricalData';
import { TrendChart } from '../charts/TrendChart';
import { HealthScoreTrendChart } from '../charts/HealthScoreTrendChart';
import { ChangeDetection } from './ChangeDetection';
import { useTranslation } from 'react-i18next';

export const HistoryTab: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const { data: changesData, isLoading: changesLoading, error } = useHistoricalChanges(selectedVillage?.id);
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-full pb-8">
        <div className="bg-surface-slate border border-surface-border rounded-card p-6 h-[400px] flex items-center justify-center">
          <span className="text-body text-text-muted">{t('dashboard.history_error', 'Historical analysis temporarily unavailable — try refreshing.')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-8">

      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
          {t('dashboard.overall_trajectory', 'OVERALL TRAJECTORY')}
        </h3>
        <HealthScoreTrendChart data={changesData?.score_changes} isLoading={changesLoading} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-mint"></span>
          {t('dashboard.notable_changes', 'NOTABLE CHANGES (2022-2026)')}
        </h3>
        <ChangeDetection changes={changesData?.top_changes} isLoading={changesLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 h-[200px]">
          <h4 className="text-mono text-text-secondary text-xs">{t('dashboard.ndvi_trend', 'NDVI TREND')}</h4>
          <TrendChart 
            data={changesData?.ndvi_changes} 
            isLoading={changesLoading} 
            valueKey="value" 
            color="#3cffd0" 
            name={t('metrics.ndvi_name', 'NDVI')} 
            chartType="line" 
          />
        </div>
        <div className="flex flex-col gap-2 h-[200px]">
          <h4 className="text-mono text-text-secondary text-xs">{t('dashboard.surface_water_trend', 'SURFACE WATER (HA)')}</h4>
          <TrendChart 
            data={changesData?.water_area_changes} 
            isLoading={changesLoading} 
            valueKey="value_ha" 
            color="#3B82F6" 
            name={t('metrics.water_area_name', 'Water Area')} 
            chartType="bar" 
          />
        </div>
      </div>
    </div>
  );
};