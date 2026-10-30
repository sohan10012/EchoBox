import { useState, useEffect } from 'react';

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(expiresAtEpochSeconds?: number): CountdownResult {
  const calculate = (): CountdownResult => {
    if (!expiresAtEpochSeconds) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSecondsRemaining: 0,
        isExpired: false,
        formatted: '—',
      };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const diff = expiresAtEpochSeconds - nowSeconds;

    if (diff <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSecondsRemaining: 0,
        isExpired: true,
        formatted: 'Expired',
      };
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    let formatted = '';
    if (hours > 0) {
      formatted = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else {
      formatted = `${pad(minutes)}m ${pad(seconds)}s`;
    }

    return {
      hours,
      minutes,
      seconds,
      totalSecondsRemaining: diff,
      isExpired: false,
      formatted,
    };
  };

  const [state, setState] = useState<CountdownResult>(calculate);

  useEffect(() => {
    setState(calculate());

    if (!expiresAtEpochSeconds) return;

    const interval = setInterval(() => {
      const next = calculate();
      setState(next);
      if (next.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAtEpochSeconds]);

  return state;
}

