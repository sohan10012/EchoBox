import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  variant?: 'active' | 'closed' | 'expired' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className,
  dot = false,
}) => {
  const variantStyles = {
    active:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    closed:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    expired:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    neutral:
      'bg-neutral-100 text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-400 border border-neutral-200 dark:border-white/10',
    brand:
      'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20',
  };

  const dotColors = {
    active: 'bg-emerald-500 animate-pulse',
    closed: 'bg-amber-500',
    expired: 'bg-rose-500',
    neutral: 'bg-neutral-400',
    brand: 'bg-brand-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

