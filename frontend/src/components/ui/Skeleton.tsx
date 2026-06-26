import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

/**
 * Reusable Skeleton loader for data-dependent components.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '100%',
  borderRadius = '4px',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-surface-border ${className}`}
      style={{ width, height, borderRadius }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-surface-slate/20 to-transparent" />
    </div>
  );
};