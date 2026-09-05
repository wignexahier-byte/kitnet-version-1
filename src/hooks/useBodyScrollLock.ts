import { useEffect, useId } from 'react';

/**
 * Global set of active lock identifiers.
 * Prevents race conditions and guarantees body scrolling is restored cleanly
 * across all browsers, modals, and route changes.
 */
const activeLocks = new Set<string>();

export function forceUnlockBodyScroll() {
  activeLocks.clear();
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('overflow-hidden');
  }
}

export function useBodyScrollLock(isLocked: boolean) {
  const lockId = useId();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isLocked) {
      activeLocks.add(lockId);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('overflow-hidden');
    } else {
      activeLocks.delete(lockId);
      if (activeLocks.size === 0) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove('overflow-hidden');
      }
    }

    return () => {
      activeLocks.delete(lockId);
      if (activeLocks.size === 0) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, [isLocked, lockId]);
}

