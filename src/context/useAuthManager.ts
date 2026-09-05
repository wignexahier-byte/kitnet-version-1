import { useState, useEffect } from 'react';
import { GoogleAuthSession, SystemSettings, TimelineEvent } from '../types';
import { safeLocalStorage, safeSessionStorage } from '../utils/storage';
import { loadFromStorage, saveToStorage, STORAGE_KEY_PREFIX } from './storageHelpers';

export const ALLOWED_ADMIN_EMAIL = 'wleal0131@gmail.com';

interface UseAuthManagerProps {
  settings: SystemSettings;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
}

export function useAuthManager({ settings, addTimelineEvent }: UseAuthManagerProps) {
  const [googleSession, setGoogleSession] = useState<GoogleAuthSession | null>(() => {
    const session = loadFromStorage<GoogleAuthSession | null>('google_session', null);
    if (session && session.expiresAt && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    return null;
  });

  const hasValidGoogleSession = Boolean(
    googleSession && googleSession.expiresAt && new Date(googleSession.expiresAt) > new Date()
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = loadFromStorage<GoogleAuthSession | null>('google_session', null);
    if (session && session.expiresAt && new Date(session.expiresAt) > new Date()) {
      return true;
    }
    const isSessionAuth = safeSessionStorage.getItem('gp_auth') === 'true';
    const isPersistentAuth = safeLocalStorage.getItem('gp_auth_persistent') === 'true';
    const isExplicitlyLocked =
      safeSessionStorage.getItem('gp_locked') === 'true' || safeLocalStorage.getItem('gp_locked') === 'true';
    return (isSessionAuth || isPersistentAuth) && !isExplicitlyLocked;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return safeSessionStorage.getItem('gp_locked') === 'true' || safeLocalStorage.getItem('gp_locked') === 'true';
  });

  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [isLogoutDisconnect, setIsLogoutDisconnect] = useState<boolean>(false);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState<boolean>(() => {
    return safeSessionStorage.getItem('gp_readonly') === 'true';
  });

  const toggleReadOnlyMode = (): boolean => {
    if (isReadOnlyMode) {
      setIsReadOnlyMode(false);
      safeSessionStorage.setItem('gp_readonly', 'false');
      addTimelineEvent({
        type: 'documento_atualizado',
        title: 'Modo Somente Leitura Desativado',
        description: 'Permissões de edição e operações restauradas.',
        entityType: 'sistema',
      });
      return true;
    } else {
      setIsReadOnlyMode(true);
      safeSessionStorage.setItem('gp_readonly', 'true');
      addTimelineEvent({
        type: 'documento_atualizado',
        title: 'Modo Somente Leitura Ativado',
        description: 'Operações de alteração foram temporariamente bloqueadas para auditoria/apresentação.',
        entityType: 'sistema',
      });
      return true;
    }
  };

  useEffect(() => {
    if (googleSession) {
      saveToStorage('google_session', googleSession);
    } else {
      safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'google_session');
    }
  }, [googleSession]);

  const loginWithGoogle = (email: string, name?: string, picture?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: 'Esta conta não tem acesso a este app. Acesso restrito ao administrador.',
      };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: GoogleAuthSession = {
      email: cleanEmail,
      name: name || 'Wigne Leal Xavier Macedo',
      picture: picture || '',
      authenticatedAt: now.toISOString(),
      expiresAt,
    };

    setGoogleSession(session);
    setIsAuthenticated(true);
    setIsLocked(false);
    safeSessionStorage.setItem('gp_auth', 'true');
    safeSessionStorage.setItem('gp_locked', 'false');
    safeLocalStorage.setItem('gp_auth_persistent', 'true');
    safeLocalStorage.removeItem('gp_locked');

    addTimelineEvent({
      type: 'documento_atualizado',
      title: 'Acesso Administrativo Concedido',
      description: `Login com Google autenticado com sucesso (${cleanEmail}). Sessão válida por 7 dias.`,
      entityType: 'sistema',
    });

    return { success: true };
  };

  const completeDisconnect = () => {
    if (isLogoutDisconnect) {
      setGoogleSession(null);
      safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'google_session');
    }
    setIsAuthenticated(false);
    setIsLocked(true);
    safeSessionStorage.removeItem('gp_auth');
    safeSessionStorage.setItem('gp_locked', 'true');
    safeLocalStorage.removeItem('gp_auth_persistent');
    safeLocalStorage.setItem('gp_locked', 'true');
    setIsDisconnecting(false);
    setIsLogoutDisconnect(false);
  };

  const clearGoogleSession = () => {
    if (isAuthenticated) {
      setIsLogoutDisconnect(true);
      setIsDisconnecting(true);
    } else {
      setGoogleSession(null);
      setIsAuthenticated(false);
      setIsLocked(true);
      safeSessionStorage.removeItem('gp_auth');
      safeSessionStorage.removeItem('gp_locked');
      safeLocalStorage.removeItem('gp_auth_persistent');
      safeLocalStorage.setItem('gp_locked', 'true');
      safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'google_session');
      setIsDisconnecting(false);
      setIsLogoutDisconnect(false);
    }
  };

  const loginWithPin = (pin: string): boolean => {
    if (pin === settings.pinCode) {
      setIsAuthenticated(true);
      setIsLocked(false);
      setIsDisconnecting(false);
      setIsLogoutDisconnect(false);
      safeSessionStorage.setItem('gp_auth', 'true');
      safeSessionStorage.setItem('gp_locked', 'false');
      safeLocalStorage.setItem('gp_auth_persistent', 'true');
      safeLocalStorage.removeItem('gp_locked');
      return true;
    }
    return false;
  };

  const loginWithBiometrics = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLocked(false);
        setIsDisconnecting(false);
        setIsLogoutDisconnect(false);
        safeSessionStorage.setItem('gp_auth', 'true');
        safeSessionStorage.setItem('gp_locked', 'false');
        safeLocalStorage.setItem('gp_auth_persistent', 'true');
        safeLocalStorage.removeItem('gp_locked');
        resolve(true);
      }, 600);
    });
  };

  const lockApp = () => {
    if (isAuthenticated) {
      setIsLogoutDisconnect(false);
      setIsDisconnecting(true);
    } else {
      setIsAuthenticated(false);
      setIsLocked(true);
      safeSessionStorage.removeItem('gp_auth');
      safeSessionStorage.setItem('gp_locked', 'true');
      safeLocalStorage.removeItem('gp_auth_persistent');
      safeLocalStorage.setItem('gp_locked', 'true');
      setIsDisconnecting(false);
      setIsLogoutDisconnect(false);
    }
  };

  const logout = () => {
    if (isAuthenticated) {
      setIsLogoutDisconnect(true);
      setIsDisconnecting(true);
    } else {
      setIsAuthenticated(false);
      setIsLocked(true);
      safeSessionStorage.removeItem('gp_auth');
      safeSessionStorage.setItem('gp_locked', 'true');
      safeLocalStorage.removeItem('gp_auth_persistent');
      safeLocalStorage.setItem('gp_locked', 'true');
      setIsDisconnecting(false);
      setIsLogoutDisconnect(false);
    }
  };

  return {
    isAuthenticated,
    isLocked,
    isDisconnecting,
    isLogoutDisconnect,
    completeDisconnect,
    isReadOnlyMode,
    toggleReadOnlyMode,
    googleSession,
    hasValidGoogleSession,
    loginWithGoogle,
    loginWithPin,
    loginWithBiometrics,
    lockApp,
    logout,
    clearGoogleSession,
  };
}
