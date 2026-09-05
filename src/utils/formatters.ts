import {
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
  getDaysUntil,
} from './dateUtils';

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
  getDaysUntil,
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  // CNPJ
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

export function maskCPFInput(v: string): string {
  if (!v) return '';
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskPhoneInput(v: string): string {
  if (!v) return '';
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function maskCEPInput(v: string): string {
  if (!v) return '';
  const digits = v.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Formata máscara de placa veicular brasileira (Tradicional ou Mercosul).
 * Aceita apenas letras e números, convertendo para maiúsculas e adicionando
 * o hífen separador após as 3 primeiras letras (ex: BRA-2E19 ou ABC-1234).
 * Nunca insere caracteres especiais espúrios como $, & ou outros.
 */
export function maskPlateInput(value: string): string {
  if (!value) return '';
  // Limpa tudo que não for letra ou número e converte para maiúsculas
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (clean.length <= 3) {
    return clean;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

export interface LicensePlateValidationResult {
  isValid: boolean;
  type?: 'mercosul' | 'antigo';
  formatted: string;
  error?: string;
}

/**
 * Valida se a placa informada atende rigorosamente aos padrões brasileiros:
 * - Padrão Antigo (Cinza): 3 letras + 4 números (ex: ABC-1234)
 * - Padrão Mercosul: 3 letras + 1 número + 1 letra + 2 números (ex: BRA-2E19)
 */
export function validateLicensePlate(plate?: string): LicensePlateValidationResult {
  if (!plate || typeof plate !== 'string') {
    return {
      isValid: false,
      formatted: '',
      error: 'Placa não informada.',
    };
  }

  const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length !== 7) {
    return {
      isValid: false,
      formatted: maskPlateInput(plate),
      error: `A placa precisa ter 7 caracteres alfanuméricos (atualmente tem ${clean.length}).`,
    };
  }

  // Verifica se contém caracteres inválidos/corrompidos
  if (/[\$&@#%*+=!<>]/.test(plate)) {
    return {
      isValid: false,
      formatted: maskPlateInput(plate),
      error: 'A placa contém caracteres especiais inválidos.',
    };
  }

  // 1. Padrão Mercosul: 3 letras + 1 dígito + 1 letra + 2 dígitos (ex: BRA2E19)
  const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean);
  if (isMercosul) {
    return {
      isValid: true,
      type: 'mercosul',
      formatted: `${clean.slice(0, 3)}-${clean.slice(3)}`,
    };
  }

  // 2. Padrão Antigo: 3 letras + 4 dígitos (ex: ABC1234)
  const isAntigo = /^[A-Z]{3}[0-9]{4}$/.test(clean);
  if (isAntigo) {
    return {
      isValid: true,
      type: 'antigo',
      formatted: `${clean.slice(0, 3)}-${clean.slice(3)}`,
    };
  }

  return {
    isValid: false,
    formatted: maskPlateInput(plate),
    error: 'Formato de placa inválido. Exemplos aceitos: ABC-1234 (Antigo) ou BRA-2E19 (Mercosul).',
  };
}

/**
 * Detecta se uma placa existente no sistema está corrompida ou com formato inválido
 */
export function isPlateCorruptedOrInvalid(plate?: string): boolean {
  if (!plate) return true;
  // Se contém $ ou & ou outros caracteres corrompidos
  if (/[\$&@#%*+=!<>]/.test(plate)) return true;
  const validation = validateLicensePlate(plate);
  return !validation.isValid;
}

export function getCNHStatus(expirationDate: string): {
  status: 'valida' | 'vencendo' | 'vencida';
  days: number;
  label: string;
  badgeClass: string;
} {
  const days = getDaysUntil(expirationDate);
  if (days < 0) {
    return {
      status: 'vencida',
      days: Math.abs(days),
      label: `Vencida há ${Math.abs(days)} dias`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 whitespace-nowrap shrink-0',
    };
  }
  if (days <= 30) {
    return {
      status: 'vencendo',
      days,
      label: `Vence em ${days} dias`,
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40 whitespace-nowrap shrink-0',
    };
  }
  return {
    status: 'valida',
    days,
    label: `Válida (${days} dias)`,
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 whitespace-nowrap shrink-0',
  };
}

export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(clean.charAt(10));
}

export function formatCurrencyExtenso(valor: number): string {
  if (!valor || valor <= 0) return 'zero reais';
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converterCentena(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    const partes: string[] = [];

    if (c > 0) partes.push(centenas[c]);
    if (d === 1) {
      partes.push(especiais[u]);
    } else {
      if (d > 1) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }
    return partes.join(' e ');
  }

  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);

  const milhares = Math.floor(inteiro / 1000);
  const resto = inteiro % 1000;

  const partesTexto: string[] = [];

  if (milhares > 0) {
    if (milhares === 1) {
      partesTexto.push('mil');
    } else {
      partesTexto.push(`${converterCentena(milhares)} mil`);
    }
  }

  if (resto > 0) {
    partesTexto.push(converterCentena(resto));
  }

  let resultado = partesTexto.join(milhares > 0 && resto > 0 && (resto < 100 || resto % 100 === 0) ? ' e ' : ' ');
  if (!resultado.trim()) resultado = 'zero';

  resultado += inteiro === 1 ? ' real' : ' reais';

  if (centavos > 0) {
    resultado += ` e ${converterCentena(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }

  return resultado;
}

