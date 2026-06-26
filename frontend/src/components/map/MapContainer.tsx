import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useMapLayers } from '@/hooks/useMapLayers';
import { VILLAGES } from '@/constants/villages';
import { VillageMarker } from './VillageMarker';
import { VillageBoundary } from './VillageBoundary';
import { NDVILayer } from './NDVILayer';
import { WaterLayer } from './WaterLayer';
import { LandCoverLayer } from './LandCoverLayer';
import { NDVILegend } from './NDVILegend';
import { LayerControl } from './LayerControl';
import { MapControls } from './MapControls';
import { VillageSearch } from './VillageSearch';
import { useSatelliteData } from '@/hooks/useSatelliteData';

// Separate component to handle map instance binding
const MapInstanceBinder: React.FC = () => {
  const map = useMap();
  const { setMapInstance } = useVillageSelection();
  
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  
  return null;
};

export const MapContainer: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const layers = useMapLayers();
  const { data, geeStatus } = useSatelliteData(selectedVillage?.id, 2024);

  const getTileUrl = () => {
    switch (layers.activeBaseLayer) {
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  return (
    <div className="flex-1 relative bg-[#0a0a0a] border border-surface-border rounded-card m-2 overflow-hidden md:m-0 md:rounded-none md:border-0 md:border-t-0">
      <LeafletMap
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={4}
        maxZoom={16}
        zoomControl={false}
        className="w-full h-full"
      >
        <MapInstanceBinder />
        
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={getTileUrl()}
        />

        {VILLAGES.map((village) => (
          <VillageMarker key={village.id} village={village} />
        ))}

        {selectedVillage && !layers.showNDVI && !layers.showWater && !layers.showLandCover && <VillageBoundary village={selectedVillage} />}
        
        {selectedVillage && layers.showNDVI && (
          <NDVILayer village={selectedVillage} data={data} isLoading={geeStatus.loading} />
        )}
        
        {selectedVillage && layers.showWater && (
          <WaterLayer village={selectedVillage} data={data} />
        )}

        {selectedVillage && layers.showLandCover && (
          <LandCoverLayer village={selectedVillage} data={data} />
        )}

        <LayerControl layers={layers} />
        {layers.showNDVI && <NDVILegend />}
        <MapControls />
        <VillageSearch />
      </LeafletMap>
    </div>
  );
};