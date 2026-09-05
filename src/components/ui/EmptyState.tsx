import React from 'react';
import { Button, ButtonVariant } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  className?: string;
  category?: 'default' | 'motos' | 'kitnets';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
  category = 'default',
}) => {
  const getIconContainerStyle = () => {
    switch (category) {
      case 'motos':
        return 'bg-[#E07A3F]/10 border-[#E07A3F]/20 text-[#FDBA74]';
      case 'kitnets':
        return 'bg-[#0EA5E9]/10 border-[#0EA5E9]/20 text-[#7DD3FC]';
      case 'default':
      default:
        return 'bg-violet-500/10 border-violet-500/20 text-violet-300';
    }
  };

  const getButtonVariant = (): ButtonVariant => {
    switch (category) {
      case 'motos':
        return 'moto';
      case 'kitnets':
        return 'kitnet';
      default:
        return 'primary';
    }
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm
        ${className}
      `}
    >
      <div className={`p-4 rounded-2xl border mb-4 ${getIconContainerStyle()}`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant={getButtonVariant()}
          size="sm"
          onClick={onAction}
          leftIcon={actionIcon}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
