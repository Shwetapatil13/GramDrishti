import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, WifiOff, MapPin } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { apiService } from '@/services/api';
import { Village } from '@/types';

/** Query Nominatim for villages in India when the backend has no results */
async function searchNominatim(query: string): Promise<Village[]> {
  console.log(`[VillageSearch][Nominatim] Querying OSM Nominatim for: "${query}"`);
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${query}, India`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('limit', '8');
  url.searchParams.set('featuretype', 'settlement');

  const res = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'en',
      // Nominatim requires a valid User-Agent per usage policy
      'User-Agent': 'GramDrishti/1.0 (agricultural analytics platform)',
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim HTTP ${res.status}: ${res.statusText}`);
  }

  const data: any[] = await res.json();
  console.log(`[VillageSearch][Nominatim] ${data.length} results returned from OSM`);

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
        console.log(`[VillageSearch][Nominatim] ✅ Real polygon found for "${item.display_name}" (${geojson.type})`);
      } else {
        console.warn(`[VillageSearch][Nominatim] ⚠️ No polygon for "${item.display_name}", geojson type: ${geojson?.type ?? 'none'}`);
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
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedVillage, flyToVillage } = useVillageSelection();
  const [results, setResults] = useState<Village[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'notfound' | 'generic' | null>(null);

  const runSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setError(null);
      setErrorType(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    setErrorType(null);
    console.log(`[VillageSearch] 🔍 Search started for: "${searchQuery}"`);

    let localResults: Village[] = [];
    let backendOnline = false;

    // Step 1: Try the local backend first
    try {
      console.log(`[VillageSearch] → Calling backend /api/v1/villages/search?q=${searchQuery}`);
      const res = await apiService.search<Village[]>('/api/v1/villages/search', { q: searchQuery });
      localResults = Array.isArray(res) ? res : [];
      backendOnline = true;
      console.log(`[VillageSearch] ✅ Backend returned ${localResults.length} local result(s)`);
    } catch (err: any) {
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNREFUSED' ||
        err?.message === 'Network Error' ||
        !err?.response;

      if (isNetworkError) {
        console.warn(`[VillageSearch] ⚠️ Backend offline. Falling back to Nominatim OSM.`);
        console.warn(`[VillageSearch] Backend error:`, err?.message);
        // Don't set error yet — try Nominatim first
      } else {
        const status = err?.response?.status;
        const detail = err?.response?.data?.detail || err?.message;
        console.error(`[VillageSearch] ❌ Backend search failed (HTTP ${status}):`, detail);
        setError(`Search failed: ${detail || 'Unknown error'}`);
        setErrorType('generic');
        setIsSearching(false);
        return;
      }
    }

    // Step 2: If backend had no matches or is offline, query Nominatim
    if (localResults.length < 3) {
      try {
        console.log(`[VillageSearch] → Querying Nominatim (backend had ${localResults.length} results)`);
        const nominatimResults = await searchNominatim(searchQuery);
        // Prioritize results that have polygons
        const sortedNominatim = [...nominatimResults].sort((a, b) => {
          if (a.boundary && !b.boundary) return -1;
          if (!a.boundary && b.boundary) return 1;
          return 0;
        });

        const merged = [...localResults];
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
        console.log(`[VillageSearch] 📍 Total results after Nominatim merge: ${merged.length}`);
        setResults(merged);

        if (merged.length === 0) {
          setError(`No villages found for "${searchQuery}". Try a different spelling.`);
          setErrorType('notfound');
        }
      } catch (nominatimErr: any) {
        console.error(`[VillageSearch] ❌ Nominatim fallback also failed:`, nominatimErr?.message);
        if (localResults.length > 0) {
          setResults(localResults);
        } else {
          if (!backendOnline) {
            setError(`Backend server is offline. OSM search also failed: ${nominatimErr?.message}`);
          } else {
            setError(`No results found for "${searchQuery}".`);
          }
          setErrorType(backendOnline ? 'notfound' : 'network');
        }
      }
    } else {
      setResults(localResults);
    }

    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 500);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const handleSelect = (village: Village) => {
    console.log(
      `[VillageSearch] 🏘️ Village selected:`,
      JSON.stringify({ id: village.id, name: village.name, district: village.district, source: village.source, hasBoundary: !!village.boundary }, null, 2)
    );
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
            placeholder="Search any village..."
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