import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';
import { Kitnet, KitnetContract } from '../../../types';

interface TerminateKitnetModalProps {
  kitnetToTerminate: { contract: KitnetContract; kitnet: Kitnet } | null;
  onClose: () => void;
  onConfirm: (contractId: string, newStatus: 'disponivel' | 'reforma', notes: string) => void;
}

export const TerminateKitnetModal: React.FC<TerminateKitnetModalProps> = ({
  kitnetToTerminate,
  onClose,
  onConfirm,
}) => {
  const [terminateForm, setTerminateForm] = useState({
    newStatus: 'disponivel' as 'disponivel' | 'reforma',
    notes: 'Desocupação realizada e chaves devolvidas após conferência.',
  });

  if (!kitnetToTerminate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      kitnetToTerminate.contract.id,
      terminateForm.newStatus,
      terminateForm.notes
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-enter">
        {/* Header Fixo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0E111A] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <LogOut className="w-4 h-4" />
            </div>
            <h3 className="text-base text-white font-bold">Encerrar Locação & Desocupar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-8 space-y-4 text-xs modal-scroll-container">
            <p className="text-xs text-slate-300">
              Encerrar o contrato ativo da unidade <strong className="text-white">{kitnetToTerminate.kitnet.name}</strong>.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Destino da Unidade após desocupação:</label>
              <select
                value={terminateForm.newStatus}
                onChange={(e) => setTerminateForm({ ...terminateForm, newStatus: e.target.value as any })}
                className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-xs"
              >
                <option value="disponivel">Disponível para Nova Locação</option>
                <option value="reforma">Encaminhar para Reforma / Manutenção</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Observações da Devolução / Chaves:</label>
              <textarea
                rows={3}
                value={terminateForm.notes}
                onChange={(e) => setTerminateForm({ ...terminateForm, notes: e.target.value })}
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
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Confirmar Desocupação
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
