import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { AnonymousIdentity } from '@/services/anonymousIdentity';

interface ChatEmptyStateProps {
  roomName: string;
  identity: AnonymousIdentity;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  roomName,
  identity,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-auto space-y-4 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-brand-500 flex items-center justify-center shadow-inner">
        <MessageSquare className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
          Welcome to {roomName}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          This is an anonymous group space. No messages have been sent yet.
          Be the first to speak up as <strong className="text-neutral-800 dark:text-neutral-200 font-semibold">{identity.displayName}</strong>!
        </p>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-medium text-brand-600 dark:text-brand-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span>100% Anonymous & Continuous Chat</span>
      </div>
    </div>
  );
};
