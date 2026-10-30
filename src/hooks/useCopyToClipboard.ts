import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard(resetDelay = 2000) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, successMessage?: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        // Fallback for older browsers
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          setCopiedText(text);
          if (successMessage) toast.success(successMessage);
          setTimeout(() => setCopiedText(null), resetDelay);
          return true;
        } catch {
          toast.error('Failed to copy to clipboard');
          return false;
        }
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        if (successMessage) toast.success(successMessage);
        setTimeout(() => setCopiedText(null), resetDelay);
        return true;
      } catch {
        toast.error('Failed to copy to clipboard');
        return false;
      }
    },
    [resetDelay]
  );

  return { copiedText, copy, isCopied: !!copiedText };
}

