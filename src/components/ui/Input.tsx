import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      fullWidth = true,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-rose-400 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          {prefixText && (
            <span className="absolute left-3.5 text-slate-400 text-sm font-semibold pointer-events-none select-none">
              {prefixText}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-[#121824] text-slate-100 placeholder-slate-500 rounded-xl border transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20'
            } ${leftIcon || prefixText ? (prefixText ? 'pl-11' : 'pl-10') : 'pl-3.5'} ${
              rightIcon || suffixText ? 'pr-10' : 'pr-3.5'
            } py-2.5 h-10 ${className}`}
            {...props}
          />

          {suffixText && (
            <span className="absolute right-3.5 text-slate-400 text-sm font-medium pointer-events-none select-none">
              {suffixText}
            </span>
          )}

          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
