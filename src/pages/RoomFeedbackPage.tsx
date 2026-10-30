import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Trash2,
  Lock,
  Unlock,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Clock,
  Calendar,
  RefreshCw,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { echoService } from '@/api/echoService';
import { FeedbackItem, RoomMetadata } from '@/api/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FeedbackCardSkeleton } from '@/components/common/Skeleton';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useCountdown } from '@/hooks/useCountdown';
import { formatRelativeTime, formatFullDate } from '@/utils/date';
import { getMessageIdentity } from '@/utils/avatar';

export const RoomFeedbackPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const [room, setRoom] = useState<RoomMetadata | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');

  // Deletion Modal State
  const [itemToDelete, setItemToDelete] = useState<FeedbackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close Room Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isClosingRoom, setIsClosingRoom] = useState(false);
  const [isReopeningRoom, setIsReopeningRoom] = useState(false);

  const { copy, isCopied } = useCopyToClipboard();
  const publicUrl = roomId ? `${window.location.origin}/room/${roomId}` : '';

  const countdown = useCountdown(room?.expires_at);
  const isRoomExpired = Boolean(room?.is_expired || countdown.isExpired);

  const loadData = async (isManualRefresh = false) => {
    if (!roomId) return;
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [roomRes, feedbackRes] = await Promise.all([
        echoService.getRoom(roomId),
        echoService.getFeedback(roomId),
      ]);

      setRoom(roomRes);
      setFeedbackList(feedbackRes.feedback || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load room details.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roomId]);

  const handleDeleteFeedback = async () => {
    if (!roomId || !itemToDelete) return;

    try {
      setIsDeleting(true);
      await echoService.deleteFeedback(roomId, itemToDelete.feedback_id);
      setFeedbackList((prev) =>
        prev.filter((item) => item.feedback_id !== itemToDelete.feedback_id)
      );
      toast.success('Message deleted successfully.');
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete message.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseRoom = async () => {
    if (!roomId) return;

    try {
      setIsClosingRoom(true);
      await echoService.closeRoom(roomId);
      if (room) {
        setRoom({ ...room, status: 'closed' });
      }
      toast.success('Room has been closed. New submissions are now disabled.');
      setIsCloseModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to close room.');
    } finally {
      setIsClosingRoom(false);
    }
  };

  const handleReopenRoom = async () => {
    if (!roomId) return;

    try {
      setIsReopeningRoom(true);
      await echoService.reopenRoom(roomId);
      if (room) {
        setRoom({ ...room, status: 'active' });
      }
      toast.success('Room reopened! New submissions are now enabled.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reopen room.');
    } finally {
      setIsReopeningRoom(false);
    }
  };

  const filteredAndSortedFeedback = useMemo(() => {
    let list = [...feedbackList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const identity = getMessageIdentity(item.feedback_id, item.display_name);
        return (
          item.message.toLowerCase().includes(q) ||
          identity.name.toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [feedbackList, searchQuery, sortOrder]);

  if (error && !isLoading) {
    return (
      <div className="min-h-[75dvh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/20 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md text-center space-y-4 shadow-card-light dark:shadow-card-dark">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
              {error.includes('Forbidden') ? 'Access Forbidden' : 'Room Unavailable'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {error.includes('Forbidden')
                ? 'You do not have permission to inspect this room. Each owner workspace is strictly isolated in DynamoDB.'
                : error}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/dashboard">
              <Button variant="primary" size="sm">
                Back to Your Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 min-h-[85dvh]">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Owner Spaces</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => copy(publicUrl, 'Public room link copied!')}
            leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {isCopied ? 'Link Copied' : 'Copy Link'}
          </Button>

          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Chat Room
            </Button>
          </a>
        </div>
      </div>

      {/* Room Details Header Card */}
      <div className="rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#121212] p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
                {room ? room.room_name : 'Loading Room...'}
              </h1>
              {room && (
                <>
                  <Badge
                    variant={isRoomExpired ? 'expired' : room.status === 'active' ? 'active' : 'closed'}
                    dot
                    size="sm"
                  >
                    {isRoomExpired ? 'Expired' : room.status === 'active' ? 'Active' : 'Closed'}
                  </Badge>
                  <Badge variant="neutral" size="sm" className="capitalize">
                    {room.visibility || 'public'}
                  </Badge>
                </>
              )}
            </div>
            {room?.room_description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 italic pt-1">
                "{room.room_description}"
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500 flex-wrap">
              <span className="font-mono bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded">
                Room ID: {roomId}
              </span>
              {room?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {formatFullDate(room.created_at)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {feedbackList.length} {feedbackList.length === 1 ? 'message' : 'messages'}
              </span>
            </div>
          </div>

          {room && room.status === 'active' && !isRoomExpired && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseModalOpen(true)}
              leftIcon={<Lock className="w-3.5 h-3.5 text-amber-500" />}
              className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex-shrink-0"
            >
              Close Submissions
            </Button>
          )}

          {room && room.status === 'closed' && !isRoomExpired && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReopenRoom}
              isLoading={isReopeningRoom}
              leftIcon={<Unlock className="w-3.5 h-3.5 text-emerald-500" />}
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex-shrink-0"
            >
              Reopen Submissions
            </Button>
          )}
        </div>

        {/* 24-Hour Expiry Bar */}
        <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
            <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span>24-Hour Room Lifespan:</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">
              {isRoomExpired ? 'Expired' : countdown.formatted}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">
            {isRoomExpired
              ? 'Automatic 24-hour limit reached. DynamoDB TTL physically cleans up records asynchronously.'
              : 'Submissions close automatically 24h from room creation.'}
          </span>
        </div>

        {/* Public Link Reminder */}
        <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Share2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span>Public chat URL for participants:</span>
          </div>
          <span className="font-mono text-neutral-600 dark:text-neutral-300 truncate max-w-md bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded">
            {publicUrl}
          </span>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation text or pseudonym..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#121212] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Order:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'oldest' | 'newest')}
            className="h-10 px-3 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#121212] text-neutral-800 dark:text-neutral-200 text-xs focus-visible:outline-2 focus-visible:outline-brand-500 cursor-pointer"
          >
            <option value="oldest">Chronological (Oldest First)</option>
            <option value="newest">Latest First</option>
          </select>
        </div>
      </div>

      {/* Feedback Messages List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <FeedbackCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredAndSortedFeedback.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedFeedback.map((item) => {
            const identity = getMessageIdentity(item.feedback_id, item.display_name);

            return (
              <div
                key={item.feedback_id}
                className="group relative rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#121212] p-5 sm:p-6 shadow-sm hover:shadow-card-light dark:hover:shadow-card-dark transition-all space-y-3"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={identity.name}
                      gradient={identity.gradient}
                      size="sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                          {identity.name}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                          #{item.feedback_id.slice(0, 6)}
                        </span>
                      </div>
                      <span
                        className="text-[11px] text-neutral-400 dark:text-neutral-500 block"
                        title={formatFullDate(item.created_at)}
                      >
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all focus:opacity-100"
                    title="Delete this message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Message Content */}
                <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed break-words whitespace-pre-wrap pl-11">
                  {item.message}
                </p>
              </div>
            );
          })}
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-3">
          <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            No Messages Received Yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Share the public room link with your audience or colleagues to begin receiving honest anonymous thoughts.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copy(publicUrl, 'Public link copied!')}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              Copy Shareable Link
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-neutral-500">
          No messages match "{searchQuery}".
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteFeedback}
        title="Delete Feedback Message?"
        message="Are you sure you want to delete this message? This action is permanent and cannot be undone."
        confirmLabel="Delete Message"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Close Room Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseRoom}
        title="Close Room to New Submissions?"
        message="Are you sure you want to close this room? Visitors will no longer be able to post messages."
        confirmLabel="Close Room"
        variant="warning"
        isLoading={isClosingRoom}
      />
    </div>
  );
};
