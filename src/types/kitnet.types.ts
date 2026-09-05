import {
  ClientOccurrence,
  DepositStatus,
  IncomeType,
  Installment,
  RentAdjustment,
} from './global.types';

export type KitnetStatus = 'disponivel' | 'alugada' | 'reforma';

export interface KitnetInspection {
  date: string;
  photos: string[];
  stateNotes: string;
  adminSignature?: string;
  clientSignature?: string;
  itemsState: {
    pintura: 'otimo' | 'bom' | 'regular' | 'reparar';
    eletrica: 'otimo' | 'bom' | 'regular' | 'reparar';
    hidraulica: 'otimo' | 'bom' | 'regular' | 'reparar';
    portasJanelas: 'otimo' | 'bom' | 'regular' | 'reparar';
    banheiro: 'otimo' | 'bom' | 'regular' | 'reparar';
    cozinha: 'otimo' | 'bom' | 'regular' | 'reparar';
  };
}

export interface Kitnet {
  id: string;
  isDemo?: boolean;
  name: string;
  number: string;
  address: string;
  description?: string;
  notes?: string;
  statusNote?: string;
  status: KitnetStatus;
  monthlyRentBase: number;
  monthlyWaterBase: number;
  monthlyInternetBase?: number;
  otherFeesBase?: number;
  depositBase?: number;
  cleaningFeeBase?: number;
  photos: {
    livingRoom?: string;
    bedroom?: string;
    bathroom?: string;
    kitchen?: string;
    outdoor?: string;
    installations?: string;
    general?: string[];
    delivery?: string[];
  };
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    date: string;
  }[];
  entryInspection?: KitnetInspection;
  exitInspection?: KitnetInspection;
}

export interface KitnetTenant {
  id: string;
  isDemo?: boolean;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phone: string;
  whatsapp?: string;
  email: string;
  photoUrl?: string;
  address: string;
  maritalStatus: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  profession?: string;
  incomeType: IncomeType;
  cltDetails?: {
    company: string;
    role: string;
    salary: number;
    tenureMonths: number;
  };
  autonomoDetails?: {
    profession: string;
    avgIncome: number;
  };
  empresarioDetails?: {
    company: string;
    cnpj: string;
    activityYears: number;
  };
  documents: {
    photo?: string;
    proofOfIncome?: string;
    paystub?: string;
    bankStatement?: string;
    proofOfAddress?: string;
    socialContract?: string;
    others?: string[];
  };
  occurrences?: ClientOccurrence[];
}

export interface KitnetContract {
  id: string;
  isDemo?: boolean;
  kitnetId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  signatureDate?: string;
  durationMonths: number;
  rentValue: number;
  waterValue: number;
  internetValue?: number;
  otherFees?: number;
  deposit: number;
  depositStatus?: DepositStatus;
  cleaningFee?: number;
  dueDay: number;
  paymentMethod?: string;
  pixKey?: string;
  status: 'ativo' | 'concluido' | 'cancelado' | 'encerrado';
  installments: Installment[];
  rentAdjustments?: RentAdjustment[];
  adjustments?: RentAdjustment[];
  notes?: string;
  contractPdfUrl?: string;
  contractDocumentId?: string;
  adminSignature?: string;
  clientSignature?: string;
  signedAt?: string;
}

export interface KitnetContractCreationParams extends Omit<KitnetContract, 'id' | 'installments'> {
  firstPaymentReceived?: boolean;
  firstPaymentPaidDate?: string;
  firstPaymentMethod?: string;
  firstPaymentNotes?: string;
}
