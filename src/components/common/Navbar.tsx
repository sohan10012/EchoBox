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
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 dark:border-white/10 bg-white/80 dark:bg-[#090909]/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-2 focus-visible:outline-brand-500 rounded-lg p-1"
            aria-label="EchoBox Home"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold shadow-md shadow-neutral-900/10 dark:shadow-white/10 transition-transform group-hover:scale-105">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white font-display flex items-center gap-1.5">
              EchoBox
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/#explore"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/'
                  ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-brand-500" />
              <span>Explore Topics</span>
            </Link>

            <Link
              to="/my-posts"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/my-posts'
                  ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-white/5'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-brand-500" />
              <span>Manage My Posts</span>
            </Link>

            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/dashboard'
                  ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-white/5'
              }`}
            >
              <span>Owner Spaces</span>
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Anonymous Persona Pill (Always Visible) */}
            <button
              type="button"
              onClick={() => setIsChangeIdentityOpen(true)}
              title="Click to change your anonymous persona"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-100/70 dark:bg-neutral-900/90 hover:border-brand-500/40 transition-colors text-xs"
            >
              <Avatar
                name={identity.displayName}
                gradient={identity.gradient}
                size="xs"
              />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 font-display hidden sm:inline max-w-[120px] truncate">
                {identity.displayName}
              </span>
              <RefreshCw className="w-3 h-3 text-neutral-400 hover:text-brand-500" />
            </button>

            {/* EchoBox ID Connected Badge (Optional) */}
            {isEchoIdentityAuthenticated && echoIdentity && (
              <Link
                to="/my-posts"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-medium"
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
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 border border-neutral-200/80 dark:border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Single Primary Action: Create Space button (Desktop) */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:inline-flex shadow-glow-sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Create Space
            </Button>

            {/* Mobile hamburger menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 border border-neutral-200 dark:border-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#090909] px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            {/* Active Persona Header on Mobile */}
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar name={identity.displayName} gradient={identity.gradient} size="sm" />
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white font-display">
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
                className="text-xs text-brand-500 font-semibold"
              >
                Change
              </button>
            </div>

            <Link
              to="/#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              Explore Public Discussions
            </Link>

            <Link
              to="/my-posts"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
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
