import React from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '@/components/landing/HeroSection';
import { PublicRoomsExplorer } from '@/components/landing/PublicRoomsExplorer';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FolderOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <PublicRoomsExplorer />
      <HowItWorks />

      {/* Optional Post Recovery & Identity Callout */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-gradient-to-b from-white to-neutral-50 dark:from-[#121212] dark:to-[#0a0a0a] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Cross-Device Management</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white font-display tracking-tight">
              Want to recover or delete your posts anytime?
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Claim an optional, private EchoBox ID with a single click. No email or personal data is ever requested, but you gain full control over your submitted messages.
            </p>
          </div>

          <Link to="/my-posts" className="flex-shrink-0">
            <Button
              size="md"
              variant="outline"
              className="h-11 px-6 font-semibold"
              leftIcon={<FolderOpen className="w-4 h-4 text-brand-500" />}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
            >
              Manage My Posts
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
