import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando dados...',
  subMessage,
  size = 'md',
  fullHeight = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;

  return (
    <div
      className={`
        flex flex-col items-center justify-center p-8 text-center
        ${fullHeight ? 'min-h-[300px] h-full' : ''}
        ${className}
      `}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
        <Loader2 size={iconSize} className="animate-spin text-violet-400 relative z-10" />
      </div>
      <p className="text-sm font-semibold text-slate-200">{message}</p>
      {subMessage && <p className="text-xs text-slate-400 mt-1 max-w-xs">{subMessage}</p>}
    </div>
  );
};
