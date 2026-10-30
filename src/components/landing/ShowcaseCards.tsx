import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Quote, Sparkles } from 'lucide-react';

interface SampleFeedback {
  id: string;
  username: string;
  timeAgo: string;
  tag: string;
  message: string;
}

const SAMPLE_FEEDBACK: SampleFeedback[] = [
  {
    id: 'sample-fox',
    username: 'Curious Fox',
    timeAgo: '12m ago',
    tag: 'Design Review',
    message:
      'Your presentation on system architecture was super clear, but the third slide felt slightly rushed. Expanding on the data pipelines would make it a 10/10!',
  },
  {
    id: 'sample-owl',
    username: 'Midnight Observer',
    timeAgo: '45m ago',
    tag: 'Team Leadership',
    message:
      'I really appreciate how you handled the sprint roadblock yesterday. You kept the team grounded and calm when tensions were high. True leadership.',
  },
  {
    id: 'sample-beacon',
    username: 'Silent Beacon',
    timeAgo: '2h ago',
    tag: 'Product UX',
    message:
      'The new checkout interface is noticeably cleaner. Removing two redundant form inputs made the mobile experience ten times smoother.',
  },
];

export const ShowcaseCards: React.FC = () => {
  return (
    <section className="py-12 md:py-20 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header info */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Interactive Showcase</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
          Real Honesty, Filtered By Privacy
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Here is what incoming anonymous feedback looks like inside an EchoBox space.
          Constructive, actionable, and free from peer bias.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAMPLE_FEEDBACK.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-md p-6 shadow-card-light dark:shadow-card-dark transition-colors flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient top border glow on hover */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/0 group-hover:via-brand-500/60 to-transparent transition-all duration-300 pointer-events-none" />

            <div>
              {/* Card Header: Avatar, Name, Time */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar id={item.id} size="md" />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white font-display leading-tight">
                      {item.username}
                    </h4>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {item.timeAgo}
                    </span>
                  </div>
                </div>

                <Badge variant="neutral" size="sm">
                  {item.tag}
                </Badge>
              </div>

              {/* Feedback Content */}
              <div className="relative pt-1 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                <Quote className="w-4 h-4 text-neutral-300 dark:text-neutral-700 absolute -top-1 -left-1 opacity-40 pointer-events-none" />
                <p className="relative z-10 pl-2 italic">
                  "{item.message}"
                </p>
              </div>
            </div>

            {/* Card Footer: Illustrative Disclaimer */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500/70" />
                Verified Anonymous
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">
                Sample preview
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

