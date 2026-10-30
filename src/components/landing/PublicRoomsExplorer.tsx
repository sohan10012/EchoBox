import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  MessageSquare,
  Clock,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Globe,
  Radio,
} from 'lucide-react';
import { echoService } from '@/api/echoService';
import { RoomMetadata } from '@/api/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useCountdown } from '@/hooks/useCountdown';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';

interface RoomCardItemProps {
  room: RoomMetadata;
}

const RoomCardItem: React.FC<RoomCardItemProps> = ({ room }) => {
  const countdown = useCountdown(room.expires_at);
  const isExpired = Boolean(room.is_expired || countdown.isExpired);

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-[#121614]/85 backdrop-blur-xl p-6 shadow-xl hover:border-[#00D99A]/40 hover:-translate-y-1 transition-all flex flex-col justify-between overflow-hidden">
      {/* Top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-[#00D99A] group-hover:to-emerald-400 transition-colors" />

      <div className="space-y-4">
        {/* Header: Title and Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                #{room.room_id}
              </span>
              <span className="text-[11px] text-[#00D99A] font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Public
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-display tracking-tight group-hover:text-[#00D99A] transition-colors line-clamp-1">
              {room.room_name}
            </h3>
          </div>

          <Badge variant={isExpired ? 'expired' : 'active'} dot size="sm">
            {isExpired ? 'Expired' : 'Active'}
          </Badge>
        </div>

        {/* Discussion Question / Prompt Box */}
        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
            Discussion Prompt
          </span>
          <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
            {room.room_description || 'Open community feedback and candid peer discussion.'}
          </p>
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <MessageSquare className="w-3.5 h-3.5 text-[#00D99A]" />
            <span>
              {room.message_count !== undefined ? room.message_count : 0} messages
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400 justify-end font-mono">
            <Clock className="w-3.5 h-3.5 text-[#00D99A]" />
            <span>{isExpired ? 'Expired' : countdown.formatted}</span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="pt-4 mt-2">
        <Link to={`/room/${room.room_id}`} className="block">
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center"
            rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />}
          >
            Join Conversation
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const PublicRoomsExplorer: React.FC = () => {
  const [rooms, setRooms] = useState<RoomMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchRooms = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const publicRooms = await echoService.discoverRooms();
      setRooms(publicRooms);
    } catch {
      // Quiet fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter((r) => {
      const name = r.room_name?.toLowerCase() || '';
      const desc = r.room_description?.toLowerCase() || '';
      const id = r.room_id?.toLowerCase() || '';
      return name.includes(q) || desc.includes(q) || id.includes(q);
    });
  }, [rooms, searchQuery]);

  return (
    <section id="explore" className="py-16 sm:py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-400">
            <Radio className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
            <span>Live Discoverable Spaces</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            Explore Public Discussions
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Jump into active 24-hour anonymous conversations. Speak candidly without creating an account or revealing your identity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchRooms(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            className="shadow-glow-sm"
          >
            Create Discussion
          </Button>
        </div>
      </div>

      {/* Search Bar with Glassmorphism */}
      <div className="relative max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
          <Search className="w-4 h-4 text-[#00D99A]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics, questions, or room names (e.g. GTA 6, AI)..."
          className="w-full h-11 pl-11 pr-4 rounded-full border border-white/10 bg-[#121614]/85 backdrop-blur-xl text-neutral-900 dark:text-white placeholder-neutral-500 text-xs sm:text-sm focus-visible:outline-2 focus-visible:outline-[#00D99A] focus:border-[#00D99A]/60 transition-all shadow-sm"
        />
      </div>

      {/* Public Rooms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-white/5 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCardItem key={room.room_id} room={room} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-white/10 bg-white/40 dark:bg-white/5 p-12 text-center space-y-4">
          <Compass className="w-10 h-10 text-neutral-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              No Public Discussions Active
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              Be the first to launch a public discussion space. Define a topic and question to start gathering unfiltered thoughts.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Start First Discussion
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-neutral-500">
          No public discussions matching "{searchQuery}". Try a different keyword or create a new discussion space.
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={() => fetchRooms(true)}
      />
    </section>
  );
};
