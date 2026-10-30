import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  MessageSquare,
  Compass,
  PlusCircle,
  Menu,
  X,
  RefreshCw,
  FolderOpen,
  KeyRound,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAnonymousIdentity } from '@/hooks/useAnonymousIdentity';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { CreateRoomModal } from '@/components/dashboard/CreateRoomModal';
import { ChangeIdentityModal } from '@/components/chat/ChangeIdentityModal';
import { ManagePostsModal } from '@/components/identity/ManagePostsModal';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { echoIdentity, isEchoIdentityAuthenticated } = useAuth();
  const { identity, changeIdentity } = useAnonymousIdentity();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChangeIdentityOpen, setIsChangeIdentityOpen] = useState(false);
  const [isManagePostsOpen, setIsManagePostsOpen] = useState(false);

  const handleConfirmChangeIdentity = () => {
    changeIdentity();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090b0a]/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-[#00D99A] rounded-lg p-1"
            aria-label="EchoBox Home"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-white/10 transition-transform group-hover:scale-105">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-1.5">
              EchoBox
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D99A] animate-pulse" />
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              to="/#explore"
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 ${
                location.pathname === '/'
                  ? 'text-white border-white/20 bg-white/10 shadow-sm'
                  : 'text-neutral-400 border-white/10 bg-white/[0.04] hover:text-white hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#00D99A]" />
              <span>Explore Topics</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#00D99A]" />
              <span>Create Space</span>
            </button>

            <Link
              to="/my-posts"
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 ${
                location.pathname === '/my-posts'
                  ? 'text-white border-emerald-500/30 bg-emerald-500/10'
                  : 'text-neutral-400 border-white/10 bg-white/[0.04] hover:text-white hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#00D99A]" />
              <span>Manage My Posts</span>
            </Link>

            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 ${
                location.pathname === '/dashboard'
                  ? 'text-white border-white/20 bg-white/10'
                  : 'text-neutral-400 border-white/10 bg-white/[0.04] hover:text-white hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <span>Owner Spaces</span>
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Anonymous Persona Pill (Hidden on mobile, visible on tablet/desktop) */}
            <button
              type="button"
              onClick={() => setIsChangeIdentityOpen(true)}
              title="Click to change your anonymous persona"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 hover:border-emerald-400/50 hover:bg-emerald-900/40 transition-all text-xs text-neutral-200 shadow-sm"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00D99A] flex items-center justify-center text-[10px] font-bold font-mono">
                {identity.displayName.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-medium text-neutral-200 font-display hidden md:inline max-w-[120px] truncate text-xs">
                {identity.displayName}
              </span>
              <RefreshCw className="w-3 h-3 text-[#00D99A]/70 hover:text-[#00D99A] ml-0.5" />
            </button>

            {/* EchoBox ID Connected Badge (Optional) */}
            {isEchoIdentityAuthenticated && echoIdentity && (
              <Link
                to="/my-posts"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] text-[#00D99A] font-medium"
                title="Active EchoBox ID"
              >
                <KeyRound className="w-3 h-3" />
                <span>{echoIdentity.echoboxId}</span>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl sm:rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#00D99A]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-300" />
              )}
            </button>

            {/* Primary Action Button: White pill with black text */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-black hover:bg-neutral-200 font-bold px-4 py-1.5 text-xs rounded-full shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Space</span>
            </button>

            {/* Mobile hamburger menu button (Matching Reference) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[1.8]" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu with Glassmorphism */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-[#0d110f]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-2xl">
            {/* Active Persona Header on Mobile */}
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar name={identity.displayName} gradient={identity.gradient} size="sm" />
                <div>
                  <p className="text-xs font-bold text-white font-display">
                    {identity.displayName}
                  </p>
                  <p className="text-[10px] text-neutral-400">Anonymous Visitor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsChangeIdentityOpen(true);
                }}
                className="text-xs text-[#00D99A] font-semibold"
              >
                Change
              </button>
            </div>

            <Link
              to="/#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-neutral-200 hover:bg-white/10"
            >
              Explore Public Discussions
            </Link>

            <Link
              to="/my-posts"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-neutral-200 hover:bg-white/10"
            >
              Manage My Posts (Optional ID)
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200"
            >
              Owner Spaces Workspace →
            </Link>

            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCreateModalOpen(true);
                }}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create a Discussion Space
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ChangeIdentityModal
        isOpen={isChangeIdentityOpen}
        onClose={() => setIsChangeIdentityOpen(false)}
        currentIdentity={identity}
        onConfirmChange={handleConfirmChangeIdentity}
      />

      <ManagePostsModal
        isOpen={isManagePostsOpen}
        onClose={() => setIsManagePostsOpen(false)}
      />
    </>
  );
};
