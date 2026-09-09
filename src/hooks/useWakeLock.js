import { useEffect, useRef, useState } from 'react';

/**
 * Holds a Screen Wake Lock while `active` is true, so the display doesn't dim
 * or sleep during a running session.
 *
 * The browser revokes the lock whenever the page is hidden (tab switch, minimise,
 * screen off) and never restores it on its own, so this re-acquires on every
 * return to visibility rather than assuming the original sentinel survived.
 *
 * Requires a secure context (https or localhost). Unsupported browsers and
 * rejected requests degrade to doing nothing.
 */
export default function useWakeLock(active) {
  const sentinelRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const isSupported =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  useEffect(() => {
    if (!active || !isSupported) return undefined;

    let cancelled = false;

    const acquire = async () => {
      // Requesting while hidden always rejects, so don't bother.
      if (document.visibilityState !== 'visible') return;
      if (sentinelRef.current) return;

      try {
        const sentinel = await navigator.wakeLock.request('screen');

        // The effect may have been torn down while the request was in flight.
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }

        sentinelRef.current = sentinel;
        setIsActive(true);

        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
            setIsActive(false);
          }
        });
      } catch {
        // NotAllowedError: low battery, blocked by permissions policy, or the
        // page stopped being visible mid-request. Not worth surfacing.
        setIsActive(false);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);

      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      setIsActive(false);
      if (sentinel) sentinel.release().catch(() => {});
    };
  }, [active, isSupported]);

  return { isSupported, isActive };
}
