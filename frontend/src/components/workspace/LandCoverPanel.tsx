import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { LandCoverChart } from '../charts/LandCoverChart';
import { Skeleton } from '../ui/Skeleton';

export const LandCoverPanel: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data, isLoading } = useSatelliteData(selectedVillage?.id, selectedYear);

  return (
    <div className="bg-surface-slate border border-surface-border rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-violet"></span>
            Land Cover Breakdown
          </h3>
          <p className="text-sm text-text-muted mt-1">
            Distribution of land types based on Sentinel-2 10m resolution data.
          </p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px] h-full">
        {isLoading ? (
          <Skeleton borderRadius="12px" />
        ) : (
          <LandCoverChart data={data?.landCover} isLoading={isLoading} totalAreaHa={selectedVillage?.area} layout="horizontal" />
        )}
      </div>
    </div>
  );
};
