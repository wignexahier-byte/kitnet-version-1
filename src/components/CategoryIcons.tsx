import React from 'react';
import { Motorbike, Home } from 'lucide-react';
import { TOKENS } from '../styles/tokens';

interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Real Motorcycle icon (Motorbike from lucide-react)
 */
export const MotoIcon: React.FC<IconProps> = ({
  className = '',
  size = 20,
  color = 'currentColor',
}) => {
  return (
    <Motorbike
      size={size}
      color={color}
      className={`shrink-0 ${className}`}
    />
  );
};

/**
 * Normal House icon (Home from lucide-react)
 */
export const KitnetIcon: React.FC<IconProps> = ({
  className = '',
  size = 20,
  color = 'currentColor',
}) => {
  return (
    <Home
      size={size}
      color={color}
      className={`shrink-0 ${className}`}
    />
  );
};

interface CategoryStampProps {
  category: 'moto' | 'kitnet';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

export const CategoryStamp: React.FC<CategoryStampProps> = ({
  category,
  size = 'md',
  showLabel = false,
  label,
  className = '',
  iconOnly = false,
}) => {
  const isMoto = category === 'moto';

  const sizeClasses = {
    xs: {
      box: 'w-6 h-6 rounded-md',
      icon: 13,
      text: 'text-[10px] px-1.5 py-0.5',
    },
    sm: {
      box: 'w-8 h-8 rounded-lg',
      icon: 16,
      text: 'text-xs px-2 py-1',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 20,
      text: 'text-xs px-2.5 py-1.5',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 24,
      text: 'text-sm px-3 py-2',
    },
  }[size];

  const colorStyles = isMoto
    ? {
        bg: 'bg-[#E07A3F]/10',
        border: 'border-[#E07A3F]/25',
        text: 'text-[#E07A3F]',
        hex: '#E07A3F',
      }
    : {
        bg: 'bg-[#0EA5E9]/10',
        border: 'border-[#0EA5E9]/25',
        text: 'text-[#0EA5E9]',
        hex: '#0EA5E9',
      };

  const defaultLabel = isMoto ? 'Frota de Motos' : 'Imóveis de Kitnets';
  const displayLabel = label || defaultLabel;

  if (iconOnly || !showLabel) {
    return (
      <div
        className={`flex items-center justify-center border shrink-0 transition-transform ${colorStyles.bg} ${colorStyles.border} ${colorStyles.text} ${sizeClasses.box} ${className}`}
        title={displayLabel}
      >
        {isMoto ? (
          <MotoIcon size={sizeClasses.icon} color={colorStyles.hex} />
        ) : (
          <KitnetIcon size={sizeClasses.icon} color={colorStyles.hex} />
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border font-semibold ${colorStyles.bg} ${colorStyles.border} ${colorStyles.text} ${sizeClasses.text} ${className}`}
    >
      {isMoto ? (
        <MotoIcon size={sizeClasses.icon} color={colorStyles.hex} />
      ) : (
        <KitnetIcon size={sizeClasses.icon} color={colorStyles.hex} />
      )}
      <span>{displayLabel}</span>
    </div>
  );
};
