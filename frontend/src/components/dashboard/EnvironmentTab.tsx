import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { MetricsPanel } from './MetricsPanel';
import { ClimateAssessment } from './ClimateAssessment';
import { LandCoverChart } from '../charts/LandCoverChart';

export const EnvironmentTab: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data, isLoading, error } = useSatelliteData(selectedVillage?.id, selectedYear);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <MetricsPanel data={data} isLoading={isLoading} error={error} />
      
      {/* Land Cover Breakdown Chart */}
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
          LAND COVER BREAKDOWN
        </h3>
        <LandCoverChart data={data?.landCover} isLoading={isLoading} />
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