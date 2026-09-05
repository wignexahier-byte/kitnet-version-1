import { Moto, Kitnet, MotoContract, KitnetContract, MotoTenant, KitnetTenant, Expense } from '../types';
import { formatDate, formatCurrency } from './formatters';
import { safeLocalStorage, safeJsonParse } from './storage';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const defaultOptions: NotificationOptions = {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    };
    new Notification(title, defaultOptions);
    return true;
  } catch (e) {
    console.error('Error dispatching browser notification:', e);
    return false;
  }
}

export interface DueNotificationItem {
  id: string;
  type: 'parcela_moto' | 'aluguel_kitnet' | 'cnh' | 'ipva' | 'seguro' | 'despesa' | 'fim_contrato';
  title: string;
  body: string;
  urgency: 'alta' | 'media' | 'informativa';
  date: string;
}

export function checkAndSendDueNotifications(params: {
  motos: Moto[];
  motoContracts: MotoContract[];
  motoTenants: MotoTenant[];
  kitnets: Kitnet[];
  kitnetContracts: KitnetContract[];
  kitnetTenants: KitnetTenant[];
  expenses: Expense[];
  contractEndAlertDays?: number;
  silent?: boolean;
}): DueNotificationItem[] {
  const {
    motos,
    motoContracts,
    motoTenants,
    kitnets,
    kitnetContracts,
    kitnetTenants,
    expenses,
    contractEndAlertDays = 60,
    silent = false,
  } = params;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const items: DueNotificationItem[] = [];

  // 1. Installments due tomorrow or today
  motoContracts.forEach((c) => {
    if (c.status !== 'ativo') return;
    const moto = motos.find((m) => m.id === c.motoId);
    const tenant = motoTenants.find((t) => t.id === c.tenantId);

    c.installments.forEach((inst) => {
      if (inst.status === 'pendente') {
        if (inst.dueDate === tomorrowStr) {
          items.push({
            id: `notif-moto-due-${inst.id}`,
            type: 'parcela_moto',
            title: `Parcela Vence Amanhã: ${tenant?.fullName || 'Locatário'}`,
            body: `Parcela ${inst.number}/${c.durationMonths} da Moto ${moto?.model || ''} (${formatCurrency(inst.amount)}) vence amanhã (${formatDate(inst.dueDate)}).`,
            urgency: 'alta',
            date: inst.dueDate,
          });
        } else if (inst.dueDate === todayStr) {
          items.push({
            id: `notif-moto-today-${inst.id}`,
            type: 'parcela_moto',
            title: `Parcela Vence Hoje: ${tenant?.fullName || 'Locatário'}`,
            body: `Parcela ${inst.number}/${c.durationMonths} da Moto ${moto?.model || ''} (${formatCurrency(inst.amount)}) vence hoje!`,
            urgency: 'alta',
            date: inst.dueDate,
          });
        }
      }
    });
  });

  // 2. Kitnet rent due tomorrow or today
  kitnetContracts.forEach((c) => {
    if (c.status !== 'ativo') return;
    const kitnet = kitnets.find((k) => k.id === c.kitnetId);
    const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

    c.installments.forEach((inst) => {
      if (inst.status === 'pendente') {
        if (inst.dueDate === tomorrowStr) {
          items.push({
            id: `notif-kitnet-due-${inst.id}`,
            type: 'aluguel_kitnet',
            title: `Aluguel Vence Amanhã: ${tenant?.fullName || 'Inquilino'}`,
            body: `Aluguel da ${kitnet?.name || 'Kitnet'} (${formatCurrency(inst.amount)}) vence amanhã (${formatDate(inst.dueDate)}).`,
            urgency: 'alta',
            date: inst.dueDate,
          });
        } else if (inst.dueDate === todayStr) {
          items.push({
            id: `notif-kitnet-today-${inst.id}`,
            type: 'aluguel_kitnet',
            title: `Aluguel Vence Hoje: ${tenant?.fullName || 'Inquilino'}`,
            body: `Aluguel da ${kitnet?.name || 'Kitnet'} (${formatCurrency(inst.amount)}) vence hoje!`,
            urgency: 'alta',
            date: inst.dueDate,
          });
        }
      }
    });
  });

  // 3. Moto IPVA & Insurance Due dates
  motos.forEach((moto) => {
    if (moto.ipvaDueDate) {
      const diffDays = Math.ceil((new Date(moto.ipvaDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 15) {
        items.push({
          id: `notif-ipva-${moto.id}`,
          type: 'ipva',
          title: `IPVA Vencendo: ${moto.brand} ${moto.model}`,
          body: `IPVA da moto placa ${moto.plate} vence em ${diffDays} dias (${formatDate(moto.ipvaDueDate)}).`,
          urgency: diffDays <= 3 ? 'alta' : 'media',
          date: moto.ipvaDueDate,
        });
      }
    }
    if (moto.insuranceDueDate) {
      const diffDays = Math.ceil((new Date(moto.insuranceDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 15) {
        items.push({
          id: `notif-seguro-${moto.id}`,
          type: 'seguro',
          title: `Seguro Vencendo: ${moto.brand} ${moto.model}`,
          body: `Renovação de seguro da moto ${moto.plate} vence em ${diffDays} dias (${formatDate(moto.insuranceDueDate)}).`,
          urgency: diffDays <= 3 ? 'alta' : 'media',
          date: moto.insuranceDueDate,
        });
      }
    }
  });

  // 4. CNH Expiration check
  const activeMotoTenantIds = new Set(
    motoContracts.filter((c) => c.status === 'ativo').map((c) => c.tenantId)
  );
  motoTenants.forEach((t) => {
    if (activeMotoTenantIds.has(t.id) && t.cnh?.expirationDate) {
      const diffDays = Math.ceil((new Date(t.cnh.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 15) {
        items.push({
          id: `notif-cnh-${t.id}`,
          type: 'cnh',
          title: `CNH Vencendo: ${t.fullName}`,
          body: `A CNH do locatário ${t.fullName} vence em ${diffDays} dias (${formatDate(t.cnh.expirationDate)}).`,
          urgency: diffDays <= 5 ? 'alta' : 'media',
          date: t.cnh.expirationDate,
        });
      }
    }
  });

  // 5. Contract End Alert (60 days before contract completion)
  motoContracts.forEach((c) => {
    if (c.status === 'ativo') {
      const lastInst = c.installments[c.installments.length - 1];
      if (lastInst?.dueDate) {
        const diffDays = Math.ceil((new Date(lastInst.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= contractEndAlertDays) {
          const moto = motos.find((m) => m.id === c.motoId);
          const tenant = motoTenants.find((t) => t.id === c.tenantId);
          items.push({
            id: `notif-contract-end-${c.id}`,
            type: 'fim_contrato',
            title: `Contrato de Moto Terminando: ${moto?.model || ''}`,
            body: `Faltam ${diffDays} dias para completar os ${c.durationMonths} meses do contrato com ${tenant?.fullName || 'Locatário'}.`,
            urgency: diffDays <= 30 ? 'alta' : 'media',
            date: lastInst.dueDate,
          });
        }
      }
    }
  });

  // Dispatch browser notifications if granted and not silent
  if (!silent && isNotificationSupported() && Notification.permission === 'granted') {
    const lastNotifKey = 'gp_last_notified_dates';
    const rawStored = safeLocalStorage.getItem(lastNotifKey);
    const notifiedMap: Record<string, string> = safeJsonParse(rawStored, {});

    items.forEach((item) => {
      // Send at most once per day per alert
      if (notifiedMap[item.id] !== todayStr) {
        sendBrowserNotification(item.title, {
          body: item.body,
          tag: item.id,
        });
        notifiedMap[item.id] = todayStr;
      }
    });

    safeLocalStorage.setItem(lastNotifKey, JSON.stringify(notifiedMap));
  }

  return items;
}
