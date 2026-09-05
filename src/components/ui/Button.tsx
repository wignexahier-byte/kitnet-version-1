import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'moto'
  | 'kitnet';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#8B5CF6] hover:bg-[#7C4FE0] text-white shadow-sm shadow-[#8B5CF6]/25 active:scale-[0.98]',
  secondary:
    'bg-[#1E293B] hover:bg-[#334155] text-slate-100 border border-white/10 active:scale-[0.98]',
  outline:
    'bg-transparent hover:bg-white/5 text-slate-200 border border-white/15 hover:border-white/30 active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white active:scale-[0.98]',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/25 active:scale-[0.98]',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25 active:scale-[0.98]',
  moto:
    'bg-[#E07A3F] hover:bg-[#C25E26] text-white shadow-sm shadow-[#E07A3F]/25 active:scale-[0.98]',
  kitnet:
    'bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-sm shadow-[#0EA5E9]/25 active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg',
  sm: 'h-8.5 px-3 text-xs font-semibold gap-1.5 rounded-xl',
  md: 'h-10 px-4 text-sm font-semibold gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base font-semibold gap-2.5 rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
