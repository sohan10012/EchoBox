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
  BarChart2,
} from 'lucide-react';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const [roomIdInput, setRoomIdInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Like counters for the interactive floating cards
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
    <section className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden bg-[#050505] text-white">
      {/* 3D Background Artwork Plate */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none opacity-90 -z-10"
        style={{
          backgroundImage: "url('/hero_bg.jpg')",
          backgroundPosition: 'center 20%',
        }}
        aria-hidden="true"
      />

      {/* Ambient gradient overlay for deep dark integration */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#050505] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative min-h-[720px] flex flex-col justify-between">
        
        {/* ========================================================= */}
        {/* DESKTOP FLOATING CONVERSATION CARDS                       */}
        {/* ========================================================= */}

        {/* Card 1 (Top-Left): Curious Lynx */}
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

        {/* Card 2 (Bottom-Left): Silent Panda */}
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

        {/* Card 3 (Bottom-Right): Cosmic Owl */}
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

        {/* Floating Top-Right Glass Badge (Behind/Near the 3D speech bubble) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden xl:block absolute right-16 top-28 rounded-xl border border-emerald-500/20 bg-emerald-950/30 backdrop-blur-md p-3 text-left w-36 shadow-lg z-10"
        >
          <BarChart2 className="w-4 h-4 text-[#13de9e] mb-1.5" />
          <p className="text-[11px] text-emerald-300 font-mono leading-tight font-medium">
            Real people
          </p>
          <p className="text-[11px] text-emerald-300 font-mono leading-tight font-medium">
            Real opinions
          </p>
          <p className="text-[11px] text-emerald-400/80 font-mono leading-tight font-medium">
            No profiles
          </p>
        </motion.div>


        {/* ========================================================= */}
        {/* CENTER HERO COLUMN                                        */}
        {/* ========================================================= */}
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-7 relative z-10 pt-4 sm:pt-6">
          
          {/* Subtle Top Pill Tag: • ANONYMOUS DISCUSSIONS */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#13de9e] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-neutral-400 font-semibold uppercase">
              Anonymous Discussions
            </span>
          </motion.div>

          {/* Exact Headline from Reference Image */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight font-display leading-[1.06]"
          >
            <span className="block text-white">Your thoughts.</span>
            <span className="block text-white">Your space.</span>
            <span className="block text-[#13de9e]">No identity required.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed"
          >
            Join real conversations, share honest opinions, and explore new perspectives — all without revealing who you are.
          </motion.p>

          {/* ======================================================= */}
          {/* ROOM ID ENTRY BAR (Matching Reference Pill Shape)       */}
          {/* ======================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-lg mx-auto pt-1"
          >
            <form onSubmit={handleJoinRoom} className="space-y-2">
              <div
                className={`rounded-full border bg-[#121212]/80 backdrop-blur-xl p-1.5 pl-4 sm:pl-5 flex items-center shadow-2xl transition-all ${
                  inputError
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-white/15 focus-within:border-[#13de9e]/60 focus-within:ring-2 focus-within:ring-[#13de9e]/20'
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
                  className="rounded-full bg-[#13de9e] hover:bg-[#10c88d] text-black font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 flex-shrink-0 shadow-[0_0_20px_rgba(19,222,158,0.35)] transition-all cursor-pointer whitespace-nowrap"
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

          {/* Action Buttons Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <a href="#explore">
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <span>Explore Topics</span>
              </button>
            </a>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white font-medium text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400 stroke-[2.5]" />
              <span>Create Discussion Space</span>
            </button>
          </motion.div>

          {/* Link: Manage My Posts (Optional) > */}
          <div className="pt-1">
            <Link
              to="/my-posts"
              className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors group"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#13de9e]" />
              <span>Manage My Posts (Optional)</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Conversation Cards Snippet (Visible on Mobile only) */}
          <div className="lg:hidden pt-4 space-y-3 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block text-center">
              Active Anonymous Thoughts:
            </span>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
              <div className="min-w-[260px] max-w-[280px] rounded-2xl border border-white/10 bg-[#121212]/90 p-3.5 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">🐱 Curious Lynx</span>
                  <span className="text-[10px] text-neutral-400 font-mono">5m ago</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  AI is making me 10x faster at building ideas. It feels like having a senior dev always on call.
                </p>
                <div className="text-right text-[10px] text-neutral-400">❤️ 24</div>
              </div>

              <div className="min-w-[260px] max-w-[280px] rounded-2xl border border-white/10 bg-[#121212]/90 p-3.5 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">🐼 Silent Panda</span>
                  <span className="text-[10px] text-neutral-400 font-mono">12m ago</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  I think we're becoming too dependent. It's easy to lose the ability to solve problems deeply.
                </p>
                <div className="text-right text-[10px] text-neutral-400">❤️ 17</div>
              </div>

              <div className="min-w-[260px] max-w-[280px] rounded-2xl border border-white/10 bg-[#121212]/90 p-3.5 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">🦉 Cosmic Owl</span>
                  <span className="text-[10px] text-neutral-400 font-mono">20m ago</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  The best startup ideas usually solve a real problem + have the right timing and distribution.
                </p>
                <div className="text-right text-[10px] text-neutral-400">❤️ 31</div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* THREE BOTTOM FEATURE PILLARS (Matching Reference Image)   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto pt-14 sm:pt-20 pb-4 relative z-10 border-t border-white/5 mt-10">
          
          {/* Feature 1 */}
          <div className="flex items-start gap-4 p-2 sm:p-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-[#13de9e] shadow-[0_0_20px_rgba(19,222,158,0.15)]">
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
          <div className="flex items-start gap-4 p-2 sm:p-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-[#13de9e] shadow-[0_0_20px_rgba(19,222,158,0.15)]">
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
          <div className="flex items-start gap-4 p-2 sm:p-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-[#13de9e] shadow-[0_0_20px_rgba(19,222,158,0.15)]">
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
