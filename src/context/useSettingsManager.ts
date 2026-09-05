import { useState, useEffect } from 'react';
import { SystemSettings, TimelineEvent } from '../types';
import { initialSettings } from '../utils/initialData';
import { loadFromStorage, saveToStorage } from './storageHelpers';
import {
  checkAndSendDueNotifications,
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notificationService';
import { Moto, MotoContract, MotoTenant, Kitnet, KitnetContract, KitnetTenant, Expense } from '../types';

interface UseSettingsManagerProps {
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  getNotificationContext: () => {
    motos: Moto[];
    motoContracts: MotoContract[];
    motoTenants: MotoTenant[];
    kitnets: Kitnet[];
    kitnetContracts: KitnetContract[];
    kitnetTenants: KitnetTenant[];
    expenses: Expense[];
  };
}

export function useSettingsManager({ addTimelineEvent, getNotificationContext }: UseSettingsManagerProps) {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const loaded = loadFromStorage('settings', initialSettings);
    return {
      ...initialSettings,
      ...loaded,
      adminName: 'Wigne Leal Xavier Macedo',
      adminCpf: '155.521.029-59',
      adminPixKey: 'wleal0131@gmail.com',
      adminPhone: '(47) 99123-4567',
      adminEmail: 'wleal0131@gmail.com',
      adminCity: loaded?.adminCity || 'Barra Velha',
      adminState: loaded?.adminState || 'Santa Catarina',
      adminCep: loaded?.adminCep || '88390-000',
      adminAddress:
        loaded?.adminAddress ||
        'Rua André Avelino Schmitt, 647, Itajubá, Barra Velha, Santa Catarina - CEP 88390-000',
      representativeName: 'Wigne Leal Xavier Macedo',
      representativeCpf: '155.521.029-59',
      representativeEmail: 'wleal0131@gmail.com',
      cityState: 'Barra Velha, Santa Catarina',
    };
  });

  useEffect(() => {
    saveToStorage('settings', settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addTimelineEvent({
      type: 'documento_atualizado',
      title: 'Configurações Atualizadas',
      description: 'Dados do proprietário/sistema foram atualizados.',
      entityType: 'sistema',
    });
  };

  const requestBrowserNotifications = async (): Promise<boolean> => {
    const res = await requestNotificationPermission();
    const isGranted = res === 'granted';
    updateSettings({ browserNotificationsEnabled: isGranted });
    if (isGranted) {
      const ctx = getNotificationContext();
      checkAndSendDueNotifications({
        ...ctx,
        contractEndAlertDays: settings.contractEndAlertDays || 60,
      });
    }
    return isGranted;
  };

  return {
    settings,
    setSettings,
    updateSettings,
    requestBrowserNotifications,
  };
}
