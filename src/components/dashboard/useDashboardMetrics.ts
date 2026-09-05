import { useMemo } from 'react';
import {
  Moto,
  MotoTenant,
  MotoContract,
  Kitnet,
  KitnetContract,
  KitnetTenant,
  Expense,
  SystemSettings,
} from '../../types';
import { DashboardService } from '../../services/DashboardService';

interface UseDashboardMetricsProps {
  motos: Moto[];
  motoTenants: MotoTenant[];
  motoContracts: MotoContract[];
  kitnets: Kitnet[];
  kitnetContracts: KitnetContract[];
  kitnetTenants: KitnetTenant[];
  expenses: Expense[];
  settings: SystemSettings;
}

export function useDashboardMetrics({
  motos,
  motoTenants,
  motoContracts,
  kitnets,
  kitnetContracts,
  kitnetTenants,
  expenses,
  settings,
}: UseDashboardMetricsProps) {
  // Métricas Consolidadas via DashboardService (Fonte Única da Verdade)
  const consolidated = useMemo(() => {
    return DashboardService.calculateConsolidatedMetrics(
      motos,
      kitnets,
      motoContracts,
      kitnetContracts,
      expenses
    );
  }, [motos, kitnets, motoContracts, kitnetContracts, expenses]);

  // Parcela mais urgente em atraso
  const mostUrgentOverdue = useMemo(() => {
    return DashboardService.getMostUrgentOverdue(motoContracts, kitnetContracts);
  }, [motoContracts, kitnetContracts]);

  // Alertas Inteligentes
  const alertItems = useMemo(() => {
    return DashboardService.getDashboardAlerts(
      motos,
      motoTenants,
      motoContracts,
      kitnetTenants,
      kitnetContracts,
      settings
    );
  }, [motos, motoTenants, motoContracts, kitnetTenants, kitnetContracts, settings]);

  // Dados para Gráficos
  const revenueExpenseData = useMemo(
    () => [
      {
        name: 'Motos',
        receita: consolidated.receitaMesAtualMotos > 0 ? consolidated.receitaMesAtualMotos : consolidated.faturamentoMensalMotos,
        despesa: consolidated.despesasMotos,
      },
      {
        name: 'Kitnets',
        receita: consolidated.receitaMesAtualKitnets > 0 ? consolidated.receitaMesAtualKitnets : consolidated.faturamentoMensalKitnets,
        despesa: consolidated.despesasKitnets,
      },
    ],
    [
      consolidated.receitaMesAtualMotos,
      consolidated.faturamentoMensalMotos,
      consolidated.despesasMotos,
      consolidated.receitaMesAtualKitnets,
      consolidated.faturamentoMensalKitnets,
      consolidated.despesasKitnets,
    ]
  );

  const monthlyEvolutionData = useMemo(() => {
    return DashboardService.getMonthlyEvolution(
      motoContracts,
      kitnetContracts,
      expenses,
      6
    );
  }, [motoContracts, kitnetContracts, expenses]);

  return {
    ...consolidated,
    mostUrgentOverdue,
    alertItems,
    revenueExpenseData,
    monthlyEvolutionData,
  };
}
