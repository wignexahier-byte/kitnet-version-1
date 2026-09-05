export {
  generatePaymentSchedule,
  generateMonthlyPayments,
  calculateContractEndDate,
  buildValidDateString,
  getDaysInMonth,
  renewalService,
  extensionService,
  reajusteService,
  leaseService,
  contractService,
} from '../services/contractService';

export type {
  ScheduleCalculationOptions,
  GeneratedScheduleResult,
} from '../services/contractService';

import {
  generatePaymentSchedule,
  ScheduleCalculationOptions,
  GeneratedScheduleResult,
} from '../services/contractService';
import { KitnetContract } from '../types';
import { safeAdd } from './financialMath';

export {
  getKitnetMonthlyTotal,
  getKitnetAssetMonthlyBase,
  getKitnetMonthlyBreakdown,
  getMotoMonthlyTotal,
  getKitnetTotalFees,
  calculateContractTotalValue,
  sumInstallmentAmounts,
  weeklyToMonthly,
  monthlyToWeekly,
} from '../domain/calculations';

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function getWeekdayName(dayIndex: number): string {
  return WEEKDAY_NAMES[dayIndex] || 'Segunda-feira';
}

/**
 * Função retrocompatível que delega para o motor auditado generatePaymentSchedule
 */
export function generateContractSchedule(options: ScheduleCalculationOptions): GeneratedScheduleResult {
  return generatePaymentSchedule(options);
}
