import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { WorkspaceHeader } from './WorkspaceHeader';
import { ExecutiveSummary } from './ExecutiveSummary';
import { MetricsGrid } from './MetricsGrid';
import { LandCoverPanel } from './LandCoverPanel';
import { HistoricalTrendPanel } from './HistoricalTrendPanel';
import { ClimatePanel } from './ClimatePanel';
import { RiskPanel } from './RiskPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { InspectorDrawer } from './InspectorDrawer';
import { TimeMachine } from './TimeMachine';
import { DataQualityPanel } from './DataQualityPanel';

export const VillageIntelligenceWorkspace: React.FC = () => {
  const { isWorkspaceExpanded, setIsWorkspaceExpanded, selectedVillage } = useVillageSelection();
  const [inspectorOpen, setInspectorOpen] = useState(false);

  if (!selectedVillage) return null;

  return (
    <AnimatePresence>
      {isWorkspaceExpanded && (
        <>
          {/* Dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-canvas-black/70 backdrop-blur-sm z-[900]"
            onClick={() => setIsWorkspaceExpanded(false)}
          />
          
          {/* Main Workspace Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[85vw] max-w-[1600px] bg-canvas-black border-l border-surface-border z-[950] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar relative" onClick={() => {}}>
              <WorkspaceHeader />
              
              <div className="max-w-7xl mx-auto pb-20">
                <ExecutiveSummary />
                
                {/* Wrap MetricsGrid so clicks can open the inspector */}
                <div onClick={() => setInspectorOpen(true)}>
                  <MetricsGrid />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="h-[450px]">
                    <LandCoverPanel />
                  </div>
                  <div className="h-[450px]">
                    <HistoricalTrendPanel />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="h-[400px]">
                    <ClimatePanel />
                  </div>
                  <div className="h-[400px]">
                    <RiskPanel />
                  </div>
                  <div className="h-[400px]">
                    <RecommendationsPanel />
                  </div>
                </div>
                
                <DataQualityPanel />
              </div>
              
              <TimeMachine />
            </div>

            <InspectorDrawer 
              isOpen={inspectorOpen} 
              onClose={() => setInspectorOpen(false)} 
              metricType="NDVI HEALTH" 
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
