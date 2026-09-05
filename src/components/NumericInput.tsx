import React, { useState, useEffect } from 'react';

/**
 * ============================================================================
 * DIRETRIZ DE DESENVOLVIMENTO DO PROJETO: COMPONENTE ÚNICO DE NÚMEROS / MOEDA
 * ============================================================================
 * NUNCA utilize <input type="number"> ou <input type="text"> com formatação solta
 * para campos monetários ou numéricos.
 * 
 * Utilize SEMPRE este componente compartilhado:
 * - <CurrencyInput /> para valores em Reais (R$)
 * - <NumericInput mode="currency" /> para valores monetários
 * - <NumericInput mode="number" /> para números gerais (KM, dias, parcelas)
 * - <NumericInput mode="integer" /> para inteiros puros
 * 
 * Características principais:
 * 1. Começa vazio quando o valor for 0 ou undefined (exibe apenas o placeholder).
 * 2. NUNCA concatena novos dígitos a um zero pré-existente (elimina o bug "02300").
 * 3. Remove automaticamente zeros à esquerda desnecessários (mantém decimais como "0,50").
 * ============================================================================
 */

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number | null;
  onChange: (value: number) => void;
  mode?: 'currency' | 'number' | 'integer';
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  mode = 'currency',
  prefix,
  suffix,
  placeholder,
  min,
  max,
  step,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  autoFocus = false,
  ...rest
}) => {
  // Converte número em string legível sem zeros à esquerda
  const formatInitialDisplay = (val?: number | null): string => {
    if (val === undefined || val === null || val === 0) {
      return '';
    }
    if (mode === 'currency') {
      return val.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return String(val);
  };

  const [displayValue, setDisplayValue] = useState<string>(() => formatInitialDisplay(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sincroniza estado interno quando o valor externo mudar (e não estiver em edição ativa)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatInitialDisplay(value));
    }
  }, [value, isFocused, mode]);

  // Limpa e normaliza valor digitado
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (mode === 'currency') {
      // Remove tudo que não for dígito
      const digitsOnly = raw.replace(/\D/g, '');

      if (!digitsOnly) {
        setDisplayValue('');
        onChange(0);
        return;
      }

      // Remove zeros à esquerda no raw de inteiros (ex: "002300" -> "2300")
      const normalizedDigits = digitsOnly.replace(/^0+/, '');
      if (!normalizedDigits) {
        setDisplayValue('0,00');
        onChange(0);
        return;
      }

      // Converte para centavos (ex: "2300" -> 23.00, "230000" -> 2300.00)
      const cents = parseInt(normalizedDigits, 10);
      const numericValue = cents / 100;

      const formatted = (numericValue).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setDisplayValue(formatted);
      onChange(numericValue);
    } else {
      // Modo number ou integer
      let clean = raw.replace(/[^\d.,]/g, '').replace(',', '.');

      if (!clean) {
        setDisplayValue('');
        onChange(0);
        return;
      }

      // Se começar com zero seguido de dígito (ex: "02300"), remove o zero inicial
      if (/^0[0-9]+/.test(clean)) {
        clean = clean.replace(/^0+/, '');
      }

      if (mode === 'integer') {
        clean = clean.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
      }

      let parsed = mode === 'integer' ? parseInt(clean, 10) : parseFloat(clean);
      if (isNaN(parsed)) {
        parsed = 0;
      }

      if (min !== undefined && parsed < min) {
        parsed = min;
      }
      if (max !== undefined && parsed > max) {
        parsed = max;
      }

      setDisplayValue(clean);
      onChange(parsed);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Se o valor for 0 e a string estiver vazia, mantém vazia para digitar direto
    if (value === 0 && !displayValue) {
      setDisplayValue('');
    }
    rest.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setDisplayValue(formatInitialDisplay(value));
    rest.onBlur?.(e);
  };

  // Prefixo padrão para moeda
  const effectivePrefix = prefix !== undefined ? prefix : mode === 'currency' ? 'R$' : '';
  const defaultPlaceholder = placeholder || (mode === 'currency' ? '0,00' : '0');

  return (
    <div className="relative flex items-center w-full">
      {effectivePrefix && (
        <span className="absolute left-3.5 text-xs font-semibold text-[#D4D4D8] select-none pointer-events-none z-10">
          {effectivePrefix}
        </span>
      )}
      <input
        {...rest}
        id={id}
        name={name}
        type="text"
        inputMode={mode === 'currency' ? 'numeric' : 'decimal'}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        placeholder={defaultPlaceholder}
        className={`w-full bg-[#0B0D14] border border-white/[0.12] hover:border-white/[0.22] hover:bg-[#0E1119] focus:bg-[#0E1119] rounded-xl py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/25 transition-all tabular-nums disabled:opacity-100 read-only:opacity-100 ${
          effectivePrefix ? 'pl-10 pr-3.5' : suffix ? 'pl-3.5 pr-9' : 'px-3.5'
        } ${className}`}
      />
      {suffix && (
        <span className="absolute right-3.5 text-xs font-medium text-[#D4D4D8] select-none pointer-events-none z-10">
          {suffix}
        </span>
      )}
    </div>
  );
};

/**
 * Atalho semântico pré-configurado para Moeda Brasileira (R$)
 */
export const CurrencyInput: React.FC<Omit<NumericInputProps, 'mode'>> = (props) => {
  return <NumericInput mode="currency" {...props} />;
};

export default NumericInput;
