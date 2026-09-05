/**
 * Domain - Contracts (Regras Oficiais de Contratos, Cronogramas e Vigências)
 *
 * Centraliza e oficializa:
 * - Geração de cronograma mensal e semanal de parcelas
 * - Renovação de contratos (+N meses)
 * - Prorrogação de prazos
 * - Reajuste de aluguéis
 * - Integridade do cronograma e parcelas
 */

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
} from '../../services/contractService';

export type {
  ScheduleCalculationOptions,
  GeneratedScheduleResult,
} from '../../services/contractService';

export { generateContractSchedule } from '../../utils/contractCalculations';
