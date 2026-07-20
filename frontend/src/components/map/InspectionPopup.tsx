import React, { useEffect, useState, useMemo } from 'react';
import { Popup } from 'react-leaflet';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useMapLayers } from '@/hooks/MapLayersContext';
import { useLayersMetadata } from '@/hooks/useLayersMetadata';

interface ClickData {
  value: number;
  lat: number;
  lng: number;
  layer: string;
  interpretation: string;
  mean?: number;
}

function interpretValue(layer: string, value: number): string {
  switch (layer) {
    case 'NDVI':
    case 'GNDVI':
    case 'EVI':
    case 'SAVI':
      if (value < 0.0) return 'Water / Urban';
      if (value < 0.2) return 'Bare Soil / Sparse';
      if (value < 0.4) return 'Low Vegetation';
      if (value < 0.6) return 'Moderate Vegetation';
      if (value < 0.8) return 'Healthy Vegetation';
      return 'Dense Forest';
    case 'NDWI':
      if (value > 0.1) return 'Water Body';
      if (value > -0.1) return 'Moist Soil / Wetland';
      return 'Dry Surface';
    case 'NDMI':
      if (value < 0.0) return 'Low Moisture';
      if (value < 0.2) return 'Moderate Moisture';
      return 'High Moisture';
    default:
      return 'Active Pixel';
  }
}

function getSatelliteSource(layer: string): string {
  const radarLayers = ['VV', 'VH', 'RATIO', 'RVI', 'SMI'];
  return radarLayers.includes(layer) ? 'Sentinel-1 SAR (Copernicus)' : 'Sentinel-2 MSI (Copernicus)';
}

function getAccentColor(value: number, palette: string[], min: number, max: number): string {
  if (!palette || palette.length === 0) return '#4ade80';
  let norm = (value - min) / (max - min);
  norm = Math.max(0, Math.min(1, norm));
  const idx = Math.floor(norm * (palette.length - 1));
  return palette[idx] || '#4ade80';
}

export const InspectionPopup: React.FC = () => {
  const { clickedLocation, setClickedLocation, selectedYear, selectedVillage } = useVillageSelection();
  const { activeSatelliteLayer } = useMapLayers();
  const { layers } = useLayersMetadata();
  
  const [data, setData] = useState<ClickData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeLayerMeta = useMemo(() => layers.find(l => l.id === activeSatelliteLayer), [layers, activeSatelliteLayer]);

  useEffect(() => {
    if (!clickedLocation || !activeSatelliteLayer) {
      setData(null);
      setError(null);
      return;
    }
    
    let isMounted = true;
    const fetchDetailedData = async () => {
      setLoading(true);
      setError(null);
      try {
        const start = `${selectedYear}-01-01`;
        const end = `${selectedYear}-12-31`;
        
        // Fetch pixel value
        const valRes = await fetch(
          `http://127.0.0.1:8000/api/v1/satellite/value?layer=${activeSatelliteLayer}&lat=${clickedLocation.lat}&lng=${clickedLocation.lng}&start=${start}&end=${end}`
        );
        if (!valRes.ok) throw new Error(`API error ${valRes.status}`);
        const valJson = await valRes.json();

        // Optionally fetch stats to get mean for comparison
        let meanVal = undefined;
        if (selectedVillage) {
          try {
            const statRes = await fetch(
              `http://127.0.0.1:8000/api/v1/satellite/statistics?layer=${activeSatelliteLayer}&geometryType=village&geometryId=${selectedVillage.id}&start=${start}&end=${end}`
            );
            if (statRes.ok) {
              const statJson = await statRes.json();
              meanVal = statJson.mean;
            }
          } catch (e) {
            // Ignore stats failure
          }
        }

        if (isMounted) {
          if (valJson.value !== null && valJson.value !== undefined) {
            setData({
              value: valJson.value,
              interpretation: interpretValue(activeSatelliteLayer, valJson.value),
              lat: clickedLocation.lat,
              lng: clickedLocation.lng,
              layer: activeSatelliteLayer,
              mean: meanVal
            });
          } else {
            setData(null);
            setError('No pixel data at this location');
          }
        }
      } catch (e: any) {
        if (isMounted) {
          setData(null);
          setError(e.message || 'Failed to fetch pixel data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetailedData();

    return () => { isMounted = false; };
  }, [clickedLocation, activeSatelliteLayer, selectedYear, selectedVillage]);

  if (!clickedLocation || !activeSatelliteLayer) return null;

  const acquisitionNote = `${selectedYear} annual median composite`;
  const satellite = getSatelliteSource(activeSatelliteLayer);

  let accentColor = '#4ade80';
  if (data && activeLayerMeta?.visualization) {
    const { palette, min, max } = activeLayerMeta.visualization;
    accentColor = getAccentColor(data.value, palette, min, max);
  }

  const diffFromAvg = (data?.mean !== undefined && data?.value !== undefined) ? (data.value - data.mean) : null;
  const diffSign = diffFromAvg !== null ? (diffFromAvg > 0 ? '+' : '') : '';

  return (
    <Popup
      position={[clickedLocation.lat, clickedLocation.lng]}
      onClose={() => setClickedLocation(null)}
      closeButton={true}
      maxWidth={320}
    >
      <div style={{
        background: 'rgba(12, 12, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${accentColor}40`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 8,
        padding: '16px',
        minWidth: 280,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />
          {activeLayerMeta?.name || activeSatelliteLayer}
        </div>
        
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
            <div className="animate-pulse">Loading inspection data...</div>
          </div>
        ) : error ? (
          <div style={{ color: '#f87171', fontSize: 11, padding: '10px 0' }}>{error}</div>
        ) : data ? (
          <>
            {/* Main value */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '12px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#94a3b8', fontSize: 10 }}>PIXEL VALUE</span>
                <span style={{ color: accentColor, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>{data.value.toFixed(5)}</span>
              </div>
              
              {data.mean !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                  <span style={{ color: '#64748b', fontSize: 10 }}>REGION AVERAGE</span>
                  <span style={{ color: '#cbd5e1', fontSize: 12 }}>{data.mean.toFixed(5)}</span>
                </div>
              )}
              
              {diffFromAvg !== null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                  <span style={{ color: '#64748b', fontSize: 10 }}>DIFFERENCE</span>
                  <span style={{ color: diffFromAvg > 0 ? '#4ade80' : '#f87171', fontSize: 12 }}>
                    {diffSign}{diffFromAvg.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {/* Classification */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>CLASSIFICATION</div>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '4px 8px', borderRadius: 4 }}>
                {data.interpretation}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '12px 0' }} />

            {/* Location */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>REGION</div>
              <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 13 }}>
                {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : 'Unknown Location'}
              </div>
            </div>

            {/* Coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}>LATITUDE</div>
                <div style={{ color: '#cbd5e1' }}>{data.lat.toFixed(6)}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}>LONGITUDE</div>
                <div style={{ color: '#cbd5e1' }}>{data.lng.toFixed(6)}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '12px 0' }} />

            {/* Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}>SATELLITE</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{satellite}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}>ACQUISITION</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{acquisitionNote}</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}>MAX CLOUD COVER</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>20%</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}>COMPOSITE</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>Median Filter</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: '#64748b' }}>Click a pixel on the raster layer to inspect.</div>
        )}
      </div>
    </Popup>
  );
};
