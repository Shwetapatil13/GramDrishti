import React, { useEffect, useState, useRef } from 'react';
import { useMapEvents, GeoJSON } from 'react-leaflet';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import L from 'leaflet';
import { HoverAnalyticsService } from './HoverAnalyticsService';

const farmCache: Record<string, any> = {};

export const FarmBoundaryService: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const [zoom, setZoom] = useState<number>(0);
  const [farmsData, setFarmsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const geoJsonRef = useRef<L.GeoJSON>(null);

  // Track map zoom events for progressive loading
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  // Initialize zoom on mount
  useEffect(() => {
    setZoom(map.getZoom());
  }, [map]);

  // Handle Village Change - Load from cache if available
  useEffect(() => {
    if (selectedVillage && farmCache[selectedVillage.id]) {
      setFarmsData(farmCache[selectedVillage.id]);
    } else {
      setFarmsData(null);
    }
  }, [selectedVillage]);

  // Fetch farms when zoom >= 17
  useEffect(() => {
    if (!selectedVillage || zoom < 17) {
      return; // Keep data in state/cache but don't fetch
    }

    if (farmsData || loading || farmCache[selectedVillage.id]) return;

    const fetchFarms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/villages/${selectedVillage.id}/farms`);
        if (res.ok) {
          const data = await res.json();
          farmCache[selectedVillage.id] = data; // store in cache
          setFarmsData(data);
        }
      } catch (e) {
        console.error("Failed to load farm boundaries:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, [zoom, selectedVillage, farmsData, loading]);

  if (!farmsData || zoom < 17) {
    return null; // Don't render polygons unless zoomed in enough
  }

  return (
    <>
      <GeoJSON
        key={`${selectedVillage?.id}-farms`}
        ref={geoJsonRef}
        data={farmsData}
        style={{
          color: '#22c55e',
          weight: 1,
          fillOpacity: 0.1,
          opacity: 0.6
        }}
        onEachFeature={(feature, layer) => {
          // Hover analytics handler
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle({
                weight: 2,
                color: '#4ade80',
                fillOpacity: 0.4
              });
              layer.bringToFront();
            },
            mouseout: (e) => {
              if (geoJsonRef.current) {
                geoJsonRef.current.resetStyle(e.target);
              }
            }
          });
        }}
      />
      {zoom >= 18 && <HoverAnalyticsService farmsLayer={geoJsonRef.current} />}
    </>
  );
};
