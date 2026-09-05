import { FinancialMetric } from './finance.types';

export interface DashboardSummary {
  motosCount: {
    total: number;
    alugadas: number;
    disponiveis: number;
    manutencao: number;
  };
  kitnetsCount: {
    total: number;
    alugadas: number;
    disponiveis: number;
    reforma: number;
  };
  financial: FinancialMetric;
  urgentAlertsCount: number;
}

export interface OperationalAlert {
  id: string;
  type: 'cobranca' | 'manutencao' | 'contrato' | 'ipva' | 'seguro' | 'vistoria';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityId?: string;
  entityType?: 'moto' | 'kitnet' | 'tenant';
  actionLabel?: string;
  dueDate?: string;
}
