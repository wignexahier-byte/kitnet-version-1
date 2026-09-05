import React, { forwardRef } from 'react';

export type CardVariant = 'default' | 'solid' | 'interactive' | 'moto' | 'kitnet' | 'danger';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-gradient-to-b from-[#131C2E] to-[#0F172A] border border-white/10 shadow-lg shadow-black/20',
  solid:
    'bg-[#111827] border border-white/10 shadow-md',
  interactive:
    'bg-gradient-to-b from-[#131C2E] to-[#0F172A] border border-white/10 hover:border-white/25 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.99]',
  moto:
    'bg-gradient-to-b from-[#E07A3F]/10 to-[#131C2E] border border-[#E07A3F]/25 shadow-lg shadow-[#E07A3F]/5',
  kitnet:
    'bg-gradient-to-b from-[#0EA5E9]/10 to-[#131C2E] border border-[#0EA5E9]/25 shadow-lg shadow-[#0EA5E9]/5',
  danger:
    'bg-gradient-to-b from-rose-500/10 to-[#131C2E] border border-rose-500/30 shadow-lg shadow-rose-500/5',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', noPadding = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl overflow-hidden ${variantStyles[variant]} ${
          noPadding ? '' : 'p-5 sm:p-6'
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-between gap-3 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base sm:text-lg font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex items-center justify-end gap-3 mt-5 pt-4 border-t border-white/10 ${className}`} {...props}>
    {children}
  </div>
);
