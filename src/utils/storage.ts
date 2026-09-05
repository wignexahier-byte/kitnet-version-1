/**
 * Safe and Resilient Storage Adapter
 * Protects against QuotaExceededError, iframe security restrictions,
 * corrupt JSON parses, and mobile memory discards.
 */

const memoryStorageFallback = new Map<string, string>();

function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window[type];
    if (!storage) return false;
    const testKey = '__gp_test_storage__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const canUseLocalStorage = isStorageAvailable('localStorage');
const canUseSessionStorage = isStorageAvailable('sessionStorage');

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (canUseLocalStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not read localStorage key "${key}":`, e);
    }
    return memoryStorageFallback.get(key) ?? null;
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (canUseLocalStorage) {
        window.localStorage.setItem(key, value);
        memoryStorageFallback.set(key, value);
        return true;
      }
    } catch (e: any) {
      console.warn(`[SafeStorage] localStorage.setItem failed for key "${key}". Falling back to memory storage.`, e);
      // If quota exceeded, clean up old non-essential caches
      if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
        try {
          cleanNonEssentialStorage();
          if (canUseLocalStorage) {
            window.localStorage.setItem(key, value);
            return true;
          }
        } catch {
          // Keep in memory fallback
        }
      }
    }
    memoryStorageFallback.set(key, value);
    return false;
  },

  removeItem: (key: string): void => {
    try {
      if (canUseLocalStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not remove localStorage key "${key}":`, e);
    }
    memoryStorageFallback.delete(key);
  },

  clear: (): void => {
    try {
      if (canUseLocalStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      console.warn('[SafeStorage] Could not clear localStorage:', e);
    }
    memoryStorageFallback.clear();
  },

  keys: (): string[] => {
    try {
      if (canUseLocalStorage) {
        return Object.keys(window.localStorage);
      }
    } catch (e) {
      console.warn('[SafeStorage] Could not list localStorage keys:', e);
    }
    return Array.from(memoryStorageFallback.keys());
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (canUseSessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not read sessionStorage key "${key}":`, e);
    }
    return safeLocalStorage.getItem(`session_${key}`);
  },

  setItem: (key: string, value: string): void => {
    try {
      if (canUseSessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not set sessionStorage key "${key}":`, e);
    }
    safeLocalStorage.setItem(`session_${key}`, value);
  },

  removeItem: (key: string): void => {
    try {
      if (canUseSessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not remove sessionStorage key "${key}":`, e);
    }
    safeLocalStorage.removeItem(`session_${key}`);
  },
};

/**
 * Safely parses JSON with a default fallback, never throwing exceptions
 */
export function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (e) {
    console.warn('[SafeStorage] JSON parse failed, returning fallback:', e);
    return fallback;
  }
}

/**
 * Removes temporary/transient keys to free up localStorage if quota is tight
 */
function cleanNonEssentialStorage(): void {
  try {
    if (!canUseLocalStorage) return;
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith('gp_last_notified_') || k.startsWith('temp_') || k.startsWith('draft_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}
