import { useState, useEffect, useCallback } from 'react';
import {
  Expense,
  TimelineEvent,
  DocumentItem,
  SystemSettings,
  Moto,
  MotoTenant,
  MotoContract,
  Kitnet,
  KitnetTenant,
  KitnetContract,
} from '../types';
import { initialExpenses, initialTimeline, initialDocuments, initialSettings, initialMotos, initialMotoTenants, initialMotoContracts, initialKitnets, initialKitnetTenants, initialKitnetContracts } from '../utils/initialData';
import { getTodayLocalDateString } from '../utils/formatters';
import { safeLocalStorage } from '../utils/storage';
import { loadFromStorage, saveToStorage, STORAGE_KEY_PREFIX } from './storageHelpers';
import { isDemoModeActive, filterOutDemoEntities, setRealDataActive } from '../utils/demoDataSecurity';

interface BackupPayload {
  timestamp: string;
  version: string;
  settings: SystemSettings;
  motos: Moto[];
  motoTenants: MotoTenant[];
  motoContracts: MotoContract[];
  kitnets: Kitnet[];
  kitnetTenants: KitnetTenant[];
  kitnetContracts: KitnetContract[];
  expenses: Expense[];
  timeline: TimelineEvent[];
  documents: DocumentItem[];
}

interface UseFinanceTimelineManagerProps {
  onRestoreBackup: (data: BackupPayload) => void;
  getBackupPayload: () => {
    settings: SystemSettings;
    motos: Moto[];
    motoTenants: MotoTenant[];
    motoContracts: MotoContract[];
    kitnets: Kitnet[];
    kitnetTenants: KitnetTenant[];
    kitnetContracts: KitnetContract[];
  };
  onResetAllState: () => void;
  onTransitionToRealData?: () => void;
}

export function useFinanceTimelineManager({
  onRestoreBackup,
  getBackupPayload,
  onResetAllState,
  onTransitionToRealData,
}: UseFinanceTimelineManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const loadedExpenses = loadFromStorage<Expense[]>('expenses', initialExpenses);
    const loadedMotos = loadFromStorage<Moto[]>('motos', initialMotos);
    const loadedKitnets = loadFromStorage<Kitnet[]>('kitnets', initialKitnets);

    return loadedExpenses.filter((e) => {
      if (e.targetType === 'moto') {
        if (loadedMotos.length === 0) return false;
        if (e.targetId && !loadedMotos.some((m) => m.id === e.targetId)) return false;
      }
      if (e.targetType === 'kitnet') {
        if (loadedKitnets.length === 0) return false;
        if (e.targetId && !loadedKitnets.some((k) => k.id === e.targetId)) return false;
      }
      return true;
    });
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
    const loadedTimeline = loadFromStorage<TimelineEvent[]>('timeline', initialTimeline);
    const loadedMotos = loadFromStorage<Moto[]>('motos', initialMotos);
    const loadedKitnets = loadFromStorage<Kitnet[]>('kitnets', initialKitnets);

    if (loadedMotos.length === 0 && loadedKitnets.length === 0) {
      return [];
    }
    return loadedTimeline;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    loadFromStorage('documents', initialDocuments)
  );

  useEffect(() => {
    saveToStorage('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    saveToStorage('timeline', timeline);
  }, [timeline]);

  useEffect(() => {
    saveToStorage('documents', documents);
  }, [documents]);

  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setTimeline((prev) => {
      if (prev.length > 0) {
        const last = prev[0];
        const isSame =
          last.title === event.title &&
          last.description === event.description &&
          last.entityType === event.entityType;
        if (isSame) {
          const lastTime = new Date(last.timestamp).getTime();
          const now = Date.now();
          if (now - lastTime < 3000) {
            return prev;
          }
        }
      }
      const newEvent: TimelineEvent = {
        ...event,
        id: `time-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toISOString(),
      };
      return [newEvent, ...prev];
    });
  }, []);

  const addDocument = (doc: Omit<DocumentItem, 'id' | 'date'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      date: getTodayLocalDateString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Novo Documento: ${doc.title}`,
      description: `Arquivo anexado à categoria ${doc.category} (${doc.relatedName}).`,
      entityType: doc.category === 'moto' ? 'moto' : doc.category === 'kitnet' ? 'kitnet' : 'sistema',
      entityId: doc.relatedId,
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (isDemoModeActive() && onTransitionToRealData) {
      onTransitionToRealData();
    }
    const id = `exp-${Date.now()}`;
    const cleanCategory = expenseData.category;
    let cleanTargetType = expenseData.targetType;
    
    // Ensure moto expenses are never wrongly tagged as kitnet
    if (cleanCategory === 'manutencao_moto' || expenseData.title.toLowerCase().includes('moto')) {
      if (!cleanTargetType || cleanTargetType === 'kitnet') {
        cleanTargetType = 'moto';
      }
    }

    const newExpense: Expense = {
      ...expenseData,
      targetType: cleanTargetType,
      id,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addTimelineEvent({
      type: 'despesa_paga',
      title: `Despesa Cadastrada: ${newExpense.title}`,
      description: `Valor: R$ ${newExpense.amount.toFixed(2)} • Categoria: ${newExpense.category} • Vencimento: ${newExpense.dueDate}.`,
      entityType: 'financeiro',
    });
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const payExpense = (id: string, receiptUrl?: string) => {
    const exp = expenses.find((e) => e.id === id);
    if (!exp) return;
    updateExpense(id, {
      status: 'pago',
      paidDate: getTodayLocalDateString(),
      receiptUrl: receiptUrl || exp.receiptUrl,
    });
    addTimelineEvent({
      type: 'despesa_paga',
      title: `Despesa Paga: ${exp.title}`,
      description: `Pagamento de R$ ${exp.amount.toFixed(2)} registrado.`,
      entityType: 'financeiro',
    });
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addTimelineEvent({
      type: 'despesa_paga',
      title: `Despesa Removida: ${exp?.title || id}`,
      description: `Registro de despesa no valor de R$ ${(exp?.amount || 0).toFixed(2)} foi excluído do sistema.`,
      entityType: 'financeiro',
    });
  };

  const deleteExpensesByTarget = (targetType: 'moto' | 'kitnet', targetId: string) => {
    setExpenses((prev) => prev.filter((e) => !(e.targetType === targetType && e.targetId === targetId)));
  };

  const purgeDemoEntities = useCallback(() => {
    setExpenses((prev) => filterOutDemoEntities(prev));
    setTimeline((prev) => filterOutDemoEntities(prev));
    setDocuments((prev) => filterOutDemoEntities(prev));
  }, []);

  const clearAll = useCallback(() => {
    setExpenses([]);
    setTimeline([]);
    setDocuments([]);
    safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'expenses');
    safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'timeline');
    safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'documents');
  }, []);

  const clearTimeline = () => {
    setTimeline([]);
    safeLocalStorage.removeItem(STORAGE_KEY_PREFIX + 'timeline');
  };

  const saveSignature = (key: string, signature: string) => {
    safeLocalStorage.setItem(`signature_${key}`, signature);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: 'Assinatura Digital Registrada',
      description: `Assinatura digital salva com sucesso para ${key}.`,
      entityType: 'sistema',
    });
  };

  const exportBackup = () => {
    const nowIso = new Date().toISOString();
    const payload = getBackupPayload();
    const fullBackup: BackupPayload = {
      timestamp: nowIso,
      version: '1.0',
      ...payload,
      expenses,
      timeline,
      documents,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-gestao-patrimonial-${nowIso.split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addTimelineEvent({
      type: 'documento_atualizado',
      title: 'Backup Completo Exportado',
      description: 'Arquivo JSON gerado e baixado com sucesso.',
      entityType: 'sistema',
    });
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.motos && data.kitnets && data.settings) {
        setRealDataActive(true);
        onRestoreBackup({
          ...data,
          motos: filterOutDemoEntities(data.motos),
          motoTenants: filterOutDemoEntities(data.motoTenants),
          motoContracts: filterOutDemoEntities(data.motoContracts),
          kitnets: filterOutDemoEntities(data.kitnets),
          kitnetTenants: filterOutDemoEntities(data.kitnetTenants),
          kitnetContracts: filterOutDemoEntities(data.kitnetContracts),
        });
        setExpenses(filterOutDemoEntities(data.expenses || []));
        setTimeline(filterOutDemoEntities(data.timeline || []));
        setDocuments(filterOutDemoEntities(data.documents || []));

        addTimelineEvent({
          type: 'documento_atualizado',
          title: 'Backup Restaurado com Sucesso',
          description: 'Todos os módulos foram atualizados a partir do arquivo importado.',
          entityType: 'sistema',
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error restoring backup:', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    setRealDataActive(false);
    onResetAllState();
    setExpenses(initialExpenses);
    setTimeline(initialTimeline);
    setDocuments(initialDocuments);
    safeLocalStorage.clear();
  };

  return {
    expenses,
    setExpenses,
    timeline,
    setTimeline,
    documents,
    setDocuments,
    purgeDemoEntities,
    clearAll,
    addTimelineEvent,
    addDocument,
    deleteDocument,
    addExpense,
    updateExpense,
    payExpense,
    deleteExpense,
    deleteExpensesByTarget,
    clearTimeline,
    saveSignature,
    exportBackup,
    importBackup,
    resetToDefaults,
  };
}
