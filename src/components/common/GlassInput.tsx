import React from 'react';
import { cn } from '@/utils/cn';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string | null;
  rounded?: 'lg' | 'xl' | '2xl' | 'full';
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      className,
      leftIcon,
      rightElement,
      error,
      rounded = 'full',
      disabled,
      ...props
    },
    ref
  ) => {
    const roundedClasses = {
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-full',
    };

    return (
      <div className="w-full space-y-1.5">
        <div
          className={cn(
            'relative flex items-center glass-input transition-all duration-200',
            roundedClasses[rounded],
            error
              ? 'border-rose-500/80 ring-2 ring-rose-500/20'
              : 'focus-within:border-[#00D99A]/70 focus-within:ring-2 focus-within:ring-[#00D99A]/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {leftIcon && (
            <div className="pl-3.5 pr-1 flex items-center justify-center text-neutral-400 shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full min-w-0 bg-transparent text-sm text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none font-mono py-2.5 sm:py-3',
              leftIcon ? 'pl-1.5 pr-3' : 'px-4',
              rightElement ? 'pr-2' : ''
            )}
            {...props}
          />

          {rightElement && (
            <div className="pr-1.5 flex items-center shrink-0">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs text-rose-400 font-medium px-4 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

