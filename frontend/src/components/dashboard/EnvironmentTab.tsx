import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { MetricsPanel } from './MetricsPanel';
import { ClimateAssessment } from './ClimateAssessment';

export const EnvironmentTab: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  // Using hardcoded 2024 for now, will wire year selector in Level 7
  const { data, isLoading, error } = useSatelliteData(selectedVillage?.id, 2024);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <MetricsPanel data={data} isLoading={isLoading} error={error} />
      
      {/* Charts placeholders for Level 4 */}
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
          LAND COVER BREAKDOWN
        </h3>
        <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[200px] flex items-center justify-center">
          <span className="text-body text-text-muted">Land Cover Chart (Level 7)</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
          CLIMATE ASSESSMENT
        </h3>
        <ClimateAssessment />
      </div>
    </div>
  );
};