import {
  Moto,
  MotoTenant,
  MotoContract,
  MotoContractCreationParams,
  Kitnet,
  KitnetTenant,
  KitnetContract,
  KitnetContractCreationParams,
  Expense,
  TimelineEvent,
  DocumentItem,
  SystemSettings,
  MotoDelivery,
  KitnetInspection,
  GoogleAuthSession,
  MotoMaintenance,
} from '../types';

export interface AppContextType {
  // Auth & Lock & Read Only
  isAuthenticated: boolean;
  isLocked: boolean;
  isDisconnecting: boolean;
  isLogoutDisconnect: boolean;
  completeDisconnect: () => void;
  isReadOnlyMode: boolean;
  toggleReadOnlyMode: (pin?: string) => boolean;
  googleSession: GoogleAuthSession | null;
  hasValidGoogleSession: boolean;
  loginWithGoogle: (email: string, name?: string, picture?: string) => { success: boolean; error?: string };
  loginWithPin: (pin: string) => boolean;
  loginWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  logout: () => void;
  clearGoogleSession: () => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  requestBrowserNotifications: () => Promise<boolean>;

  // Motos
  motos: Moto[];
  motoTenants: MotoTenant[];
  motoContracts: MotoContract[];
  addMoto: (moto: Omit<Moto, 'id' | 'kmLogs'>) => string;
  duplicateMoto: (motoId: string) => string;
  updateMoto: (id: string, updates: Partial<Moto>) => void;
  deleteMoto: (id: string) => void;
  addKmLog: (motoId: string, km: number, notes?: string, photoUrl?: string) => void;
  recordMotoDelivery: (motoId: string, delivery: MotoDelivery) => void;
  addMotoMaintenance: (motoId: string, maintenance: Omit<MotoMaintenance, 'id' | 'motoId'>) => void;
  deleteMotoMaintenance: (motoId: string, maintenanceId: string) => void;
  addMotoTenant: (tenant: Omit<MotoTenant, 'id'>) => string;
  updateMotoTenant: (id: string, updates: Partial<MotoTenant>) => void;
  createMotoContract: (contract: MotoContractCreationParams) => string;
  updateMotoContract: (id: string, updates: Partial<MotoContract>) => void;
  adjustMotoContractRent: (contractId: string, newValue: number, reason: string, effectiveFromInstallment?: number) => void;
  renewMotoContract: (contractId: string, additionalMonths: number, newRentValue?: number, reason?: string) => void;
  payMotoInstallment: (contractId: string, installmentId: string, notes?: string, receiptUrl?: string, paymentMethod?: string) => void;
  terminateMotoContract: (contractId: string, finalKm?: number, finalNotes?: string) => void;

  // Kitnets
  kitnets: Kitnet[];
  kitnetTenants: KitnetTenant[];
  kitnetContracts: KitnetContract[];
  addKitnet: (kitnet: Omit<Kitnet, 'id'>) => string;
  duplicateKitnet: (kitnetId: string) => string;
  updateKitnet: (id: string, updates: Partial<Kitnet>) => void;
  deleteKitnet: (id: string) => void;
  recordKitnetInspection: (kitnetId: string, inspection: KitnetInspection) => void;
  addKitnetTenant: (tenant: Omit<KitnetTenant, 'id'>) => string;
  updateKitnetTenant: (id: string, updates: Partial<KitnetTenant>) => void;
  createKitnetContract: (contract: KitnetContractCreationParams) => string;
  adjustKitnetContractRent: (contractId: string, newValue: number, reason: string, effectiveFromInstallment?: number) => void;
  renewKitnetContract: (contractId: string, additionalMonths: number, newRentValue?: number, reason?: string) => void;
  payKitnetInstallment: (contractId: string, installmentId: string, notes?: string, receiptUrl?: string, paymentMethod?: string) => void;
  terminateKitnetContract: (contractId: string, newKitnetStatus?: 'disponivel' | 'reforma', finalNotes?: string) => void;

  // Expenses & Finance
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  payExpense: (id: string, receiptUrl?: string) => void;
  deleteExpense: (id: string) => void;

  // Timeline & Documents
  timeline: TimelineEvent[];
  documents: DocumentItem[];
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  clearTimeline: () => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'date'>) => void;
  deleteDocument: (id: string) => void;
  saveSignature: (key: string, signature: string) => void;

  // Backup & Restore
  exportBackup: () => void;
  importBackup: (jsonString: string) => boolean;
  resetToDefaults: () => void;

  // Demo Data & Real Data Isolation
  hasRealData: boolean;
  isDemoMode: boolean;
  toggleDemoMode: (enable?: boolean) => boolean;
  clearDemoDataAndStartFresh: () => void;
  loadDemoData: () => void;

  // Storage Health & Quota
  storageHealthWarning: boolean;
  setStorageHealthWarning: (warning: boolean) => void;
}
