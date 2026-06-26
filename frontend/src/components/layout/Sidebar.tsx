import React, { useState } from 'react';
import { VILLAGES } from '@/constants/villages';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { Search } from 'lucide-react';
import { WeatherWidget } from '../dashboard/WeatherWidget';
import { VillageScoreBadge } from './VillageScoreBadge';

export const Sidebar: React.FC = () => {
  const { selectedVillage, setSelectedVillage, flyToVillage } = useVillageSelection();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVillages = VILLAGES.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nameHindi.includes(searchQuery)
  );

  const handleSelect = (village: typeof VILLAGES[0]) => {
    setSelectedVillage(village);
    flyToVillage(village);
  };

  return (
    <aside className="w-[280px] bg-canvas-black border-r border-surface-border flex flex-col h-full shrink-0 hidden md:flex">
      <div className="p-4 border-b border-surface-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search villages..."
            className="w-full bg-surface-slate border border-surface-border rounded-button py-2 pl-9 pr-4 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <WeatherWidget />

      <div className="flex-1 overflow-y-auto">
        {filteredVillages.map((village) => {
          const isSelected = selectedVillage?.id === village.id;
          return (
            <div
              key={village.id}
              className={`p-4 cursor-pointer border-l-4 transition-colors ${
                isSelected
                  ? 'border-l-brand-mint bg-surface-slate'
                  : 'border-l-transparent hover:border-l-brand-console hover:bg-surface-slate/50'
              }`}
              onClick={() => handleSelect(village)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-heading-md text-text-primary">{village.name}</h3>
                  <p className="text-mono text-text-secondary mt-1">{village.district}</p>
                </div>
                <VillageScoreBadge villageId={village.id} />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};