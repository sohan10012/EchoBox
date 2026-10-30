import React from 'react';
import { Avatar } from '@/components/common/Avatar';
import { formatRelativeTime, formatFullDate } from '@/utils/date';
import { getMessageIdentity } from '@/utils/avatar';
import { FeedbackItem } from '@/api/types';

interface ChatMessageBubbleProps {
  message: FeedbackItem;
  isCurrentUser: boolean;
  currentUserDisplayName?: string;
  currentUserGradient?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isCurrentUser,
  currentUserDisplayName,
  currentUserGradient,
}) => {
  // Use message identity metadata if present, or override with current user if marked, or fallback to deterministic identity
  const identity = isCurrentUser && currentUserDisplayName
    ? {
        name: currentUserDisplayName,
        gradient: currentUserGradient || 'from-emerald-400 to-teal-600',
        initials: currentUserDisplayName.split(' ').map((n) => n[0]).join('').slice(0, 2),
      }
    : getMessageIdentity(message.feedback_id, message.display_name);

  return (
    <div
      className={`group flex items-start gap-3 w-full animate-fade-in ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <Avatar
        name={identity.name}
        gradient={identity.gradient}
        size="md"
        className="mt-0.5 flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10"
      />

      {/* Message Bubble Container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%] space-y-1 ${
          isCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender Name & Timestamp */}
        <div
          className={`flex items-center gap-2 text-[11px] px-1 ${
            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-display">
            {identity.name}
          </span>

          {isCurrentUser && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-500/15 text-brand-600 dark:text-brand-400 font-medium">
              You
            </span>
          )}

          <span
            className="text-neutral-400 dark:text-neutral-500 cursor-default"
            title={formatFullDate(message.created_at)}
          >
            {formatRelativeTime(message.created_at)}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm transition-colors ${
            isCurrentUser
              ? 'bg-neutral-900 text-white dark:bg-neutral-800 dark:text-white rounded-tr-sm border border-neutral-800 dark:border-white/10'
              : 'bg-white text-neutral-900 dark:bg-[#161616] dark:text-[#ededed] rounded-tl-sm border border-neutral-200/90 dark:border-white/10'
          }`}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
};
