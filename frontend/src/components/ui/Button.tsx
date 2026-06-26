import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Reusable Button component styled per design system.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'transition-all duration-180 ease-in-out font-mono tracking-[0.12em] uppercase rounded-button flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-brand-mint text-text-inverted hover:bg-white/20 hover:text-black hover:outline hover:outline-1 hover:outline-[#c2c2c2] border-none',
    secondary: 'bg-surface-border text-text-muted font-grotesk normal-case tracking-normal hover:bg-white/15 hover:text-black',
    outlined: 'border border-surface-border bg-transparent text-text-primary hover:border-brand-mint',
  };

  const sizeClasses = {
    sm: 'text-xs px-4 py-2',
    md: 'text-xs px-6 py-2.5',
    lg: 'text-sm px-8 py-3',
  };

  const stateClasses = (loading || disabled) ? 'opacity-50 cursor-not-allowed' : '';
  const loadingClasses = loading ? 'animate-pulse' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${stateClasses} ${loadingClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  );
};