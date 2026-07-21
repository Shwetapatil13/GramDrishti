import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { Download, Share2, Map, Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WorkspaceHeader: React.FC = () => {
  const { selectedVillage, setIsWorkspaceExpanded, timeRange, setTimeRange } = useVillageSelection();
  const { t } = useTranslation();

  if (!selectedVillage) return null;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {selectedVillage.name}, {selectedVillage.district}
          </h1>
          <span className="bg-brand-mint/10 text-brand-mint border border-brand-mint/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Active Workspace
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1.5"><Map className="w-4 h-4" /> {selectedVillage.area?.toFixed(1)} ha</span>
          <span>•</span>
          <span>Data Sources: Sentinel-2, ERA5, CHIRPS</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Updated Today</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-surface-slate hover:bg-surface-elevated border border-surface-border text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Report
        </button>
        
        {/* Date Selector */}
        <div className="bg-surface-slate border border-surface-border rounded-lg p-1 flex">
          <button 
            onClick={() => setTimeRange('12M')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === '12M' ? 'bg-brand-violet text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Last 12M
          </button>
          <button 
            onClick={() => setTimeRange('5Y')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === '5Y' ? 'bg-brand-violet text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            5Y Trend
          </button>
        </div>

        <button 
          onClick={() => setIsWorkspaceExpanded(false)}
          className="p-2 ml-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
