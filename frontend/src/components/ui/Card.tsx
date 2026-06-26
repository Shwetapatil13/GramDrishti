import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  active?: boolean;
  className?: string;
}

/**
 * Reusable Card component styled per design system.
 */
export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  active = false,
  className = '',
}) => {
  const baseClasses = 'bg-surface-slate border rounded-card p-6';
  
  const activeStyles = active
    ? 'border-brand-mint shadow-[0_0_0_1px_#3cffd0_inset]'
    : 'border-surface-border';

  const hoverProps = hover
    ? {
        whileHover: {
          borderColor: '#309875',
          transition: { duration: 0.15, ease: 'easeOut' },
        },
      }
    : {};

  return (
    <motion.div
      className={`${baseClasses} ${activeStyles} ${className}`}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
};