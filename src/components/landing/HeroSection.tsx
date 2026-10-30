import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Plus,
  ShieldCheck,
  ChevronRight,
  Heart,
  MessageSquare,
  Lock,
  Zap,
  Clock,
} from 'lucide-react';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';

interface PopularDiscussion {
  roomId: string;
  tag: string;
  tagColor: string;
  title: string;
  messages: number;
  timeLeft: string;
  thumbnail: string;
}

const POPULAR_DISCUSSIONS: PopularDiscussion[] = [
  {
    roomId: '88e686fc',
    tag: 'Tech',
    tagColor: 'bg-emerald-500/20 text-[#00D99A] border-emerald-500/30',
    title: 'Is AI making developers more productive?',
    messages: 18,
    timeLeft: '22h left',
    thumbnail: '/thumb_tech.jpg',
  },
  {
    roomId: 'e2b53ca7',
    tag: 'Startups',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: 'What makes a startup idea worth building?',
    messages: 15,
    timeLeft: '20h left',
    thumbnail: '/thumb_startup.jpg',
  },
  {
    roomId: 'c72f033e',
    tag: 'Careers',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    title: 'Is college still necessary for a tech career?',
    messages: 18,
    timeLeft: '21h left',
    thumbnail: '/thumb_careers.jpg',
  },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const [roomIdInput, setRoomIdInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Like counters for interactive cards
  const [likes, setLikes] = useState({
    card1: 24,
    card2: 17,
    card3: 31,
  });
  const [liked, setLiked] = useState({
    card1: false,
    card2: false,
    card3: false,
  });

  const toggleLike = (key: 'card1' | 'card2' | 'card3') => {
    setLiked((prev) => {
      const isNowLiked = !prev[key];
      setLikes((l) => ({
        ...l,
        [key]: isNowLiked ? l[key] + 1 : l[key] - 1,
      }));
      return { ...prev, [key]: isNowLiked };
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = roomIdInput.trim().replace(/^#/, '');

    if (!cleanId) {
      setInputError('Please enter an 8-digit Room ID');
      return;
    }

    if (cleanId.length < 6 || cleanId.length > 12) {
      setInputError('Room ID should be 8 characters (e.g. b07f3a9c)');
      return;
    }

    setInputError(null);
    navigate(`/room/${cleanId}`);
  };

  return (
    <section className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden bg-[#050807] text-white">
      {/* 3D Background Artwork Plate: Responsive (Mobile vertical vs Desktop ultrawide) */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none opacity-85 -z-10 bg-[url('/hero_bg_mobile.jpg')] md:bg-[url('/hero_bg_desktop.jpg')]"
        style={{
          backgroundPosition: 'center top',
        }}
        aria-hidden="true"
      />

      {/* Atmospheric ambient lighting */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#050807] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[700px] flex flex-col justify-between">
        
        {/* ========================================================= */}
        {/* DESKTOP-ONLY FLOATING DIALOGUE CARDS (LG & XL screens)    */}
        {/* ========================================================= */}

        {/* Desktop Card 1 (Top-Left): Curious Lynx */}
        <motion.div
          initial={{ opacity: 0, y: -20, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:block absolute left-2 xl:left-8 top-12 w-72 xl:w-80 rounded-2xl border border-white/10 bg-[#121212]/85 backdrop-blur-xl p-4 shadow-2xl space-y-3 z-20 cursor-default"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                🐱
              </div>
              <span className="font-bold text-xs text-white font-display">
                Curious Lynx
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">5m ago</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-normal">
            AI is making me 10x faster at building ideas. It feels like having a senior dev always on call.
          </p>

          <div className="flex items-center justify-end pt-0.5">
            <button
              type="button"
              onClick={() => toggleLike('card1')}
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                liked.card1 ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked.card1 ? 'fill-current text-rose-500' : 'text-rose-500/80 fill-rose-500/80'}`} />
              <span className="text-white text-xs font-bold">{likes.card1}</span>
            </button>
          </div>
        </motion.div>

        {/* Desktop Card 2 (Bottom-Left): Silent Panda */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden lg:block absolute left-0 xl:left-4 top-64 w-72 xl:w-80 rounded-2xl border border-white/10 bg-[#121212]/85 backdrop-blur-xl p-4 shadow-2xl space-y-3 z-20 cursor-default"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                🐼
              </div>
              <span className="font-bold text-xs text-white font-display">
                Silent Panda
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">12m ago</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-normal">
            I think we're becoming too dependent. It's easy to lose the ability to solve problems deeply.
          </p>

          <div className="flex items-center justify-end pt-0.5">
            <button
              type="button"
              onClick={() => toggleLike('card2')}
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                liked.card2 ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked.card2 ? 'fill-current text-rose-500' : 'text-rose-500/80 fill-rose-500/80'}`} />
              <span className="text-white text-xs font-bold">{likes.card2}</span>
            </button>
          </div>
        </motion.div>

        {/* Desktop 3D Glass Speech Bubble Sculpture (Upper Right) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="hidden lg:block absolute right-12 xl:right-20 top-4 w-44 xl:w-52 h-44 xl:h-52 z-10 pointer-events-none select-none"
        >
          <div className="absolute inset-0 bg-[#00D99A]/15 blur-3xl rounded-full" />
          <img
            src="/glass_bubble_transparent.png"
            alt="3D Glass Bubble Sculpture"
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_35px_rgba(0,217,154,0.35)]"
          />
        </motion.div>

        {/* Desktop Floating Badge: Real people / Real opinions / No profiles */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="hidden lg:flex items-center gap-2.5 absolute right-2 xl:right-6 top-32 rounded-xl border border-white/10 bg-[#121212]/85 backdrop-blur-xl px-3 py-2 z-20 shadow-xl pointer-events-none"
        >
          <div className="flex items-end gap-0.5 h-3.5 text-[#00D99A]">
            <span className="w-1 h-2 bg-[#00D99A] rounded-xs" />
            <span className="w-1 h-3.5 bg-[#00D99A] rounded-xs" />
            <span className="w-1 h-2.5 bg-[#00D99A] rounded-xs" />
          </div>
          <div className="text-[10px] leading-tight font-sans">
            <div className="font-semibold text-white">Real people</div>
            <div className="text-neutral-300">Real opinions</div>
            <div className="text-neutral-500 text-[9px]">No profiles</div>
          </div>
        </motion.div>

        {/* Desktop Card 3 (Bottom-Right): Cosmic Owl */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          whileHover={{ rotate: 0, scale: 1.03 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="hidden lg:block absolute right-2 xl:right-6 top-64 w-72 xl:w-80 rounded-2xl border border-white/10 bg-[#121212]/85 backdrop-blur-xl p-4 shadow-2xl space-y-3 z-20 cursor-default"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                🦉
              </div>
              <span className="font-bold text-xs text-white font-display">
                Cosmic Owl
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">20m ago</span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-normal">
            The best startup ideas usually solve a real problem + have the right timing and distribution.
          </p>

          <div className="flex items-center justify-end pt-0.5">
            <button
              type="button"
              onClick={() => toggleLike('card3')}
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                liked.card3 ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked.card3 ? 'fill-current text-rose-500' : 'text-rose-500/80 fill-rose-500/80'}`} />
              <span className="text-white text-xs font-bold">{likes.card3}</span>
            </button>
          </div>
        </motion.div>


        {/* ========================================================= */}
        {/* CENTER HERO SECTION                                       */}
        {/* ========================================================= */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto text-center space-y-5 sm:space-y-6 relative z-10 pt-2 sm:pt-6">
          
          {/* Tag: • ANONYMOUS DISCUSSIONS */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#00D99A] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-neutral-400 font-semibold uppercase">
              Anonymous Discussions
            </span>
          </motion.div>

          {/* Exact Headline from Reference */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight font-display leading-[1.06]"
          >
            <span className="block text-white">Your thoughts.</span>
            <span className="block text-white">Your space.</span>
            <span className="block text-[#00D99A]">No identity required.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed px-2"
          >
            Join real conversations, share honest opinions, and explore new perspectives — all without revealing who you are.
          </motion.p>

          {/* ======================================================= */}
          {/* MOBILE 3D CENTERPIECE SHOWCASE (Visible on Mobile/Tablet)*/}
          {/* ======================================================= */}
          <div className="lg:hidden relative py-3 my-2 w-full max-w-sm sm:max-w-md mx-auto">
            {/* Center 3D Speech Bubble with green refraction glow */}
            <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center my-2">
              <div className="absolute inset-0 bg-[#00D99A]/15 blur-2xl rounded-full" />
              <img
                src="/glass_bubble_transparent.png"
                alt="3D Glass Speech Bubble"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(0,217,154,0.35)]"
              />
            </div>

            {/* Mobile Card 1: Left */}
            <motion.div
              initial={{ opacity: 0, x: -16, rotate: -4 }}
              animate={{ opacity: 1, x: 0, rotate: -4 }}
              className="absolute left-0 top-3 w-40 sm:w-48 rounded-2xl border border-white/10 bg-[#121212]/90 backdrop-blur-xl p-2.5 text-left shadow-2xl z-20"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px]">
                    🐱
                  </div>
                  <span className="font-bold text-[10px] text-white truncate">Curious Lynx</span>
                </div>
                <span className="text-[9px] text-neutral-400 font-mono">2m ago</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-snug line-clamp-3">
                AI is making me 10x faster at building ideas. But it also makes me overthink...
              </p>
              <div className="text-right text-[10px] text-rose-400 pt-1 flex items-center justify-end gap-1 font-mono">
                <Heart className="w-2.5 h-2.5 fill-current" />
                <span>24</span>
              </div>
            </motion.div>

            {/* Mobile Card 2: Right */}
            <motion.div
              initial={{ opacity: 0, x: 16, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              className="absolute right-0 top-12 w-40 sm:w-48 rounded-2xl border border-white/10 bg-[#121212]/90 backdrop-blur-xl p-2.5 text-left shadow-2xl z-20"
            >
              {/* Mobile Annotation */}
              <div className="absolute -top-5 right-1 text-right">
                <span className="text-[9px] italic text-[#00D99A] font-serif leading-none block">
                  Real people / Real opinions ↙
                </span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#f59e0b] flex items-center justify-center text-[10px]">
                    🦉
                  </div>
                  <span className="font-bold text-[10px] text-white truncate">Cosmic Owl</span>
                </div>
                <span className="text-[9px] text-neutral-400 font-mono">12m ago</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-snug line-clamp-3">
                The best ideas come from real problems, not just new tech.
              </p>
              <div className="text-right text-[10px] text-rose-400 pt-1 flex items-center justify-end gap-1 font-mono">
                <Heart className="w-2.5 h-2.5 fill-current" />
                <span>17</span>
              </div>
            </motion.div>
          </div>

          {/* ======================================================= */}
          {/* ROOM ID ENTRY BAR (Matching Phone UI Reference)         */}
          {/* ======================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-lg mx-auto pt-1"
          >
            <form onSubmit={handleJoinRoom} className="space-y-2">
              <div
                className={`rounded-2xl sm:rounded-full border bg-[#121212]/80 backdrop-blur-xl p-1.5 pl-3.5 sm:pl-5 flex items-center shadow-2xl transition-all ${
                  inputError
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-white/15 focus-within:border-[#00D99A]/60 focus-within:ring-2 focus-within:ring-[#00D99A]/20'
                }`}
              >
                {/* Hash Prefix Icon */}
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-neutral-400 font-mono text-sm font-bold mr-2.5 flex-shrink-0">
                  #
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => {
                    setRoomIdInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Enter 8-digit Room ID (e.g. b07f3a9c)"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  maxLength={12}
                  aria-label="Room ID input"
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-mono"
                />

                {/* Join Room Pill Button */}
                <button
                  type="submit"
                  className="rounded-xl sm:rounded-full bg-[#00D99A] hover:bg-[#00c58b] text-black font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 flex-shrink-0 shadow-[0_0_20px_rgba(0,217,154,0.35)] transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Join Room</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Inline Validation Feedback */}
              {inputError && (
                <p role="alert" className="text-xs text-rose-400 font-medium px-4 animate-fade-in text-center sm:text-left">
                  {inputError}
                </p>
              )}
            </form>
          </motion.div>

          {/* Divider: ────── or ────── */}
          <div className="flex items-center justify-center gap-3 w-48 mx-auto my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-mono text-neutral-500">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Two Action Buttons: [Explore Topics] & [Create Discussion] */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap"
          >
            <a href="#explore">
              <button
                type="button"
                className="rounded-xl sm:rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-xs sm:text-sm px-4 sm:px-5 py-2.5 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span>Explore Topics</span>
              </button>
            </a>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl sm:rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-xs sm:text-sm px-4 sm:px-5 py-2.5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 stroke-[2.5]" />
              <span>Create Discussion</span>
            </button>
          </motion.div>

          {/* Link: Manage My Posts (Optional) > */}
          <div className="pt-0.5">
            <Link
              to="/my-posts"
              className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors group"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D99A]" />
              <span>Manage My Posts (Optional)</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* "POPULAR DISCUSSIONS" SECTION (As Shown on Mobile Screen) */}
        {/* ========================================================= */}
        <div className="max-w-4xl mx-auto w-full pt-12 sm:pt-16 pb-4 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D99A]" />
              <h2 className="text-sm sm:text-base font-bold text-white font-display">
                Popular Discussions
              </h2>
            </div>
            <a
              href="#explore"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Horizontal scroll cards on mobile / 3-column grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-3 gap-3.5 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
            {POPULAR_DISCUSSIONS.map((disc) => (
              <div
                key={disc.roomId}
                onClick={() => navigate(`/room/${disc.roomId}`)}
                className="min-w-[260px] sm:min-w-0 flex-1 snap-start rounded-2xl border border-white/10 bg-[#0f1412]/85 backdrop-blur-xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-[#00D99A]/40 hover:-translate-y-1 transition-all group shadow-xl"
              >
                {/* Top: Left Thumbnail Image + Right Category & Title */}
                <div className="flex gap-3 items-start">
                  <img
                    src={disc.thumbnail}
                    alt={disc.title}
                    className="w-16 h-20 rounded-xl object-cover shrink-0 border border-white/10 shadow-md bg-neutral-900"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span
                      className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${disc.tagColor} font-semibold`}
                    >
                      {disc.tag}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#00D99A] transition-colors leading-snug line-clamp-3">
                      {disc.title}
                    </h3>
                  </div>
                </div>

                {/* Bottom: Message count & Remaining Time */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2.5 mt-2.5 border-t border-white/5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#00D99A] transition-colors" />
                    <span>{disc.messages}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{disc.timeLeft}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* THREE BOTTOM FEATURE PILLARS (Desktop & Tablet)           */}
        {/* ========================================================= */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto pt-8 pb-4 relative z-10 border-t border-white/5">
          
          {/* Feature 1 */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-[#00D99A] shadow-[0_0_20px_rgba(0,217,154,0.15)]">
              <MessageSquare className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-white font-display">
                Open Conversations
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Discuss anything that matters to you.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-[#00D99A] shadow-[0_0_20px_rgba(0,217,154,0.15)]">
              <Lock className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-white font-display">
                Private & Ephemeral
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every space is temporary and clutter-free.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-[#00D99A] shadow-[0_0_20px_rgba(0,217,154,0.15)]">
              <Zap className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-white font-display">
                Built for Real People
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                No sign-up, no tracking, just honest discussion.
              </p>
            </div>
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
