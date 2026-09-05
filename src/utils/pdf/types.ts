import { Moto, MotoContract, MotoTenant, Kitnet, KitnetContract, KitnetTenant, Installment, SystemSettings } from '../../types';

export type DocumentType =
  | 'contrato_moto'
  | 'contrato_locacao_moto_completo'
  | 'contrato_kitnet'
  | 'termo_entrega_moto'
  | 'termo_vistoria_kitnet'
  | 'recibo_pagamento'
  | 'recibo_caucao'
  | 'notificacao_cobranca'
  | 'termo_rescisao'
  | 'termo_encerramento'
  | 'declaracao_quitacao'
  | 'termo_quitacao';

export interface DocumentData {
  type: DocumentType;
  title: string;
  clientType?: 'kitnet' | 'moto';
  assetLabel?: string;
  assetDescription?: string;
  durationMonths?: number;
  moto?: Moto;
  motoContract?: MotoContract;
  motoTenant?: MotoTenant;
  kitnet?: Kitnet;
  kitnetContract?: KitnetContract;
  kitnetTenant?: KitnetTenant;
  installment?: Installment;
  settings: SystemSettings;
  customDate?: string;
  customDaysLate?: number;
  closureNotes?: string;
  tenantSignature?: string;
  ownerSignature?: string;
  isMonochrome?: boolean;
  customAmount?: number;
  customPaymentFrequency?: 'mensal' | 'semanal';
  customMonthlyValue?: number;
  customWeeklyValue?: number;
  customDueDay?: number;
  customDueDayOfWeek?: string;
  customDueLimitTime?: string;
  customDeposit?: number;
  customTenantName?: string;
  customTenantCpf?: string;
  customTenantAddress?: string;
  customTenantPhone?: string;
  customStartDate?: string;
  customInitialKm?: number;
  customCleaningFee?: number;
  customRepairs?: number;
  customRefundAmount?: number;
  customInsuranceDeductible?: string;
  customContractCity?: string;
  // Witness configuration
  witnessesCount?: number;
  witness1Name?: string;
  witness1Cpf?: string;
  witness2Name?: string;
  witness2Cpf?: string;
}

export interface MotoRentalContractPdfOptions {
  moto: Moto;
  tenant: MotoTenant;
  contract?: MotoContract;
  settings: SystemSettings;
  startDate?: string;
  minimumMonths?: number;
  endDateMin?: string;
  paymentFrequency?: 'mensal' | 'semanal';
  monthlyValue?: number;
  weeklyValue?: number;
  dueDay?: number;
  dueDayOfWeek?: number | string;
  dueLimitTime?: string;
  deposit?: number;
  insuranceDeductible?: number | string;
  contractCity?: string;
  initialKm?: number;
  inspectionDate?: string;
  inspectionTime?: string;
  tenantSignature?: string;
  ownerSignature?: string;
  autoDownload?: boolean;
  // Witness configuration
  witnessesCount?: number;
  witness1Name?: string;
  witness1Cpf?: string;
  witness2Name?: string;
  witness2Cpf?: string;
}
