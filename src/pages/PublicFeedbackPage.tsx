import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  RefreshCw,
  AlertCircle,
  Share2,
  ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { echoService } from '@/api/echoService';
import { FeedbackItem, RoomMetadata } from '@/api/types';
import { useAnonymousIdentity } from '@/hooks/useAnonymousIdentity';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatSkeleton } from '@/components/chat/ChatSkeleton';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { ChangeIdentityModal } from '@/components/chat/ChangeIdentityModal';

const POLLING_INTERVAL_MS = 5000;

export const PublicFeedbackPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { identity, changeIdentity } = useAnonymousIdentity();

  const [room, setRoom] = useState<RoomMetadata | null>(null);
  const [messages, setMessages] = useState<FeedbackItem[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set of feedback IDs sent by this browser in the current session
  const [mySentIds, setMySentIds] = useState<Set<string>>(() => {
    if (!roomId) return new Set();
    try {
      const stored = sessionStorage.getItem(`echobox.sent_${roomId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Identity change modal state
  const [isChangeIdentityModalOpen, setIsChangeIdentityModalOpen] = useState(false);

  // Auto-scroll management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAtBottomRef = useRef(true);

  // Polling guard
  const isPollingBusyRef = useRef(false);

  const { copy, isCopied } = useCopyToClipboard();
  const publicUrl = window.location.href;

  // Persist sent message IDs to session storage
  const recordSentMessage = useCallback((feedbackId: string) => {
    if (!roomId) return;
    setMySentIds((prev) => {
      const updated = new Set(prev).add(feedbackId);
      try {
        sessionStorage.setItem(`echobox.sent_${roomId}`, JSON.stringify(Array.from(updated)));
      } catch {}
      return updated;
    });
  }, [roomId]);

  // Initial Room & Message fetch
  const fetchRoomAndInitialMessages = useCallback(async () => {
    if (!roomId) {
      setError('No room identifier provided.');
      setIsLoadingRoom(false);
      setIsLoadingMessages(false);
      return;
    }

    try {
      setIsLoadingRoom(true);
      setError(null);

      const roomData = await echoService.getRoom(roomId);
      setRoom(roomData);
      setIsLoadingRoom(false);

      // Fetch messages
      const feedbackData = await echoService.getFeedback(roomId);
      const rawFeedback = feedbackData.feedback || [];

      // Sort chronologically (oldest to newest for chat flow)
      const sorted = [...rawFeedback].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setMessages(sorted);
      setIsLoadingMessages(false);

      // Scroll to bottom on initial load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Could not load room. It may not exist or has been deleted.');
      setIsLoadingRoom(false);
      setIsLoadingMessages(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomAndInitialMessages();
  }, [fetchRoomAndInitialMessages]);

  // Modest background polling (every 4-6s)
  useEffect(() => {
    if (!roomId || isLoadingRoom || !!error) return;

    let timerId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const poll = async () => {
      // Don't poll if document is hidden or request is already in-flight
      if (document.visibilityState !== 'visible' || isPollingBusyRef.current) {
        return;
      }

      try {
        isPollingBusyRef.current = true;
        const res = await echoService.getFeedback(roomId);
        if (isCancelled) return;

        const incoming = res.feedback || [];
        setMessages((prev) => {
          // Check if there are actual new messages by feedback_id
          const existingIds = new Set(prev.map((m) => m.feedback_id));
          const hasNew = incoming.some((m) => !existingIds.has(m.feedback_id));

          if (!hasNew && incoming.length === prev.length) {
            return prev;
          }

          // Merge and sort
          const sorted = [...incoming].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          // If visitor was at bottom, keep them at bottom
          if (isAtBottomRef.current) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 80);
          }

          return sorted;
        });
      } catch {
        // Quiet network error handling for background polling
      } finally {
        isPollingBusyRef.current = false;
      }
    };

    timerId = setInterval(poll, POLLING_INTERVAL_MS);

    // Visibility change handler to resume polling immediately when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        poll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId, isLoadingRoom, error]);

  // Handle user scrolling
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceToBottom < 80;
    isAtBottomRef.current = isAtBottom;
    setShowScrollBottom(!isAtBottom && messages.length > 5);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message action
  const handleSendMessage = async (text: string): Promise<boolean> => {
    if (!roomId) return false;

    try {
      const response = await echoService.submitFeedback(roomId, text, {
        displayName: identity.displayName,
        sessionId: identity.sessionId,
      });

      // Record this message as sent by current visitor
      recordSentMessage(response.feedback_id);

      // Optimistically append the message to chat
      const optimisticMessage: FeedbackItem = {
        feedback_id: response.feedback_id,
        message: text,
        created_at: new Date().toISOString(),
        display_name: identity.displayName,
        anonymous_session_id: identity.sessionId,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Scroll down to newly sent message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);

      toast.success('Message sent anonymously!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit message.');
      return false;
    }
  };

  const handleConfirmIdentityChange = () => {
    const newIdentity = changeIdentity();
    toast.success(`Identity changed to ${newIdentity.displayName}`);
  };

  // Error State
  if (error && !isLoadingRoom) {
    return (
      <div className="min-h-[85dvh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/20 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md text-center space-y-4 shadow-card-light dark:shadow-card-dark">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
              Room Unavailable
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {error}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => fetchRoomAndInitialMessages()}>
              Try Again
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Chat Room Header */}
      <div className="flex-shrink-0 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/85 dark:bg-[#121212]/90 backdrop-blur-md p-3 sm:p-4 mb-3 shadow-sm flex items-center justify-between gap-3">
        {/* Left: Room Title, Status, and ID */}
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display truncate">
              {room ? room.room_name : 'Loading Room...'}
            </h1>
            {room && (
              <Badge variant={room.status === 'active' ? 'active' : 'closed'} dot size="sm">
                {room.status === 'active' ? 'Active Space' : 'Closed'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
            <span className="font-mono bg-neutral-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
              #{roomId}
            </span>
            <span>•</span>
            <span>{messages.length} {messages.length === 1 ? 'message' : 'messages'}</span>
          </div>
        </div>

        {/* Right: Visitor Persona Pill & Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Identity Pill */}
          <button
            type="button"
            onClick={() => setIsChangeIdentityModalOpen(true)}
            title="Click to change your anonymous identity"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-xs"
          >
            <Avatar
              name={identity.displayName}
              gradient={identity.gradient}
              size="xs"
            />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 hidden md:inline font-display">
              {identity.displayName}
            </span>
            <RefreshCw className="w-3 h-3 text-neutral-400 hover:text-brand-500" />
          </button>

          {/* Share Link Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copy(publicUrl, 'Room invite link copied!')}
            className="hidden sm:inline-flex h-8 px-2.5"
            title="Share this room link"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Conversation Scrollable Region */}
      <div className="relative flex-1 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/50 dark:bg-[#0c0c0c]/60 backdrop-blur-sm overflow-hidden flex flex-col mb-3">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        >
          {isLoadingMessages ? (
            <ChatSkeleton />
          ) : messages.length === 0 ? (
            <ChatEmptyState
              roomName={room?.room_name || 'this space'}
              identity={identity}
            />
          ) : (
            messages.map((msg) => (
              <ChatMessageBubble
                key={msg.feedback_id}
                message={msg}
                isCurrentUser={mySentIds.has(msg.feedback_id)}
                currentUserDisplayName={identity.displayName}
                currentUserGradient={identity.gradient}
              />
            ))
          )}

          {/* Anchor to scroll to bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll-to-Bottom Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            aria-label="Scroll to newest messages"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat Composer Section */}
      <div className="flex-shrink-0">
        <ChatComposer
          identity={identity}
          onSendMessage={handleSendMessage}
          onOpenChangeIdentity={() => setIsChangeIdentityModalOpen(true)}
          isClosed={room?.status === 'closed'}
        />
      </div>

      {/* Change Identity Confirmation Dialog */}
      <ChangeIdentityModal
        isOpen={isChangeIdentityModalOpen}
        onClose={() => setIsChangeIdentityModalOpen(false)}
        currentIdentity={identity}
        onConfirmChange={handleConfirmIdentityChange}
      />
    </div>
  );
};
