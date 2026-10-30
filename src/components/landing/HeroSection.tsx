import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Compass, PlusCircle, FolderOpen, RefreshCw, Hash } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { useAnonymousIdentity } from '@/hooks/useAnonymousIdentity';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { ChangeIdentityModal } from '@/components/chat/ChangeIdentityModal';

export const HeroSection: React.FC = () => {
  const { identity, changeIdentity } = useAnonymousIdentity();
  const navigate = useNavigate();

  const [roomIdInput, setRoomIdInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChangeIdentityOpen, setIsChangeIdentityOpen] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = roomIdInput.trim();
    if (!cleanId) {
      setInputError('Please enter a room ID');
      return;
    }
    // Remove leading # if user typed it
    const formattedId = cleanId.replace(/^#/, '');
    navigate(`/room/${formattedId}`);
  };

  return (
    <section className="relative pt-16 pb-16 md:pt-24 md:pb-20 overflow-hidden">
      {/* Soft ambient lighting spotlights */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 right-1/4 w-[350px] h-[250px] bg-teal-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Subtle pill tag displaying active visitor persona */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-neutral-200/90 dark:border-white/10 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md text-xs text-neutral-700 dark:text-neutral-300 shadow-sm"
        >
          <Avatar name={identity.displayName} gradient={identity.gradient} size="xs" />
          <span>
            Browsing as <strong className="font-semibold text-neutral-900 dark:text-white">{identity.displayName}</strong>
          </span>
          <button
            type="button"
            onClick={() => setIsChangeIdentityOpen(true)}
            className="text-brand-500 hover:text-brand-400 font-semibold inline-flex items-center gap-1 ml-1"
            title="Change your anonymous pseudonym"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Change</span>
          </button>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-display leading-[1.08]"
        >
          Got Something to Say?
          <span className="block mt-2 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-neutral-200 dark:to-neutral-400 bg-clip-text text-transparent">
            Say It Anonymously.
          </span>
        </motion.h1>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16, ease: 'easeOut' }}
          className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Join focused group conversations with zero sign-up or tracking. Enter a room ID, explore public topics, or launch your own 24-hour anonymous space.
        </motion.p>

        {/* Enter Room ID Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: 'easeOut' }}
          className="max-w-md mx-auto"
        >
          <form onSubmit={handleJoinRoom} className="space-y-2">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#121212] shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <div className="pl-3 text-neutral-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => {
                  setRoomIdInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder="Enter 8-digit Room ID (e.g. b078960a)"
                className="w-full h-10 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-mono"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="h-10 px-5 flex-shrink-0 font-semibold shadow-glow-sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
              >
                Join Room
              </Button>
            </div>
            {inputError && (
              <p className="text-xs text-rose-500 font-medium text-left px-2 animate-fade-in">
                {inputError}
              </p>
            )}
          </form>
        </motion.div>

        {/* Action Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <a href="#explore">
            <Button
              size="md"
              variant="secondary"
              className="h-11 px-6 font-semibold"
              leftIcon={<Compass className="w-4 h-4 text-brand-500" />}
            >
              Explore Public Rooms
            </Button>
          </a>

          <Button
            size="md"
            variant="outline"
            className="h-11 px-6 font-semibold"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4 text-brand-500" />}
          >
            Create Discussion Space
          </Button>

          <Link to="/my-posts">
            <Button
              size="md"
              variant="ghost"
              className="h-11 px-5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              leftIcon={<FolderOpen className="w-4 h-4" />}
            >
              Manage My Posts (Optional)
            </Button>
          </Link>
        </motion.div>
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ChangeIdentityModal
        isOpen={isChangeIdentityOpen}
        onClose={() => setIsChangeIdentityOpen(false)}
        currentIdentity={identity}
        onConfirmChange={changeIdentity}
      />
    </section>
  );
};
