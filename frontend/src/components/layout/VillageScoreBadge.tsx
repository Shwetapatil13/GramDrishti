import React from 'react';
import { useScores } from '@/hooks/useScores';
import { useVillageSelection } from '@/hooks/useVillageSelection';

interface VillageScoreBadgeProps {
  villageId: string;
}

export const VillageScoreBadge: React.FC<VillageScoreBadgeProps> = ({ villageId }) => {
  const { selectedYear } = useVillageSelection();
  const { data: score, isLoading } = useScores(villageId, selectedYear);

  if (isLoading || !score) {
    return (
      <div className="bg-surface-border text-text-muted text-mono rounded-tag px-2 py-1 animate-pulse">
        --/100
      </div>
    );
  }

  let colorClass = 'bg-[#ef4444] text-[#fca5a5]'; // poor
  const val = score.overall;
  if (val >= 80) colorClass = 'bg-[#166534] text-[#86efac]'; // excellent
  else if (val >= 60) colorClass = 'bg-[#16a34a] text-canvas-black'; // good
  else if (val >= 40) colorClass = 'bg-[#f59e0b] text-canvas-black'; // medium

  return (
    <div className={`text-mono rounded-tag px-2 py-1 ${colorClass}`}>
      {val.toFixed(0)}/100
    </div>
  );
};