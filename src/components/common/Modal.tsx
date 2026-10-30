import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card with Premium Glassmorphism */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'relative w-full z-10 rounded-2xl glass-modal p-6 sm:p-8 overflow-hidden',
              maxWidthClasses[maxWidth],
              className
            )}
          >
            {/* Ambient subtle green glow at top of modal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#00D99A]/50 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="space-y-1">
                {title && (
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

