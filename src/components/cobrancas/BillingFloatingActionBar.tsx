import React from 'react';
import { createPortal } from 'react-dom';
import { Send, CheckCheck, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { BillingItem } from './types';

interface BillingFloatingActionBarProps {
  selectedItems: BillingItem[];
  onOpenBatchModal: () => void;
  onOpenBatchPayModal: () => void;
  onClearSelection: () => void;
}

export const BillingFloatingActionBar: React.FC<BillingFloatingActionBarProps> = ({
  selectedItems,
  onOpenBatchModal,
  onOpenBatchPayModal,
  onClearSelection,
}) => {
  if (typeof document === 'undefined' || selectedItems.length === 0) return null;

  const totalAmount = selectedItems.reduce((acc, i) => acc + i.amount, 0);

  return createPortal(
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] w-full max-w-2xl px-4 animate-slideUp">
      <div className="bg-[#141418]/95 backdrop-blur-md border border-[#8B5CF6]/60 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2.5 text-xs text-[#F5F5F7]">
          <div className="w-7 h-7 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {selectedItems.length}
          </div>
          <div>
            <span className="font-bold block">
              {selectedItems.length}{' '}
              {selectedItems.length === 1 ? 'parcela selecionada' : 'parcelas selecionadas'}
            </span>
            <span className="text-[#8B5CF6] font-bold tabular-nums">
              Total: {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Encaminhar Mensagens WhatsApp */}
          <button
            onClick={onOpenBatchModal}
            className="btn-primary flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            Encaminhar Mensagens
          </button>

          {/* Baixa em Lote */}
          <button
            onClick={onOpenBatchPayModal}
            className="px-3 py-2 bg-[#1E1D24] hover:bg-[#25242C] text-[#10B981] font-semibold text-xs rounded-xl border border-white/[0.08] hover:border-[#10B981]/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Quitar parcelas selecionadas"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Baixa em Lote</span>
          </button>

          {/* Limpar */}
          <button
            onClick={onClearSelection}
            className="p-2 text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            title="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
