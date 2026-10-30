import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75dvh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-400 flex items-center justify-center mx-auto">
          <MessageSquareOff className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            The page or room URL you are looking for does not exist or may have been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

