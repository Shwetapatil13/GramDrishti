import React, { useState } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { useSatelliteData } from '@/hooks/useSatelliteData';
import { EmptyState } from './EmptyState';
import { GEEProgress } from '../ui/GEEProgress';
import { EnvironmentTab } from './EnvironmentTab';
import { OverviewTab } from './OverviewTab';
import { HistoryTab } from './HistoryTab';
import { AITab } from './AITab';
import { ReportTab } from './ReportTab';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TABS = ['OVERVIEW', 'ENVIRONMENT', 'HISTORY', 'AI ANALYST', 'REPORT'] as const;
type TabType = typeof TABS[number];

export const DashboardPanel: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const { geeStatus } = useSatelliteData(selectedVillage?.id, selectedYear);

  if (!selectedVillage) {
    return (
      <div className="w-full md:w-[350px] lg:w-[400px] border-l border-surface-border bg-canvas-black shrink-0 hidden md:block">
        <EmptyState />
      </div>
    );
  }

  // Handle panel classes for mobile bottom sheet vs desktop sidebar
  const panelClasses = `
    w-full md:w-[350px] lg:w-[400px] bg-canvas-black md:border-l border-surface-border flex flex-col shrink-0
    absolute md:relative bottom-0 left-0 right-0 z-[450] md:z-auto
    transition-transform duration-300 ease-in-out border-t md:border-t-0 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-none
    ${isMobileExpanded ? 'h-[85vh]' : 'h-[30vh] md:h-full'}
  `;

  return (
    <div className={panelClasses}>
      {/* Mobile drag handle */}
      <div 
        className="w-full h-8 flex items-center justify-center cursor-pointer md:hidden"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
      >
        <div className="w-12 h-1.5 bg-surface-border rounded-full flex items-center justify-center">
           {isMobileExpanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronUp className="w-4 h-4 text-text-muted" />}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex overflow-x-auto border-b border-surface-border no-scrollbar p-2 md:p-4 gap-2 shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-tag text-mono transition-colors ${
                isActive
                  ? 'bg-brand-mint text-text-inverted'
                  : 'bg-surface-slate text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 overflow-x-hidden relative">
        {geeStatus.loading ? (
          <div className="mb-4">
            <GEEProgress message="Retrieving satellite data (~45s on first load)…" cached={geeStatus.cached} />
          </div>
        ) : null}
        
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {activeTab === 'OVERVIEW' ? (
                <OverviewTab />
              ) : activeTab === 'ENVIRONMENT' ? (
                <EnvironmentTab />
              ) : activeTab === 'HISTORY' ? (
                <HistoryTab />
              ) : activeTab === 'AI ANALYST' ? (
                <AITab />
              ) : activeTab === 'REPORT' ? (
                <ReportTab />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-body text-text-secondary">
                    Content for <span className="text-brand-mint font-mono uppercase">{activeTab}</span>
                    <br />
                    Coming in a later level...
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </div>
  );
};