import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, ExternalLink, ArrowRight, Globe, Lock, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { echoService } from '@/api/echoService';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { RoomVisibility } from '@/api/types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (roomId: string, roomName: string) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [visibility, setVisibility] = useState<RoomVisibility>('public');
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{
    roomId: string;
    roomName: string;
    roomDescription: string;
    visibility: RoomVisibility;
  } | null>(null);

  const { copy, isCopied } = useCopyToClipboard();
  const navigate = useNavigate();

  const handleReset = () => {
    setRoomName('');
    setRoomDescription('');
    setVisibility('public');
    setCreatedRoom(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = roomName.trim();
    if (!trimmedName) {
      toast.error('Please enter a room name.');
      return;
    }
    if (trimmedName.length > 80) {
      toast.error('Room name cannot exceed 80 characters.');
      return;
    }

    const trimmedDesc = roomDescription.trim();
    if (!trimmedDesc) {
      toast.error('Please enter a discussion question or prompt for participants.');
      return;
    }
    if (trimmedDesc.length > 1000) {
      toast.error('Description cannot exceed 1000 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await echoService.createRoom(trimmedName, trimmedDesc, visibility);

      setCreatedRoom({
        roomId: res.room_id,
        roomName: res.room_name,
        roomDescription: trimmedDesc,
        visibility,
      });

      toast.success('Room created successfully on AWS DynamoDB!');
      if (onRoomCreated) {
        onRoomCreated(res.room_id, res.room_name);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const publicUrl = createdRoom
    ? `${window.location.origin}/room/${createdRoom.roomId}`
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={createdRoom ? 'Discussion Space Ready' : 'Create Discussion Space'}
      description={
        createdRoom
          ? 'Your unique discussion link is live and accepting anonymous posts.'
          : 'Define a topic or question to collect candid thoughts from peers, friends, or the community.'
      }
    >
      {!createdRoom ? (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Room Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="modal-room-name"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Room Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="modal-room-name"
              type="text"
              required
              autoFocus
              maxLength={80}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. GTA 6 Discussion, Q4 Design Critique, Team AMA"
              className="w-full h-11 px-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
            />
          </div>

          {/* Room Description / Prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="modal-room-desc"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
              >
                Discussion Question / Prompt <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                {roomDescription.length}/1000
              </span>
            </div>
            <textarea
              id="modal-room-desc"
              required
              rows={3}
              maxLength={1000}
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="e.g. What do you think about GTA 6 and its upcoming release? Share your honest expectations, concerns, and predictions."
              className="w-full p-3.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[11px] text-neutral-400">
              This prompt will be pinned at the top of the chat so all participants immediately understand what to discuss.
            </p>
          </div>

          {/* Visibility Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Room Visibility
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  visibility === 'public'
                    ? 'border-brand-500/80 bg-brand-500/10 text-neutral-900 dark:text-white ring-1 ring-brand-500/30'
                    : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Globe className={`w-4 h-4 mt-0.5 flex-shrink-0 ${visibility === 'public' ? 'text-brand-500' : ''}`} />
                <div>
                  <p className="font-semibold text-xs">Public</p>
                  <p className="text-[10px] opacity-80 leading-tight">Discoverable on the Explore page</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  visibility === 'private'
                    ? 'border-brand-500/80 bg-brand-500/10 text-neutral-900 dark:text-white ring-1 ring-brand-500/30'
                    : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Lock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${visibility === 'private' ? 'text-brand-500' : ''}`} />
                <div>
                  <p className="font-semibold text-xs">Private</p>
                  <p className="text-[10px] opacity-80 leading-tight">Only accessible with direct link</p>
                </div>
              </button>
            </div>
          </div>

          {/* 24-Hour Notice */}
          <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span>Automatic 24-hour expiration starts upon room creation.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<Sparkles className="w-4 h-4 ml-0.5" />}
            >
              Launch Space
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 pt-2">
          {/* Shareable Link Box */}
          <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-medium">Direct Discussion Link</span>
              <span className="font-mono text-[11px] text-brand-500">
                ID: {createdRoom.roomId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full text-xs font-mono text-neutral-800 dark:text-neutral-200 bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 px-3 py-2 rounded-lg select-all"
              />
              <Button
                type="button"
                variant={isCopied ? 'secondary' : 'primary'}
                size="sm"
                className="flex-shrink-0"
                onClick={() => copy(publicUrl, 'Discussion link copied!')}
                leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-100 dark:border-white/5">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={() => {
                window.open(publicUrl, '_blank');
              }}
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              Open in New Tab
            </Button>

            <Button
              type="button"
              variant="primary"
              className="w-full sm:flex-1"
              onClick={() => {
                const targetId = createdRoom.roomId;
                handleReset();
                navigate(`/room/${targetId}`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4 ml-0.5" />}
            >
              Enter Discussion
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
