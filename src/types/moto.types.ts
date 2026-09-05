import {
  ApprovalStatus,
  ClientOccurrence,
  DepositStatus,
  Installment,
  RentAdjustment,
} from './global.types';

export type MotoStatus = 'disponivel' | 'alugada' | 'manutencao' | 'encerrada';

export interface MotoDamage {
  id: string;
  description: string;
  photoUrl?: string;
  date: string;
}

export type MaintenanceType =
  | 'troca_oleo'
  | 'pneu_dianteiro'
  | 'pneu_traseiro'
  | 'relacao_kit'
  | 'freio_pastilha'
  | 'revisao_geral'
  | 'eletrica'
  | 'bateria'
  | 'cabos_velas'
  | 'outro';

export interface MotoMaintenance {
  id: string;
  motoId: string;
  date: string;
  km: number;
  type: MaintenanceType;
  serviceType?: string;
  description: string;
  cost: number;
  performedBy?: string;
  mechanicOrShop?: string;
  nextDueKm?: number;
  nextDueDate?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface KmLog {
  id: string;
  date: string;
  km: number;
  photoUrl?: string;
  notes?: string;
}

export interface MotoDelivery {
  date: string;
  initialKm: number;
  photos: string[];
  stateNotes: string;
  clientConfirmed: boolean;
  adminSignature?: string;
  clientSignature?: string;
}

export interface Moto {
  id: string;
  isDemo?: boolean;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  renavam: string;
  chassi: string;
  purchaseDate: string;
  purchasePrice: number;
  currentKm: number;
  status: MotoStatus;
  statusNote?: string;
  notes?: string;
  ipvaDueDate?: string;
  insuranceDueDate?: string;
  insuranceCompany?: string;
  insuranceDeductible?: string | number;
  documents: {
    crlv?: string;
    notaFiscal?: string;
    seguro?: string;
    outros?: string[];
  };
  photos: {
    front?: string;
    rear?: string;
    right?: string;
    left?: string;
    dashboard?: string;
    damages?: MotoDamage[];
  };
  delivery?: MotoDelivery;
  returnInspection?: {
    date: string;
    finalKm: number;
    photos: string[];
    stateNotes: string;
    damagesFound?: MotoDamage[];
    adminSignature?: string;
    clientSignature?: string;
  };
  kmLogs: KmLog[];
  maintenances?: MotoMaintenance[];
}

export interface MotoTenant {
  id: string;
  isDemo?: boolean;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phone: string;
  whatsapp: string;
  email: string;
  photoUrl?: string;
  address: string;
  profession: string;
  company: string;
  income: number;
  cnh: {
    number: string;
    category: string;
    expirationDate: string;
  };
  documents: {
    photo?: string;
    cnhFront?: string;
    cnhBack?: string;
    proofOfAddress?: string;
    proofOfIncome?: string;
    bankStatement?: string;
    others?: string[];
  };
  approvalChecklist: {
    cnhValid: boolean;
    docsChecked: boolean;
    addressValidated: boolean;
    incomeAnalyzed: boolean;
    depositReceived: boolean;
    contractSigned: boolean;
    result: ApprovalStatus;
    cpfValidationLog?: string;
    notes?: string;
  };
  occurrences?: ClientOccurrence[];
}

export interface MotoContract {
  id: string;
  isDemo?: boolean;
  motoId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  durationMonths: 24 | 36;
  paymentFrequency?: 'mensal' | 'semanal';
  monthlyValue: number;
  weeklyValue?: number;
  dueDay: number;
  dueDayOfWeek?: number;
  deposit: number;
  depositStatus?: DepositStatus;
  insuranceDeductible?: string;
  notes?: string;
  status: 'ativo' | 'concluido' | 'cancelado' | 'encerrado';
  installments: Installment[];
  totalAgreedValue: number;
  firstInstallmentProportional?: boolean;
  firstInstallmentDays?: number;
  rentAdjustments?: RentAdjustment[];
  adjustments?: RentAdjustment[];
  adminSignature?: string;
  clientSignature?: string;
  signedAt?: string;
}

export interface MotoContractCreationParams extends Omit<MotoContract, 'id' | 'installments'> {
  firstPaymentReceived?: boolean;
  firstPaymentPaidDate?: string;
  firstPaymentMethod?: string;
  firstPaymentNotes?: string;
}
