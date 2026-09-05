export type TabType =
  | 'dashboard'
  | 'cobrancas'
  | 'motos'
  | 'kitnets'
  | 'clientes'
  | 'calendario'
  | 'financeiro'
  | 'relatorios'
  | 'documentos'
  | 'configuracoes';

export type InstallmentStatus = 'pago' | 'pendente' | 'atrasado' | 'cancelada';
export type ApprovalStatus = 'aprovado' | 'em_analise' | 'reprovado';
export type IncomeType = 'CLT' | 'autonomo' | 'empresario' | 'aposentado';
export type DepositStatus = 'retida' | 'devolvida' | 'a_definir';

export interface GoogleAuthSession {
  email: string;
  name?: string;
  picture?: string;
  authenticatedAt: string;
  expiresAt: string;
}

export interface Installment {
  id: string;
  number: number;
  totalInstallments: number;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: InstallmentStatus;
  receiptUrl?: string;
  notes?: string;
  paymentMethod?: string;
  isPartial?: boolean;
  partialDays?: number;
}

export interface ClientOccurrence {
  id: string;
  clientId: string; // tenantId
  clientType: 'moto' | 'kitnet';
  date: string;
  title: string;
  description: string;
  category: 'contrato' | 'entrega' | 'pagamento' | 'atraso' | 'negociacao' | 'vistoria' | 'sinistro' | 'documento' | 'outros';
  attachments?: {
    id: string;
    name: string;
    type: 'image' | 'pdf' | 'audio' | 'nota';
    url: string;
  }[];
}

export interface RentAdjustment {
  id: string;
  date: string;
  appliedAt?: string;
  previousValue: number;
  newValue: number;
  percentage?: number;
  reason?: string;
  effectiveFromInstallment?: number;
}

export interface SystemSettings {
  adminName: string;
  companyName?: string;
  primaryOwnerName?: string;
  adminCpf: string;
  adminPixKey: string;
  adminPixType?: string;
  adminBankName?: string;
  adminAgency?: string;
  adminAccount?: string;
  adminPhone: string;
  adminEmail: string;
  adminAddress: string;
  adminCity?: string;
  adminState?: string;
  adminCep?: string;
  pinCode: string;
  biometricsEnabled: boolean;
  autoBackupDays: number;
  lastBackupDate?: string;
  adminSignature?: string;
  representativeName?: string;
  representativeCpf?: string;
  representativeEmail?: string;
  cityState?: string;
  cleaningFee?: number;
  contractEndAlertDays?: number;
  isReadOnlyMode?: boolean;
  browserNotificationsEnabled?: boolean;
}

export interface ClientScore {
  score: number; // 0 a 100
  classification: 'excelente' | 'medio' | 'alto_risco';
  factors: {
    punctuality: number; // 0-40
    longevity: number; // 0-25
    documentation: number; // 0-20
    occurrencesPenalty: number; // -X
  };
  summary: string;
}

export interface TimelineEvent {
  id: string;
  isDemo?: boolean;
  timestamp: string;
  type: 'contrato_criado' | 'moto_entregue' | 'pagamento_recebido' | 'documento_atualizado' | 'vistoria' | 'km_atualizado' | 'despesa_paga' | 'alerta' | 'ocorrencia_cliente' | 'manutencao';
  title: string;
  description: string;
  entityType: 'moto' | 'kitnet' | 'financeiro' | 'sistema' | 'cliente';
  entityId?: string;
}
