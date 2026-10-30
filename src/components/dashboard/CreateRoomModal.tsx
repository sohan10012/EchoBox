import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { echoService } from '@/api/echoService';
import { useAuth } from '@/context/AuthContext';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

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
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{
    roomId: string;
    roomName: string;
  } | null>(null);

  const { addManagedRoom } = useAuth();
  const { copy, isCopied } = useCopyToClipboard();
  const navigate = useNavigate();

  const handleReset = () => {
    setRoomName('');
    setCreatedRoom(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = roomName.trim();
    if (!trimmed) {
      toast.error('Please enter a name for your feedback room.');
      return;
    }

    if (trimmed.length > 80) {
      toast.error('Room name cannot exceed 80 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await echoService.createRoom(trimmed);
      
      // Store into user's managed rooms
      addManagedRoom(res.room_id, res.room_name);
      
      setCreatedRoom({
        roomId: res.room_id,
        roomName: res.room_name,
      });

      toast.success('Room created successfully on AWS!');
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
      title={createdRoom ? 'Room Ready for Feedback' : 'Create Anonymous Space'}
      description={
        createdRoom
          ? 'Your unique feedback link is live and accepting submissions.'
          : 'Set up a dedicated room to collect anonymous feedback from peers, clients, or teams.'
      }
    >
      {!createdRoom ? (
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="space-y-2">
            <label
              htmlFor="room-name"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Room Name
            </label>
            <input
              id="room-name"
              type="text"
              required
              autoFocus
              maxLength={80}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Design Critique, Q4 Team Feedback, Client AMA"
              className="w-full h-11 px-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
            />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Visitors will see this title at the top of their feedback submission page.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-white/5">
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
              Create Room
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Shareable Link Box */}
          <div className="p-4 rounded-xl bg-neutral-100/80 dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-medium">Public Feedback Link</span>
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
                onClick={() => copy(publicUrl, 'Public room link copied to clipboard!')}
                leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
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
              Open Form
            </Button>

            <Button
              type="button"
              variant="primary"
              className="w-full sm:flex-1"
              onClick={() => {
                handleReset();
                navigate(`/dashboard/room/${createdRoom.roomId}`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4 ml-0.5" />}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

