import React from 'react';
import { Skeleton } from '@/components/common/Skeleton';

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 w-full">
      {/* Incoming message skeleton */}
      <div className="flex items-start gap-3 max-w-[75%]">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-24 h-3.5 rounded" />
          <Skeleton className="w-64 h-12 rounded-2xl rounded-tl-sm" />
        </div>
      </div>

      {/* Outgoing message skeleton */}
      <div className="flex items-start gap-3 max-w-[75%] ml-auto flex-row-reverse">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-1.5 flex-1 flex flex-col items-end">
          <Skeleton className="w-20 h-3.5 rounded" />
          <Skeleton className="w-80 h-14 rounded-2xl rounded-tr-sm" />
        </div>
      </div>

      {/* Incoming message skeleton */}
      <div className="flex items-start gap-3 max-w-[75%]">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-28 h-3.5 rounded" />
          <Skeleton className="w-48 h-10 rounded-2xl rounded-tl-sm" />
        </div>
      </div>
    </div>
  );
};

