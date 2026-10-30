import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Share2, Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

const STEPS = [
  {
    step: '01',
    title: 'Create Your Room',
    description:
      'Name your room in one click. Instantly provisions a high-speed AWS serverless space ready for incoming thoughts.',
    icon: PlusCircle,
    color: 'text-brand-500',
    bgColor: 'bg-brand-500/10 border-brand-500/20',
  },
  {
    step: '02',
    title: 'Share Your Unique Link',
    description:
      'Copy your dedicated EchoBox URL and drop it into Slack, Discord, Twitter, LinkedIn, or your presentation slides.',
    icon: Share2,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    step: '03',
    title: 'Continuous Anonymous Chat',
    description:
      'Visitors receive a stable anonymous persona and converse continuously without registering or logging in. Live updates sync directly.',
    icon: Inbox,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 relative border-t border-neutral-200/60 dark:border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-semibold tracking-widest text-brand-500 uppercase">
            Simple 3-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            How EchoBox Works
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
            Engineered for zero friction. Start receiving candid, actionable opinions in less than 30 seconds.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-sm p-7 space-y-5 hover:border-neutral-300 dark:hover:border-white/20 transition-all group"
              >
                {/* Step badge & icon */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.bgColor}`}
                  >
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="font-mono text-2xl font-black text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 text-center">
          <Link to="/dashboard">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}>
              Create Your Free Room Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

