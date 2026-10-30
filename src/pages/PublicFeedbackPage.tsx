import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  RefreshCw,
  AlertCircle,
  ArrowDown,
  Clock,
  ShieldCheck,
  Copy,
  Info,
  MessageSquare,
  KeyRound,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { echoService } from '@/api/echoService';
import { FeedbackItem, RoomMetadata } from '@/api/types';
import { useAnonymousIdentity } from '@/hooks/useAnonymousIdentity';
import { useRoomShare } from '@/hooks/useRoomShare';
import { useCountdown } from '@/hooks/useCountdown';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime, formatFullDate } from '@/utils/date';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Modal } from '@/components/common/Modal';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatSkeleton } from '@/components/chat/ChatSkeleton';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { ChangeIdentityModal } from '@/components/chat/ChangeIdentityModal';
import { ManagePostsModal } from '@/components/identity/ManagePostsModal';

const POLLING_INTERVAL_MS = 4500;

export const PublicFeedbackPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { identity, changeIdentity } = useAnonymousIdentity();
  const { echoIdentity, isEchoIdentityAuthenticated } = useAuth();

  const [room, setRoom] = useState<RoomMetadata | null>(null);
  const [messages, setMessages] = useState<FeedbackItem[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile Drawers & Modals
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
  const [isMobileIdentityOpen, setIsMobileIdentityOpen] = useState(false);
  const [isManagePostsModalOpen, setIsManagePostsModalOpen] = useState(false);

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

  const {
    publicUrl,
    isIdCopied,
    isLinkCopied,
    copyRoomId,
    copyRoomLink,
    shareRoom,
  } = useRoomShare({
    roomId: roomId || '',
    roomName: room?.room_name,
    roomDescription: room?.room_description,
  });

  // Countdown timer based on room.expires_at
  const countdown = useCountdown(room?.expires_at);
  const isRoomExpired = Boolean(room?.is_expired || countdown.isExpired);

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

  // Background polling (every 4.5s) with tab visibility pausing
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
    if (isRoomExpired) {
      toast.error('This room has expired and can no longer accept submissions.');
      return false;
    }

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
    setIsMobileIdentityOpen(false);
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 h-[calc(100dvh-4rem)] flex flex-col min-h-0 overflow-hidden">
      {/* 3-Column Grid for Laptop/Desktop; Single Column for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Room Info & 24h Expiry Countdown (Desktop)  */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-1">
          {/* Room Details Card */}
          <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md p-5 space-y-4 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-brand-500 uppercase tracking-wider font-semibold">
                  {room?.visibility === 'public' ? 'Public Room' : 'Private Space'}
                </span>
                <Badge
                  variant={isRoomExpired ? 'expired' : room?.status === 'active' ? 'active' : 'closed'}
                  dot
                  size="sm"
                >
                  {isRoomExpired ? 'Expired' : room?.status === 'active' ? 'Active' : 'Closed'}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display tracking-tight leading-snug">
                {room ? room.room_name : 'Loading Space...'}
              </h2>
            </div>

            {/* Discussion Prompt */}
            {room?.room_description && (
              <div className="p-3 rounded-xl bg-neutral-100/80 dark:bg-white/[0.04] border border-neutral-200/60 dark:border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Discussion Prompt
                  </span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  "{room.room_description}"
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-100 dark:border-white/5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span>Room Identifier</span>
                <button
                  type="button"
                  onClick={copyRoomId}
                  title="Click to copy Room ID"
                  className="inline-flex items-center gap-1 font-mono bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 px-2 py-0.5 rounded text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer group"
                >
                  <span>#{roomId}</span>
                  {isIdCopied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
              {room?.created_at && (
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Created</span>
                  <span title={formatFullDate(room.created_at)}>
                    {formatRelativeTime(room.created_at)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span>Messages</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {messages.length} submissions
                </span>
              </div>
            </div>
          </div>

          {/* 24-Hour Expiry Card */}
          <div
            className={`rounded-2xl border p-5 space-y-3 shadow-sm ${
              isRoomExpired
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  24-Hour Lifespan
                </span>
              </div>
              <span className="font-mono text-sm font-bold">
                {isRoomExpired ? 'Expired' : countdown.formatted}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed opacity-90">
              {isRoomExpired
                ? 'This space has exceeded its 24-hour lifetime. No further anonymous submissions can be sent.'
                : 'EchoBox enforces a strict 24-hour conversation lifecycle. When the timer hits zero, submissions close automatically.'}
            </p>
          </div>

          {/* Invite & Share Card */}
          <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Invite & Share
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">Public Space</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full text-[11px] font-mono text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg select-all"
              />
              <Button
                type="button"
                variant={isLinkCopied ? 'secondary' : 'primary'}
                size="sm"
                className="h-8 px-2.5 flex-shrink-0"
                onClick={copyRoomLink}
                title="Copy Room Link"
              >
                {isLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs h-8"
                onClick={shareRoom}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-500" />}
              >
                Share Room
              </Button>
              <Button
                type="button"
                variant={isIdCopied ? 'secondary' : 'outline'}
                size="sm"
                className="w-full text-xs h-8"
                onClick={copyRoomId}
                leftIcon={isIdCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isIdCopied ? 'ID Copied' : 'Copy ID'}
              </Button>
            </div>

            <p className="text-[10px] text-neutral-400 leading-tight">
              Anyone with the link or room ID can join and converse anonymously.
            </p>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Main Chat Conversation & Composer         */}
        {/* ========================================================= */}
        <main className="col-span-1 lg:col-span-6 flex flex-col h-full min-h-0 relative">
          {/* Mobile Top Bar (Visible < lg) */}
          <div className="lg:hidden flex-shrink-0 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/85 dark:bg-[#121212]/90 backdrop-blur-md p-3 mb-2 shadow-sm flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-neutral-900 dark:text-white font-display truncate">
                {room ? room.room_name : 'Loading Room...'}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                <span className="font-mono">#{roomId}</span>
                <span>•</span>
                <span className="font-mono text-emerald-500 font-semibold">
                  {isRoomExpired ? 'Expired' : countdown.formatted}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={shareRoom}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                title="Share room"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileInfoOpen(true)}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                title="Room details"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileIdentityOpen(true)}
                className="flex items-center gap-1.5 p-1 px-2 rounded-lg border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs"
                title="My Identity"
              >
                <Avatar name={identity.displayName} gradient={identity.gradient} size="xs" />
                <span className="font-semibold text-[11px] max-w-[80px] truncate">
                  {identity.displayName.split(' ')[0]}
                </span>
              </button>
            </div>
          </div>

          {/* Pinned Discussion Prompt Banner (Desktop & Mobile) */}
          {room?.room_description && (
            <div className="flex-shrink-0 mb-2 rounded-xl border border-brand-500/25 bg-gradient-to-r from-brand-500/[0.08] via-brand-500/[0.03] to-transparent p-2.5 sm:px-3.5 sm:py-2.5 backdrop-blur-md shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-500">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Discussion Topic
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {room.visibility === 'public' ? 'Public Room' : 'Private Space'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug line-clamp-2">
                    {room.room_description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Region */}
          <div className="relative flex-1 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/50 dark:bg-[#0c0c0c]/60 backdrop-blur-sm overflow-hidden flex flex-col mb-3">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
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
                    isCurrentUser={
                      mySentIds.has(msg.feedback_id) ||
                      (!!msg.anonymous_session_id && msg.anonymous_session_id === identity.sessionId)
                    }
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
              isExpired={isRoomExpired}
            />
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Anonymous Identity & Privacy Guidelines    */}
        {/* ========================================================= */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pl-1">
          {/* Persona Card */}
          <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Your Persona
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded">
                Tab Persistent
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar
                name={identity.displayName}
                gradient={identity.gradient}
                size="lg"
                className="ring-2 ring-brand-500/20"
              />
              <div className="min-w-0">
                <p className="font-bold text-neutral-900 dark:text-white font-display text-base truncate">
                  {identity.displayName}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  Session: {identity.sessionId.slice(0, 10)}...
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              All messages you post in this room will appear under this pseudonym. No personal data, email, or credentials are required.
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsChangeIdentityModalOpen(true)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Change Identity
            </Button>
          </div>

          {/* Manage My Posts Connection Card */}
          <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Manage My Posts</span>
              </div>
              {isEchoIdentityAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
              )}
            </div>

            {isEchoIdentityAuthenticated ? (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-mono">ID:</span>
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {echoIdentity?.echoboxId}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Submissions sent from this browser are linked to your EchoBox ID. You can manage or delete them anytime.
                </p>
                <Link to="/my-posts">
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Open My Posts Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Participating is completely anonymous. Optionally connect an EchoBox ID if you want to manage or delete your messages later. No email needed.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsManagePostsModalOpen(true)}
                  leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                >
                  Connect EchoBox ID
                </Button>
              </div>
            )}
          </div>

          {/* Anonymity Architecture Card */}
          <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Anonymity Architecture</span>
            </div>

            <ul className="space-y-2.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                <span>
                  <strong>Zero Tracking:</strong> EchoBox does not log IP addresses, fingerprint devices, or persist user-identifying cookies.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                <span>
                  <strong>24h Purge:</strong> Native DynamoDB TTL deletes conversation records after exactly 24 hours.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                <span>
                  <strong>Stable Pseudonyms:</strong> Your avatar and pseudonym remain consistent throughout this session until explicitly changed.
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Change Identity Confirmation Dialog */}
      <ChangeIdentityModal
        isOpen={isChangeIdentityModalOpen}
        onClose={() => setIsChangeIdentityModalOpen(false)}
        currentIdentity={identity}
        onConfirmChange={handleConfirmIdentityChange}
      />

      {/* Mobile Info Sheet/Modal */}
      <Modal
        isOpen={isMobileInfoOpen}
        onClose={() => setIsMobileInfoOpen(false)}
        title={room ? room.room_name : 'Room Information'}
        description={`Room #${roomId}`}
      >
        <div className="space-y-4 pt-1">
          {/* Discussion prompt in mobile info */}
          {room?.room_description && (
            <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-1">
              <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 uppercase tracking-wider font-semibold block">
                Discussion Prompt
              </span>
              <p className="text-xs text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
                "{room.room_description}"
              </p>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Visibility</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200 capitalize">
                {room?.visibility || 'Public'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status</span>
              <Badge variant={isRoomExpired ? 'expired' : room?.status === 'active' ? 'active' : 'closed'} size="sm">
                {isRoomExpired ? 'Expired' : room?.status === 'active' ? 'Active' : 'Closed'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">24-Hour Expiry</span>
              <span className="font-mono font-semibold">{isRoomExpired ? 'Expired' : countdown.formatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Submissions</span>
              <span className="font-semibold">{messages.length} messages</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Shareable Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full text-xs font-mono bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 px-3 py-2 rounded-lg select-all"
              />
              <Button
                type="button"
                variant={isLinkCopied ? 'secondary' : 'primary'}
                size="sm"
                onClick={copyRoomLink}
              >
                {isLinkCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={shareRoom}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-500" />}
              >
                Share
              </Button>
              <Button
                type="button"
                variant={isIdCopied ? 'secondary' : 'outline'}
                size="sm"
                className="w-full text-xs"
                onClick={copyRoomId}
                leftIcon={isIdCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isIdCopied ? 'ID Copied' : 'Copy ID'}
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsMobileInfoOpen(false);
                setIsManagePostsModalOpen(true);
              }}
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            >
              {isEchoIdentityAuthenticated ? 'Manage My Posts' : 'Connect EchoBox ID'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Identity Sheet/Modal */}
      <Modal
        isOpen={isMobileIdentityOpen}
        onClose={() => setIsMobileIdentityOpen(false)}
        title="Your Anonymous Identity"
        description="Your pseudonymous persona for this browser session."
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10">
            <Avatar name={identity.displayName} gradient={identity.gradient} size="lg" />
            <div>
              <p className="font-bold text-neutral-900 dark:text-white font-display">
                {identity.displayName}
              </p>
              <p className="text-xs text-neutral-400">
                Session: {identity.sessionId.slice(0, 12)}...
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            All messages you send appear under this name. Change it anytime to speak as a different persona.
          </p>

          <Button
            type="button"
            variant="primary"
            className="w-full text-xs"
            onClick={() => {
              setIsMobileIdentityOpen(false);
              setIsChangeIdentityModalOpen(true);
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Change Anonymous Identity
          </Button>
        </div>
      </Modal>

      {/* Manage Posts Modal */}
      <ManagePostsModal
        isOpen={isManagePostsModalOpen}
        onClose={() => setIsManagePostsModalOpen(false)}
      />
    </div>
  );
};
