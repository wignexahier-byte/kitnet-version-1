import { LucideIcon } from 'lucide-react';

export interface UnifiedClient {
  id: string;
  type: 'kitnet' | 'moto';
  tenantId: string;
  fullName: string;
  cpf: string;
  rg?: string;
  phone?: string;
  address?: string;
  assetLabel: string;
  assetDescription: string;
  deposit: number;
  rentOrMonthlyValue: number;
  monthlyValue: number;
  weeklyValue?: number;
  waterValue?: number;
  durationMonths?: number;
  totalAgreedValue?: number;
  paymentFrequency?: 'mensal' | 'semanal';
  insuranceDeductible?: string;
  contractId?: string;
  contractStartDate?: string;
  dueDay?: number;
  dueDayOfWeek?: number;
  initialKm?: number;
  plate?: string;
  brand?: string;
  model?: string;
  renavam?: string;
}

export interface DocumentTypeItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
  desc: string;
}
