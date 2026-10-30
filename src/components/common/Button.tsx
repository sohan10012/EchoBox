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
      sm: 'h-9 px-4 text-xs font-medium rounded-full gap-1.5',
      md: 'h-11 px-5 text-sm font-semibold rounded-full gap-2',
      lg: 'h-13 px-7 text-base font-bold rounded-full gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-[#00D99A] text-neutral-950 hover:bg-[#00c58b] active:scale-[0.98] font-bold border border-emerald-300/40 shadow-[0_4px_20px_rgba(0,217,154,0.35),inset_0_1px_0_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_28px_rgba(0,217,154,0.5)]',
      secondary:
        'glass-pill text-white active:scale-[0.98]',
      outline:
        'bg-transparent hover:bg-white/[0.06] text-neutral-200 hover:text-white border border-white/15 hover:border-white/25 active:scale-[0.98] shadow-sm',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-neutral-400 hover:text-white active:scale-[0.98]',
      danger:
        'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 active:scale-[0.98] shadow-sm',
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

