/**
 * Serviço Unificado e Auditado de Gestão de Contratos e Mensalidades
 * 
 * Contém a lógica central para:
 * - generatePaymentSchedule: Cálculo de cronograma completo de mensalidades (mensais ou semanais).
 * - generateMonthlyPayments: Geração detalhada de parcelas mensais com controle de vencimentos e bissexto.
 * - leaseService: Criação e validação de contratos de locação (Kitnets e Motos).
 * - renewalService: Renovação formal de contratos adicionando novas parcelas e estendendo a vigência.
 * - extensionService: Prorrogação de prazos contratuais e cronogramas.
 * - reajusteService: Aplicação de reajustes anuais ou pontuais de aluguel.
 */

import { Installment, InstallmentStatus, KitnetContract, MotoContract, RentAdjustment } from '../types';
import { safeAdd, safeSub, safeMul, safeDiv, roundCurrency, getDaysDifference } from '../utils/financialMath';
import { getKitnetMonthlyTotal } from '../domain/calculations';
import {
  today,
  getTodayLocalDateString,
  getDaysInMonth,
  buildValidDateString,
  calculateContractEndDate,
  addDays,
  parseDate,
} from '../utils/dateUtils';

export {
  getDaysInMonth,
  buildValidDateString,
  calculateContractEndDate,
};

export interface ScheduleCalculationOptions {
  startDate: string; // YYYY-MM-DD
  durationMonths: number;
  paymentFrequency?: 'mensal' | 'semanal';
  monthlyValue?: number;
  weeklyValue?: number;
  dueDay?: number; // 1 a 31 para mensal
  dueDayOfWeek?: number; // 0 (Dom) a 6 (Sáb) para semanal
  allowProRata?: boolean;
}

export interface GeneratedScheduleResult {
  totalInstallments: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  firstDueDate: string;
  lastDueDate: string;
  firstInstallmentAmount: number;
  regularInstallmentAmount: number;
  isFirstInstallmentProportional: boolean;
  isPartial: boolean;
  partialDays: number;
  totalAgreedValue: number;
  installments: Array<{
    number: number;
    totalInstallments: number;
    dueDate: string;
    amount: number;
    status: InstallmentStatus;
    isPartial?: boolean;
    partialDays?: number;
  }>;
}

/**
 * GERAÇÃO DE MENSALIDADES (generateMonthlyPayments)
 * Gera a totalidade das N parcelas para contratos de locação mensal.
 */
export function generateMonthlyPayments(
  startDate: string,
  durationMonths: number,
  monthlyValue: number,
  dueDay: number = 10,
  allowProRata: boolean = false
): GeneratedScheduleResult {
  const safeDuration = Math.max(1, Math.round(durationMonths || 1));
  const [startYearStr, startMonthStr, startDayStr] = (startDate || getTodayLocalDateString()).split('-');
  const startYear = parseInt(startYearStr, 10);
  const startMonth = parseInt(startMonthStr, 10); // 1-12
  const startDay = parseInt(startDayStr, 10);

  const targetDueDay = Math.min(Math.max(Number(dueDay) || 1, 1), 31);

  let firstDueYear = startYear;
  let firstDueMonth = startMonth;

  if (targetDueDay <= startDay) {
    // Se o dia de vencimento já passou ou é o mesmo do início, a primeira parcela vence no mês subsequente
    firstDueMonth += 1;
    if (firstDueMonth > 12) {
      firstDueMonth = 1;
      firstDueYear += 1;
    }
  }

  const firstDueDateStr = buildValidDateString(firstDueYear, firstDueMonth, targetDueDay);
  const partialDays = Math.max(1, getDaysDifference(startDate, firstDueDateStr));
  const isProportional = Boolean(allowProRata && startDay !== targetDueDay && partialDays !== 30 && partialDays < 30);

  const dailyRate = safeDiv(monthlyValue, 30);
  const firstAmount = isProportional
    ? roundCurrency(safeMul(dailyRate, partialDays))
    : roundCurrency(monthlyValue);

  const installments: GeneratedScheduleResult['installments'] = [];

  for (let i = 1; i <= safeDuration; i++) {
    const monthOffset = (firstDueMonth - 1) + (i - 1);
    const curYear = firstDueYear + Math.floor(monthOffset / 12);
    const curMonth = (monthOffset % 12) + 1;
    const dueDateStr = buildValidDateString(curYear, curMonth, targetDueDay);
    const amount = i === 1 ? firstAmount : roundCurrency(monthlyValue);

    installments.push({
      number: i,
      totalInstallments: safeDuration,
      dueDate: dueDateStr,
      amount,
      status: 'pendente',
      isPartial: i === 1 && isProportional,
      partialDays: i === 1 && isProportional ? partialDays : undefined,
    });
  }

  const totalAgreed = installments.reduce((acc, inst) => safeAdd(acc, inst.amount), 0);
  const endDate = calculateContractEndDate(startDate, safeDuration);
  const lastDueDate = installments[installments.length - 1]?.dueDate || firstDueDateStr;

  return {
    totalInstallments: safeDuration,
    durationMonths: safeDuration,
    startDate,
    endDate,
    firstDueDate: firstDueDateStr,
    lastDueDate,
    firstInstallmentAmount: firstAmount,
    regularInstallmentAmount: roundCurrency(monthlyValue),
    isFirstInstallmentProportional: isProportional,
    isPartial: isProportional,
    partialDays: isProportional ? partialDays : 30,
    totalAgreedValue: roundCurrency(totalAgreed),
    installments,
  };
}

/**
 * GERAÇÃO DE CRONOGRAMA COMPLETO (generatePaymentSchedule)
 * Suporta contratos mensais e semanais (ex: motos com intenção de compra).
 */
export function generatePaymentSchedule(options: ScheduleCalculationOptions): GeneratedScheduleResult {
  const {
    startDate,
    durationMonths,
    paymentFrequency = 'mensal',
    monthlyValue = 0,
    weeklyValue = 0,
    dueDay = 10,
    dueDayOfWeek = 1,
    allowProRata = false,
  } = options;

  if (paymentFrequency === 'mensal') {
    return generateMonthlyPayments(startDate, durationMonths, monthlyValue, dueDay, allowProRata);
  }

  // SEMANAL CALCULATION
  const safeDuration = Math.max(1, durationMonths || 1);
  const totalWeeks = Math.round(safeDuration * (52 / 12));
  const safeStartDate = startDate || getTodayLocalDateString();
  const parsedStart = parseDate(safeStartDate);
  const startYear = parsedStart?.year || 2026;
  const startMonth = parsedStart?.month || 1;
  const startDay = parsedStart?.day || 1;

  const startObj = new Date(Date.UTC(startYear, startMonth - 1, startDay, 12, 0, 0));
  const startDayOfWeek = startObj.getUTCDay(); // 0 a 6
  const targetDayOfWeek = Number(dueDayOfWeek) % 7;

  let daysUntilFirstDue = (targetDayOfWeek - startDayOfWeek + 7) % 7;
  if (daysUntilFirstDue === 0) daysUntilFirstDue = 7;
  const isProportional = Boolean(allowProRata && daysUntilFirstDue !== 7);

  const firstDueDateStr = addDays(safeStartDate, daysUntilFirstDue);

  const dailyRate = safeDiv(weeklyValue, 7);
  const firstAmount = isProportional
    ? roundCurrency(safeMul(dailyRate, daysUntilFirstDue))
    : roundCurrency(weeklyValue);

  const installments: GeneratedScheduleResult['installments'] = [];

  for (let i = 1; i <= totalWeeks; i++) {
    const dueDateStr = addDays(firstDueDateStr, (i - 1) * 7);
    const amount = i === 1 ? firstAmount : roundCurrency(weeklyValue);

    installments.push({
      number: i,
      totalInstallments: totalWeeks,
      dueDate: dueDateStr,
      amount,
      status: 'pendente',
      isPartial: i === 1 && isProportional,
      partialDays: i === 1 && isProportional ? daysUntilFirstDue : undefined,
    });
  }

  const totalAgreed = installments.reduce((acc, inst) => safeAdd(acc, inst.amount), 0);
  const endDate = calculateContractEndDate(startDate, safeDuration);
  const lastDueDate = installments[installments.length - 1]?.dueDate || firstDueDateStr;

  return {
    totalInstallments: totalWeeks,
    durationMonths: safeDuration,
    startDate,
    endDate,
    firstDueDate: firstDueDateStr,
    lastDueDate,
    firstInstallmentAmount: firstAmount,
    regularInstallmentAmount: roundCurrency(weeklyValue),
    isFirstInstallmentProportional: isProportional,
    isPartial: isProportional,
    partialDays: daysUntilFirstDue,
    totalAgreedValue: roundCurrency(totalAgreed),
    installments,
  };
}

/**
 * SERVIÇO DE RENOVAÇÃO (renewalService)
 * Estende o contrato com novas parcelas, atualiza o totalInstallments de todas as parcelas
 * e recalcula a vigência total.
 */
export const renewalService = {
  renewContract<T extends KitnetContract | MotoContract>(
    contract: T,
    additionalMonths: number,
    newRentValue?: number,
    reason?: string
  ): T {
    const safeAdditional = Math.max(1, Math.round(additionalMonths));
    const currentDuration = contract.durationMonths || 12;
    const newTotalDuration = currentDuration + safeAdditional;
    const existingInstallments = contract.installments || [];
    const isKitnet = 'kitnetId' in contract;

    const baseAmount =
      newRentValue && newRentValue > 0
        ? newRentValue
        : isKitnet
        ? (contract as KitnetContract).rentValue
        : (contract as MotoContract).monthlyValue;

    const effectiveMonthly = isKitnet
      ? getKitnetMonthlyTotal({
          rentValue: baseAmount,
          waterValue: (contract as KitnetContract).waterValue,
          internetValue: (contract as KitnetContract).internetValue,
          otherFees: (contract as KitnetContract).otherFees,
        })
      : baseAmount;

    // Identificar a data da última parcela para dar continuidade exata
    const lastInst = existingInstallments[existingInstallments.length - 1];
    let lastDueYear: number;
    let lastDueMonth: number;
    const dueDay = (contract as any).dueDay || 10;

    if (lastInst && lastInst.dueDate) {
      const [y, m] = lastInst.dueDate.split('-');
      lastDueYear = parseInt(y, 10);
      lastDueMonth = parseInt(m, 10);
    } else {
      const [y, m] = (contract.startDate || getTodayLocalDateString()).split('-');
      lastDueYear = parseInt(y, 10);
      lastDueMonth = parseInt(m, 10);
    }

    const newInstallments: Installment[] = [];
    for (let i = 1; i <= safeAdditional; i++) {
      const monthOffset = (lastDueMonth - 1) + i;
      const curYear = lastDueYear + Math.floor(monthOffset / 12);
      const curMonth = (monthOffset % 12) + 1;
      const dueDateStr = buildValidDateString(curYear, curMonth, dueDay);
      const instNumber = existingInstallments.length + i;

      newInstallments.push({
        id: `inst-renew-${contract.id}-${instNumber}-${Date.now()}`,
        number: instNumber,
        totalInstallments: newTotalDuration,
        dueDate: dueDateStr,
        amount: effectiveMonthly,
        status: 'pendente',
      });
    }

    // Atualiza o totalInstallments de TODAS as parcelas existentes para refletir a nova vigência
    const updatedExistingInstallments: Installment[] = existingInstallments.map((inst) => ({
      ...inst,
      totalInstallments: newTotalDuration,
    }));

    const allInstallments = [...updatedExistingInstallments, ...newInstallments];
    const newEndDate = calculateContractEndDate(contract.startDate, newTotalDuration);

    const renewalAdjustment: RentAdjustment = {
      id: `renew-adj-${Date.now()}`,
      date: getTodayLocalDateString(),
      previousValue: isKitnet ? (contract as KitnetContract).rentValue : (contract as MotoContract).monthlyValue,
      newValue: baseAmount,
      reason: reason || `Renovação contratual (+${safeAdditional} meses)`,
      effectiveFromInstallment: existingInstallments.length + 1,
    };

    const currentAdjustments = contract.rentAdjustments || [];

    if (isKitnet) {
      return {
        ...contract,
        durationMonths: newTotalDuration,
        endDate: newEndDate,
        rentValue: baseAmount,
        installments: allInstallments,
        rentAdjustments: [renewalAdjustment, ...currentAdjustments],
      } as T;
    } else {
      return {
        ...contract,
        durationMonths: newTotalDuration as any,
        endDate: newEndDate,
        monthlyValue: baseAmount,
        installments: allInstallments,
        totalAgreedValue: allInstallments.reduce((acc, curr) => safeAdd(acc, curr.amount), 0),
        rentAdjustments: [renewalAdjustment, ...currentAdjustments],
      } as T;
    }
  },
};

/**
 * SERVIÇO DE EXTENSÃO (extensionService)
 * Alias especializado para prorrogação de prazos com garantia de integridade.
 */
export const extensionService = {
  extendContract: renewalService.renewContract,
};

/**
 * SERVIÇO DE REAJUSTE DE ALUGUEL (reajusteService)
 * Aplica novos valores às parcelas pendentes preservando as quitadas.
 */
export const reajusteService = {
  adjustRent<T extends KitnetContract | MotoContract>(
    contract: T,
    newValue: number,
    reason: string,
    effectiveFromInstallment?: number
  ): T {
    const isKitnet = 'kitnetId' in contract;
    const previousValue = isKitnet
      ? (contract as KitnetContract).rentValue
      : (contract as MotoContract).monthlyValue;

    const diff = safeSub(newValue, previousValue);
    const adjustment: RentAdjustment = {
      id: `adj-${Date.now()}`,
      date: getTodayLocalDateString(),
      previousValue,
      newValue,
      reason,
      effectiveFromInstallment,
    };

    const currentAdjustments = contract.rentAdjustments || [];
    const updatedInstallments = contract.installments.map((inst) => {
      const shouldUpdate =
        inst.status === 'pendente' &&
        (!effectiveFromInstallment || inst.number >= effectiveFromInstallment);
      if (shouldUpdate) {
        return {
          ...inst,
          amount: roundCurrency(safeAdd(inst.amount, diff)),
        };
      }
      return inst;
    });

    if (isKitnet) {
      return {
        ...contract,
        rentValue: newValue,
        installments: updatedInstallments,
        rentAdjustments: [adjustment, ...currentAdjustments],
      } as T;
    } else {
      const totalAgreed = updatedInstallments.reduce((acc, curr) => safeAdd(acc, curr.amount), 0);
      return {
        ...contract,
        monthlyValue: newValue,
        installments: updatedInstallments,
        totalAgreedValue: totalAgreed,
        rentAdjustments: [adjustment, ...currentAdjustments],
      } as T;
    }
  },
};

/**
 * SERVIÇO DE LOCAÇÃO E INTEGRIDADE DE CONTRATOS (leaseService / contractService)
 */
export const leaseService = {
  /**
   * Valida e completa contratos que porventura tenham parcelas faltantes
   * (ex: contrato de 12 meses com apenas 7 parcelas geradas).
   */
  ensureFullScheduleIntegrity<T extends KitnetContract | MotoContract>(contract: T): T {
    const duration = contract.durationMonths || 12;
    const existing = contract.installments || [];

    // Se o contrato já tiver todas as parcelas (ou mais), retorna sem alteração
    if (existing.length >= duration) {
      return contract;
    }

    const isKitnet = 'kitnetId' in contract;
    const dueDay = (contract as any).dueDay || 10;
    const missingCount = duration - existing.length;
    const lastInst = existing[existing.length - 1];

    let lastDueYear: number;
    let lastDueMonth: number;

    if (lastInst && lastInst.dueDate) {
      const [y, m] = lastInst.dueDate.split('-');
      lastDueYear = parseInt(y, 10);
      lastDueMonth = parseInt(m, 10);
    } else {
      const [y, m] = (contract.startDate || getTodayLocalDateString()).split('-');
      lastDueYear = parseInt(y, 10);
      lastDueMonth = parseInt(m, 10);
    }

    const regularAmount =
      existing[existing.length - 1]?.amount ||
      (isKitnet
        ? getKitnetMonthlyTotal(contract as KitnetContract)
        : (contract as MotoContract).monthlyValue || 0);

    const completedInstallments: Installment[] = [...existing];

    for (let i = 1; i <= missingCount; i++) {
      const monthOffset = (lastDueMonth - 1) + i;
      const curYear = lastDueYear + Math.floor(monthOffset / 12);
      const curMonth = (monthOffset % 12) + 1;
      const dueDateStr = buildValidDateString(curYear, curMonth, dueDay);
      const instNumber = existing.length + i;

      completedInstallments.push({
        id: `inst-auto-${contract.id}-${instNumber}`,
        number: instNumber,
        totalInstallments: duration,
        dueDate: dueDateStr,
        amount: regularAmount,
        status: 'pendente',
      });
    }

    // Normaliza totalInstallments de todas as parcelas
    const normalizedInstallments = completedInstallments.map((inst) => ({
      ...inst,
      totalInstallments: duration,
    }));

    return {
      ...contract,
      endDate: contract.endDate || calculateContractEndDate(contract.startDate, duration),
      installments: normalizedInstallments,
    };
  },
};

export const contractService = {
  generatePaymentSchedule,
  generateMonthlyPayments,
  calculateContractEndDate,
  buildValidDateString,
  renewalService,
  extensionService,
  reajusteService,
  leaseService,
};
