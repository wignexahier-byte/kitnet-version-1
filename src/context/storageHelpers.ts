import { safeLocalStorage, safeJsonParse } from '../utils/storage';
import {
  STORAGE_KEY_PREFIX,
  IS_INSTALLED_KEY,
  hasRealDataStored,
  setRealDataActive,
  filterOutDemoEntities,
  isDemoEntity,
} from '../utils/demoDataSecurity';

export { STORAGE_KEY_PREFIX };
export const CURRENT_DATA_VERSION = 'v2_novos_clientes_2026';

type StorageWarningListener = (warning: boolean) => void;
const warningListeners: Set<StorageWarningListener> = new Set();
let currentStorageHealthWarning = false;

// Check and perform auto-migration safely without wiping real data
export function checkAndMigrateStorageVersion(onResetToDefaults?: () => void): void {
  try {
    const storedVersion = safeLocalStorage.getItem(STORAGE_KEY_PREFIX + 'data_version');
    const hasRealData = hasRealDataStored();

    if (storedVersion !== CURRENT_DATA_VERSION) {
      // REGRA DE SEGURANÇA: NUNCA apagar dados reais do usuário em migração de versão!
      if (!hasRealData) {
        // Se ainda for puramente base de teste inicial, atualiza chaves
        const keysToClear = [
          'motos',
          'motoTenants',
          'motoContracts',
          'kitnets',
          'kitnetTenants',
          'kitnetContracts',
          'expenses',
          'timeline',
          'documents',
        ];
        keysToClear.forEach((k) => safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + k));
        if (onResetToDefaults) {
          onResetToDefaults();
        }
      }
      safeLocalStorage.setItem(STORAGE_KEY_PREFIX + 'data_version', CURRENT_DATA_VERSION);
    }
  } catch (e) {
    console.warn('[SafeStorage] Version migration check failed:', e);
  }
}

// Auto-run version migration check once on initial script load
if (typeof window !== 'undefined') {
  checkAndMigrateStorageVersion();
}

export function subscribeStorageHealthWarning(listener: StorageWarningListener): () => void {
  warningListeners.add(listener);
  listener(currentStorageHealthWarning);
  return () => {
    warningListeners.delete(listener);
  };
}

export function setStorageHealthWarningState(warning: boolean): void {
  if (currentStorageHealthWarning !== warning) {
    currentStorageHealthWarning = warning;
    warningListeners.forEach((fn) => fn(warning));
  }
}

export function getStorageHealthWarningState(): boolean {
  return currentStorageHealthWarning;
}

/**
 * Carrega dados do localStorage com isolamento estrito:
 * - Se já possui dados reais: dados demo NUNCA são mesclados ou carregados.
 * - Se o app já foi instalado e uma coleção estiver vazia: retorna array vazio [],
 *   NUNCA recarrega initialData por acidente.
 * - InitialData só é utilizado na primeira instalação limpa (fresh install).
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  const item = safeLocalStorage.getItem(STORAGE_KEY_PREFIX + key);
  const isInstalled = safeLocalStorage.getItem(IS_INSTALLED_KEY) === 'true';
  const hasRealData = hasRealDataStored();

  if (item !== null) {
    const parsed = safeJsonParse(item, fallback);
    if (hasRealData && Array.isArray(parsed)) {
      // Garante sanitização de qualquer demo remanescente
      return filterOutDemoEntities(parsed) as unknown as T;
    }
    return parsed;
  }

  // Se a chave não existir no localStorage:
  // Se o app já foi instalado ou já possui dados reais, uma chave ausente/removida
  // representa coleção vazia [], e NÃO deve restaurar dados de demonstração!
  if (isInstalled || hasRealData) {
    if (Array.isArray(fallback)) {
      return [] as unknown as T;
    }
  }

  // Primeira instalação limpa: marca como instalado e carrega fallback demo
  safeLocalStorage.setItem(IS_INSTALLED_KEY, 'true');
  return fallback;
}

/**
 * Salva no storage garantindo que dados de demonstração não contaminem dados reais
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    let payload = value;
    const hasRealData = hasRealDataStored();

    if (hasRealData && Array.isArray(value)) {
      payload = filterOutDemoEntities(value) as unknown as T;
    }

    const success = safeLocalStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(payload));
    if (!success) {
      setStorageHealthWarningState(true);
    }
    return success;
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
    setStorageHealthWarningState(true);
    return false;
  }
}
