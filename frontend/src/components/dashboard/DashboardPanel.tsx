import React, { useState } from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { EmptyState } from './EmptyState';

const TABS = ['OVERVIEW', 'ENVIRONMENT', 'HISTORY', 'AI ANALYST', 'REPORT'] as const;
type TabType = typeof TABS[number];

export const DashboardPanel: React.FC = () => {
  const { selectedVillage } = useVillageSelection();
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  if (!selectedVillage) {
    return (
      <div className="w-full md:w-[350px] lg:w-[400px] border-l border-surface-border bg-canvas-black shrink-0 hidden md:block">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="w-full md:w-[350px] lg:w-[400px] border-l border-surface-border bg-canvas-black flex flex-col shrink-0 hidden md:flex">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto border-b border-surface-border no-scrollbar p-4 gap-2">
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-body text-text-secondary">
            Content for <span className="text-brand-mint font-mono uppercase">{activeTab}</span>
            <br />
            Coming in a later level...
          </p>
        </div>
      </div>
    </div>
  );
};