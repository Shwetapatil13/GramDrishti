import React from 'react';
import { useVillageSelection } from '@/hooks/useVillageSelection';
import { MapIcon, FileText } from 'lucide-react';

interface Action {
    type: string;
    layer?: string;
    report_type?: string;
}

interface Props {
    actions: Action[];
}

export const ActionPanel: React.FC<Props> = ({ actions }) => {
    const { activeLayers, setActiveLayers } = useVillageSelection();

    const handleActionClick = (action: Action) => {
        if (action.type === 'toggle_layer' && action.layer) {
            if (activeLayers.includes(action.layer)) {
                setActiveLayers(activeLayers.filter(l => l !== action.layer));
            } else {
                setActiveLayers([...activeLayers, action.layer]);
            }
        } else if (action.type === 'generate_report') {
            alert(`Generating ${action.report_type || 'full'} report... (Simulated)`);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={() => handleActionClick(action)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-border hover:bg-[#333] transition-colors rounded-button text-xs text-text-primary"
                >
                    {action.type === 'toggle_layer' ? <MapIcon className="w-3.5 h-3.5 text-brand-mint" /> : <FileText className="w-3.5 h-3.5 text-brand-mint" />}
                    {action.type === 'toggle_layer' ? `Show ${action.layer} Layer` : `Generate Report`}
                </button>
            ))}
        </div>
    );
};
