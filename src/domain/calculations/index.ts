/**
 * Domain - Calculations (Motor Matemático e Financeiro Oficial)
 *
 * Centraliza e oficializa TODAS as regras de:
 * - Aluguel mensal e semanal
 * - Taxas (água, internet, limpeza, outras taxas)
 * - Caução e liquidação de garantias
 * - Parcelas e valor total de contrato
 * - Receitas (previstas, realizadas, a receber)
 * - Inadimplência, encargos moratórios e dias de atraso
 * - Despesas, lucro líquido e margem operacional
 * - ROI, rentabilidade e taxas de ocupação
 * - Precisão monetária sem perda de centavos
 */

import {
  roundCurrency,
  toCents,
  fromCents,
  safeAdd,
  safeSub,
  safeMul,
  safeDiv,
  getDaysDifference,
  WEEKS_PER_MONTH,
  calculateOverdueCharges,
  calculateProportionalRent,
  calculateEarlyTermination,
  calculateDepositSettlement,
  distributeInstallments,
  OverdueChargesOptions,
  OverdueChargesResult,
  EarlyTerminationResult,
  DepositSettlementResult,
} from '../../utils/financialMath';

export {
  roundCurrency,
  toCents,
  fromCents,
  safeAdd,
  safeSub,
  safeMul,
  safeDiv,
  getDaysDifference,
  WEEKS_PER_MONTH,
  calculateOverdueCharges,
  calculateProportionalRent,
  calculateEarlyTermination,
  calculateDepositSettlement,
  distributeInstallments,
};

export type {
  OverdueChargesOptions,
  OverdueChargesResult,
  EarlyTerminationResult,
  DepositSettlementResult,
};

/**
 * Converte valor semanal para equivalente mensal oficial (52 semanas / 12 meses = 4.333...)
 */
export function weeklyToMonthly(weekly: number): number {
  if (!weekly || weekly <= 0) return 0;
  return roundCurrency(safeMul(weekly, WEEKS_PER_MONTH));
}

/**
 * Converte valor mensal para equivalente semanal oficial
 */
export function monthlyToWeekly(monthly: number): number {
  if (!monthly || monthly <= 0) return 0;
  return roundCurrency(safeDiv(monthly, WEEKS_PER_MONTH));
}

/**
 * Calcula o total mensal de uma Kitnet:
 * Aluguel Base + Água + Internet + Outras Taxas
 * REGRA: Se qualquer taxa for nula/indefinida, utiliza 0 e NUNCA inventa valor fictício.
 */
export function getKitnetMonthlyTotal(contract?: {
  rentValue?: number | null;
  waterValue?: number | null;
  internetValue?: number | null;
  otherFees?: number | null;
} | null): number {
  if (!contract) return 0;
  const rent = contract.rentValue || 0;
  const water = contract.waterValue || 0;
  const internet = contract.internetValue || 0;
  const other = contract.otherFees || 0;

  return safeAdd(safeAdd(safeAdd(rent, water), internet), other);
}

/**
 * Retorna o valor mensal padrão cadastrado na Kitnet (imóvel disponível / base)
 */
export function getKitnetAssetMonthlyBase(kitnet?: {
  monthlyRentBase?: number | null;
  monthlyWaterBase?: number | null;
  monthlyInternetBase?: number | null;
  otherFeesBase?: number | null;
} | null): number {
  if (!kitnet) return 0;
  return getKitnetMonthlyTotal({
    rentValue: kitnet.monthlyRentBase,
    waterValue: kitnet.monthlyWaterBase,
    internetValue: kitnet.monthlyInternetBase,
    otherFees: kitnet.otherFeesBase,
  });
}

/**
 * Retorna o detalhamento formal dos valores mensais de uma Kitnet
 */
export function getKitnetMonthlyBreakdown(contract?: {
  rentValue?: number | null;
  waterValue?: number | null;
  internetValue?: number | null;
  otherFees?: number | null;
} | null) {
  const rent = contract?.rentValue || 0;
  const water = contract?.waterValue || 0;
  const internet = contract?.internetValue || 0;
  const other = contract?.otherFees || 0;
  const total = safeAdd(safeAdd(safeAdd(rent, water), internet), other);
  return { rent, water, internet, other, total };
}

/**
 * Calcula apenas o total de taxas adicionais da Kitnet (sem o aluguel base)
 */
export function getKitnetTotalFees(contract: {
  waterValue?: number | null;
  internetValue?: number | null;
  otherFees?: number | null;
}): number {
  const water = contract.waterValue || 0;
  const internet = contract.internetValue || 0;
  const other = contract.otherFees || 0;

  return safeAdd(safeAdd(water, internet), other);
}

/**
 * Calcula o valor mensal efetivo de uma Moto:
 * Se a periodicidade for semanal, converte para mensal usando WEEKS_PER_MONTH.
 * Se mensal, utiliza monthlyValue direto.
 */
export function getMotoMonthlyTotal(contract: {
  monthlyValue?: number | null;
  weeklyValue?: number | null;
  paymentFrequency?: string;
}): number {
  if (contract.paymentFrequency === 'semanal' && contract.weeklyValue) {
    return weeklyToMonthly(contract.weeklyValue);
  }
  return contract.monthlyValue || 0;
}

/**
 * Calcula o valor total acordado do contrato somando as parcelas
 */
export function calculateContractTotalValue(installments: Array<{ amount: number }>): number {
  if (!installments || installments.length === 0) return 0;
  return installments.reduce((acc, inst) => safeAdd(acc, inst.amount || 0), 0);
}

/**
 * Soma o valor total de uma lista de parcelas
 */
export const sumInstallmentAmounts = calculateContractTotalValue;

/**
 * Calcula a taxa de ocupação percentual (0 a 100)
 */
export function calculateOccupancyRate(rented: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((Math.max(0, rented) / total) * 100);
}

/**
 * Calcula o Yield mensal percentual sobre o capital investido
 */
export function calculateYield(monthlyRevenue: number, investedAmount: number): number {
  if (!investedAmount || investedAmount <= 0 || !monthlyRevenue || monthlyRevenue <= 0) return 0;
  return roundCurrency((monthlyRevenue / investedAmount) * 100);
}

/**
 * Calcula o ROI anual estimado baseado no yield mensal
 */
export function calculateAnnualROI(monthlyRevenue: number, investedAmount: number): number {
  const monthlyYield = calculateYield(monthlyRevenue, investedAmount);
  return roundCurrency(monthlyYield * 12);
}

/**
 * Calcula a margem de lucro líquido percentual
 */
export function calculateProfitMargin(netProfit: number, grossRevenue: number): number {
  if (!grossRevenue || grossRevenue <= 0) return 0;
  return roundCurrency((netProfit / grossRevenue) * 100);
}

/**
 * Calcula o índice de inadimplência percentual
 */
export function calculateDefaultRate(overdueAmount: number, expectedRevenue: number): number {
  if (!expectedRevenue || expectedRevenue <= 0 || !overdueAmount || overdueAmount <= 0) return 0;
  return roundCurrency((overdueAmount / expectedRevenue) * 100);
}
