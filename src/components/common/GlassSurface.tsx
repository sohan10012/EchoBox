import React from 'react';
import { cn } from '@/utils/cn';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'card' | 'modal' | 'recessed' | 'pill' | 'subtle';
  interactive?: boolean;
  glow?: boolean;
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  children: React.ReactNode;
}

export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  (
    {
      className,
      variant = 'card',
      interactive = false,
      glow = false,
      rounded = '2xl',
      children,
      ...props
    },
    ref
  ) => {
    const roundedClasses = {
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    };

    const variantClasses = {
      panel: 'glass-panel',
      card: 'glass-card',
      modal: 'glass-modal',
      recessed: 'glass-input',
      pill: 'glass-pill',
      subtle: 'bg-white/[0.03] dark:bg-[#121614]/60 backdrop-blur-md border border-white/8 shadow-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          roundedClasses[rounded],
          variantClasses[variant],
          interactive && 'hover:-translate-y-1 cursor-pointer',
          glow && 'shadow-[0_0_28px_rgba(0,217,154,0.18)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassSurface.displayName = 'GlassSurface';
