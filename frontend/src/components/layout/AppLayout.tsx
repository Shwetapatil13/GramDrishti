import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MapContainer } from '../map/MapContainer';
import { DashboardPanel } from '../dashboard/DashboardPanel';
import { VillageProvider } from '@/hooks/useVillageSelection';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <VillageProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-canvas-black text-text-primary">
        <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <MapContainer />
          <DashboardPanel />
        </div>
      </div>
    </VillageProvider>
  );
};