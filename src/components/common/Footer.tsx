import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-200/60 dark:border-white/10 bg-white/50 dark:bg-[#090909]/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold">
                <MessageSquare className="w-4 h-4 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white font-display">
                EchoBox
              </span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
              The premium anonymous feedback platform designed for candid peer thoughts, team insights, and unfiltered constructive honesty without fear or awkwardness.
            </p>
            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-500" /> Account-free messaging
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-brand-500" /> TLS 1.3 encrypted
              </span>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li>
                <Link to="/#how-it-works" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <a href="#security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Privacy Guarantees
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links & backend status */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Infrastructure
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AWS Serverless Active</span>
              </li>
              <li className="text-xs text-neutral-400 dark:text-neutral-500">
                Region: ap-south-1
              </li>
              <li className="text-xs text-neutral-400 dark:text-neutral-500">
                Cognito Auth Ready
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-neutral-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} EchoBox Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with craft for privacy & honest conversations.
          </p>
        </div>
      </div>
    </footer>
  );
};
