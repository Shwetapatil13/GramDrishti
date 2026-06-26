import React from 'react';
import { Download, FileJson, FileText } from 'lucide-react';

export const ReportTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-8">
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
          VILLAGE REPORT
        </h3>
        
        <div className="bg-surface-slate border border-surface-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-surface-border">
            <span className="text-body text-text-primary">Include AI Analysis</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-mint"></div>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-mono text-text-secondary text-xs">INCLUDES:</h4>
            <ul className="text-body text-text-secondary text-sm flex flex-col gap-2 list-disc pl-4">
              <li>Executive Summary</li>
              <li>Village Health Score & Breakdowns</li>
              <li>Environmental Metrics</li>
              <li>Historical Trends (2022-2026)</li>
              <li>AI Recommendations</li>
            </ul>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-brand-mint text-canvas-black rounded-button py-3 font-mono text-xs hover:bg-white transition-colors mt-2">
          <Download className="w-4 h-4" /> DOWNLOAD PDF REPORT
        </button>
        
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button className="flex items-center justify-center gap-2 bg-surface-border text-text-primary rounded-button py-3 font-mono text-xs hover:bg-surface-elevated transition-colors">
            <FileJson className="w-4 h-4" /> EXPORT JSON
          </button>
          <button className="flex items-center justify-center gap-2 bg-surface-border text-text-primary rounded-button py-3 font-mono text-xs hover:bg-surface-elevated transition-colors">
            <FileText className="w-4 h-4" /> EXPORT CSV
          </button>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-mono text-text-muted text-[10px]">
            LAST GENERATED: NEVER
          </span>
        </div>
      </div>
    </div>
  );
};