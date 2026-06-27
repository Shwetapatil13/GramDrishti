import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Technology: React.FC = () => {
  const { t } = useTranslation();
  
  const techs = [
    'Google Earth Engine', 'Gemini AI', 'FastAPI', 'React',
    'Leaflet', 'OpenStreetMap', 'Python', 'Machine Learning',
    'Tailwind CSS', 'PostGIS', 'Celery', 'Framer Motion'
  ];

  return (
    <section id="technology" className="py-24 bg-canvas-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-4xl mb-4">
            {t('technology.headline', 'Technology Stack')}
          </h2>
          <p className="text-body text-text-secondary text-lg">
            {t('technology.subheadline', 'Built on a modern, scalable, and powerful geospatial architecture.')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {techs.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -3, backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--brand-mint)' }}
              className="px-6 py-3 bg-surface-slate border border-surface-border rounded-full text-text-primary font-mono text-sm cursor-default transition-colors shadow-sm"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};