import React, { useEffect, useState } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { apiService } from '@/services/api';
import { Skeleton } from '../ui/Skeleton';

interface AssessmentData {
  heat_stress: { risk_level: string };
  rainfall_adequacy: { adequacy: string; percent_of_normal: number };
  drought_risk: { risk_level: string };
}

export const ClimateAssessment: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedVillage) return;

    let mounted = true;
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const data = await apiService.get<AssessmentData>(`/api/v1/weather/${selectedVillage.id}/assessment`, { year: selectedYear });
        if (mounted) setAssessment(data);
      } catch {
        // Silently handle error as component shows unavailable state
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAssessment();

    return () => {
      mounted = false;
    };
  }, [selectedVillage, selectedYear]);

  if (loading) {
    return (
      <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[140px]">
        <Skeleton borderRadius="4px" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[120px] flex items-center justify-center">
        <span className="text-body text-text-muted">Climate Assessment unavailable</span>
      </div>
    );
  }

  const { heat_stress, rainfall_adequacy, drought_risk } = assessment;

  // Rainfall Adequacy Bar calculation
  const percent = rainfall_adequacy.percent_of_normal || 100;
  const clampedPercent = Math.min(Math.max(percent, 0), 200); // 0 to 200 scale
  const barPosition = `${(clampedPercent / 200) * 100}%`;
  
  let adequacyColor = '#3cffd0'; // normal
  if (rainfall_adequacy.adequacy === 'deficit') adequacyColor = '#ef4444';
  if (rainfall_adequacy.adequacy === 'surplus') adequacyColor = '#3860be';

  const riskColors: Record<string, string> = {
    low: 'bg-brand-mint text-canvas-black',
    moderate: 'bg-semantic-warning text-canvas-black',
    high: 'bg-semantic-danger text-text-primary',
    extreme: 'bg-[#991b1b] text-text-primary', // darker red
  };

  return (
    <div className="bg-surface-slate border border-surface-border rounded-xl p-5 flex flex-col gap-5">
      
      {/* Rainfall Adequacy Bar */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-mono text-text-secondary text-xs">RAINFALL ADEQUACY</span>
          <span className="text-mono text-text-primary text-xs uppercase" style={{ color: adequacyColor }}>
            {rainfall_adequacy.adequacy} ({percent.toFixed(0)}%)
          </span>
        </div>
        <div className="relative h-2 bg-surface-border rounded-full w-full overflow-hidden">
          {/* Gradient scale background */}
          <div className="absolute inset-0 bg-gradient-to-r from-semantic-danger via-brand-mint to-brand-blue opacity-30"></div>
          {/* Indicator mark */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-text-primary rounded-full transition-all duration-500 shadow-md"
            style={{ left: `calc(${barPosition} - 4px)`, backgroundColor: adequacyColor }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Heat Stress */}
        <div className="flex flex-col gap-2">
          <span className="text-mono text-text-secondary text-xs">HEAT STRESS</span>
          <div className={`w-fit px-3 py-1 rounded-tag text-mono text-xs uppercase ${riskColors[heat_stress.risk_level] || riskColors.low}`}>
            {heat_stress.risk_level}
          </div>
        </div>

        {/* Drought Risk */}
        <div className="flex flex-col gap-2">
          <span className="text-mono text-text-secondary text-xs">DROUGHT RISK</span>
          <div className={`w-fit px-3 py-1 rounded-tag text-mono text-xs uppercase ${riskColors[drought_risk.risk_level] || riskColors.low}`}>
            {drought_risk.risk_level}
          </div>
        </div>
      </div>
      
    </div>
  );
};