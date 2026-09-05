import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export type DrawerPosition = 'bottom' | 'right' | 'left';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: DrawerPosition;
  showCloseButton?: boolean;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'bottom',
  showCloseButton = true,
  className = '',
}) => {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionStyles = {
    bottom:
      'fixed inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t border-white/15 animate-slideInBottom',
    right:
      'fixed inset-y-0 right-0 max-w-md w-full rounded-l-3xl border-l border-white/15 animate-slideInRight',
    left:
      'fixed inset-y-0 left-0 max-w-md w-full rounded-r-3xl border-r border-white/15 animate-slideInLeft',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        className={`relative z-10 bg-[#0F172A] shadow-2xl flex flex-col overflow-hidden ${
          positionStyles[position]
        } ${className}`}
      >
        {/* Drag handle for bottom drawer */}
        {position === 'bottom' && (
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#131C2E]/60">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              )}
              {description && (
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all ml-auto shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#0B0F17]/80 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
