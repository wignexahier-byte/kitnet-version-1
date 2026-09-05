import React, { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = '',
      rows = 3,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          className={`
            w-full rounded-xl bg-slate-900/90 border px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500
            transition-all duration-200 outline-none resize-y
            ${
              error
                ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-950/60' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
