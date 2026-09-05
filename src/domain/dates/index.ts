/**
 * Domain - Dates (Fonte Única da Verdade para Datas Civis)
 *
 * Centraliza e oficializa:
 * - today()
 * - parseDate()
 * - formatDate()
 * - formatDateFullPT()
 * - formatDurationExtenso()
 * - addDays()
 * - addMonths()
 * - addMonthsToDate()
 * - calculateContractEndDate()
 * - calculateDueDate()
 * - calculateLateDays()
 * - getMonthKey()
 * - isInstallmentOverdue()
 * - getDaysUntil()
 * - getDaysInMonth()
 * - buildValidDateString()
 */

export {
  today,
  getTodayLocalDateString,
  parseDate,
  getDaysInMonth,
  buildValidDateString,
  formatDate,
  formatDateFullPT,
  formatDurationExtenso,
  addDays,
  addMonths,
  addMonthsToDate,
  calculateContractEndDate,
  calculateDueDate,
  calculateLateDays,
  getMonthKey,
  isInstallmentOverdue,
  filterOverdueInstallments,
  daysBetweenDates,
  getDaysUntil,
} from '../../utils/dateUtils';
