import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-9 px-3.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'h-11 px-5 text-sm font-medium rounded-xl gap-2',
      lg: 'h-13 px-7 text-base font-semibold rounded-xl gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-white text-neutral-950 hover:bg-neutral-100 active:scale-[0.98] shadow-glow-sm hover:shadow-glow dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 border border-white/20',
      secondary:
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98] dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:bg-neutral-800/90 border border-neutral-200/80 dark:border-white/10 shadow-sm',
      outline:
        'bg-transparent text-neutral-800 hover:bg-neutral-100/70 active:scale-[0.98] dark:text-neutral-200 dark:hover:bg-white/5 border border-neutral-300 dark:border-white/15',
      ghost:
        'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white',
      danger:
        'bg-rose-600/10 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/20 active:scale-[0.98] dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-transform transition-opacity motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-brand-500',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

