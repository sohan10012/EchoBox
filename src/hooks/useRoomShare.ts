import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseRoomShareOptions {
  roomId: string;
  roomName?: string;
  roomDescription?: string;
}

export function useRoomShare({ roomId, roomName, roomDescription }: UseRoomShareOptions) {
  const [isIdCopied, setIsIdCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const cleanId = (roomId || '').trim();
  const publicUrl = typeof window !== 'undefined' && cleanId
    ? `${window.location.origin}/room/${cleanId}`
    : '';

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  /**
   * Copies the exact 8-character room ID to clipboard.
   */
  const copyRoomId = useCallback(async () => {
    if (!cleanId) return;
    const ok = await copyToClipboard(cleanId);
    if (ok) {
      setIsIdCopied(true);
      toast.success(`Room ID #${cleanId} copied to clipboard!`);
      setTimeout(() => setIsIdCopied(false), 2000);
    } else {
      toast.error('Failed to copy Room ID');
    }
  }, [cleanId]);

  /**
   * Directly copies the canonical room URL to clipboard.
   */
  const copyRoomLink = useCallback(async () => {
    if (!publicUrl) return;
    const ok = await copyToClipboard(publicUrl);
    if (ok) {
      setIsLinkCopied(true);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setIsLinkCopied(false), 2000);
    } else {
      toast.error('Failed to copy room link');
    }
  }, [publicUrl]);

  /**
   * Shares the room using native Web Share API where supported, or falls back to copying link.
   */
  const shareRoom = useCallback(async () => {
    if (!publicUrl) return;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: roomName ? `EchoBox: ${roomName}` : 'EchoBox Anonymous Discussion',
          text: roomDescription
            ? `Join this anonymous discussion: "${roomDescription}"`
            : 'Join this anonymous conversation space on EchoBox.',
          url: publicUrl,
        });
        toast.success('Room shared!');
        return;
      } catch (err: any) {
        // User cancelled or aborted native share sheet
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback: Copy link
    await copyRoomLink();
  }, [publicUrl, roomName, roomDescription, copyRoomLink]);

  return {
    roomId: cleanId,
    publicUrl,
    isIdCopied,
    isLinkCopied,
    copyRoomId,
    copyRoomLink,
    shareRoom,
  };
}
