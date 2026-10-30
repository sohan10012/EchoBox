const ADJECTIVES = [
  'Silent',
  'Midnight',
  'Curious',
  'Velvet',
  'Emerald',
  'Amber',
  'Solar',
  'Cosmic',
  'Indigo',
  'Nebula',
  'Mystic',
  'Silver',
  'Golden',
  'Shadow',
  'Quantum',
  'Astral',
];

const NOUNS = [
  'Beacon',
  'Fox',
  'Owl',
  'Voyager',
  'Echo',
  'Falcon',
  'Nomad',
  'Observer',
  'Lynx',
  'Raven',
  'Spark',
  'Phantom',
  'Pioneer',
  'Seeker',
  'Whisper',
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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAnonymousIdentity(id: string): {
  name: string;
  gradient: string;
  initials: string;
} {
  const hash = hashString(id || 'anonymous');
  const adj = ADJECTIVES[hash % ADJECTIVES.length];
  const noun = NOUNS[(hash >> 3) % NOUNS.length];
  const gradient = GRADIENTS[hash % GRADIENTS.length];
  const initials = `${adj[0]}${noun[0]}`;

  return {
    name: `${adj} ${noun}`,
    gradient,
    initials,
  };
}

export function getMessageIdentity(
  messageId: string,
  customDisplayName?: string
): {
  name: string;
  gradient: string;
  initials: string;
} {
  if (customDisplayName && customDisplayName.trim()) {
    const trimmed = customDisplayName.trim();
    const parts = trimmed.split(' ');
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : trimmed.slice(0, 2).toUpperCase();
    const hash = hashString(trimmed);
    const gradient = GRADIENTS[hash % GRADIENTS.length];
    return {
      name: trimmed,
      gradient,
      initials,
    };
  }
  return getAnonymousIdentity(messageId);
}

