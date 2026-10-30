import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRoomPage = location.pathname.startsWith('/room/');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-[#090909]/75 backdrop-blur-md transition-colors">
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
            to="/"
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            className="px-3.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            How It Works
          </a>
          <Link
            to="/dashboard"
            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname.startsWith('/dashboard')
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/5 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/50 dark:hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-brand-500" />
            Owner Spaces
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Action Links */}
          {isRoomPage ? (
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                className="hidden sm:inline-flex"
              >
                Create Room
              </Button>
            </Link>
          ) : (
            <Link to="/dashboard">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Open Dashboard
              </Button>
            </Link>
          )}

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
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            How It Works
          </a>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold rounded-lg text-brand-500 bg-brand-500/10"
          >
            Owner Spaces Dashboard
          </Link>
          <div className="pt-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Create Room
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
