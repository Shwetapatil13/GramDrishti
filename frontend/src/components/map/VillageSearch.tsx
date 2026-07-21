import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, WifiOff, MapPin } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { apiService } from '@/services/api';
import { Village } from '@/types';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

/** Query Nominatim for villages in India when the backend has no results */
interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    country_code?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    district?: string;
    state_district?: string;
    state?: string;
  };
  geojson?: GeoJSON.Geometry;
}

async function searchNominatim(searchQuery: string, signal?: AbortSignal): Promise<Village[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    searchQuery
  )}&format=jsonv2&addressdetails=1&polygon_geojson=1&countrycodes=in&limit=5`;

  const res = await fetch(url, {
    signal,
    headers: {
      'User-Agent': 'GramDrishtiApp/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim API returned ${res.status}`);
  }

  const data: NominatimResult[] = await res.json();

  return data
    .filter((item) => {
      // Only include items that look like villages/towns/cities in India
      const addr = item.address || {};
      const isInIndia =
        addr.country_code === 'in' ||
        (item.display_name || '').toLowerCase().includes('india');
      return isInIndia;
    })
    .map((item) => {
      const addr = item.address || {};
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      // Extract the polygon geometry from Nominatim if available
      const geojson = item.geojson;
      let boundary: Village['boundary'] = null;
      if (geojson && (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon')) {
        boundary = geojson;
      }

      const villageName =
        addr.village ||
        addr.town ||
        addr.city ||
        addr.municipality ||
        addr.county ||
        item.name ||
        item.display_name.split(',')[0].trim();

      const district =
        addr.county ||
        addr.district ||
        addr.state_district ||
        '';

      const state = addr.state || '';

      return {
        id: `nominatim-${item.place_id}`,
        name: villageName,
        nameHindi: villageName,
        district,
        state,
        coordinates: [lat, lon] as [number, number],
        boundary,
        area: 0,
        source: 'nominatim' as const,
        osm_id: item.place_id,
      };
    });
}

export const VillageSearch: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedVillage, flyToVillage } = useVillageSelection();
  const [results, setResults] = useState<Village[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'notfound' | 'generic' | null>(null);

  const searchReqIdRef = React.useRef(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const runSearch = useCallback(async (searchQuery: string) => {
    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;
    if (searchQuery.length < 3) {
      setResults([]);
      setError(null);
      setErrorType(null);
      return;
    }

    const currentReqId = ++searchReqIdRef.current;
    setIsSearching(true);
    setError(null);
    setErrorType(null);

    let localResults: Village[] = [];
    let backendOnline = false;

    // Step 1: Try local backend search
    try {
      const res = await apiService.search<Village[]>('/api/v1/villages/search', { q: searchQuery }, { signal });
      localResults = Array.isArray(res) ? res : [];
      backendOnline = true;
    } catch (error: unknown) {
      if (axios.isCancel(error) || (error as any).name === 'AbortError') return;
      const err = error as any;
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNREFUSED' ||
        err?.message === 'Network Error' ||
        !err?.response;

      if (!isNetworkError) {
        const detail = err?.response?.data?.detail || err?.message;
        if (currentReqId === searchReqIdRef.current) {
          setError(`Search failed: ${detail || 'Unknown error'}`);
          setErrorType('generic');
          setIsSearching(false);
        }
        return;
      }
    }

    // Drop stale response if another search was launched in the meantime (Suspect A fix)
    if (currentReqId !== searchReqIdRef.current) return;

    // Step 2: Query Nominatim in parallel or as fallback (Suspect B fix)
    let merged = [...localResults];
    try {
      const nominatimResults = await searchNominatim(searchQuery, signal);

      if (currentReqId !== searchReqIdRef.current) return;

      const sortedNominatim = [...nominatimResults].sort((a, b) => {
        if (a.boundary && !b.boundary) return -1;
        if (!a.boundary && b.boundary) return 1;
        return 0;
      });

      const seenNames = new Set(localResults.map((l) => l.name.toLowerCase()));

      for (const n of sortedNominatim) {
        const baseName = n.name.toLowerCase().replace(/\s+district$/, '');
        let isDuplicate = false;
        
        for (const seen of seenNames) {
          const seenBase = seen.replace(/\s+district$/, '');
          if (seenBase === baseName || seen === n.name.toLowerCase()) {
            isDuplicate = true;
            break;
          }
        }
        
        if (!isDuplicate) {
          merged.push(n);
          seenNames.add(n.name.toLowerCase());
          seenNames.add(baseName);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      // Nominatim failed, keep localResults
    }

    if (currentReqId !== searchReqIdRef.current) return;

    setResults(merged);
    if (merged.length === 0) {
      setError(`No villages found for "${searchQuery}". Try a different spelling.`);
      setErrorType(backendOnline ? 'notfound' : 'network');
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const handleSelect = (village: Village) => {
    console.log('[INSTRUMENT 1 - VillageSearch] handleSelect clicked:', {
      id: village.id,
      name: village.name,
      source: village.source,
      coordinates: village.coordinates,
      hasBoundary: !!village.boundary,
    });
    setSelectedVillage(village);
    flyToVillage(village);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div className="absolute top-4 left-4 z-[400] w-[300px]">
      <div className="relative">
        <div className="bg-surface-slate border border-surface-border rounded-full flex items-center px-4 py-2.5 shadow-lg backdrop-blur-sm">
          <Search className="w-4 h-4 text-text-secondary mr-2 shrink-0" />
          <input
            type="text"
            placeholder={t('map.search_placeholder', 'Search any village...')}
            className="bg-transparent border-none outline-none text-body text-text-primary w-full placeholder:text-text-secondary text-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => setIsOpen(query.length > 0)}
          />
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-brand-mint shrink-0 ml-2" />}
        </div>

        {isOpen && (results.length > 0 || error) && (
          <div className="absolute top-full mt-2 w-full bg-surface-slate border border-surface-border rounded-xl overflow-hidden shadow-xl max-h-72 overflow-y-auto">
            {error ? (
              <div className="p-3 flex items-start gap-2 text-sm">
                {errorType === 'network' ? (
                  <WifiOff className="w-4 h-4 text-semantic-warning mt-0.5 shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                )}
                <span className="text-text-secondary">{error}</span>
              </div>
            ) : (
              results.map((village) => (
                <div
                  key={village.id}
                  className="p-3 hover:bg-brand-mint/10 hover:text-brand-mint cursor-pointer border-b border-surface-border last:border-b-0 transition-colors"
                  onClick={() => handleSelect(village)}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-body font-medium text-sm">{village.name}</div>
                    {village.source === 'nominatim' && (
                      <span className="text-[9px] font-mono text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded-full">OSM</span>
                    )}
                    {village.boundary && (
                      <span className="text-[9px] font-mono text-brand-mint bg-brand-mint/10 px-1.5 py-0.5 rounded-full">polygon</span>
                    )}
                  </div>
                  <div className="text-mono text-[10px] text-text-secondary mt-0.5">
                    {[village.district, village.state].filter(Boolean).join(', ')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};