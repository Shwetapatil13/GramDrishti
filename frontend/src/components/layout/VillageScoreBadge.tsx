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

  let colorClass = 'bg-semantic-danger text-white'; // poor
  const val = score.overall;
  if (val >= 80) colorClass = 'bg-score-excellent text-canvas-black'; // excellent
  else if (val >= 60) colorClass = 'bg-score-good text-canvas-black'; // good
  else if (val >= 40) colorClass = 'bg-score-medium text-canvas-black'; // medium

  return (
    <div className={`text-mono rounded-tag px-2 py-1 ${colorClass}`}>
      {val.toFixed(0)}/100
    </div>
  );
};