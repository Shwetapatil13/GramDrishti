import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { apiService } from '@/services/api';
import { Village } from '@/types';

export const VillageSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedVillage, flyToVillage } = useVillageSelection();
  const [results, setResults] = useState<Village[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await apiService.search<Village[]>('/api/v1/villages/search', { q: query });
        setResults(res);
      } catch {
        // Handle silently
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (village: Village) => {
    setSelectedVillage(village);
    flyToVillage(village);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="absolute top-4 left-4 z-[400] w-[280px]">
      <div className="relative">
        <div className="bg-surface-slate border border-surface-border rounded-full flex items-center px-4 py-2 shadow-md">
          <Search className="w-4 h-4 text-text-secondary mr-2" />
          <input
            type="text"
            placeholder="Search villages..."
            className="bg-transparent border-none outline-none text-body text-text-primary w-full placeholder:text-text-secondary"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => setIsOpen(query.length > 0)}
          />
        </div>
        
        {isOpen && (results.length > 0 || isSearching) && (
          <div className="absolute top-full mt-2 w-full bg-surface-slate border border-surface-border rounded-xl overflow-hidden shadow-lg">
            {isSearching ? (
               <div className="p-3 text-center text-text-muted"><Loader2 className="w-4 h-4 animate-spin mx-auto"/></div>
            ) : (
              results.map((village) => (
                <div
                  key={village.id}
                  className="p-3 hover:bg-brand-mint/10 hover:text-brand-mint cursor-pointer border-b border-surface-border last:border-b-0 transition-colors"
                  onClick={() => handleSelect(village)}
                >
                  <div className="text-body font-medium">{village.name}</div>
                  <div className="text-mono text-[10px] text-text-secondary">{village.district}, {village.state}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};