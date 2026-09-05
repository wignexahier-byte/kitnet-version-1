import { MotoContract, KitnetContract, Installment } from '../../types';

export interface BillingItem {
  id: string; // unique key: `${assetType}-${contractId}-${installmentId}`
  contractId: string;
  installmentId: string;
  assetType: 'moto' | 'kitnet';
  assetName: string;
  assetDetails: string;
  clientName: string;
  clientPhone: string;
  clientCpf: string;
  tenantId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  status: 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia';
  daysOverdue: number;
  fineAmount: number;
  interestAmount: number;
  totalDueWithCharges: number;
  paidCount: number;
  pendingCount: number;
  paidAmount: number;
  remainingAmount: number;
  progressPercent: number;
  progressVisual: string;
  rawContract: MotoContract | KitnetContract;
  rawInstallment: Installment;
}
