import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { apiService } from '@/services/api';
import { Skeleton } from '../ui/Skeleton';
import { useTranslation } from 'react-i18next';

export const VillageSummary: React.FC = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const fetchSummary = useCallback(async () => {
    if (!selectedVillage) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.post<{ summary: string }>(`/api/v1/ai/${selectedVillage.id}/summary?year=${selectedYear}&language=${i18n.language || 'en'}`);
      setSummary(data.summary);
    } catch {
      setError(t('errors.summary_failed', 'Failed to generate summary.'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedVillage, selectedYear, i18n.language, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSummary();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSummary]);

  if (isLoading) {
    return (
      <div className="bg-surface-slate border border-surface-border rounded-xl p-6 flex flex-col gap-3">
        <span className="text-mono text-brand-mint text-xs">AI GENERATED SUMMARY</span>
        <div className="flex flex-col gap-2">
          <Skeleton height="16px" />
          <Skeleton height="16px" width="90%" />
          <Skeleton height="16px" width="95%" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-slate border border-surface-border rounded-xl p-6 flex flex-col gap-3 items-start">
        <span className="text-mono text-semantic-danger text-xs">SUMMARY UNAVAILABLE</span>
        <p className="text-body text-text-muted">{error}</p>
        <button 
          onClick={fetchSummary}
          className="text-mono text-text-primary text-xs hover:text-brand-mint flex items-center gap-1"
        >
          <RefreshCcw className="w-3 h-3" /> RETRY
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-surface-slate border border-surface-border rounded-xl p-6 flex flex-col gap-3 relative">
      <div className="flex justify-between items-start">
        <span className="text-mono text-brand-mint text-xs tracking-wider">AI GENERATED SUMMARY</span>
        <button 
          onClick={fetchSummary}
          className="text-text-muted hover:text-brand-mint transition-colors"
          title="Refresh Summary"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
      <div className="text-body text-text-primary leading-relaxed space-y-3">
        {summary.split('\n\n').map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    </div>
  );
};