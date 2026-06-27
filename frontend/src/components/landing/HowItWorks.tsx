import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const steps = [
  { id: '01', titleKey: 'howItWorks.step1.title', titleDefault: 'Search Village', descKey: 'howItWorks.step1.desc', descDefault: 'Find any village in India instantly.' },
  { id: '02', titleKey: 'howItWorks.step2.title', titleDefault: 'Fetch Satellite Data', descKey: 'howItWorks.step2.desc', descDefault: 'Pull GEE metrics on the fly.' },
  { id: '03', titleKey: 'howItWorks.step3.title', titleDefault: 'Environmental Analysis', descKey: 'howItWorks.step3.desc', descDefault: 'Calculate health and stress scores.' },
  { id: '04', titleKey: 'howItWorks.step4.title', titleDefault: 'AI Processing', descKey: 'howItWorks.step4.desc', descDefault: 'Generate actionable insights.' },
  { id: '05', titleKey: 'howItWorks.step5.title', titleDefault: 'Interactive Dashboard', descKey: 'howItWorks.step5.desc', descDefault: 'Visualize and export reports.' },
];

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-24 bg-surface-slate border-y border-surface-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-4xl mb-4">
            {t('howItWorks.headline', 'How It Works')}
          </h2>
          <p className="text-body text-text-secondary text-lg max-w-2xl">
            {t('howItWorks.subheadline', 'A seamless pipeline from raw coordinates to actionable intelligence in seconds.')}
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-surface-border -translate-y-1/2">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-brand-mint via-brand-blue to-brand-violet"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-6 bg-canvas-black md:bg-transparent p-4 md:p-0 rounded-xl border border-surface-border md:border-none"
              >
                <div className="w-12 h-12 rounded-full bg-surface-elevated border-2 border-surface-border flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-mono text-brand-mint">{step.id}</span>
                </div>
                <div>
                  <h4 className="text-heading-md text-text-primary text-base mb-1">{t(step.titleKey, step.titleDefault)}</h4>
                  <p className="text-body text-text-secondary text-sm leading-snug">{t(step.descKey, step.descDefault)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};