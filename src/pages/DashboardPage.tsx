import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Radio,
  Layers,
  Search,
  Inbox,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { echoService } from '@/api/echoService';

export const DashboardPage: React.FC = () => {
  const { managedRooms, isAuthenticated, login } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalFeedbackSum, setTotalFeedbackSum] = useState<number>(0);
  const [activeRoomsCount, setActiveRoomsCount] = useState<number>(0);
  const [refreshTick, setRefreshTick] = useState(0);

  // Auto-initialize demo owner session for prototype preview if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      login('guest-owner@echobox.dev', 'echobox2026!').catch(() => {});
    }
  }, [isAuthenticated, login]);

  // Aggregate feedback count and active room counts across user rooms
  useEffect(() => {
    let isMounted = true;
    async function aggregateCounts() {
      if (!managedRooms.length) {
        setTotalFeedbackSum(0);
        setActiveRoomsCount(0);
        return;
      }

      try {
        const [feedbackResults, roomResults] = await Promise.all([
          Promise.allSettled(managedRooms.map((r) => echoService.getFeedback(r.roomId))),
          Promise.allSettled(managedRooms.map((r) => echoService.getRoom(r.roomId))),
        ]);

        if (!isMounted) return;

        let totalMessages = 0;
        for (const res of feedbackResults) {
          if (res.status === 'fulfilled' && res.value) {
            totalMessages += res.value.count || res.value.feedback?.length || 0;
          }
        }
        setTotalFeedbackSum(totalMessages);

        let activeCount = 0;
        for (const res of roomResults) {
          if (res.status === 'fulfilled' && res.value?.status === 'active') {
            activeCount++;
          }
        }
        setActiveRoomsCount(activeCount);
      } catch {
        // Quiet network error
      }
    }

    aggregateCounts();

    return () => {
      isMounted = false;
    };
  }, [managedRooms, refreshTick]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTick((t) => t + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredRooms = useMemo(() => {
    return managedRooms.filter((room) => {
      const matchesSearch =
        room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [managedRooms, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 min-h-[85dvh]">
      {/* Backend Security Limitation / Architecture Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-300">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Demo Owner Session — Architecture Boundary Ready:</span>
            <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              The existing AWS backend does not yet enforce AWS Cognito JWT validation on room creation, feedback retrieval, or room closure. Owner dashboard capabilities are currently running in prototype mode.
            </p>
          </div>
        </div>
      </div>

      {/* Header and Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-brand-500 uppercase tracking-wider">
              Room Management
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              AWS ap-south-1 Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight mt-1">
            Owner Workspace
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Create and monitor anonymous spaces, copy invite links for your audience, and review incoming conversations in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap flex-shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="flex-shrink-0"
          >
            Refresh
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
          value={managedRooms.length}
          icon={Layers}
          accentColor="indigo"
          subtext="Configured spaces"
        />
        <StatCard
          label="Total Messages"
          value={totalFeedbackSum}
          icon={MessageSquare}
          accentColor="brand"
          subtext="Aggregated submissions"
        />
        <StatCard
          label="Active Spaces"
          value={activeRoomsCount || managedRooms.length}
          icon={Radio}
          accentColor="emerald"
          subtext="Accepting public messages"
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

      {/* Rooms Grid / Empty State */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.roomId}
              roomId={room.roomId}
              initialRoomName={room.roomName}
              initialCreatedAt={room.createdAt}
              onRoomUpdated={() => setRefreshTick((t) => t + 1)}
            />
          ))}
        </div>
      ) : managedRooms.length === 0 ? (
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
          <div className="pt-2">
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
        onRoomCreated={() => setRefreshTick((t) => t + 1)}
      />
    </div>
  );
};
