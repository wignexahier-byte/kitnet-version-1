import React from 'react';

export type TagVariant = 'default' | 'motos' | 'kitnets' | 'success' | 'danger' | 'warning' | 'violet';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: 'sm' | 'md';
  onRemove?: () => void;
  icon?: React.ReactNode;
}

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-slate-800/80 text-slate-300 border-white/10',
  motos: 'bg-[#E07A3F]/15 text-[#FDBA74] border-[#E07A3F]/30',
  kitnets: 'bg-[#0EA5E9]/15 text-[#7DD3FC] border-[#0EA5E9]/30',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-300 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onRemove,
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-lg border backdrop-blur-sm whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeClasses}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-current opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
};
