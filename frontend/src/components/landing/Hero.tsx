import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-canvas-black">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--surface-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-mint/10 border border-brand-mint/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse"></span>
              <span className="text-mono text-[10px] text-brand-mint">LIVE SATELLITE MONITORING</span>
            </div>
            
            <h1 className="text-display text-text-primary text-4xl md:text-6xl lg:text-[4rem] leading-[1.1]">
              See Every Village Before Problems Become Crises.
            </h1>
            
            <p className="text-body text-text-secondary text-lg md:text-xl max-w-xl">
              GramDrishti is an AI-powered rural intelligence platform combining satellite imagery, Google Earth Engine, environmental analytics, and artificial intelligence to monitor villages in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link to="/auth" className="flex items-center gap-2 bg-brand-mint text-canvas-black px-6 py-3.5 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-text-primary transition-colors">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="flex items-center gap-2 bg-surface-slate border border-surface-border text-text-primary px-6 py-3.5 rounded-button font-grotesk text-sm hover:bg-surface-elevated transition-colors">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Animated Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] w-full rounded-2xl border border-surface-border bg-surface-slate p-2 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-mint/5 via-transparent to-brand-blue/5"></div>
            
            {/* Mock Dashboard UI */}
            <div className="w-full h-full rounded-xl border border-surface-border bg-canvas-black flex overflow-hidden">
              <div className="w-1/3 border-r border-surface-border p-4 flex flex-col gap-3">
                <div className="h-8 bg-surface-slate rounded-lg w-full"></div>
                <div className="h-16 bg-surface-slate rounded-lg w-full border-l-2 border-brand-mint"></div>
                <div className="h-16 bg-surface-slate rounded-lg w-full"></div>
              </div>
              <div className="w-2/3 p-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-brand-mint/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-brand-mint/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-brand-mint/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Floating Cards */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute top-4 right-4 bg-surface-elevated border border-surface-border p-3 rounded-lg shadow-lg"
                >
                  <div className="text-mono text-[10px] text-text-secondary">NDVI HEALTH</div>
                  <div className="text-brand-mint font-bold">0.62</div>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-4 left-4 bg-surface-elevated border border-surface-border p-3 rounded-lg shadow-lg flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full border-[3px] border-semantic-warning flex items-center justify-center text-xs">68</div>
                  <div className="text-mono text-[10px] text-text-secondary">HEALTH SCORE</div>
                </motion.div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};