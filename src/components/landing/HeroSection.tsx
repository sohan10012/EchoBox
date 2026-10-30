import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, EyeOff } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
      {/* Soft ambient lighting spotlights */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-brand-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 right-1/4 w-[350px] h-[250px] bg-emerald-500/10 blur-3xl pointer-events-none -z-10 rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Subtle pill tag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span>Real thoughts without identity friction</span>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <span className="text-neutral-500 dark:text-neutral-400">100% Confidential</span>
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
          className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Create your space. Share your link. Receive honest anonymous feedback.
          No awkward conversations. Just real thoughts.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto font-semibold px-8 h-12 shadow-glow hover:scale-[1.02] active:scale-[0.98]"
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Get Started
            </Button>
          </Link>

          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto px-7 h-12"
            >
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Quick credibility proofs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-neutral-500 dark:text-neutral-400"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-brand-500" />
            <span>Zero Sign-up for Senders</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            <span>Continuous Group Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Instant Room Creation</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

