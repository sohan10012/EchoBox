import React from 'react';
import { AlertTriangle, Lock } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            variant === 'danger'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}
        >
          {variant === 'danger' ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
            {title}
          </h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

