import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X } from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { CurrencyInput } from '../../NumericInput';

interface RenewKitnetContractModalProps {
  isOpen: boolean;
  selectedKitnet: Kitnet | null;
  activeContract: KitnetContract | null;
  tenant?: KitnetTenant;
  onClose: () => void;
  onConfirm: (additionalMonths: number, newRentValue: number, reason: string) => void;
}

export const RenewKitnetContractModal: React.FC<RenewKitnetContractModalProps> = ({
  isOpen,
  selectedKitnet,
  activeContract,
  tenant,
  onClose,
  onConfirm,
}) => {
  const [renewForm, setRenewForm] = useState({
    additionalMonths: 12,
    newRentValue: activeContract?.rentValue || 0,
    reason: 'Renovação anual com emissão de novo cronograma de pagamentos',
  });

  React.useEffect(() => {
    if (activeContract) {
      setRenewForm((prev) => ({
        ...prev,
        newRentValue: activeContract.rentValue || 0,
      }));
    }
  }, [activeContract]);

  if (!isOpen || !selectedKitnet || !activeContract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      Number(renewForm.additionalMonths),
      Number(renewForm.newRentValue),
      renewForm.reason
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-enter">
        {/* Header Fixo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0E111A] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base text-white font-bold">Formalizar Aditivo de Renovação</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 text-xs modal-scroll-container">
            <div className="p-3.5 bg-[#0E111A] border border-sky-500/20 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Locatário / Unidade:</span>
              <p className="font-bold text-white text-sm">
                {tenant?.fullName || 'Inquilino'} • {selectedKitnet.name} (Unidade {selectedKitnet.number})
              </p>
              <p className="text-xs text-sky-400 font-medium">
                Vigência atual com {activeContract.installments.length} parcelas registradas no histórico.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Extensão de Prazo (Meses) *</label>
              <select
                value={renewForm.additionalMonths}
                onChange={(e) => setRenewForm({ ...renewForm, additionalMonths: Number(e.target.value) })}
                className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-xs"
              >
                <option value={12}>+ 12 Meses (1 Ano)</option>
                <option value={24}>+ 24 Meses (2 Anos)</option>
                <option value={6}>+ 6 Meses (Semestral)</option>
                <option value={36}>+ 36 Meses (3 Anos)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Novo Aluguel Base Líquido (R$) *</label>
              <CurrencyInput
                value={renewForm.newRentValue}
                onChange={(val) => setRenewForm({ ...renewForm, newRentValue: val })}
                className="w-full bg-[#0E111A] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-sky-500 text-sm"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Taxa de água de {formatCurrency(activeContract.waterValue)} será somada em cada vencimento.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Motivo / Fundamentação do Aditivo</label>
              <input
                type="text"
                required
                value={renewForm.reason}
                onChange={(e) => setRenewForm({ ...renewForm, reason: e.target.value })}
                className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-xs"
              />
            </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-white/[0.08] bg-[#0E111A] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white font-semibold rounded-xl text-xs border border-white/[0.10] active:scale-95 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Confirmar Aditivo & Gerar Parcelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
