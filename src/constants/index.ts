import { SystemSettings, TabType } from '../types';
import { initialSettings } from '../utils/initialData';

export const DEFAULT_SETTINGS: SystemSettings = {
  ...initialSettings,
  adminName: 'Wigne Leal Xavier Macedo',
  adminCpf: '155.521.029-59',
  adminPixKey: 'wleal0131@gmail.com',
  adminPhone: '(47) 99123-4567',
  adminEmail: 'wleal0131@gmail.com',
  adminCity: 'Barra Velha',
  adminState: 'Santa Catarina',
  adminCep: '88390-000',
  adminAddress: 'Rua André Avelino Schmitt, 647, Itajubá, Barra Velha, Santa Catarina - CEP 88390-000',
  representativeName: 'Wigne Leal Xavier Macedo',
  representativeCpf: '155.521.029-59',
  representativeEmail: 'wleal0131@gmail.com',
  cityState: 'Barra Velha, Santa Catarina',
};

export const NAVIGATION_TABS: Array<{ id: TabType; label: string; iconName: string }> = [
  { id: 'dashboard', label: 'Visão Geral', iconName: 'LayoutDashboard' },
  { id: 'cobrancas', label: 'Cobranças', iconName: 'Banknote' },
  { id: 'motos', label: 'Motos', iconName: 'Motorbike' },
  { id: 'kitnets', label: 'Kitnets', iconName: 'Home' },
  { id: 'clientes', label: 'Inquilinos', iconName: 'Users' },
  { id: 'calendario', label: 'Calendário', iconName: 'Calendar' },
  { id: 'financeiro', label: 'Financeiro', iconName: 'DollarSign' },
  { id: 'relatorios', label: 'Relatórios', iconName: 'FileText' },
  { id: 'documentos', label: 'Documentos', iconName: 'FileCheck' },
  { id: 'configuracoes', label: 'Configurações', iconName: 'Settings' },
];

export const STORAGE_KEYS = {
  PREFIX: 'gestao_patrimonial_',
  SETTINGS: 'settings',
  MOTOS: 'motos',
  MOTO_TENANTS: 'motoTenants',
  MOTO_CONTRACTS: 'motoContracts',
  KITNETS: 'kitnets',
  KITNET_TENANTS: 'kitnetTenants',
  KITNET_CONTRACTS: 'kitnetContracts',
  EXPENSES: 'expenses',
  TIMELINE: 'timeline',
  DOCUMENTS: 'documents',
  GOOGLE_SESSION: 'google_session',
} as const;
