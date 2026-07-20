import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useMapLayers } from '@/hooks/MapLayersContext';
import { VILLAGES } from '@/constants/villages';
import { VillageMarker } from './VillageMarker';
import { VillageBoundary } from './VillageBoundary';
import { SatelliteLayer } from './SatelliteLayer';
import { MapLegend } from './MapLegend';
import { LayerControl } from './LayerControl';
import { MapControls } from './MapControls';
import { VillageSearch } from './VillageSearch';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { HoverInspector } from './HoverInspector';
import { InspectionPopup } from './InspectionPopup';

import { useTheme } from '@/hooks/useTheme';

// Separate component to handle map instance binding
const MapInstanceBinder: React.FC = () => {
  const map = useMap();
  const { setMapInstance } = useVillageSelection();
  
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  
  return null;
};

const MapClickHandler: React.FC = () => {
  const { setClickedLocation } = useVillageSelection();
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // India geographic bounds validation
      // Prevents out-of-bounds anomalous coordinates (e.g., Lat 35, Lng 52) from being sampled
      if (lat >= 6.5 && lat <= 38.5 && lng >= 68.0 && lng <= 97.5) {
        setClickedLocation({ lat, lng });
      } else {
        console.warn(`Click ignored: Coordinates [Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}] are outside India's bounds.`);
      }
    },
  });
  return null;
};

export const MapContainer: React.FC = React.memo(() => {
  const { selectedVillage, selectedYear, selectedVillagePolygon, setActiveLayers } = useVillageSelection();
  const layers = useMapLayers();
  const { data } = useSatelliteData(selectedVillage?.id, selectedYear);
  const { theme } = useTheme();

  useEffect(() => {
    const active = [];
    if (layers.activeSatelliteLayer) active.push(layers.activeSatelliteLayer);
    setActiveLayers(active);
  }, [layers.activeSatelliteLayer, setActiveLayers]);

  const getTileUrl = () => {
    switch (layers.activeBaseLayer) {
      case 'dark':
        return theme === 'light' 
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      default:
        return theme === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  return (
    <div className={`flex-1 relative bg-canvas-black border border-surface-border rounded-card m-2 overflow-hidden md:m-0 md:rounded-none md:border-0 md:border-t-0 ${layers.activeSatelliteLayer ? 'cursor-crosshair' : ''}`}>
      <LeafletMap
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={4}
        maxZoom={16}
        maxBounds={[
          [6.5, 68.0], // Southwest bounds (India)
          [38.5, 97.5] // Northeast bounds (India)
        ]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        className={`w-full h-full ${layers.activeSatelliteLayer ? 'cursor-crosshair' : ''}`}
      >
        <MapInstanceBinder />
        <MapClickHandler />
        
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={getTileUrl()}
        />

        {VILLAGES.map((village) => (
          <VillageMarker key={village.id} village={village} />
        ))}

        {selectedVillage && !layers.activeSatelliteLayer && <VillageBoundary key={selectedVillage.id} polygon={selectedVillagePolygon} />}
        
        {selectedVillage && layers.activeSatelliteLayer && (
          <SatelliteLayer 
            village={selectedVillage} 
            data={data} 
            activeLayerId={layers.activeSatelliteLayer} 
          />
        )}

        <HoverInspector />
        <InspectionPopup />

        <LayerControl />
        {layers.activeSatelliteLayer && <MapLegend activeLayerId={layers.activeSatelliteLayer} />}
        <MapControls />
        <VillageSearch />
      </LeafletMap>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';