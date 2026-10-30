/**
 * Anonymous Identity Service
 *
 * Provides persistent UX-level anonymous identities for room visitors.
 * Stored in sessionStorage so the identity persists across rooms within
 * the same browser tab/session, but does NOT reset on every message.
 */

export interface AnonymousIdentity {
  sessionId: string;
  displayName: string;
  gradient: string;
  initials: string;
  createdAt: string;
}

const STORAGE_KEY_SESSION = 'echobox.anonymous.session';
const STORAGE_KEY_IDENTITY = 'echobox.anonymous.identity';
const IDENTITY_CHANGED_EVENT = 'echobox:identity-changed';

const ADJECTIVES = [
  'Curious',
  'Silent',
  'Cosmic',
  'Midnight',
  'Velvet',
  'Amber',
  'Solar',
  'Mystic',
  'Quantum',
  'Radiant',
  'Gentle',
  'Swift',
  'Neon',
  'Clever',
  'Shadow',
  'Astral',
  'Zen',
  'Lucid',
];

const ANIMALS = [
  'Fox',
  'Panda',
  'Owl',
  'Wolf',
  'Falcon',
  'Lynx',
  'Raven',
  'Nomad',
  'Voyager',
  'Dolphin',
  'Koala',
  'Otter',
  'Tiger',
  'Bear',
  'Seeker',
  'Phoenix',
  'Beacon',
  'Orion',
];

const GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-violet-500 to-indigo-600',
  'from-amber-400 to-rose-500',
  'from-cyan-400 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-400 to-red-600',
  'from-teal-400 to-cyan-600',
  'from-indigo-400 to-purple-600',
];

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function createNewIdentity(sessionId: string): AnonymousIdentity {
  const adj = pickRandom(ADJECTIVES);
  const animal = pickRandom(ANIMALS);
  const gradient = pickRandom(GRADIENTS);
  const displayName = `${adj} ${animal}`;
  const initials = `${adj[0]}${animal[0]}`;

  return {
    sessionId,
    displayName,
    gradient,
    initials,
    createdAt: new Date().toISOString(),
  };
}

export const anonymousIdentityService = {
  /**
   * Retrieves the stable session ID or creates one in sessionStorage.
   */
  getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (!sessionId) {
        sessionId = generateUUID();
        sessionStorage.setItem(STORAGE_KEY_SESSION, sessionId);
      }
      return sessionId;
    } catch {
      return generateUUID();
    }
  },

  /**
   * Retrieves the visitor's current anonymous identity or generates a new
   * one on first visit. Reuses the same identity throughout the session.
   */
  getIdentity(): AnonymousIdentity {
    const sessionId = this.getSessionId();

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_IDENTITY);
      if (stored) {
        const parsed = JSON.parse(stored) as AnonymousIdentity;
        // Verify it matches current session
        if (parsed && parsed.displayName && parsed.gradient) {
          return parsed;
        }
      }
    } catch {
      // In case of storage read issue, proceed to generate
    }

    const newIdentity = createNewIdentity(sessionId);
    try {
      sessionStorage.setItem(STORAGE_KEY_IDENTITY, JSON.stringify(newIdentity));
    } catch {}

    return newIdentity;
  },

  /**
   * Regenerates a new anonymous identity upon explicit user request.
   */
  changeIdentity(): AnonymousIdentity {
    const sessionId = this.getSessionId();
    const currentIdentity = this.getIdentity();

    // Ensure we pick a different name if possible
    let newIdentity = createNewIdentity(sessionId);
    let attempts = 0;
    while (newIdentity.displayName === currentIdentity.displayName && attempts < 5) {
      newIdentity = createNewIdentity(sessionId);
      attempts++;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY_IDENTITY, JSON.stringify(newIdentity));
      window.dispatchEvent(
        new CustomEvent(IDENTITY_CHANGED_EVENT, { detail: newIdentity })
      );
    } catch {}

    return newIdentity;
  },

  /**
   * Subscribes to identity changes within the tab.
   */
  onIdentityChanged(callback: (identity: AnonymousIdentity) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<AnonymousIdentity>;
      callback(customEvent.detail);
    };
    window.addEventListener(IDENTITY_CHANGED_EVENT, handler);
    return () => window.removeEventListener(IDENTITY_CHANGED_EVENT, handler);
  },
};

