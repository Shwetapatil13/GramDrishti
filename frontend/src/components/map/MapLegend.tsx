import React, { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useMap } from 'react-leaflet';
import { useLayersMetadata } from '@/hooks/useLayersMetadata';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { API_BASE_URL } from '@/services/api';

/** Format a stat that the backend may omit or return as null. */
const fmt = (v: unknown, digits = 4) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(digits) : '—');

interface MapLegendProps {
  activeLayerId: string | null;
}

export const MapLegend: React.FC<MapLegendProps> = ({ activeLayerId }) => {
  const { layers } = useLayersMetadata();
  const { selectedVillage, selectedYear, hoverValue } = useVillageSelection();
  const villageId = selectedVillage?.id;
  const map = useMap();
  // State (not a ref) so we re-render into the portal as soon as it exists
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ALL hooks must be called unconditionally
  const activeLayer = useMemo(() => layers.find(l => l.id === activeLayerId), [layers, activeLayerId]);

  const gradient = useMemo(() => {
    const palette = activeLayer?.visualization?.palette;
    if (!palette || palette.length === 0) return 'transparent';
    if (palette.length === 1) return palette[0];
    const step = 100 / (palette.length - 1);
    const stops = palette.map((color, i) => `${color} ${i * step}%`).join(', ');
    return `linear-gradient(to right, ${stops})`;
  }, [activeLayer]);

  useEffect(() => {
    const mapWrapper = map.getContainer().parentElement;
    if (!mapWrapper) return;

    // Bottom-left so the legend doesn't cover the zoom/re-center buttons (bottom-right)
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.bottom = '1.5rem';
    el.style.left = '1rem';
    el.style.zIndex = '400';
    el.style.pointerEvents = 'all';
    mapWrapper.appendChild(el);
    setPortalEl(el);

    return () => {
      setPortalEl(null);
      if (mapWrapper.contains(el)) {
        mapWrapper.removeChild(el);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!activeLayerId || !villageId) {
      setStats(null);
      return;
    }

    let isMounted = true;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const start = `${selectedYear}-01-01`;
        const end = `${selectedYear}-12-31`;
        const id = encodeURIComponent(villageId);
        
        // This hits the updated backend endpoint that returns mean, median, min, max, stdDev
        const url = `${API_BASE_URL}/api/v1/satellite/statistics?layer=${encodeURIComponent(activeLayerId)}&geometryType=village&geometryId=${id}&start=${start}&end=${end}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error("Failed");
        
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (e) {
        if (isMounted) setStats(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, [activeLayerId, villageId, selectedYear]);


  // Early return AFTER all hooks
  if (!activeLayer) return null;

  const { name, visualization, ai_context } = activeLayer;
  const { min, max } = visualization;

  const content = (
    <div className="bg-canvas-black border border-surface-border rounded-xl shadow-lg p-4 w-72">
      <h4 className="text-sm font-semibold text-accent-green mb-1">{name}</h4>

      {ai_context?.interpretation && (
        <p className="text-xs text-content-dim mb-3 leading-relaxed">
          {ai_context.interpretation}
        </p>
      )}

      {/* Advanced Statistics Section */}
      <div className="bg-surface-slate rounded p-2 mb-3 border border-surface-border">
        {loading ? (
          <div className="flex justify-center p-2"><div className="animate-spin h-4 w-4 border-2 border-accent-green border-t-transparent rounded-full"></div></div>
        ) : stats && typeof stats.mean === 'number' ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-content-dim">Average</span>
              <span className="font-mono text-content-body font-bold">{fmt(stats.mean)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-content-dim">Median</span>
              <span className="font-mono text-content-body font-bold">{fmt(stats.median)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-content-dim">Minimum</span>
              <span className="font-mono text-content-body">{fmt(stats.min)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-content-dim">Maximum</span>
              <span className="font-mono text-content-body">{fmt(stats.max)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-content-dim">Std Dev</span>
              <span className="font-mono text-content-body">{fmt(stats.stdDev)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-content-dim">Pixels</span>
              <span className="font-mono text-content-body">{stats.pixelCount?.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-content-dim text-center py-2">Select a village to see regional stats</div>
        )}
      </div>

      {/* Live Cursor Value */}
      <div className="bg-surface-elevated rounded p-2 mb-3 border border-surface-border">
        <div className="flex justify-between items-center text-xs">
          <span className="text-content-dim">Cursor Value</span>
          {hoverValue ? (
            <span className="font-mono text-accent-green font-bold">{hoverValue.value.toFixed(5)}</span>
          ) : (
            <span className="text-content-dim italic">hover map to sample</span>
          )}
        </div>
        {hoverValue && (
          <div className="flex justify-between text-xs mt-1">
            <span className="text-content-dim">{hoverValue.lat.toFixed(5)}, {hoverValue.lng.toFixed(5)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-content-dim mb-1">
          <span>Color Scale</span>
        </div>
        <div className="h-3 w-full rounded-sm" style={{ background: gradient }} />
        <div className="flex justify-between text-xs font-mono text-content-body mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );

  // Wait for the portal: an inline fallback would render inside the Leaflet
  // container, where Leaflet swallows its clicks/scrolls.
  if (!portalEl) return null;

  return ReactDOM.createPortal(content, portalEl);
};
