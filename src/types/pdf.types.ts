import { Moto, MotoContract, MotoTenant } from './moto.types';
import { Kitnet, KitnetContract, KitnetTenant } from './kitnet.types';
import { SystemSettings, Installment } from './global.types';

export interface BasePdfOptions {
  settings: SystemSettings;
  autoDownload?: boolean;
  contractCity?: string;
  signatureDate?: string;
}

export interface MotoRentalContractPdfOptions extends BasePdfOptions {
  moto: Moto;
  tenant: MotoTenant;
  contract?: MotoContract;
  startDate?: string;
  minimumMonths?: number;
  endDateMin?: string;
  weeklyValue?: number;
  dueDayOfWeek?: number | string;
  dueLimitTime?: string;
  deposit?: number;
  insuranceDeductible?: string | number;
  initialKm?: number;
  inspectionDate?: string;
  inspectionTime?: string;
}

export interface KitnetRentalContractPdfOptions extends BasePdfOptions {
  kitnet: Kitnet;
  tenant: KitnetTenant;
  contract: KitnetContract;
}

export interface ReceiptPdfOptions extends BasePdfOptions {
  tenantName: string;
  tenantCpf: string;
  amount: number;
  description: string;
  referenceDate: string;
  paymentMethod?: string;
  categoryName: string;
  installment?: Installment;
}

export interface NoticePdfOptions extends BasePdfOptions {
  tenantName: string;
  tenantCpf: string;
  tenantAddress?: string;
  debtAmount: number;
  daysOverdue: number;
  itemDescription: string; // Ex: Moto Honda CG 160 Fan (ABC-1234)
  noticeType: 'cobranca' | 'notificacao_extrajudicial' | 'distrato';
  issueDate?: string;
  limitDate?: string;
  notes?: string;
}
