import React from 'react';
import { cn } from '@/utils/cn';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-neutral-200/70 dark:bg-neutral-800/60',
        className
      )}
      aria-hidden="true"
    />
  );
};

export const RoomCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-3/5 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-28 rounded-md" />
      <div className="pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const FeedbackCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
    </div>
  );
};

