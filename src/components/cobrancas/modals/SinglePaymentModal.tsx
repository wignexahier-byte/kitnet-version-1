import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCheck, X, Check, Smartphone, DollarSign, CreditCard } from 'lucide-react';
import { BillingItem } from '../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface SinglePaymentModalProps {
  item: BillingItem;
  onClose: () => void;
  onConfirm: (item: BillingItem, method: 'pix' | 'dinheiro' | 'transferencia' | 'cartao', notes: string) => void;
}

export const SinglePaymentModal: React.FC<SinglePaymentModalProps> = ({
  item,
  onClose,
  onConfirm,
}) => {
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'transferencia' | 'cartao'>('pix');

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl w-full max-w-md min-w-0 overflow-hidden flex flex-col my-auto shadow-2xl animate-modal-enter">
        <div className="p-4 sm:p-5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#121214] gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#F2F1ED] truncate">Confirmar Pagamento</h3>
              <p className="text-[11px] sm:text-xs text-[#9C9CA3] truncate">Registro de quitação de parcela</p>
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
          {/* Item Summary Card */}
          <div className="bg-[#121214] border border-[#2A2A2E] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9C9CA3] uppercase tracking-wider">Cliente</span>
              <span className="text-sm font-bold text-[#F2F1ED]">{item.clientName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9C9CA3]">
              <span>Ativo:</span>
              <span className="text-[#F2F1ED] font-medium">{item.assetName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9C9CA3]">
              <span>Parcela:</span>
              <span className="text-[#F2F1ED] font-medium">
                {item.installmentNumber}/{item.totalInstallments} (Venc: {formatDate(item.dueDate)})
              </span>
            </div>
            <div className="pt-2 border-t border-[#2A2A2E] flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B5CF6]">Valor Quitado:</span>
              <span className="text-lg font-black text-[#10B981] tabular-nums">
                {formatCurrency(item.amount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['pix', 'dinheiro', 'transferencia', 'cartao'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                    paymentMethod === method
                      ? 'bg-[#8B5CF6] text-[#121214] border-[#8B5CF6]'
                      : 'bg-[#121214] text-[#9C9CA3] border-[#2A2A2E] hover:border-[#3F3F46]'
                  }`}
                >
                  {method === 'pix' && <Smartphone className="w-3.5 h-3.5" />}
                  {method === 'dinheiro' && <DollarSign className="w-3.5 h-3.5" />}
                  {method === 'transferencia' && <CreditCard className="w-3.5 h-3.5" />}
                  {method === 'cartao' && <CreditCard className="w-3.5 h-3.5" />}
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Observação Opcional */}
          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comprovante enviado no WhatsApp, pagamento adiantado..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full bg-[#121214] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] placeholder-[#5F5F66] focus:outline-none focus:border-[#8B5CF6] transition-all"
            />
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
            onClick={() => onConfirm(item, paymentMethod, paymentNotes)}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-[#22c55e] text-[#121214] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#10B981]/15"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Confirmar Quitação
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
