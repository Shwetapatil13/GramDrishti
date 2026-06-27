import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Satellite, Activity, Brain, LayoutDashboard } from 'lucide-react';

const steps = [
  { id: '01', icon: Search, titleKey: 'howItWorks.step1.title', titleDefault: 'Search Village', descKey: 'howItWorks.step1.desc', descDefault: 'Find any village in India instantly using our comprehensive geographic database.' },
  { id: '02', icon: Satellite, titleKey: 'howItWorks.step2.title', titleDefault: 'Fetch Satellite Data', descKey: 'howItWorks.step2.desc', descDefault: 'Pull live GEE metrics including NDVI, NDWI, and LST on the fly.' },
  { id: '03', icon: Activity, titleKey: 'howItWorks.step3.title', titleDefault: 'Environmental Analysis', descKey: 'howItWorks.step3.desc', descDefault: 'Calculate precise health indices and identify early stress indicators.' },
  { id: '04', icon: Brain, titleKey: 'howItWorks.step4.title', titleDefault: 'AI Processing', descKey: 'howItWorks.step4.desc', descDefault: 'Generate actionable insights and automated mitigation strategies.' },
  { id: '05', icon: LayoutDashboard, titleKey: 'howItWorks.step5.title', titleDefault: 'Interactive Dashboard', descKey: 'howItWorks.step5.desc', descDefault: 'Visualize data clearly and export comprehensive PDF reports.' },
];

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-24 bg-surface-slate border-y border-surface-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center md:text-left">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-5xl mb-6">
            {t('howItWorks.headline', 'How It Works')}
          </h2>
          <p className="text-body text-text-secondary text-lg md:text-xl max-w-3xl mx-auto md:mx-0">
            {t('howItWorks.subheadline', 'A seamless pipeline from raw coordinates to actionable intelligence in seconds. Discover how we process satellite data to deliver insights.')}
          </p>
        </div>

        <div className="relative mt-12">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-[2px] bg-surface-border">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-brand-mint via-brand-blue to-brand-violet"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="flex flex-col items-center md:items-start gap-5 bg-canvas-black md:bg-transparent p-8 md:p-0 rounded-2xl border border-surface-border md:border-none relative group hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-16 h-16 rounded-2xl bg-canvas-black border border-surface-border flex items-center justify-center shrink-0 shadow-lg group-hover:border-brand-mint transition-colors relative z-10 overflow-hidden">
                    <Icon className="w-8 h-8 text-brand-mint absolute opacity-10 scale-150 group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-mono font-bold text-text-primary relative z-10 group-hover:text-brand-mint transition-colors">{step.id}</span>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-heading-md text-text-primary text-lg mb-3 group-hover:text-brand-mint transition-colors">{t(step.titleKey, step.titleDefault)}</h4>
                    <p className="text-body text-text-secondary text-sm leading-relaxed">{t(step.descKey, step.descDefault)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
      </div>
    </section>
  );
};