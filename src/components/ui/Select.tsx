import React, { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      fullWidth = true,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-rose-400 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full appearance-none bg-[#121824] text-slate-100 rounded-xl border transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed pl-3.5 pr-10 py-2.5 h-10 cursor-pointer ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={String(opt.value)}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-[#0B0F17] text-slate-100"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-400 animate-fadeIn flex items-center gap-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-slate-400 leading-relaxed">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
