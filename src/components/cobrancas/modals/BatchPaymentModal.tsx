import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCheck, X } from 'lucide-react';
import { BillingItem } from '../types';
import { formatCurrency } from '../../../utils/formatters';

interface BatchPaymentModalProps {
  items: BillingItem[];
  onClose: () => void;
  onConfirm: (items: BillingItem[]) => void;
}

export const BatchPaymentModal: React.FC<BatchPaymentModalProps> = ({
  items,
  onClose,
  onConfirm,
}) => {
  if (typeof document === 'undefined') return null;

  const totalAmount = items.reduce((acc, i) => acc + i.amount, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl w-full max-w-lg min-w-0 overflow-hidden flex flex-col my-auto shadow-2xl animate-modal-enter">
        <div className="p-4 sm:p-5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#121214] gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#F2F1ED] truncate">Baixa em Lote</h3>
              <p className="text-[11px] sm:text-xs text-[#9C9CA3] truncate">
                Quitar {items.length} parcelas selecionadas simultaneamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9C9CA3] hover:text-[#F2F1ED] p-1.5 rounded-lg hover:bg-[#2A2A2E] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overflow-x-hidden modal-scroll-container">
          <div className="bg-[#121214] border border-[#2A2A2E] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-[#9C9CA3]">Total a ser quitado:</span>
              <div className="text-xl font-bold text-[#10B981] tabular-nums">
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <span className="px-3 py-1 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-lg text-xs font-bold">
              {items.length} parcelas
            </span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-[#9C9CA3] uppercase tracking-wider">
              Parcelas a quitar:
            </span>
            {items.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-[#121214] rounded-lg border border-[#2A2A2E] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#F2F1ED] block">{item.clientName}</span>
                  <span className="text-[#9C9CA3] text-[11px]">
                    {item.assetName} • Parcela {item.installmentNumber}
                  </span>
                </div>
                <span className="font-bold text-[#10B981] tabular-nums">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[#2A2A2E] flex items-center justify-end gap-2.5 bg-[#121214] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-[#9C9CA3] hover:text-[#F2F1ED] rounded-xl hover:bg-[#1C1C1F] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(items)}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-[#22c55e] text-[#121214] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#10B981]/15"
          >
            <CheckCheck className="w-4 h-4 stroke-[2.5]" />
            Confirmar Baixa de Todas
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
