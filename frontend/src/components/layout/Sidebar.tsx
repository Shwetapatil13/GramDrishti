import React, { useState, useEffect } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { Search, Loader2 } from 'lucide-react';
import { WeatherWidget } from '../dashboard/WeatherWidget';
import { VillageScoreBadge } from './VillageScoreBadge';
import { X } from 'lucide-react';
import { apiService } from '@/services/api';
import { Village } from '@/types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { selectedVillage, setSelectedVillage, flyToVillage } = useVillageSelection();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Village[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await apiService.search<Village[]>('/api/v1/villages/search', { q: searchQuery });
        setSearchResults(results);
      } catch {
        // Handle silently
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (village: Village) => {
    setSelectedVillage(village);
    flyToVillage(village);
    if (onClose) onClose();
  };

  const sidebarClasses = `
    w-[280px] bg-canvas-black border-r border-surface-border flex flex-col h-full shrink-0
    absolute md:relative z-[600] md:z-auto transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[550] md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={sidebarClasses}>
        <div className="p-4 border-b border-surface-border flex flex-col gap-3">
          {onClose && (
            <div className="flex justify-between items-center md:hidden mb-1">
              <span className="text-mono text-text-primary">VILLAGES</span>
              <button onClick={onClose} className="text-text-muted"><X className="w-5 h-5"/></button>
            </div>
          )}
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

      <div className="flex-1 overflow-y-auto relative">
        {isSearching && (
          <div className="absolute inset-0 bg-canvas-black/50 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-brand-mint animate-spin" />
          </div>
        )}
        {searchResults.map((village) => {
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
                  <p className="text-mono text-text-secondary mt-1 text-[10px]">{village.district}, {village.state}</p>
                </div>
                <VillageScoreBadge villageId={village.id} />
              </div>
            </div>
          );
        })}
        {!isSearching && searchResults.length === 0 && searchQuery.length >= 3 && (
           <div className="p-4 text-center text-text-muted text-sm">No villages found.</div>
        )}
        {!isSearching && searchResults.length === 0 && searchQuery.length < 3 && (
           <div className="p-4 text-center text-text-muted text-sm">Type at least 3 characters to search OpenStreetMap.</div>
        )}
      </div>
      </aside>
    </>
  );
};