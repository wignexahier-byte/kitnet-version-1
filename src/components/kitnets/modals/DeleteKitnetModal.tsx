import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Kitnet, KitnetContract } from '../../../types';

interface DeleteKitnetModalProps {
  kitnetToDelete: Kitnet | null;
  kitnetContracts: KitnetContract[];
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteKitnetModal: React.FC<DeleteKitnetModalProps> = ({
  kitnetToDelete,
  kitnetContracts,
  onClose,
  onConfirm,
}) => {
  if (!kitnetToDelete) return null;

  const hasActiveContract = kitnetContracts.some(
    (c) => c.kitnetId === kitnetToDelete.id && c.status === 'ativo'
  );

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-white/[0.12] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto animate-modal-enter">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white">Excluir Kitnet Definitivamente?</h3>
          <p className="text-xs text-slate-400">
            Você está prestes a remover <strong className="text-white">{kitnetToDelete.name} (Unidade {kitnetToDelete.number})</strong>.
          </p>
        </div>

        {hasActiveContract && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-200">Atenção: Locatário Ativo Detectado!</strong>
              <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">
                Esta kitnet possui contrato em vigor. Ao excluí-la, o vínculo de contrato e o histórico desta unidade também serão encerrados.
              </p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-400 text-center">
          Esta ação é permanente e atualizará seu balanço patrimonial.
        </p>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white font-semibold rounded-xl text-xs border border-white/[0.10] active:scale-95 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-delete-kitnet"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sim, Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
