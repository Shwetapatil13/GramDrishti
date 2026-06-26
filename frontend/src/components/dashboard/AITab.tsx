import React from 'react';
import { VillageSummary } from '../ai/VillageSummary';
import { AIChatPanel } from '../ai/AIChatPanel';

export const AITab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <VillageSummary />
      <AIChatPanel />
    </div>
  );
};