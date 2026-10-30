import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { AnonymousIdentity } from '@/services/anonymousIdentity';

interface ChatComposerProps {
  identity: AnonymousIdentity;
  onSendMessage: (text: string) => Promise<boolean>;
  onOpenChangeIdentity: () => void;
  isClosed?: boolean;
  isExpired?: boolean;
}

const MAX_CHAR_LIMIT = 2000;

export const ChatComposer: React.FC<ChatComposerProps> = ({
  identity,
  onSendMessage,
  onOpenChangeIdentity,
  isClosed = false,
  isExpired = false,
}) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-resize textarea to fit text (up to max height)
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift submits
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isClosed || isSubmitting) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_CHAR_LIMIT) {
      setErrorMsg(`Message exceeds ${MAX_CHAR_LIMIT} characters`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const success = await onSendMessage(trimmed);
      if (success) {
        setText('');
        setCooldown(2);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  if (isExpired) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
          <Lock className="w-4 h-4" />
          <span>Room Has Expired (24-Hour Limit)</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          This room has reached its 24-hour lifetime. You can view previous conversation messages, but no new anonymous submissions are permitted.
        </p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
          <Lock className="w-4 h-4" />
          <span>Room Submissions Closed</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          The room owner has closed this space. You can read previous messages, but new messages cannot be sent.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Current Identity Bar */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <Avatar
            name={identity.displayName}
            gradient={identity.gradient}
            size="xs"
          />
          <span className="text-neutral-500 dark:text-neutral-400">
            Speaking as:{' '}
            <strong className="text-neutral-900 dark:text-white font-medium">
              {identity.displayName}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenChangeIdentity}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-brand-500 dark:text-neutral-400 dark:hover:text-brand-400 transition-colors focus-visible:outline-none"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Change identity</span>
        </button>
      </div>

      {/* Composer Card with Glassmorphism */}
      <div className="relative rounded-2xl border border-white/12 bg-[#121614]/85 backdrop-blur-xl shadow-lg transition-all focus-within:border-[#00D99A]/70 focus-within:ring-2 focus-within:ring-[#00D99A]/20 overflow-hidden">
        {/* Error notification if any */}
        {errorMsg && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between text-xs text-rose-400">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errorMsg}
            </span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="font-bold hover:underline"
            >
              ×
            </button>
          </div>
        )}

        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message anonymously... (Enter to send, Shift+Enter for new line)"
            maxLength={MAX_CHAR_LIMIT + 50}
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none resize-none leading-relaxed min-h-[44px]"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="px-3.5 py-2.5 bg-black/30 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            <span className={isOverLimit ? 'text-rose-500 font-bold' : ''}>
              {charCount}/{MAX_CHAR_LIMIT}
            </span>
            <span className="hidden sm:inline">• Enter to send</span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!text.trim() || isOverLimit || isSubmitting || cooldown > 0}
            className="shadow-glow-sm h-8 px-4"
            rightIcon={cooldown === 0 ? <Send className="w-3.5 h-3.5 ml-1" /> : undefined}
          >
            {cooldown > 0 ? `Wait ${cooldown}s` : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

