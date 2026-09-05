/**
 * DashboardService - Serviço Centralizado de Cálculos Financeiros e Métricas ERP
 * 
 * Fonte Única da Verdade para:
 * - Dashboard Principal (KPIs, Gráficos, Alertas, DRE, Comparativos)
 * - FinanceiroView (Fluxo de Caixa, Despesas, Receitas)
 * - CobrançasView (Inadimplência, Parcelas em Atraso, Contatos)
 * - Painel de Gestão Patrimonial (Valuation, ROI, Frota, Imóveis)
 * - Exportações Excel/CSV e Relatórios
 */

import {
  Moto,
  MotoTenant,
  MotoContract,
  Kitnet,
  KitnetContract,
  KitnetTenant,
  Expense,
  SystemSettings,
  Installment,
} from '../types';
import {
  roundCurrency,
  safeAdd,
  safeSub,
  safeMul,
  safeDiv,
  getDaysDifference,
  WEEKS_PER_MONTH,
  getKitnetMonthlyTotal,
  getMotoMonthlyTotal,
  calculateOccupancyRate,
  calculateYield,
  calculateAnnualROI,
  calculateProfitMargin,
  calculateDefaultRate,
  today,
  parseDate,
  getMonthKey,
  daysBetweenDates,
  isInstallmentOverdue,
} from '../domain';
import { getCNHStatus } from '../utils/formatters';

export interface ConsolidatedFinancialMetrics {
  // Quantitativos
  totalMotos: number;
  motosAlugadas: number;
  motosDisponiveis: number;
  motosManutencao: number;
  taxaOcupacaoMotos: number;

  totalKitnets: number;
  kitnetsAlugadas: number;
  kitnetsDisponiveis: number;
  kitnetsManutencao: number;
  taxaOcupacaoKitnets: number;

  totalContratosAtivos: number;

  // Valuation e Investimento
  valorInvestidoMotos: number;
  valorInvestidoKitnets: number;
  patrimonioTotalAvaliado: number;

  // Receitas Recorrentes (Run-Rate Mensal)
  faturamentoMensalMotos: number;
  faturamentoMensalKitnets: number;
  faturamentoBrutoMensal: number;
  receitaAnualProjetada: number;

  // Receitas Efetivamente Recebidas
  receitaRecebidaMotos: number;
  receitaRecebidaKitnets: number;
  totalReceitaRecebida: number;

  // Receita Recebida no Mês Atual (Competência/Caixa)
  receitaMesAtualMotos: number;
  receitaMesAtualKitnets: number;
  receitaMesAtualTotal: number;

  // Inadimplência & Valores em Atraso
  inadimplenciaMotos: number;
  inadimplenciaKitnets: number;
  totalInadimplenciaGeral: number;
  inadimplenciaPctMotos: number;
  inadimplenciaPctKitnets: number;

  // Valores Pendentes a Vencer
  aReceberMotos: number;
  aReceberKitnets: number;
  totalAReceber: number;

  // Despesas Operacionais (Mês Atual)
  despesasMotos: number;
  despesasKitnets: number;
  totalDespesas: number;

  // DRE & Margem Operacional
  lucroLiquidoMensal: number;
  margemLucro: number;

  // Rentabilidade & Yield
  yieldMotos: number;
  yieldKitnets: number;
  roiAnualMotos: number;
  roiAnualKitnets: number;

  // Cauções sob custódia
  caucoesRetidasMotos: number;
  caucoesRetidasKitnets: number;
  totalCaucoesRetidas: number;
}

export interface DashboardAlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category?: 'moto' | 'kitnet';
  text: string;
  subtext: string;
  contractId?: string;
  installmentId?: string;
}

export interface MonthlyEvolutionPoint {
  mes: string;
  receita: number;
  despesa: number;
  lucro: number;
}

export class DashboardService {
  /**
   * Calcula todas as métricas consolidadas com precisão em centavos
   */
  public static calculateConsolidatedMetrics(
    motos: Moto[],
    kitnets: Kitnet[],
    motoContracts: MotoContract[],
    kitnetContracts: KitnetContract[],
    expenses: Expense[],
    currentYearMonth?: string // Ex: "2026-08"
  ): ConsolidatedFinancialMetrics {
    const targetYM = currentYearMonth || getMonthKey(today());

    // --- MOTOS QUANTITATIVOS ---
    const totalMotos = motos.length;
    const motosAlugadas = motos.filter((m) => m.status === 'alugada').length;
    const motosDisponiveis = motos.filter((m) => m.status === 'disponivel').length;
    const motosManutencao = motos.filter((m) => m.status === 'manutencao').length;
    const taxaOcupacaoMotos = calculateOccupancyRate(motosAlugadas, totalMotos);

    const valorInvestidoMotos = motos.reduce((acc, m) => safeAdd(acc, m.purchasePrice || 0), 0);

    // --- KITNETS QUANTITATIVOS ---
    const totalKitnets = kitnets.length;
    const kitnetsAlugadas = kitnets.filter((k) => k.status === 'alugada').length;
    const kitnetsDisponiveis = kitnets.filter((k) => k.status === 'disponivel').length;
    const kitnetsManutencao = kitnets.filter((k) => k.status === 'reforma').length;
    const taxaOcupacaoKitnets = calculateOccupancyRate(kitnetsAlugadas, totalKitnets);

    // Patrimônio real (valor de compra das motos da frota)
    const patrimonioTotalAvaliado = valorInvestidoMotos;
    const valorInvestidoKitnets = 0;
    const totalContratosAtivos = motosAlugadas + kitnetsAlugadas;

    // --- MOTOS FINANCEIRO ---
    let faturamentoMensalMotos = 0;
    let receitaRecebidaMotos = 0;
    let receitaMesAtualMotos = 0;
    let inadimplenciaMotos = 0;
    let aReceberMotos = 0;
    let caucoesRetidasMotos = 0;

    motoContracts.forEach((c) => {
      if (c.deposit && c.depositStatus !== 'devolvida') {
        caucoesRetidasMotos = safeAdd(caucoesRetidasMotos, c.deposit);
      }

      if (c.status === 'ativo') {
        const monthly = getMotoMonthlyTotal(c);
        faturamentoMensalMotos = safeAdd(faturamentoMensalMotos, monthly);
      }

      c.installments.forEach((i) => {
        if (i.status === 'pago') {
          receitaRecebidaMotos = safeAdd(receitaRecebidaMotos, i.amount);
          const payDate = i.paidDate || i.dueDate;
          if (payDate && payDate.startsWith(targetYM)) {
            receitaMesAtualMotos = safeAdd(receitaMesAtualMotos, i.amount);
          }
        } else if (i.status === 'pendente') {
          if (isInstallmentOverdue(i)) {
            inadimplenciaMotos = safeAdd(inadimplenciaMotos, i.amount);
          } else {
            aReceberMotos = safeAdd(aReceberMotos, i.amount);
          }
        }
      });
    });

    // --- KITNETS FINANCEIRO ---
    let faturamentoMensalKitnets = 0;
    let receitaRecebidaKitnets = 0;
    let receitaMesAtualKitnets = 0;
    let inadimplenciaKitnets = 0;
    let aReceberKitnets = 0;
    let caucoesRetidasKitnets = 0;

    kitnetContracts.forEach((c) => {
      if (c.deposit && (c as any).depositStatus !== 'devolvida') {
        caucoesRetidasKitnets = safeAdd(caucoesRetidasKitnets, c.deposit);
      }

      if (c.status === 'ativo') {
        const monthly = getKitnetMonthlyTotal(c);
        faturamentoMensalKitnets = safeAdd(faturamentoMensalKitnets, monthly);
      }

      c.installments.forEach((i) => {
        if (i.status === 'pago') {
          receitaRecebidaKitnets = safeAdd(receitaRecebidaKitnets, i.amount);
          const payDate = i.paidDate || i.dueDate;
          if (payDate && payDate.startsWith(targetYM)) {
            receitaMesAtualKitnets = safeAdd(receitaMesAtualKitnets, i.amount);
          }
        } else if (i.status === 'pendente') {
          if (isInstallmentOverdue(i)) {
            inadimplenciaKitnets = safeAdd(inadimplenciaKitnets, i.amount);
          } else {
            aReceberKitnets = safeAdd(aReceberKitnets, i.amount);
          }
        }
      });
    });

    // --- CONSOLIDADOS ---
    const faturamentoBrutoMensal = safeAdd(faturamentoMensalMotos, faturamentoMensalKitnets);
    const receitaAnualProjetada = safeMul(faturamentoBrutoMensal, 12);
    const totalReceitaRecebida = safeAdd(receitaRecebidaMotos, receitaRecebidaKitnets);
    const receitaMesAtualTotal = safeAdd(receitaMesAtualMotos, receitaMesAtualKitnets);
    const totalInadimplenciaGeral = safeAdd(inadimplenciaMotos, inadimplenciaKitnets);
    const totalAReceber = safeAdd(aReceberMotos, aReceberKitnets);
    const totalCaucoesRetidas = safeAdd(caucoesRetidasMotos, caucoesRetidasKitnets);

    // --- DESPESAS DO MÊS ---
    const despesasDoMes = expenses.filter((e) => {
      const rawDate = e.dueDate || e.paidDate || (e as any).date;
      return rawDate && rawDate.startsWith(targetYM);
    });

    const despesasMotos = despesasDoMes
      .filter((e) => e.targetType === 'moto' || e.category === 'seguro' || e.category === 'manutencao_moto')
      .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

    const despesasKitnets = despesasDoMes
      .filter((e) => e.targetType === 'kitnet' || ['agua', 'energia', 'internet', 'iptu', 'reparo', 'reforma'].includes(e.category))
      .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

    const totalDespesas = safeAdd(despesasMotos, despesasKitnets);
    const lucroLiquidoMensal = safeSub(faturamentoBrutoMensal, totalDespesas);
    const margemLucro = calculateProfitMargin(lucroLiquidoMensal, faturamentoBrutoMensal);

    // Yields e ROIs Anuais
    const yieldMotos = calculateYield(faturamentoMensalMotos, valorInvestidoMotos);
    const yieldKitnets = calculateYield(faturamentoMensalKitnets, valorInvestidoKitnets);
    const roiAnualMotos = calculateAnnualROI(faturamentoMensalMotos, valorInvestidoMotos);
    const roiAnualKitnets = calculateAnnualROI(faturamentoMensalKitnets, valorInvestidoKitnets);

    const inadimplenciaPctMotos = calculateDefaultRate(inadimplenciaMotos, faturamentoMensalMotos);
    const inadimplenciaPctKitnets = calculateDefaultRate(inadimplenciaKitnets, faturamentoMensalKitnets);

    return {
      totalMotos,
      motosAlugadas,
      motosDisponiveis,
      motosManutencao,
      taxaOcupacaoMotos,
      totalKitnets,
      kitnetsAlugadas,
      kitnetsDisponiveis,
      kitnetsManutencao,
      taxaOcupacaoKitnets,
      totalContratosAtivos,
      valorInvestidoMotos: roundCurrency(valorInvestidoMotos),
      valorInvestidoKitnets: roundCurrency(valorInvestidoKitnets),
      patrimonioTotalAvaliado: roundCurrency(patrimonioTotalAvaliado),
      faturamentoMensalMotos: roundCurrency(faturamentoMensalMotos),
      faturamentoMensalKitnets: roundCurrency(faturamentoMensalKitnets),
      faturamentoBrutoMensal: roundCurrency(faturamentoBrutoMensal),
      receitaAnualProjetada: roundCurrency(receitaAnualProjetada),
      receitaRecebidaMotos: roundCurrency(receitaRecebidaMotos),
      receitaRecebidaKitnets: roundCurrency(receitaRecebidaKitnets),
      totalReceitaRecebida: roundCurrency(totalReceitaRecebida),
      receitaMesAtualMotos: roundCurrency(receitaMesAtualMotos),
      receitaMesAtualKitnets: roundCurrency(receitaMesAtualKitnets),
      receitaMesAtualTotal: roundCurrency(receitaMesAtualTotal),
      inadimplenciaMotos: roundCurrency(inadimplenciaMotos),
      inadimplenciaKitnets: roundCurrency(inadimplenciaKitnets),
      totalInadimplenciaGeral: roundCurrency(totalInadimplenciaGeral),
      inadimplenciaPctMotos: roundCurrency(inadimplenciaPctMotos),
      inadimplenciaPctKitnets: roundCurrency(inadimplenciaPctKitnets),
      aReceberMotos: roundCurrency(aReceberMotos),
      aReceberKitnets: roundCurrency(aReceberKitnets),
      totalAReceber: roundCurrency(totalAReceber),
      despesasMotos: roundCurrency(despesasMotos),
      despesasKitnets: roundCurrency(despesasKitnets),
      totalDespesas: roundCurrency(totalDespesas),
      lucroLiquidoMensal: roundCurrency(lucroLiquidoMensal),
      margemLucro,
      yieldMotos: roundCurrency(yieldMotos),
      yieldKitnets: roundCurrency(yieldKitnets),
      roiAnualMotos,
      roiAnualKitnets,
      caucoesRetidasMotos: roundCurrency(caucoesRetidasMotos),
      caucoesRetidasKitnets: roundCurrency(caucoesRetidasKitnets),
      totalCaucoesRetidas: roundCurrency(totalCaucoesRetidas),
    };
  }

  /**
   * Gera a série histórica de evolução financeira dos últimos N meses
   */
  public static getMonthlyEvolution(
    motoContracts: MotoContract[],
    kitnetContracts: KitnetContract[],
    expenses: Expense[],
    monthsCount: number = 6
  ): MonthlyEvolutionPoint[] {
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const cur = parseDate(today()) || { year: 2026, month: 9, day: 1 };
    const result: MonthlyEvolutionPoint[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const totalMonthIndex = (cur.year * 12 + (cur.month - 1)) - i;
      const targetYear = Math.floor(totalMonthIndex / 12);
      const targetMonth = (totalMonthIndex % 12) + 1;
      const yearMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
      const label = `${monthsNames[targetMonth - 1]}/${String(targetYear).slice(2)}`;

      let receitaMes = 0;
      motoContracts.forEach((c) => {
        if (c.deposit && c.depositStatus !== 'devolvida') {
          const contractStartDate = c.startDate || (c.installments?.[0]?.paidDate) || '';
          if (contractStartDate && contractStartDate.startsWith(yearMonth)) {
            receitaMes = safeAdd(receitaMes, c.deposit);
          }
        }
        c.installments.forEach((inst) => {
          if (inst.status === 'pago') {
            const payDate = inst.paidDate || inst.dueDate;
            if (payDate && payDate.startsWith(yearMonth)) {
              receitaMes = safeAdd(receitaMes, inst.amount);
            }
          }
        });
      });

      kitnetContracts.forEach((c) => {
        if (c.deposit && (c as any).depositStatus !== 'devolvida') {
          const contractStartDate = c.startDate || (c.installments?.[0]?.paidDate) || '';
          if (contractStartDate && contractStartDate.startsWith(yearMonth)) {
            receitaMes = safeAdd(receitaMes, c.deposit);
          }
        }
        c.installments.forEach((inst) => {
          if (inst.status === 'pago') {
            const payDate = inst.paidDate || inst.dueDate;
            if (payDate && payDate.startsWith(yearMonth)) {
              receitaMes = safeAdd(receitaMes, inst.amount);
            }
          }
        });
      });

      let despesaMes = 0;
      expenses.forEach((e) => {
        const expDate = e.paidDate || (e as any).date || e.dueDate;
        if (expDate && expDate.startsWith(yearMonth)) {
          despesaMes = safeAdd(despesaMes, e.amount);
        }
      });

      const lucroMes = safeSub(receitaMes, despesaMes);

      result.push({
        mes: label,
        receita: roundCurrency(receitaMes),
        despesa: roundCurrency(despesaMes),
        lucro: roundCurrency(lucroMes),
      });
    }

    return result;
  }

  /**
   * Encontra a parcela em atraso mais urgente no sistema
   */
  public static getMostUrgentOverdue(
    motoContracts: MotoContract[],
    kitnetContracts: KitnetContract[]
  ): { contractId: string; installmentId: string; dueDate: string; amount: number } | undefined {
    const candidates: Array<{
      contractId: string;
      installmentId: string;
      dueDate: string;
      amount: number;
    }> = [];

    motoContracts.forEach((c) => {
      if (c.status !== 'ativo') return;
      c.installments.forEach((inst) => {
        if (isInstallmentOverdue(inst)) {
          candidates.push({
            contractId: c.id,
            installmentId: inst.id,
            dueDate: inst.dueDate,
            amount: inst.amount,
          });
        }
      });
    });

    kitnetContracts.forEach((c) => {
      if (c.status !== 'ativo') return;
      c.installments.forEach((inst) => {
        if (isInstallmentOverdue(inst)) {
          candidates.push({
            contractId: c.id,
            installmentId: inst.id,
            dueDate: inst.dueDate,
            amount: inst.amount,
          });
        }
      });
    });

    candidates.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return candidates[0];
  }

  /**
   * Gera todos os alertas inteligentes do sistema
   */
  public static getDashboardAlerts(
    motos: Moto[],
    motoTenants: MotoTenant[],
    motoContracts: MotoContract[],
    kitnetTenants: KitnetTenant[],
    kitnetContracts: KitnetContract[],
    settings: SystemSettings
  ): DashboardAlertItem[] {
    const items: DashboardAlertItem[] = [];
    const todayStr = today();

    // 1. Inadimplência Motos
    motoContracts.forEach((contract) => {
      if (contract.status !== 'ativo') return;
      const overdue = contract.installments.find((i) => isInstallmentOverdue(i));
      if (overdue) {
        const tenant = motoTenants.find((t) => t.id === contract.tenantId);
        const days = Math.max(1, daysBetweenDates(overdue.dueDate, todayStr));
        items.push({
          id: `alert-overdue-${contract.id}`,
          type: 'critical',
          category: 'moto',
          text: `Parcela Atrasada há ${days} dias: ${tenant?.fullName || 'Locatário'}`,
          subtext: `Parcela ${overdue.number}/${overdue.totalInstallments} (R$ ${overdue.amount.toFixed(2)}) vencida em ${overdue.dueDate}`,
          contractId: contract.id,
          installmentId: overdue.id,
        });
      }
    });

    // 2. Inadimplência Kitnets
    kitnetContracts.forEach((contract) => {
      if (contract.status !== 'ativo') return;
      const overdue = contract.installments.find((i) => isInstallmentOverdue(i));
      if (overdue) {
        const tenant = kitnetTenants.find((t) => t.id === contract.tenantId);
        const days = Math.max(1, daysBetweenDates(overdue.dueDate, todayStr));
        items.push({
          id: `alert-k-overdue-${contract.id}`,
          type: 'critical',
          category: 'kitnet',
          text: `Aluguel Atrasado há ${days} dias: ${tenant?.fullName || 'Locatário'}`,
          subtext: `Valor R$ ${overdue.amount.toFixed(2)} vencido em ${overdue.dueDate}`,
          contractId: contract.id,
          installmentId: overdue.id,
        });
      }
    });

    // 3. CNH Vencendo/Vencida de locatários ativos
    const activeMotoTenantIds = new Set(
      motoContracts.filter((c) => c.status === 'ativo').map((c) => c.tenantId)
    );

    motoTenants.forEach((tenant) => {
      if (activeMotoTenantIds.has(tenant.id) && tenant.cnh?.expirationDate) {
        const cnh = getCNHStatus(tenant.cnh.expirationDate);
        if (cnh.status === 'vencendo' || cnh.status === 'vencida') {
          items.push({
            id: `alert-cnh-${tenant.id}`,
            type: cnh.status === 'vencida' ? 'critical' : 'warning',
            category: 'moto',
            text: `CNH do Condutor: ${tenant.fullName}`,
            subtext: `${cnh.label} (Cat. ${tenant.cnh.category} • Vencimento: ${tenant.cnh.expirationDate})`,
          });
        }
      }
    });

    // 4. Término de contratos próximo
    motoContracts.forEach((contract) => {
      if (contract.status === 'ativo' && contract.endDate) {
        const daysUntilEnd = daysBetweenDates(todayStr, contract.endDate);
        if (daysUntilEnd <= (settings.contractEndAlertDays || 60) && daysUntilEnd >= 0) {
          const tenant = motoTenants.find((t) => t.id === contract.tenantId);
          const moto = motos.find((m) => m.id === contract.motoId);
          items.push({
            id: `alert-contract-end-${contract.id}`,
            type: daysUntilEnd <= 15 ? 'critical' : 'warning',
            category: 'moto',
            text: `Fim de Contrato (${daysUntilEnd} dias): ${moto ? `${moto.brand} ${moto.model}` : 'Moto'}`,
            subtext: `Locatário: ${tenant?.fullName || 'Cliente'} • Término: ${contract.endDate}`,
            contractId: contract.id,
          });
        }
      }
    });

    // 5. IPVA e Seguros
    motos.forEach((moto) => {
      if (moto.ipvaDueDate) {
        const days = daysBetweenDates(todayStr, moto.ipvaDueDate);
        if (days <= 30) {
          items.push({
            id: `alert-ipva-${moto.id}`,
            type: days <= 7 ? 'critical' : 'warning',
            category: 'moto',
            text: `IPVA: ${moto.brand} ${moto.model} (${moto.plate || 'S/ Placa'})`,
            subtext: `Vencimento: ${moto.ipvaDueDate} (${days > 0 ? `em ${days} dias` : 'VENCIDO/HOJE'})`,
          });
        }
      }

      if (moto.insuranceDueDate) {
        const days = daysBetweenDates(todayStr, moto.insuranceDueDate);
        if (days <= 30) {
          items.push({
            id: `alert-insurance-${moto.id}`,
            type: days <= 7 ? 'critical' : 'warning',
            category: 'moto',
            text: `Seguro/Proteção: ${moto.brand} ${moto.model}`,
            subtext: `Renovar até ${moto.insuranceDueDate} (${days > 0 ? `em ${days} dias` : 'VENCIDO'})`,
          });
        }
      }
    });

    return items;
  }
}
