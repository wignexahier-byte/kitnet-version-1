/**
 * FinancialMath - Motor Matemático e Financeiro de Alta Precisão
 * 
 * Regras implementadas:
 * 1. Todos os cálculos monetários são processados com arredondamento seguro em centavos (IEEE 754 precision fix).
 * 2. Juros de mora, multas legais, pro-rata die e rescisões proporcionais conforme a legislação brasileira (Código Civil e Lei do Inquilinato 8.245/91).
 * 3. Garantia de consistência total: Centavos nunca são perdidos em parcelamentos ou divisões.
 */

import { daysBetweenDates, today } from './dateUtils';

export interface OverdueChargesOptions {
  principal: number;
  dueDate: string;
  referenceDate?: string;
  fixedFinePercent?: number; // Ex: 0.02 (2% multa padrão)
  flatDailyFine?: number; // Ex: R$ 10,00 por dia (usado em contratos de moto)
  interestMonthlyRate?: number; // Ex: 0.01 (1% a.m.)
  gracePeriodDays?: number; // Dias de tolerância
}

export interface OverdueChargesResult {
  principal: number;
  overdueDays: number;
  fineAmount: number;
  interestAmount: number;
  totalDue: number;
  isOverdue: boolean;
}

export interface EarlyTerminationResult {
  monthlyRent: number;
  totalContractMonths: number;
  completedMonths: number;
  remainingMonths: number;
  basePenaltyAmount: number; // Multa integral (ex: 1 aluguel)
  proportionalPenalty: number; // Multa proporcional aos meses faltantes (Lei 8.245/91 art 4º)
  depositRetained: number;
  balanceToRefund: number;
  balanceToPay: number;
}

export interface DepositSettlementResult {
  initialDeposit: number;
  unpaidInstallmentsTotal: number;
  damagesTotal: number;
  cleaningFee: number;
  otherDebts: number;
  totalDeductions: number;
  refundAmount: number; // Se caução > deduções
  remainingDebt: number; // Se deduções > caução
}

/**
 * Constante padronizada de semanas por mês (52 semanas / 12 meses = 4.333...)
 */
export const WEEKS_PER_MONTH = 52 / 12;

/**
 * Arredonda um valor financeiro para exatamente 2 casas decimais usando Math.round com epsilon
 */
export function roundCurrency(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Converte valor para centavos inteiros (evita erros de float 0.1 + 0.2)
 */
export function toCents(amount: number): number {
  if (!Number.isFinite(amount) || Number.isNaN(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100);
}

/**
 * Converte centavos inteiros de volta para valor float com 2 casas
 */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/**
 * Adição segura de múltiplos valores monetários
 */
export function safeAdd(...amounts: number[]): number {
  const totalCents = amounts.reduce((acc, curr) => acc + toCents(curr), 0);
  return fromCents(totalCents);
}

/**
 * Subtração segura (a - b)
 */
export function safeSub(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b));
}

/**
 * Multiplicação segura com arredondamento preciso
 */
export function safeMul(amount: number, factor: number): number {
  return roundCurrency(amount * factor);
}

/**
 * Divisão segura com proteção contra divisão por zero
 */
export function safeDiv(amount: number, divisor: number): number {
  if (!divisor || divisor === 0) return 0;
  return roundCurrency(amount / divisor);
}

/**
 * Calcula a diferença exata em dias corridos entre duas datas (formato YYYY-MM-DD)
 * Delega para o padrão central de datas civis daysBetweenDates
 */
export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  return daysBetweenDates(fromDateStr, toDateStr);
}

/**
 * Calcula encargos moratórios (multa e juros diários pro-rata) sobre parcela em atraso
 */
export function calculateOverdueCharges(options: OverdueChargesOptions): OverdueChargesResult {
  const {
    principal,
    dueDate,
    referenceDate = today(),
    fixedFinePercent = 0.02, // 2% multa contratual padrão
    flatDailyFine = 0, // Multa diária fixa se configurada
    interestMonthlyRate = 0.01, // 1% ao mês (0.0333% ao dia)
    gracePeriodDays = 0,
  } = options;

  const diffDays = daysBetweenDates(dueDate, referenceDate);
  const isOverdue = diffDays > gracePeriodDays;
  const overdueDays = isOverdue ? diffDays : 0;

  if (!isOverdue || principal <= 0) {
    return {
      principal: roundCurrency(principal),
      overdueDays: 0,
      fineAmount: 0,
      interestAmount: 0,
      totalDue: roundCurrency(principal),
      isOverdue: false,
    };
  }

  // Multa: Percentual sobre o principal + Multa diária fixa se houver
  let fineAmount = 0;
  if (fixedFinePercent > 0) {
    fineAmount = safeAdd(fineAmount, safeMul(principal, fixedFinePercent));
  }
  if (flatDailyFine > 0) {
    fineAmount = safeAdd(fineAmount, safeMul(flatDailyFine, overdueDays));
  }

  // Juros: Pro-rata die simples (taxa mensal / 30 dias por dia de atraso)
  const dailyInterestRate = interestMonthlyRate / 30;
  const interestAmount = safeMul(principal, dailyInterestRate * overdueDays);

  const totalDue = safeAdd(principal, fineAmount, interestAmount);

  return {
    principal: roundCurrency(principal),
    overdueDays,
    fineAmount: roundCurrency(fineAmount),
    interestAmount: roundCurrency(interestAmount),
    totalDue: roundCurrency(totalDue),
    isOverdue: true,
  };
}

/**
 * Calcula a primeira parcela proporcional (Pro-rata die)
 * Baseado no mês comercial padrão de 30 dias conforme prática imobiliária brasileira
 */
export function calculateProportionalRent(
  monthlyValue: number,
  startDateStr: string,
  firstDueDateStr: string
): { amount: number; days: number; dailyRate: number; isProportional: boolean } {
  if (monthlyValue <= 0 || !startDateStr || !firstDueDateStr) {
    return { amount: monthlyValue, days: 30, dailyRate: safeDiv(monthlyValue, 30), isProportional: false };
  }

  const days = getDaysDifference(startDateStr, firstDueDateStr);
  const dailyRate = safeDiv(monthlyValue, 30);

  // Se o período for entre 27 e 33 dias, considera mês integral padrão
  if (days >= 27 && days <= 33) {
    return { amount: monthlyValue, days, dailyRate, isProportional: false };
  }

  // Período menor ou maior que 1 mês: calcula pro-rata exato
  const amount = safeMul(dailyRate, Math.max(1, days));
  return {
    amount: roundCurrency(amount),
    days: Math.max(1, days),
    dailyRate,
    isProportional: true,
  };
}

/**
 * Rescisão antecipada proporcional (Art. 4º da Lei nº 8.245/1991)
 * Multa proporcional ao tempo restante do contrato:
 * Multa = (Multa_Base / Prazo_Total) * Meses_Restantes
 */
export function calculateEarlyTermination({
  monthlyRent,
  totalContractMonths,
  completedMonths,
  deposit = 0,
  penaltyMonths = 1, // Padrão: 1 aluguel como base
}: {
  monthlyRent: number;
  totalContractMonths: number;
  completedMonths: number;
  deposit?: number;
  penaltyMonths?: number;
}): EarlyTerminationResult {
  const safeTotalMonths = Math.max(1, totalContractMonths);
  const safeCompletedMonths = Math.min(safeTotalMonths, Math.max(0, completedMonths));
  const remainingMonths = Math.max(0, safeTotalMonths - safeCompletedMonths);

  const basePenaltyAmount = safeMul(monthlyRent, penaltyMonths);
  const proportionalPenalty = remainingMonths > 0
    ? roundCurrency((basePenaltyAmount / safeTotalMonths) * remainingMonths)
    : 0;

  let balanceToRefund = 0;
  let balanceToPay = 0;
  const depositRetained = Math.min(deposit, proportionalPenalty);

  if (deposit >= proportionalPenalty) {
    balanceToRefund = safeSub(deposit, proportionalPenalty);
  } else {
    balanceToPay = safeSub(proportionalPenalty, deposit);
  }

  return {
    monthlyRent: roundCurrency(monthlyRent),
    totalContractMonths: safeTotalMonths,
    completedMonths: safeCompletedMonths,
    remainingMonths,
    basePenaltyAmount: roundCurrency(basePenaltyAmount),
    proportionalPenalty,
    depositRetained: roundCurrency(depositRetained),
    balanceToRefund: roundCurrency(balanceToRefund),
    balanceToPay: roundCurrency(balanceToPay),
  };
}

/**
 * Prestação de contas e liquidação de Caução (Desocupação/Encerramento)
 */
export function calculateDepositSettlement({
  initialDeposit,
  unpaidInstallmentsTotal = 0,
  damagesTotal = 0,
  cleaningFee = 0,
  otherDebts = 0,
}: {
  initialDeposit: number;
  unpaidInstallmentsTotal?: number;
  damagesTotal?: number;
  cleaningFee?: number;
  otherDebts?: number;
}): DepositSettlementResult {
  const totalDeductions = safeAdd(
    unpaidInstallmentsTotal,
    damagesTotal,
    cleaningFee,
    otherDebts
  );

  const refundAmount = initialDeposit > totalDeductions ? safeSub(initialDeposit, totalDeductions) : 0;
  const remainingDebt = totalDeductions > initialDeposit ? safeSub(totalDeductions, initialDeposit) : 0;

  return {
    initialDeposit: roundCurrency(initialDeposit),
    unpaidInstallmentsTotal: roundCurrency(unpaidInstallmentsTotal),
    damagesTotal: roundCurrency(damagesTotal),
    cleaningFee: roundCurrency(cleaningFee),
    otherDebts: roundCurrency(otherDebts),
    totalDeductions: roundCurrency(totalDeductions),
    refundAmount: roundCurrency(refundAmount),
    remainingDebt: roundCurrency(remainingDebt),
  };
}

/**
 * Divide um valor total em N parcelas sem perda de centavos
 * A diferença residual de centavos é ajustada na primeira ou última parcela
 */
export function distributeInstallments(
  totalAmount: number,
  installmentCount: number,
  adjustOnFirst: boolean = false
): number[] {
  if (installmentCount <= 0) return [];
  if (installmentCount === 1) return [roundCurrency(totalAmount)];

  const totalCents = toCents(totalAmount);
  const baseCents = Math.floor(totalCents / installmentCount);
  const remainderCents = totalCents - baseCents * installmentCount;

  const result: number[] = [];
  for (let i = 0; i < installmentCount; i++) {
    let cents = baseCents;
    if (adjustOnFirst && i === 0) {
      cents += remainderCents;
    } else if (!adjustOnFirst && i === installmentCount - 1) {
      cents += remainderCents;
    }
    result.push(fromCents(cents));
  }

  return result;
}

