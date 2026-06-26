import React from 'react';
import { Village } from '@/types';

interface VillagePopupProps {
  village: Village;
}

// We implement this as a UI overlay absolutely positioned relative to the marker, 
// but since React-Leaflet's Popup has its own styling, we will use a custom approach.
// For simplicity in React-Leaflet, we can just use the standard Popup but style it completely with CSS.
import { Popup } from 'react-leaflet';

export const VillagePopup: React.FC<VillagePopupProps> = ({ village }) => {
  return (
    <Popup 
      className="custom-leaflet-popup"
      closeButton={false}
      offset={[0, -10]}
    >
      <div className="bg-surface-slate border border-brand-mint rounded-card p-4 min-w-[200px] text-left">
        <h3 className="text-heading-md text-text-primary m-0">{village.name}</h3>
        <p className="text-mono text-text-secondary mt-1 mb-3">{village.district}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-muted">Area:</span>
          <span className="text-brand-mint font-mono">{village.area} km²</span>
        </div>
        <button className="w-full mt-4 bg-brand-console text-text-primary rounded-button py-2 font-mono text-xs hover:bg-brand-mint hover:text-canvas-black transition-colors">
          VIEW ANALYSIS
        </button>
      </div>
    </Popup>
  );
};