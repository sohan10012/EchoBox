import React from 'react';
import { RefreshCw, Shield } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { AnonymousIdentity } from '@/services/anonymousIdentity';

interface ChangeIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIdentity: AnonymousIdentity;
  onConfirmChange: () => void;
}

export const ChangeIdentityModal: React.FC<ChangeIdentityModalProps> = ({
  isOpen,
  onClose,
  currentIdentity,
  onConfirmChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Anonymous Identity?"
      maxWidth="sm"
    >
      <div className="space-y-5 pt-1 text-center">
        {/* Current Identity Display */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-2">
          <Avatar
            name={currentIdentity.displayName}
            gradient={currentIdentity.gradient}
            size="lg"
          />
          <div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">
              Current Identity
            </p>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              {currentIdentity.displayName}
            </h4>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-left space-y-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <p>
            Changing your identity generates a fresh pseudonym and avatar for this browser session.
            All messages you send after this change will appear under your new persona.
          </p>

          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-white/5 flex items-start gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <Shield className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Session identities are UX-level pseudonyms designed to preserve privacy and conversational continuity, not cryptographic authentication.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-white/5">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Keep Current
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1 shadow-glow-sm"
            onClick={() => {
              onConfirmChange();
              onClose();
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Change Identity
          </Button>
        </div>
      </div>
    </Modal>
  );
};
