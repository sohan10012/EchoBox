import { useState, useEffect, useCallback } from 'react';
import {
  anonymousIdentityService,
  AnonymousIdentity,
} from '@/services/anonymousIdentity';

export function useAnonymousIdentity() {
  const [identity, setIdentity] = useState<AnonymousIdentity>(() =>
    anonymousIdentityService.getIdentity()
  );

  useEffect(() => {
    const unsubscribe = anonymousIdentityService.onIdentityChanged((newIdentity) => {
      setIdentity(newIdentity);
    });
    return unsubscribe;
  }, []);

  const changeIdentity = useCallback(() => {
    const updated = anonymousIdentityService.changeIdentity();
    setIdentity(updated);
    return updated;
  }, []);

  return {
    identity,
    sessionId: identity.sessionId,
    displayName: identity.displayName,
    gradient: identity.gradient,
    initials: identity.initials,
    changeIdentity,
  };
}
