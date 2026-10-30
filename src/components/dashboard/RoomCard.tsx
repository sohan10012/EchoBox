import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  MessageSquare,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { echoService } from '@/api/echoService';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { formatRelativeTime } from '@/utils/date';
import { RoomStatus } from '@/api/types';

interface RoomCardProps {
  roomId: string;
  initialRoomName?: string;
  initialCreatedAt?: string;
  onRoomUpdated?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomId,
  initialRoomName,
  initialCreatedAt,
  onRoomUpdated,
}) => {
  const [roomName, setRoomName] = useState(initialRoomName || 'Loading...');
  const [status, setStatus] = useState<RoomStatus>('active');
  const [feedbackCount, setFeedbackCount] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState(initialCreatedAt || new Date().toISOString());
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { copy, isCopied } = useCopyToClipboard();
  const publicUrl = `${window.location.origin}/room/${roomId}`;

  // Fetch real-time status and feedback count from AWS backend
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [roomData, feedbackData] = await Promise.allSettled([
          echoService.getRoom(roomId),
          echoService.getFeedback(roomId),
        ]);

        if (!isMounted) return;

        if (roomData.status === 'fulfilled') {
          setRoomName(roomData.value.room_name);
          setStatus(roomData.value.status);
          if (roomData.value.created_at) {
            setCreatedAt(roomData.value.created_at);
          }
        }

        if (feedbackData.status === 'fulfilled') {
          setFeedbackCount(feedbackData.value.count || feedbackData.value.feedback?.length || 0);
        }
      } catch {
        // Quiet fallback
      } finally {
        if (isMounted) setIsLoadingDetails(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const handleCloseRoom = async () => {
    try {
      setIsClosing(true);
      await echoService.closeRoom(roomId);
      setStatus('closed');
      toast.success(`Room "${roomName}" is now closed.`);
      setIsCloseModalOpen(false);
      if (onRoomUpdated) onRoomUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to close room.');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <>
      <div
        className={`group relative rounded-2xl border p-6 shadow-sm transition-all flex flex-col justify-between overflow-hidden ${
          status === 'active'
            ? 'border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#121212] hover:shadow-card-light dark:hover:shadow-card-dark'
            : 'border-neutral-200/60 dark:border-amber-500/15 bg-neutral-50/60 dark:bg-[#0e0e0e]/80 opacity-90'
        }`}
      >
        {/* Top indicator bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 transition-colors ${
            status === 'active'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300'
              : 'bg-neutral-400 dark:bg-amber-500/40'
          }`}
        />

        <div className="space-y-4">
          {/* Card Top: Title, Status Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display tracking-tight group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                {roomName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded">
                  ID: {roomId}
                </span>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatRelativeTime(createdAt)}
                </span>
              </div>
            </div>

            <Badge variant={status === 'active' ? 'active' : 'closed'} dot size="sm">
              {status === 'active' ? 'Active' : 'Closed'}
            </Badge>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-100 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Total Feedback
                </p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {feedbackCount !== null ? feedbackCount : isLoadingDetails ? '—' : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Submissions
                </p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {status === 'active' ? 'Open' : 'Archived'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions Bottom */}
        <div className="pt-5 flex items-center justify-between gap-2">
          {/* Copy link button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => copy(publicUrl, 'Public feedback link copied!')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 border border-neutral-200/80 dark:border-white/10 transition-colors"
              title="Copy shareable link"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{isCopied ? 'Copied' : 'Link'}</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
              title="Open public form in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {status === 'active' && (
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(true)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 transition-colors"
                title="Close room to stop further feedback"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View feedback button */}
          <Link to={`/dashboard/room/${roomId}`}>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              View Feedback
            </Button>
          </Link>
        </div>
      </div>

      {/* Close Room Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseRoom}
        title="Close Feedback Room?"
        message={`Are you sure you want to close "${roomName}"? Visitors will no longer be able to submit new anonymous messages.`}
        confirmLabel="Close Room"
        variant="warning"
        isLoading={isClosing}
      />
    </>
  );
};

