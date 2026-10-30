import React from 'react';
import { ShieldCheck, EyeOff, Lock, UserCheck } from 'lucide-react';

const SECURITY_POINTS = [
  {
    icon: EyeOff,
    title: 'No Sender Sign-Up Required',
    description:
      'Visitors jump straight into conversation without creating accounts, providing email addresses, or linking identities.',
  },
  {
    icon: Lock,
    title: 'Owner-Controlled Spaces',
    description:
      'Room creators retain control to close or reopen submissions at any point during team retrospectives or live AMAs.',
  },
  {
    icon: ShieldCheck,
    title: 'Encrypted In-Transit',
    description:
      'All traffic routes through AWS API Gateway with HTTPS TLS 1.3 encryption directly to serverless DynamoDB storage.',
  },
  {
    icon: UserCheck,
    title: 'Session-Scoped Personas',
    description:
      'Pseudonyms persist during your active browser session so you can engage in continuous discussion without revealing your real name.',
  },
];

export const SecuritySection: React.FC = () => {
  return (
    <section id="security" className="py-16 md:py-24 border-t border-neutral-200/60 dark:border-white/5 bg-neutral-50/50 dark:bg-black/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-semibold tracking-widest text-brand-500 uppercase">
            Trust & Confidentiality
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Built for Psychological Safety
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
            Honest feedback requires uncompromised anonymity. Here is how we ensure both senders and owners feel completely secure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECURITY_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="p-6 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#121212] space-y-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-display">
                  {point.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

