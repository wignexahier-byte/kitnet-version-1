import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppContextType } from './types';
import { useAuthManager } from './useAuthManager';
import { useSettingsManager } from './useSettingsManager';
import { useMotosManager } from './useMotosManager';
import { useKitnetsManager } from './useKitnetsManager';
import { useFinanceTimelineManager } from './useFinanceTimelineManager';
import { checkAndSendDueNotifications, isNotificationSupported } from '../utils/notificationService';
import { initialMotos, initialMotoTenants, initialMotoContracts, initialKitnets, initialKitnetTenants, initialKitnetContracts, initialSettings, initialExpenses } from '../utils/initialData';
import {
  subscribeStorageHealthWarning,
  setStorageHealthWarningState,
  getStorageHealthWarningState,
} from './storageHelpers';
import {
  hasRealDataStored,
  setRealDataActive,
  isDemoEntity,
  filterOutDemoEntities,
  sanitizeStorageFromDemo,
} from '../utils/demoDataSecurity';

export * from './types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasRealDataState, setHasRealDataState] = useState<boolean>(hasRealDataStored);

  // Finance, Timeline and Documents manager (needs forward callbacks)
  let setMotosRef: any = null;
  let setMotoTenantsRef: any = null;
  let setMotoContractsRef: any = null;
  let setKitnetsRef: any = null;
  let setKitnetTenantsRef: any = null;
  let setKitnetContractsRef: any = null;
  let setSettingsRef: any = null;

  const handleTransitionToRealData = useCallback(() => {
    if (!hasRealDataStored()) {
      setRealDataActive(true);
      setHasRealDataState(true);
      if (setMotosRef) setMotosRef((prev: any) => filterOutDemoEntities(prev));
      if (setMotoTenantsRef) setMotoTenantsRef((prev: any) => filterOutDemoEntities(prev));
      if (setMotoContractsRef) setMotoContractsRef((prev: any) => filterOutDemoEntities(prev));
      if (setKitnetsRef) setKitnetsRef((prev: any) => filterOutDemoEntities(prev));
      if (setKitnetTenantsRef) setKitnetTenantsRef((prev: any) => filterOutDemoEntities(prev));
      if (setKitnetContractsRef) setKitnetContractsRef((prev: any) => filterOutDemoEntities(prev));
      financeManager.purgeDemoEntities();
      sanitizeStorageFromDemo();
    }
  }, []);

  const financeManager = useFinanceTimelineManager({
    onRestoreBackup: (data) => {
      setRealDataActive(true);
      setHasRealDataState(true);
      if (setSettingsRef) setSettingsRef(data.settings);
      if (setMotosRef) setMotosRef(data.motos);
      if (setMotoTenantsRef) setMotoTenantsRef(data.motoTenants || []);
      if (setMotoContractsRef) setMotoContractsRef(data.motoContracts || []);
      if (setKitnetsRef) setKitnetsRef(data.kitnets);
      if (setKitnetTenantsRef) setKitnetTenantsRef(data.kitnetTenants || []);
      if (setKitnetContractsRef) setKitnetContractsRef(data.kitnetContracts || []);
    },
    getBackupPayload: () => ({
      settings: settingsManager.settings,
      motos: motosManager.motos,
      motoTenants: motosManager.motoTenants,
      motoContracts: motosManager.motoContracts,
      kitnets: kitnetsManager.kitnets,
      kitnetTenants: kitnetsManager.kitnetTenants,
      kitnetContracts: kitnetsManager.kitnetContracts,
    }),
    onResetAllState: () => {
      setRealDataActive(false);
      setHasRealDataState(false);
      if (setSettingsRef) setSettingsRef(initialSettings);
      if (setMotosRef) setMotosRef(initialMotos);
      if (setMotoTenantsRef) setMotoTenantsRef(initialMotoTenants);
      if (setMotoContractsRef) setMotoContractsRef(initialMotoContracts);
      if (setKitnetsRef) setKitnetsRef(initialKitnets);
      if (setKitnetTenantsRef) setKitnetTenantsRef(initialKitnetTenants);
      if (setKitnetContractsRef) setKitnetContractsRef(initialKitnetContracts);
    },
    onTransitionToRealData: handleTransitionToRealData,
  });

  const motosManager = useMotosManager({
    addTimelineEvent: financeManager.addTimelineEvent,
    addExpense: financeManager.addExpense,
    deleteExpensesByTarget: financeManager.deleteExpensesByTarget,
    onTransitionToRealData: handleTransitionToRealData,
  });

  const kitnetsManager = useKitnetsManager({
    addTimelineEvent: financeManager.addTimelineEvent,
    deleteExpensesByTarget: financeManager.deleteExpensesByTarget,
    onTransitionToRealData: handleTransitionToRealData,
  });

  const settingsManager = useSettingsManager({
    addTimelineEvent: financeManager.addTimelineEvent,
    getNotificationContext: () => ({
      motos: motosManager.motos,
      motoContracts: motosManager.motoContracts,
      motoTenants: motosManager.motoTenants,
      kitnets: kitnetsManager.kitnets,
      kitnetContracts: kitnetsManager.kitnetContracts,
      kitnetTenants: kitnetsManager.kitnetTenants,
      expenses: financeManager.expenses,
    }),
  });

  const authManager = useAuthManager({
    settings: settingsManager.settings,
    addTimelineEvent: financeManager.addTimelineEvent,
  });

  const [storageHealthWarning, setStorageHealthWarning] = useState<boolean>(getStorageHealthWarningState);

  useEffect(() => {
    return subscribeStorageHealthWarning((warning) => {
      setStorageHealthWarning(warning);
    });
  }, []);

  // Assign state setters for backup restoration
  setMotosRef = motosManager.setMotos;
  setMotoTenantsRef = motosManager.setMotoTenants;
  setMotoContractsRef = motosManager.setMotoContracts;
  setKitnetsRef = kitnetsManager.setKitnets;
  setKitnetTenantsRef = kitnetsManager.setKitnetTenants;
  setKitnetContractsRef = kitnetsManager.setKitnetContracts;
  setSettingsRef = settingsManager.setSettings;

  // Background notifications check - debounced on mount or contract changes
  useEffect(() => {
    if (
      settingsManager.settings.browserNotificationsEnabled &&
      isNotificationSupported() &&
      Notification.permission === 'granted'
    ) {
      const timer = setTimeout(() => {
        checkAndSendDueNotifications({
          motos: motosManager.motos,
          motoContracts: motosManager.motoContracts,
          motoTenants: motosManager.motoTenants,
          kitnets: kitnetsManager.kitnets,
          kitnetContracts: kitnetsManager.kitnetContracts,
          kitnetTenants: kitnetsManager.kitnetTenants,
          expenses: financeManager.expenses,
          contractEndAlertDays: settingsManager.settings.contractEndAlertDays || 60,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    settingsManager.settings.browserNotificationsEnabled,
    settingsManager.settings.contractEndAlertDays,
    motosManager.motoContracts,
    kitnetsManager.kitnetContracts,
  ]);

  const clearDemoDataAndStartFresh = useCallback(() => {
    setRealDataActive(true);
    setHasRealDataState(true);
    if (setMotosRef) setMotosRef([]);
    if (setMotoTenantsRef) setMotoTenantsRef([]);
    if (setMotoContractsRef) setMotoContractsRef([]);
    if (setKitnetsRef) setKitnetsRef([]);
    if (setKitnetTenantsRef) setKitnetTenantsRef([]);
    if (setKitnetContractsRef) setKitnetContractsRef([]);
    financeManager.clearAll();
    sanitizeStorageFromDemo();
    financeManager.addTimelineEvent({
      type: 'documento_atualizado',
      title: 'Ambiente Real Inicializado',
      description: 'Dados de demonstração foram isolados e removidos. Sistema pronto para dados reais.',
      entityType: 'sistema',
    });
  }, [financeManager]);

  const loadDemoData = useCallback(() => {
    setRealDataActive(false);
    setHasRealDataState(false);
    if (setSettingsRef) setSettingsRef(initialSettings);
    if (setMotosRef) setMotosRef(initialMotos);
    if (setMotoTenantsRef) setMotoTenantsRef(initialMotoTenants);
    if (setMotoContractsRef) setMotoContractsRef(initialMotoContracts);
    if (setKitnetsRef) setKitnetsRef(initialKitnets);
    if (setKitnetTenantsRef) setKitnetTenantsRef(initialKitnetTenants);
    if (setKitnetContractsRef) setKitnetContractsRef(initialKitnetContracts);
    financeManager.resetToDefaults();
  }, [financeManager]);

  const toggleDemoMode = useCallback(
    (enable?: boolean): boolean => {
      // If enable is explicitly passed, use it; otherwise toggle current demo mode
      // Current demo mode active is (!hasRealDataState)
      const targetDemoState = enable !== undefined ? enable : hasRealDataState;

      if (targetDemoState) {
        // Turning Demo ON: restore/overlay demo dataset
        setRealDataActive(false);
        setHasRealDataState(false);

        if (setMotosRef) {
          setMotosRef((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((m) => !isDemoEntity(m)) : [];
            return [...initialMotos, ...nonDemo];
          });
        }
        if (setMotoTenantsRef) {
          setMotoTenantsRef((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((t) => !isDemoEntity(t)) : [];
            return [...initialMotoTenants, ...nonDemo];
          });
        }
        if (setMotoContractsRef) {
          setMotoContractsRef((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((c) => !isDemoEntity(c)) : [];
            return [...initialMotoContracts, ...nonDemo];
          });
        }
        if (setKitnetsRef) {
          setKitnetsRef((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((k) => !isDemoEntity(k)) : [];
            return [...initialKitnets, ...nonDemo];
          });
        }
        if (setKitnetTenantsRef) {
          setKitnetTenantsRef((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((t) => !isDemoEntity(t)) : [];
            return [...initialKitnetTenants, ...nonDemo];
          });
        }
        if (setKitnetContractsRef) {
          setKitnetContractsRef((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((c) => !isDemoEntity(c)) : [];
            return [...initialKitnetContracts, ...nonDemo];
          });
        }
        if (financeManager.setExpenses) {
          financeManager.setExpenses((prev: any[]) => {
            const nonDemo = Array.isArray(prev) ? prev.filter((e) => !isDemoEntity(e)) : [];
            return [...initialExpenses, ...nonDemo];
          });
        }

        financeManager.addTimelineEvent({
          type: 'documento_atualizado',
          title: 'Clientes Demo Ativados',
          description: 'Clientes e contratos demonstrativos carregados para teste completo do sistema.',
          entityType: 'sistema',
        });
        return true;
      } else {
        // Turning Demo OFF: purge all demo entities, preserve any real data
        setRealDataActive(true);
        setHasRealDataState(true);

        if (setMotosRef) {
          setMotosRef((prev: any[]) => (Array.isArray(prev) ? prev.filter((m) => !isDemoEntity(m)) : []));
        }
        if (setMotoTenantsRef) {
          setMotoTenantsRef((prev: any[]) => (Array.isArray(prev) ? prev.filter((t) => !isDemoEntity(t)) : []));
        }
        if (setMotoContractsRef) {
          setMotoContractsRef((prev: any[]) => (Array.isArray(prev) ? prev.filter((c) => !isDemoEntity(c)) : []));
        }
        if (setKitnetsRef) {
          setKitnetsRef((prev: any[]) => (Array.isArray(prev) ? prev.filter((k) => !isDemoEntity(k)) : []));
        }
        if (setKitnetTenantsRef) {
          setKitnetTenantsRef((prev: any[]) => (Array.isArray(prev) ? prev.filter((t) => !isDemoEntity(t)) : []));
        }
        if (setKitnetContractsRef) {
          setKitnetContractsRef((prev: any[]) => (Array.isArray(prev) ? prev.filter((c) => !isDemoEntity(c)) : []));
        }
        if (financeManager.setExpenses) {
          financeManager.setExpenses((prev: any[]) => (Array.isArray(prev) ? prev.filter((e) => !isDemoEntity(e)) : []));
        }
        sanitizeStorageFromDemo();

        financeManager.addTimelineEvent({
          type: 'documento_atualizado',
          title: 'Clientes Demo Desativados',
          description: 'Dados demonstrativos removidos. Ambiente limpo e seguro para dados reais.',
          entityType: 'sistema',
        });
        return false;
      }
    },
    [hasRealDataState, financeManager]
  );

  const handleSetStorageHealthWarning = useCallback((warning: boolean) => {
    setStorageHealthWarningState(warning);
    setStorageHealthWarning(warning);
  }, []);

  const contextValue: AppContextType = useMemo(
    () => ({
      // Auth
      isAuthenticated: authManager.isAuthenticated,
      isLocked: authManager.isLocked,
      isDisconnecting: authManager.isDisconnecting,
      isLogoutDisconnect: authManager.isLogoutDisconnect,
      completeDisconnect: authManager.completeDisconnect,
      isReadOnlyMode: authManager.isReadOnlyMode,
      toggleReadOnlyMode: authManager.toggleReadOnlyMode,
      googleSession: authManager.googleSession,
      hasValidGoogleSession: authManager.hasValidGoogleSession,
      loginWithGoogle: authManager.loginWithGoogle,
      loginWithPin: authManager.loginWithPin,
      loginWithBiometrics: authManager.loginWithBiometrics,
      lockApp: authManager.lockApp,
      logout: authManager.logout,
      clearGoogleSession: authManager.clearGoogleSession,

      // Settings
      settings: settingsManager.settings,
      updateSettings: settingsManager.updateSettings,
      requestBrowserNotifications: settingsManager.requestBrowserNotifications,

      // Motos
      motos: motosManager.motos,
      motoTenants: motosManager.motoTenants,
      motoContracts: motosManager.motoContracts,
      addMoto: motosManager.addMoto,
      duplicateMoto: motosManager.duplicateMoto,
      updateMoto: motosManager.updateMoto,
      deleteMoto: motosManager.deleteMoto,
      addKmLog: motosManager.addKmLog,
      recordMotoDelivery: motosManager.recordMotoDelivery,
      addMotoMaintenance: motosManager.addMotoMaintenance,
      deleteMotoMaintenance: motosManager.deleteMotoMaintenance,
      addMotoTenant: motosManager.addMotoTenant,
      updateMotoTenant: motosManager.updateMotoTenant,
      createMotoContract: motosManager.createMotoContract,
      updateMotoContract: motosManager.updateMotoContract,
      adjustMotoContractRent: motosManager.adjustMotoContractRent,
      renewMotoContract: motosManager.renewMotoContract,
      payMotoInstallment: motosManager.payMotoInstallment,
      terminateMotoContract: motosManager.terminateMotoContract,

      // Kitnets
      kitnets: kitnetsManager.kitnets,
      kitnetTenants: kitnetsManager.kitnetTenants,
      kitnetContracts: kitnetsManager.kitnetContracts,
      addKitnet: kitnetsManager.addKitnet,
      duplicateKitnet: kitnetsManager.duplicateKitnet,
      updateKitnet: kitnetsManager.updateKitnet,
      deleteKitnet: kitnetsManager.deleteKitnet,
      recordKitnetInspection: kitnetsManager.recordKitnetInspection,
      addKitnetTenant: kitnetsManager.addKitnetTenant,
      updateKitnetTenant: kitnetsManager.updateKitnetTenant,
      createKitnetContract: kitnetsManager.createKitnetContract,
      adjustKitnetContractRent: kitnetsManager.adjustKitnetContractRent,
      renewKitnetContract: kitnetsManager.renewKitnetContract,
      payKitnetInstallment: kitnetsManager.payKitnetInstallment,
      terminateKitnetContract: kitnetsManager.terminateKitnetContract,

      // Expenses
      expenses: financeManager.expenses,
      addExpense: financeManager.addExpense,
      updateExpense: financeManager.updateExpense,
      payExpense: financeManager.payExpense,
      deleteExpense: financeManager.deleteExpense,

      // Timeline & Docs
      timeline: financeManager.timeline,
      documents: financeManager.documents,
      addTimelineEvent: financeManager.addTimelineEvent,
      clearTimeline: financeManager.clearTimeline,
      addDocument: financeManager.addDocument,
      deleteDocument: financeManager.deleteDocument,
      saveSignature: financeManager.saveSignature,

      // Backup & Restore
      exportBackup: financeManager.exportBackup,
      importBackup: financeManager.importBackup,
      resetToDefaults: financeManager.resetToDefaults,

      // Demo Data Isolation
      hasRealData: hasRealDataState,
      isDemoMode: !hasRealDataState,
      toggleDemoMode,
      clearDemoDataAndStartFresh,
      loadDemoData,

      // Storage Health & Quota
      storageHealthWarning,
      setStorageHealthWarning: handleSetStorageHealthWarning,
    }),
    [
      authManager,
      settingsManager,
      motosManager,
      kitnetsManager,
      financeManager,
      hasRealDataState,
      toggleDemoMode,
      clearDemoDataAndStartFresh,
      loadDemoData,
      storageHealthWarning,
      handleSetStorageHealthWarning,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

