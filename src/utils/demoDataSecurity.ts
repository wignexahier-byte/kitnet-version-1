import { safeLocalStorage } from './storage';

export const STORAGE_KEY_PREFIX = 'gestao_patrimonial_';
export const HAS_REAL_DATA_KEY = `${STORAGE_KEY_PREFIX}has_real_data`;
export const DATA_MODE_KEY = `${STORAGE_KEY_PREFIX}data_mode`;
export const IS_INSTALLED_KEY = `${STORAGE_KEY_PREFIX}installed`;

// Known demo ID prefixes and sets
const DEMO_ID_REGEX = /^(moto-[1-7]|tenant-moto-[1-5]|contract-moto-[1-5]|kitnet-[1-6]|tenant-kitnet-[1-4]|contract-kitnet-[1-4]|exp-([1-9]|1[0-5])|time-([1-9]|1[0-2])|doc-[1-4])$/;

/**
 * Identifica se uma entidade é um dado de demonstração / amostra de fábrica.
 * Regra:
 * 1. Campo explícito isDemo === true
 * 2. ID coincide com os identificadores do initialData.ts
 */
export function isDemoEntity(item: any): boolean {
  if (!item || typeof item !== 'object') return false;
  if (item.isDemo === true || item.isDemoEntity === true) return true;
  if (typeof item.id === 'string' && DEMO_ID_REGEX.test(item.id)) {
    return true;
  }
  return false;
}

/**
 * Filtra removendo qualquer entidade de demonstração de um array.
 */
export function filterOutDemoEntities<T>(items: T[] | null | undefined): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => !isDemoEntity(item));
}

/**
 * Retorna se o usuário já possui ou ativou ambiente de dados reais.
 */
export function hasRealDataStored(): boolean {
  if (typeof window === 'undefined') return false;
  return safeLocalStorage.getItem(HAS_REAL_DATA_KEY) === 'true';
}

/**
 * Registra formalmente a transição para dados reais no localStorage.
 */
export function setRealDataActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  safeLocalStorage.setItem(HAS_REAL_DATA_KEY, active ? 'true' : 'false');
  safeLocalStorage.setItem(DATA_MODE_KEY, active ? 'real' : 'demo');
}

/**
 * Verifica se a aplicação está em modo de demonstração inicial.
 */
export function isDemoModeActive(): boolean {
  return !hasRealDataStored();
}

/**
 * Purga chaves de armazenamento de dados demo, garantindo que nenhum
 * registro de demonstração contamine os dados reais do usuário.
 */
export function sanitizeStorageFromDemo(): void {
  if (typeof window === 'undefined') return;

  const entityKeys = [
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

  entityKeys.forEach((key) => {
    const fullKey = STORAGE_KEY_PREFIX + key;
    const raw = safeLocalStorage.getItem(fullKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((item) => !isDemoEntity(item));
          safeLocalStorage.setItem(fullKey, JSON.stringify(clean));
        }
      } catch {
        // Ignora erros de parsing
      }
    }
  });

  setRealDataActive(true);
}
