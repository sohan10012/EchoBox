import React from 'react';
import { cn } from '@/utils/cn';
import { getAnonymousIdentity } from '@/utils/avatar';

interface AvatarProps {
  id?: string;
  name?: string;
  gradient?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  id = 'anon',
  name,
  gradient: customGradient,
  size = 'md',
  className,
}) => {
  const identity = getAnonymousIdentity(id);
  const initials = name ? name.substring(0, 2).toUpperCase() : identity.initials;
  const gradient = customGradient || identity.gradient;

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  return (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0 bg-gradient-to-br ring-1 ring-white/20 select-none',
        gradient,
        sizeStyles[size],
        className
      )}
      title={name || identity.name}
      aria-label={name || identity.name}
    >
      <span className="relative z-10 tracking-tight">{initials}</span>
      {/* Subtle glass reflection overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-white/20 pointer-events-none" />
    </div>
  );
};

