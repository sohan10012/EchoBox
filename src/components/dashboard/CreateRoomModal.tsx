import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, ArrowRight, Globe, Lock, Clock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { echoService } from '@/api/echoService';
import { useRoomShare } from '@/hooks/useRoomShare';
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

  const navigate = useNavigate();

  const {
    publicUrl,
    isIdCopied,
    isLinkCopied,
    copyRoomId,
    copyRoomLink,
    shareRoom,
  } = useRoomShare({
    roomId: createdRoom?.roomId || '',
    roomName: createdRoom?.roomName,
    roomDescription: createdRoom?.roomDescription,
  });

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
        <div className="space-y-4 pt-1">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-500 mt-0.5">
              <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                  Discussion Space Ready!
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {createdRoom.visibility}
                </span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold truncate mt-0.5">
                {createdRoom.roomName}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 italic leading-relaxed">
                "{createdRoom.roomDescription}"
              </p>
            </div>
          </div>

          {/* Room ID & Link Card */}
          <div className="p-4 rounded-xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/10 space-y-3.5">
            {/* Room ID Row */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200/70 dark:border-white/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Room Identifier
                </span>
                <span className="font-mono text-base font-bold text-neutral-900 dark:text-white tracking-wider">
                  #{createdRoom.roomId}
                </span>
              </div>

              <Button
                type="button"
                variant={isIdCopied ? 'secondary' : 'outline'}
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={copyRoomId}
                leftIcon={isIdCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isIdCopied ? 'ID Copied' : 'Copy Room ID'}
              </Button>
            </div>

            {/* Room Link Row */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                Shareable Public URL
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full text-xs font-mono text-neutral-800 dark:text-neutral-200 bg-white dark:bg-black/40 border border-neutral-200 dark:border-white/10 px-3 py-2 rounded-lg select-all"
                />
                <Button
                  type="button"
                  variant={isLinkCopied ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-9 px-3 text-xs flex-shrink-0"
                  onClick={copyRoomLink}
                  leftIcon={isLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {isLinkCopied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Share Room + Enter Discussion */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:flex-1 h-11"
              onClick={shareRoom}
              leftIcon={<Share2 className="w-4 h-4 text-emerald-500" />}
            >
              Share Room
            </Button>

            <Button
              type="button"
              variant="primary"
              className="w-full sm:flex-1 h-11 font-semibold"
              onClick={() => {
                const targetId = createdRoom.roomId;
                handleReset();
                navigate(`/room/${targetId}`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4 ml-0.5" />}
            >
              Enter Discussion Space
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
