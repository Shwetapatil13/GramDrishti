import React from 'react';
import { X, ExternalLink, Calculator, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: string;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({ isOpen, onClose, metricType }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 bottom-0 w-[400px] bg-surface-slate border-l border-surface-border shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-[1000] flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-surface-border">
            <h3 className="text-lg font-bold text-text-primary">Metric Inspector</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-elevated rounded-full transition-colors">
              <X className="w-5 h-5 text-text-muted hover:text-text-primary" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <h4 className="text-xl font-bold text-brand-mint mb-2">{metricType || 'Normalized Difference Vegetation Index'}</h4>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              NDVI is a simple graphical indicator that can be used to analyze remote sensing measurements and assess whether or not the target being observed contains live green vegetation.
            </p>
            
            <div className="mb-6">
              <h5 className="text-xs font-mono font-bold tracking-widest text-text-muted mb-3 uppercase flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" /> Formula
              </h5>
              <div className="bg-canvas-black border border-surface-border rounded-lg p-4 font-mono text-center text-sm text-brand-violet">
                (NIR - Red) / (NIR + Red)
              </div>
            </div>

            <div className="mb-6">
              <h5 className="text-xs font-mono font-bold tracking-widest text-text-muted mb-3 uppercase flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Interpretation
              </h5>
              <ul className="text-sm text-text-secondary space-y-2">
                <li><strong className="text-emerald-400">0.6 to 0.9:</strong> Dense vegetation, forests, crops at peak growth.</li>
                <li><strong className="text-lime-400">0.2 to 0.5:</strong> Sparse vegetation, shrubs, grasslands.</li>
                <li><strong className="text-amber-400">0 to 0.1:</strong> Bare soil, rocks, sand, or snow.</li>
                <li><strong className="text-blue-400">-1 to 0:</strong> Water bodies.</li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono font-bold tracking-widest text-text-muted mb-3 uppercase flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" /> References
              </h5>
              <a href="#" className="text-sm text-brand-blue hover:underline block mb-1">USGS Landsat Factsheet</a>
              <a href="#" className="text-sm text-brand-blue hover:underline">ESA Sentinel-2 Documentation</a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
