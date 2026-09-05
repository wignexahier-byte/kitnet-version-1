/**
 * FinancialService - Unificação e Fachada Central de Cálculos Financeiros
 * 
 * Fonte Única da Verdade para:
 * - Cálculos e consolidação de receitas, despesas, fluxo de caixa e DRE
 * - Regras de contratos, cronogramas e parcelas
 * - Matemática financeira com precisão em centavos
 */

export { DashboardService } from './DashboardService';
export type {
  ConsolidatedFinancialMetrics,
  DashboardAlertItem,
  MonthlyEvolutionPoint,
} from './DashboardService';

export * from '../domain';

