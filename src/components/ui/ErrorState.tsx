import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocorreu um erro',
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-500/20 bg-red-950/20 backdrop-blur-sm
        ${className}
      `}
    >
      <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 mb-4">
        <AlertTriangle size={28} />
      </div>
      <h3 className="text-base font-bold text-red-200 mb-1">{title}</h3>
      <p className="text-xs text-red-300/80 max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="danger"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
