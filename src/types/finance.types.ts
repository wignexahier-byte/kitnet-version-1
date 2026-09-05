export type ExpenseCategory =
  | 'internet'
  | 'agua'
  | 'energia'
  | 'iptu'
  | 'reforma'
  | 'reparo'
  | 'seguro'
  | 'manutencao_moto'
  | 'outros';

export type ExpenseRecurrence = 'nenhuma' | 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface Expense {
  id: string;
  isDemo?: boolean;
  title: string;
  category: ExpenseCategory;
  targetType: 'geral' | 'moto' | 'kitnet';
  targetId?: string;
  amount: number;
  dueDate: string;
  date?: string;
  paidDate?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  recurrence: ExpenseRecurrence;
  receiptUrl?: string;
  notes?: string;
}

export interface FinancialMetric {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalPending: number;
  totalOverdue: number;
  occupancyRate: number;
  collectionRate: number;
}
