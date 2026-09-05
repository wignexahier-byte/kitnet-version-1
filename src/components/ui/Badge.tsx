import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'moto'
  | 'kitnet'
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral'
  | 'outline';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  leftIcon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30',
  moto: 'bg-[#E07A3F]/15 text-[#FB923C] border-[#E07A3F]/30',
  kitnet: 'bg-[#0EA5E9]/15 text-[#38BDF8] border-[#0EA5E9]/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
  outline: 'bg-transparent text-slate-300 border-white/20',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-[#8B5CF6]',
  moto: 'bg-[#E07A3F]',
  kitnet: 'bg-[#0EA5E9]',
  success: 'bg-emerald-400 animate-pulse',
  danger: 'bg-rose-400 animate-pulse',
  warning: 'bg-amber-400',
  neutral: 'bg-slate-400',
  outline: 'bg-slate-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1 rounded-md font-medium',
  sm: 'px-2 py-0.5 text-xs gap-1.5 rounded-lg font-semibold',
  md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg font-bold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
  leftIcon,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center border select-none whitespace-nowrap uppercase tracking-wider ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
    </span>
  );
};
