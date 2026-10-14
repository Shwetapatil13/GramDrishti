import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useMapLayers } from '@/hooks/MapLayersContext';
import { VillageBoundary } from './VillageBoundary';
import { SatelliteLayer } from './SatelliteLayer';
import { MapLegend } from './MapLegend';
import { LayerControl } from './LayerControl';
import { MapControls } from './MapControls';
import { VillageSearch } from './VillageSearch';
import { HoverInspector } from './HoverInspector';
import { InspectionPopup } from './InspectionPopup';
import { useTheme } from '@/hooks/useTheme';
import { booleanPointInPolygon } from '@/utils/geo';

// Modular Services
import { SpatialLockManager } from './services/SpatialLockManager';
import { FarmBoundaryService } from './services/FarmBoundaryService';
import { ClearCacheManager } from './services/ClearCacheManager';


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
  const { setClickedLocation, selectedVillage, selectedVillagePolygon } = useVillageSelection();
  const { activeSatelliteLayer } = useMapLayers();

  // A pinned inspection point belongs to one village + layer; drop it when either
  // changes so a stale popup doesn't reappear on the next village/overlay.
  useEffect(() => {
    setClickedLocation(null);
  }, [selectedVillage?.id, activeSatelliteLayer, setClickedLocation]);

  useMapEvents({
    click(e) {
      // Pixel inspection only makes sense while a satellite overlay is shown
      if (!activeSatelliteLayer) return;

      const { lat, lng } = e.latlng;
      
      // If a village is selected, strictly restrict clicks to its exact boundary
      if (selectedVillagePolygon) {
        if (!booleanPointInPolygon([lng, lat], selectedVillagePolygon)) {
          // Click was outside the active workspace, ignore it completely
          return;
        }
      }
      
      // Basic bounds check for India
      if (lat >= 6.5 && lat <= 38.5 && lng >= 68.0 && lng <= 97.5) {
        setClickedLocation({ lat, lng });
      }
    },
  });
  return null;
};

export const MapContainer: React.FC = React.memo(() => {
  const { selectedVillage, selectedYear, selectedVillagePolygon, setActiveLayers } = useVillageSelection();
  const layers = useMapLayers();
  const { theme } = useTheme();

  useEffect(() => {
    const active = [];
    if (layers.activeSatelliteLayer) active.push(layers.activeSatelliteLayer);
    setActiveLayers(active);
  }, [layers.activeSatelliteLayer, setActiveLayers]);

  const getBaseTiles = (): { url: string; attribution: string } => {
    switch (layers.activeBaseLayer) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        };
      case 'osm':
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
      case 'dark':
      default:
        return {
          url: theme === 'light'
            ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        };
    }
  };
  const baseTiles = getBaseTiles();

  return (
    <div className={`flex-1 relative bg-canvas-black border border-surface-border rounded-card m-2 overflow-hidden md:m-0 md:rounded-none md:border-0 md:border-t-0 ${layers.activeSatelliteLayer ? 'cursor-crosshair' : ''}`}>
      <LeafletMap
        center={[20.5937, 78.9629]}
        zoom={5}
        minZoom={4}
        maxZoom={21}
        maxBounds={[
          [6.5, 68.0],
          [38.5, 97.5]
        ]}
        zoomControl={false}
        className={`w-full h-full ${layers.activeSatelliteLayer ? 'cursor-crosshair' : ''}`}
      >
        <MapInstanceBinder />
        <MapClickHandler />
        
        {/* Modular Services */}
        <SpatialLockManager />
        <ClearCacheManager />
        <FarmBoundaryService />

        <TileLayer
          // Remount on basemap change so the attribution control updates too
          key={baseTiles.url}
          attribution={baseTiles.attribution}
          url={baseTiles.url}
          maxZoom={21}
          maxNativeZoom={19}
        />

        {/* Village markers removed as requested */}

        {selectedVillage && layers.activeSatelliteLayer && (
          <SatelliteLayer 
            village={selectedVillage} 
            year={selectedYear}
            activeLayerId={layers.activeSatelliteLayer} 
          />
        )}

        {/* Keep the village outline visible over overlays (without the fill tinting the raster) */}
        {selectedVillage && (
          <VillageBoundary
            key={selectedVillage.id}
            polygon={selectedVillagePolygon}
            outlineOnly={!!layers.activeSatelliteLayer}
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