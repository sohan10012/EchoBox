import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  MessageSquare,
  Radio,
  Layers,
  Search,
  Inbox,
  RefreshCw,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { StatCard } from '@/components/dashboard/StatCard';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { echoService } from '@/api/echoService';
import { RoomMetadata } from '@/api/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimRoomId, setClaimRoomId] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch rooms from DynamoDB for the authenticated owner
  const loadOwnerRooms = useCallback(async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const ownerRooms = await echoService.getOwnerRooms();
      setRooms(ownerRooms);
      if (showToast) {
        toast.success(`Synchronized ${ownerRooms.length} spaces from DynamoDB`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not load your rooms from DynamoDB');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOwnerRooms();
  }, [loadOwnerRooms]);

  // Aggregate stats
  const totalMessages = useMemo(() => {
    return rooms.reduce((acc, r) => acc + (r.message_count || r.feedback_count || 0), 0);
  }, [rooms]);

  const activeRoomsCount = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return rooms.filter((r) => {
      const isExpired = (r.expires_at && r.expires_at <= now) || r.is_expired;
      return r.status === 'active' && !isExpired;
    }).length;
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const q = searchQuery.toLowerCase();
      return (
        room.room_name.toLowerCase().includes(q) ||
        room.room_id.toLowerCase().includes(q)
      );
    });
  }, [rooms, searchQuery]);

  const handleClaimRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = claimRoomId.trim();
    if (!cleanId) {
      toast.error('Please enter a valid room ID');
      return;
    }

    try {
      setIsClaiming(true);
      await echoService.claimLegacyRoom(cleanId);
      toast.success(`Room ${cleanId} successfully claimed into your workspace!`);
      setClaimRoomId('');
      setIsClaimModalOpen(false);
      loadOwnerRooms();
    } catch (err: any) {
      toast.error(err.message || 'Failed to claim room. It may be claimed by another owner.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 min-h-[85dvh]">
      {/* Header and Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-brand-500 uppercase tracking-wider">
              Owner Workspace
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {user?.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight mt-1">
            Spaces & Conversations
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Create anonymous feedback spaces, monitor incoming conversation streams, and track 24-hour expiry lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsClaimModalOpen(true)}
            leftIcon={<Link2 className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            Claim Room
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => loadOwnerRooms(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="flex-shrink-0"
          >
            Sync
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="flex-shrink-0 shadow-glow"
          >
            Create New Room
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Managed Spaces"
          value={isLoading ? '—' : rooms.length}
          icon={Layers}
          accentColor="indigo"
          subtext="Persistent across sessions"
        />
        <StatCard
          label="Total Messages"
          value={isLoading ? '—' : totalMessages}
          icon={MessageSquare}
          accentColor="brand"
          subtext="Live feedback received"
        />
        <StatCard
          label="Active Spaces"
          value={isLoading ? '—' : activeRoomsCount}
          icon={Radio}
          accentColor="emerald"
          subtext="Accepting chat messages"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms by name or ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#121212] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Showing {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'}
          </span>
        </div>
      </div>

      {/* Rooms Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-white/5 animate-pulse p-6 space-y-4"
            />
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.room_id}
              roomId={room.room_id}
              initialRoomName={room.room_name}
              initialCreatedAt={room.created_at}
              initialExpiresAt={room.expires_at}
              initialStatus={room.is_expired ? 'expired' : room.status}
              initialFeedbackCount={room.message_count || room.feedback_count}
              onRoomUpdated={() => loadOwnerRooms()}
            />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-white/15 bg-white/40 dark:bg-[#121212]/40 backdrop-blur-sm p-12 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
              No Rooms Created Yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Create your first space to generate a shareable link. Anyone with the URL can jump into the anonymous group chat without logging in.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsClaimModalOpen(true)}
              leftIcon={<Link2 className="w-4 h-4" />}
            >
              Claim Existing Room
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-glow"
            >
              Create Your First Room
            </Button>
          </div>
        </div>
      ) : (
        /* No Search Matches */
        <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          No rooms matching "{searchQuery}". Try a different keyword or clear your search.
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={() => loadOwnerRooms()}
      />

      {/* Claim Legacy Room Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Claim Room into Workspace"
        description="Adopt an unowned room into your authenticated workspace by its 8-character Room ID."
      >
        <form onSubmit={handleClaimRoom} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label
              htmlFor="claim-id"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Room ID
            </label>
            <input
              id="claim-id"
              type="text"
              required
              maxLength={16}
              value={claimRoomId}
              onChange={(e) => setClaimRoomId(e.target.value)}
              placeholder="e.g. f485b2d4"
              className="w-full h-11 px-4 rounded-xl border border-neutral-300 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/80 text-neutral-900 dark:text-white font-mono text-sm focus-visible:outline-2 focus-visible:outline-brand-500 transition-colors"
            />
            <p className="text-[11px] text-neutral-400">
              Only unowned rooms can be claimed. Once claimed, this room will permanently belong to your account.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsClaimModalOpen(false)}
              disabled={isClaiming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isClaiming}
              leftIcon={<Link2 className="w-4 h-4" />}
            >
              Claim Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
