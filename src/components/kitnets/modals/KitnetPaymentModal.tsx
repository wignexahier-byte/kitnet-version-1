import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { Installment } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface KitnetPaymentModalProps {
  paymentData: { contractId: string; installment: Installment } | null;
  onClose: () => void;
  onConfirm: (contractId: string, installmentId: string) => void;
}

export const KitnetPaymentModal: React.FC<KitnetPaymentModalProps> = ({
  paymentData,
  onClose,
  onConfirm,
}) => {
  if (!paymentData) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-white/[0.12] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 my-auto animate-modal-enter">
        <div className="flex items-center gap-2.5 text-white font-bold text-base">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span>Confirmar Recebimento</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Confirmar o pagamento da parcela <strong className="text-white">#{paymentData.installment.number}</strong> no valor de <strong className="text-sky-400 font-mono font-bold text-sm">{formatCurrency(paymentData.installment.amount)}</strong>?
        </p>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.10] active:scale-95 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(paymentData.contractId, paymentData.installment.id)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
