import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CTA: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-6 bg-canvas-black">
      <div className="max-w-5xl mx-auto relative rounded-[2rem] overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-brand-violet/20 to-brand-mint/20 opacity-50 blur-3xl"></div>
        <div className="absolute inset-0 bg-surface-slate/80 backdrop-blur-sm border border-surface-border rounded-[2rem]"></div>
        
        <div className="relative z-10 px-8 py-16 md:py-24 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-heading-lg text-text-primary text-3xl md:text-5xl mb-6 max-w-2xl">
              {t('cta.headline', 'Start Monitoring Villages Intelligently')}
            </h2>
            <p className="text-body text-text-secondary text-lg mb-10 max-w-xl mx-auto">
              {t('cta.subheadline', 'Join GramDrishti today and transform how rural environmental planning is executed.')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/auth?mode=signup" className="flex items-center gap-2 bg-text-primary text-canvas-black px-8 py-4 rounded-button font-mono text-sm uppercase tracking-wider hover:bg-brand-mint transition-colors shadow-lg">
                {t('landing.getStarted', 'Get Started')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};