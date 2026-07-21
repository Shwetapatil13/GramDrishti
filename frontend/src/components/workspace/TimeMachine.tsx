import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { History } from 'lucide-react';

export const TimeMachine: React.FC = () => {
  const { selectedYear, setSelectedYear } = useVillageSelection();
  const currentYear = new Date().getFullYear();
  // Generate current year and previous 5 years
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="bg-canvas-black border border-surface-border rounded-xl p-3 flex items-center gap-3 mt-8 sticky bottom-4 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] mx-auto w-fit">
      <div className="flex items-center justify-center pl-2">
        <History className="w-5 h-5 text-brand-mint" />
      </div>

      <div className="flex items-center gap-2 px-1">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              selectedYear === year 
                ? 'bg-brand-mint text-text-inverted scale-110 shadow-lg' 
                : 'bg-surface-slate text-text-muted hover:text-text-primary hover:bg-surface-elevated'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};
