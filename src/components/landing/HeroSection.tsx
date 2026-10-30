import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  PlusCircle,
  Hash,
  ShieldCheck,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { echoService } from '@/api/echoService';
import { RoomMetadata } from '@/api/types';
import { useCountdown } from '@/hooks/useCountdown';

// Fallback seeded discussions for instant zero-latency rendering
const SEEDED_ROOMS: RoomMetadata[] = [
  {
    room_id: '88e686fc',
    room_name: 'Is AI making developers more productive or dependent?',
    room_description:
      'With AI coding assistants becoming part of everyday development, are developers becoming more productive, or are they losing their problem-solving skills?',
    visibility: 'public',
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    feedback_count: 18,
    message_count: 18,
  },
  {
    room_id: 'e2b53ca7',
    room_name: 'What makes a startup idea worth building?',
    room_description:
      'Is solving a real problem enough, or do timing, execution, distribution and market demand matter more?',
    visibility: 'public',
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    feedback_count: 18,
    message_count: 18,
  },
  {
    room_id: 'c72f033e',
    room_name: 'Is college still necessary for a successful tech career?',
    room_description:
      'Can skills, projects and practical experience replace a traditional college degree in today\'s technology industry?',
    visibility: 'public',
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    feedback_count: 18,
    message_count: 18,
  },
];

// Curated authentic perspectives for the left floating dialogue deck
const PEER_THOUGHTS = [
  {
    author: 'Curious Lynx',
    gradient: 'from-emerald-400 to-teal-600',
    topic: 'AI & Engineering',
    message:
      'AI generates boilerplate instantly, but debugging distributed race conditions still demands pure human critical thinking.',
  },
  {
    author: 'Midnight Wolf',
    gradient: 'from-indigo-400 to-purple-600',
    topic: 'Startup Reality',
    message:
      'Solving a problem is only 20% of the battle. Distribution strategy and timing dictate whether you survive.',
  },
  {
    author: 'Silent Panda',
    gradient: 'from-cyan-400 to-blue-600',
    topic: 'Career & Skills',
    message:
      'Shipping real open-source systems beats any diploma. Proof of work is the ultimate tech equalizer.',
  },
];

// Interactive Spotlight Card Component
const DiscussionSpotlightCard: React.FC<{
  rooms: RoomMetadata[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
}> = ({ rooms, selectedIndex, onSelectIndex }) => {
  const navigate = useNavigate();
  const activeRoom = rooms[selectedIndex] || rooms[0];
  const countdown = useCountdown(activeRoom?.expires_at);

  if (!activeRoom) return null;

  return (
    <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden group">
      {/* Subtle top emerald accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

      <div className="space-y-4">
        {/* Spotlight header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
              Live Topic Spotlight
            </span>
          </div>

          <Badge variant="active" size="sm" dot>
            {countdown.formatted}
          </Badge>
        </div>

        {/* Room Topic & Prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-white/5 px-2 py-0.5 rounded font-medium">
              #{activeRoom.room_id}
            </span>
            <span className="text-[11px] font-medium text-brand-500">Public Space</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display tracking-tight leading-snug">
            {activeRoom.room_name}
          </h3>

          <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-black/40 border border-neutral-200/60 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
              Discussion Prompt
            </span>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 italic leading-relaxed line-clamp-3">
              "{activeRoom.room_description}"
            </p>
          </div>
        </div>

        {/* Live stats */}
        <div className="flex items-center justify-between py-2 border-y border-neutral-100 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {activeRoom.feedback_count || activeRoom.message_count || 18} submissions
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>24h Ephemeral</span>
          </div>
        </div>

        {/* Quick Room Selector Tabs */}
        {rooms.length > 1 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold block">
              Active Topics:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {rooms.slice(0, 3).map((r, idx) => (
                <button
                  key={r.room_id}
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex-shrink-0 cursor-pointer ${
                    selectedIndex === idx
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                      : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'
                  }`}
                >
                  {idx === 0 ? 'AI & Devs' : idx === 1 ? 'Startups' : 'Tech Degrees'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action to enter room */}
      <div className="pt-4">
        <Button
          type="button"
          variant="primary"
          className="w-full text-xs sm:text-sm font-semibold h-10 shadow-glow-sm"
          onClick={() => navigate(`/room/${activeRoom.room_id}`)}
          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          Join Discussion Space
        </Button>
      </div>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const [roomIdInput, setRoomIdInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active public rooms fetched from backend
  const [rooms, setRooms] = useState<RoomMetadata[]>(SEEDED_ROOMS);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    echoService
      .discoverRooms()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setRooms(data);
        }
      })
      .catch(() => {
        // Fall back gracefully to SEEDED_ROOMS
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = roomIdInput.trim().replace(/^#/, '');

    if (!cleanId) {
      setInputError('Please enter an 8-character Room ID');
      return;
    }

    if (cleanId.length < 6 || cleanId.length > 12) {
      setInputError('Room ID should be 8 characters (e.g. 88e686fc)');
      return;
    }

    setIsSubmitting(true);
    setInputError(null);
    navigate(`/room/${cleanId}`);
  };

  const handleFillSample = (sampleId: string) => {
    setRoomIdInput(sampleId);
    setInputError(null);
  };

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Ambient background lighting */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* MAIN HERO GRID: 3-Column on XL, 2-Column on LG, 1-Col Mobile */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          
          {/* ======================================================= */}
          {/* LEFT COLUMN: Layered Floating Dialogue Deck (Desktop XL) */}
          {/* ======================================================= */}
          <div className="hidden xl:flex xl:col-span-3 flex-col gap-3.5">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Candid Peer Dialogue
              </span>
            </div>

            {PEER_THOUGHTS.map((item, index) => (
              <motion.div
                key={item.author}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className={`p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121212]/80 backdrop-blur-md shadow-sm space-y-2.5 transition-all hover:-translate-y-1 hover:border-emerald-500/30 ${
                  index === 0
                    ? '-rotate-1 hover:rotate-0'
                    : index === 1
                    ? 'rotate-1 hover:rotate-0'
                    : '-rotate-0.5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={item.author} gradient={item.gradient} size="xs" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white font-display">
                      {item.author}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {item.topic}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                  "{item.message}"
                </p>
              </motion.div>
            ))}

            <div className="p-3 rounded-xl border border-dashed border-neutral-200 dark:border-white/10 text-center">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                100% Identity-Free • Zero Traces
              </span>
            </div>
          </div>

          {/* ======================================================= */}
          {/* CENTER COLUMN: Core Headline, Distinctive Room Entry & CTAs */}
          {/* ======================================================= */}
          <div className="col-span-1 lg:col-span-7 xl:col-span-5 space-y-6 text-center lg:text-left">
            
            {/* Subtle top trust tag */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md text-xs text-neutral-700 dark:text-neutral-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-medium tracking-wide">
                Private & Ephemeral • 24-Hour Lifecycle
              </span>
            </motion.div>

            {/* Redesigned Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.6rem] font-extrabold tracking-tight text-neutral-900 dark:text-white font-display leading-[1.08]"
            >
              Your thoughts.
              <br />
              Your space.
              <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                No identity required.
              </span>
            </motion.h1>

            {/* Value Proposition Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Join focused group conversations with zero sign-up or tracking. Enter an 8-digit room ID, explore public topics, or launch your own 24-hour anonymous discussion space.
            </motion.p>

            {/* ===================================================== */}
            {/* REDESIGNED ROOM ID ENTRY COMPONENT                    */}
            {/* ===================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-xl mx-auto lg:mx-0 pt-1"
            >
              <form onSubmit={handleJoinRoom} className="space-y-2.5">
                {/* Desktop & Tablet Integrated Bar / Mobile Clean Stacking */}
                <div
                  className={`p-1.5 sm:p-2 rounded-2xl border bg-white dark:bg-[#121212] transition-all shadow-md ${
                    inputError
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-neutral-300 dark:border-white/15 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Left Hash Badge + Input */}
                    <div className="flex items-center flex-1 min-w-0 px-2 sm:px-3 h-11 sm:h-10">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 mr-2.5 flex-shrink-0">
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={roomIdInput}
                        onChange={(e) => {
                          setRoomIdInput(e.target.value);
                          if (inputError) setInputError(null);
                        }}
                        placeholder="Enter 8-digit Room ID (e.g. 88e686fc)"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        maxLength={12}
                        aria-label="Room ID input"
                        className="w-full bg-transparent text-sm sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Join Room Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="w-full sm:w-auto h-11 sm:h-10 px-6 font-semibold flex-shrink-0 text-sm shadow-glow-sm"
                      rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                    >
                      Join Room
                    </Button>
                  </div>
                </div>

                {/* Inline Validation Feedback */}
                {inputError && (
                  <p
                    role="alert"
                    className="text-xs text-rose-500 font-medium text-left px-2 animate-fade-in"
                  >
                    {inputError}
                  </p>
                )}

                {/* Quick Sample Room Chips */}
                <div className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Try active room:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFillSample('88e686fc')}
                    className="font-mono bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 px-2 py-0.5 rounded text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    #88e686fc (AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('e2b53ca7')}
                    className="font-mono bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 px-2 py-0.5 rounded text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    #e2b53ca7 (Startup)
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Quick Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <Button
                size="md"
                variant="primary"
                className="h-11 px-5 font-semibold shadow-glow-sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create Discussion Space
              </Button>

              <a href="#explore">
                <Button
                  size="md"
                  variant="secondary"
                  className="h-11 px-5 font-semibold"
                  leftIcon={<Compass className="w-4 h-4 text-brand-500" />}
                >
                  Explore Topics
                </Button>
              </a>

              <Link to="/my-posts">
                <Button
                  size="md"
                  variant="ghost"
                  className="h-11 px-4 text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  leftIcon={<ShieldCheck className="w-4 h-4 text-brand-500" />}
                >
                  Manage My Posts
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: Active Discussion Spotlight Preview Card */}
          {/* ======================================================= */}
          <div className="col-span-1 lg:col-span-5 xl:col-span-4 w-full max-w-md mx-auto lg:max-w-none">
            <DiscussionSpotlightCard
              rooms={rooms}
              selectedIndex={selectedRoomIndex}
              onSelectIndex={setSelectedRoomIndex}
            />
          </div>

        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
};
