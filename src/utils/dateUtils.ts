/**
 * Utilitário Centralizado de Datas Civis e Formatações
 * 
 * Regras Estritas:
 * 1. Datas de contratos, vencimentos e pagamentos são datas civis (YYYY-MM-DD).
 * 2. Imunes a fuso horário e transições de horário de verão (UTC safe / String-based).
 * 3. Cálculos de adição de meses respeitam o último dia de meses mais curtos (ex: 31/01 + 1 mês = 28/02 ou 29/02).
 */

/**
 * Retorna a data civil atual no formato YYYY-MM-DD com base no relógio local
 */
export function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const getTodayLocalDateString = today;

/**
 * Decompõe uma string de data (YYYY-MM-DD ou ISO) em ano, mês (1-12) e dia
 */
export function parseDate(dateString?: string): { year: number; month: number; day: number } | null {
  if (!dateString) return null;
  const clean = dateString.split('T')[0].trim();
  const parts = clean.split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
}

/**
 * Retorna a quantidade de dias em determinado mês e ano (respeita anos bissextos)
 */
export function getDaysInMonth(year: number, month: number): number {
  // month: 1 a 12
  return new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
}

/**
 * Constrói uma string YYYY-MM-DD válida limitando o dia ao máximo permitido pelo mês
 */
export function buildValidDateString(year: number, month: number, day: number): string {
  const maxDays = getDaysInMonth(year, month);
  const validDay = Math.min(Math.max(1, day), maxDays);
  return `${year}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
}

/**
 * Formata uma data YYYY-MM-DD para o padrão brasileiro DD/MM/YYYY
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const parsed = parseDate(dateString);
  if (parsed) {
    const day = String(parsed.day).padStart(2, '0');
    const month = String(parsed.month).padStart(2, '0');
    return `${day}/${month}/${parsed.year}`;
  }
  return dateString;
}

const PT_MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/**
 * Formata data no formato extenso por extenso (ex: "15 de março de 2026")
 */
export function formatDateFullPT(dateString?: string): string {
  if (!dateString) return 'Data não informada';
  const parsed = parseDate(dateString);
  if (parsed) {
    const monthName = PT_MONTHS[parsed.month - 1] || String(parsed.month);
    return `${parsed.day} de ${monthName} de ${parsed.year}`;
  }
  return dateString;
}

/**
 * Formata a duração em meses por extenso
 */
export function formatDurationExtenso(months: number): string {
  if (months === 6) return '6 (seis) meses';
  if (months === 12) return '1 (um) ano';
  if (months === 24) return '2 (dois) anos';
  if (months === 36) return '3 (três) anos';
  if (months === 1) return '1 (um) mês';
  if (months === 2) return '2 (dois) meses';
  if (months === 3) return '3 (três) meses';
  if (months === 4) return '4 (quatro) meses';
  if (months === 5) return '5 (cinco) meses';
  if (months === 18) return '18 (dezoito) meses';
  if (months === 30) return '30 (trinta) meses';
  if (months > 0 && months % 12 === 0) {
    const years = months / 12;
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${months} meses`;
}

/**
 * Adiciona uma quantidade de dias civis a uma data YYYY-MM-DD
 */
export function addDays(dateString: string, daysToAdd: number): string {
  const parsed = parseDate(dateString);
  if (!parsed) return dateString;
  const d = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0));
  d.setUTCDate(d.getUTCDate() + daysToAdd);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona meses a uma data YYYY-MM-DD, ajustando para o último dia válido do mês de destino
 */
export function addMonths(dateString?: string, monthsToAdd: number = 1): string {
  if (!dateString) {
    const t = today();
    return addMonths(t, monthsToAdd);
  }
  const parsed = parseDate(dateString);
  if (!parsed) return dateString;

  const totalMonthOffset = (parsed.month - 1) + monthsToAdd;
  const targetYear = parsed.year + Math.floor(totalMonthOffset / 12);
  const targetMonth = ((totalMonthOffset % 12) + 12) % 12 + 1;
  const maxDays = getDaysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(parsed.day, maxDays);

  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}

export const addMonthsToDate = addMonths;

/**
 * Calcula a data de término civil de um contrato
 */
export function calculateContractEndDate(startDate: string, durationMonths: number): string {
  if (!startDate) return '';
  return addMonths(startDate, durationMonths);
}

/**
 * Calcula a data de vencimento de uma parcela para um determinado ano/mês
 */
export function calculateDueDate(year: number, month: number, targetDueDay: number): string {
  return buildValidDateString(year, month, targetDueDay);
}

/**
 * Calcula a quantidade de dias em atraso entre a data de vencimento e a data de referência
 * Retorna 0 se a data de vencimento for hoje ou futura.
 */
export function calculateLateDays(dueDate: string, referenceDate: string = today()): number {
  if (!dueDate || dueDate >= referenceDate) return 0;
  const pDue = parseDate(dueDate);
  const pRef = parseDate(referenceDate);
  if (!pDue || !pRef) return 0;
  const utcDue = Date.UTC(pDue.year, pDue.month - 1, pDue.day);
  const utcRef = Date.UTC(pRef.year, pRef.month - 1, pRef.day);
  const diffDays = Math.floor((utcRef - utcDue) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Retorna a chave do mês no formato YYYY-MM
 */
export function getMonthKey(dateString?: string): string {
  if (!dateString) return today().slice(0, 7);
  const parsed = parseDate(dateString);
  if (parsed) {
    return `${parsed.year}-${String(parsed.month).padStart(2, '0')}`;
  }
  return dateString.slice(0, 7);
}

/**
 * Verifica se uma parcela está em atraso
 */
export function isInstallmentOverdue(
  inst: { status: string; dueDate: string },
  referenceDate: string = today()
): boolean {
  if (inst.status === 'pago' || inst.status === 'cancelada') return false;
  return inst.dueDate < referenceDate;
}

/**
 * Filtra parcelas em atraso em relação a uma data civil de referência
 */
export function filterOverdueInstallments<T extends { status: string; dueDate: string }>(
  installments: T[],
  referenceDate: string = today()
): T[] {
  if (!installments) return [];
  return installments.filter((inst) => isInstallmentOverdue(inst, referenceDate));
}

/**
 * Calcula a diferença em dias entre duas datas civis (endDate - startDate)
 */
export function daysBetweenDates(startDate: string, endDate: string): number {
  const pStart = parseDate(startDate);
  const pEnd = parseDate(endDate);
  if (!pStart || !pEnd) return 0;
  const utcStart = Date.UTC(pStart.year, pStart.month - 1, pStart.day);
  const utcEnd = Date.UTC(pEnd.year, pEnd.month - 1, pEnd.day);
  return Math.round((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
}

/**
 * Calcula quantos dias restam até uma data futura (ou dias de atraso se negativo)
 */
export function getDaysUntil(targetDate?: string, referenceDate: string = today()): number {
  if (!targetDate) return 0;
  const pTarget = parseDate(targetDate);
  const pRef = parseDate(referenceDate);
  if (!pTarget || !pRef) return 0;
  const utcTarget = Date.UTC(pTarget.year, pTarget.month - 1, pTarget.day);
  const utcRef = Date.UTC(pRef.year, pRef.month - 1, pRef.day);
  return Math.round((utcTarget - utcRef) / (1000 * 60 * 60 * 24));
}
