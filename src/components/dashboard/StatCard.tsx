import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  accentColor?: 'brand' | 'indigo' | 'amber' | 'emerald';
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  accentColor = 'brand',
  isLoading = false,
}) => {
  const accentStyles = {
    brand: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-[#121614]/85 backdrop-blur-xl shadow-xl relative overflow-hidden transition-all hover:border-[#00D99A]/40">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            {label}
          </p>
          {isLoading ? (
            <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-md mt-1" />
          ) : (
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
              {value}
            </h3>
          )}
          {subtext && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 pt-1">
              {subtext}
            </p>
          )}
        </div>

        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0',
            accentStyles[accentColor]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

