import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { Village, EnvironmentalMetrics, LandCoverBreakdown } from '@/types';

interface LandCoverLayerProps {
  village: Village | null;
  data?: EnvironmentalMetrics;
}

export const LandCoverLayer: React.FC<LandCoverLayerProps> = ({ village, data }) => {
  if (!village || !village.boundary || !village.boundary.coordinates) return null;

  const positions = village.boundary.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]);

  // Determine dominant class for the single polygon representation
  let dominantClass = 'Unknown';
  let dominantColor = 'var(--surface-slate)'; // Default slate

  const LC_COLORS: Record<keyof LandCoverBreakdown, string> = {
    cropland: 'var(--semantic-warning)',
    trees: 'var(--score-excellent)',
    water: 'var(--brand-mint)',
    builtArea: 'var(--text-muted)',
    grassland: 'var(--score-good)',
    bareLand: 'var(--semantic-warning)',
    flooded: 'var(--brand-blue)',
  };

  if (data && data.landCover) {
    let maxVal = -1;
    let maxKey: keyof LandCoverBreakdown = 'bareLand';
    
    // Find dominant class
    (Object.entries(data.landCover) as [keyof LandCoverBreakdown, number][]).forEach(([key, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxKey = key;
      }
    });

    dominantClass = maxKey.charAt(0).toUpperCase() + maxKey.slice(1);
    dominantColor = LC_COLORS[maxKey];
  }

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: dominantColor,
        weight: 2,
        fillColor: dominantColor,
        fillOpacity: 0.5,
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-leaflet-popup">
        <div className="bg-surface-slate border border-surface-border rounded-md p-2 text-text-primary text-mono">
          DOMINANT LC: {dominantClass}
        </div>
      </Tooltip>
    </Polygon>
  );
};