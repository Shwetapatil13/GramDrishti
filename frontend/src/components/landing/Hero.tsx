import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-canvas-black">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--surface-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Hero Image (Now on Left) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full rounded-3xl overflow-hidden border border-surface-border/50 shadow-[0_0_40px_-15px_rgba(46,204,113,0.3)] group order-first"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-mint/20 via-transparent to-brand-blue/10 mix-blend-overlay z-10 pointer-events-none transition-opacity group-hover:opacity-50"></div>
            <img 
              src="/hero_image.png" 
              alt="GramDrishti Hero Dashboard" 
              className="w-full h-auto object-cover rounded-3xl transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </motion.div>
          
          {/* Text Content (Now on Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6 lg:pl-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-mint/10 border border-brand-mint/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-brand-mint animate-pulse"></span>
              <span className="text-mono text-[10px] text-brand-mint">{t('hero.live_monitoring', 'LIVE SATELLITE MONITORING')}</span>
            </div>
            
            <h1 className="text-display text-text-primary text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
              {t('hero.headline', 'See Every Village. Solve Problems Before They Become Crises.')}
            </h1>
            
            <p className="text-body text-text-secondary text-lg md:text-xl max-w-xl">
              {t('hero.description', 'GramDrishti is an AI-powered rural intelligence platform combining satellite imagery, Google Earth Engine, environmental analytics, and artificial intelligence to monitor villages in real time.')}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link to="/auth" className="flex items-center gap-2 bg-brand-mint text-canvas-black px-6 py-3.5 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-text-primary transition-colors">
                {t('landing.getStarted', 'Get Started')} <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="flex items-center gap-2 bg-surface-slate border border-surface-border text-text-primary px-6 py-3.5 rounded-button font-grotesk text-sm hover:bg-surface-elevated transition-colors">
                <Play className="w-4 h-4" /> {t('hero.watch_demo', 'Watch Demo')}
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};