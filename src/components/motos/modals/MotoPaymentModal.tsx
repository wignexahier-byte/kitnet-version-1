import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { Installment, Moto } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface MotoPaymentModalProps {
  paymentData: { contractId: string; installment: Installment } | null;
  moto?: Moto;
  onClose: () => void;
  onConfirm: (contractId: string, installmentId: string, notes?: string) => void;
}

export const MotoPaymentModal: React.FC<MotoPaymentModalProps> = ({
  paymentData,
  moto,
  onClose,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Transferência' | 'Cartão'>('PIX');
  const [notes, setNotes] = useState('');

  if (!paymentData || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noteText = notes.trim()
      ? `Baixa de parcela (${paymentMethod}): ${notes.trim()}`
      : `Baixa de parcela confirmada via ${paymentMethod}`;
    onConfirm(paymentData.contractId, paymentData.installment.id, noteText);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl shadow-black/80 space-y-4 my-auto animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Baixar / Confirmar Parcela</h3>
              {moto && (
                <p className="text-xs text-slate-400">
                  {moto.brand} {moto.model} ({moto.plate})
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo da Parcela */}
        <div className="p-4 bg-[#090B10] rounded-xl border border-white/[0.08] space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Parcela:</span>
            <span className="font-bold text-white font-mono">
              #{String(paymentData.installment.number).padStart(2, '0')}/{paymentData.installment.totalInstallments}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Vencimento:</span>
            <span className="text-slate-300 font-medium">{formatDate(paymentData.installment.dueDate)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/[0.06]">
            <span className="text-slate-400">Valor a Receber:</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {formatCurrency(paymentData.installment.amount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Método de Pagamento */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {(['PIX', 'Dinheiro', 'Transferência', 'Cartão'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 ring-2 ring-emerald-500/25 font-bold shadow-md shadow-emerald-500/15'
                      : 'bg-[#090B10] border-white/[0.10] text-slate-400 hover:text-white hover:border-white/[0.20]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Observações (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Pago via PIX pelo locatário"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/[0.10] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Pagamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
