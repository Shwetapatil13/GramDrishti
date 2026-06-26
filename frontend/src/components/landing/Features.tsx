import React from 'react';
import { motion } from 'framer-motion';
import { Satellite, Leaf, FileText, History, AlertTriangle, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Satellite,
    title: 'Satellite Monitoring',
    description: 'Direct integration with Google Earth Engine for real-time high-resolution imagery and analysis.',
    color: 'var(--brand-blue)'
  },
  {
    icon: Leaf,
    title: 'Environmental Intelligence',
    description: 'Track NDVI, NDWI, LST, rainfall and vegetation health dynamically across any region.',
    color: 'var(--score-excellent)'
  },
  {
    icon: FileText,
    title: 'AI Reports',
    description: 'Automatically generate comprehensive, actionable insights and village-level executive summaries.',
    color: 'var(--brand-violet)'
  },
  {
    icon: History,
    title: 'Historical Analysis',
    description: 'Compare multiple years of data to track degradation, recovery, and long-term climate trajectories.',
    color: 'var(--brand-mint)'
  },
  {
    icon: AlertTriangle,
    title: 'Risk Prediction',
    description: 'Predict droughts, crop stress, and land degradation before they become critical emergencies.',
    color: 'var(--semantic-warning)'
  },
  {
    icon: ShieldCheck,
    title: 'Decision Support',
    description: 'Empower governments, NGOs, and Gram Panchayats with data-backed policy recommendations.',
    color: 'var(--semantic-info)'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-canvas-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-heading-lg text-text-primary text-3xl md:text-4xl mb-4">
            Intelligence at Scale
          </h2>
          <p className="text-body text-text-secondary text-lg">
            Everything you need to understand rural environments, powered by the most advanced satellite and AI stack.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-surface-slate border border-surface-border rounded-2xl p-6 relative overflow-hidden group hover:border-brand-mint/50 hover:shadow-lg transition-all"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.color}, transparent)` }}
              />
              
              <div 
                className="w-12 h-12 rounded-xl border border-surface-border bg-surface-elevated flex items-center justify-center mb-6"
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              
              <h3 className="text-heading-md text-text-primary mb-3">
                {feature.title}
              </h3>
              
              <p className="text-body text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};