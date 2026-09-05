import React from 'react';
import { createPortal } from 'react-dom';
import { FileCheck, FileText, X } from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant, SystemSettings } from '../../../types';
import { formatCurrency, formatCPF } from '../../../utils/formatters';
import { generateKitnetContractPdfFile } from '../../../utils/pdfGenerator';

interface KitnetContractSuccessModalProps {
  data: {
    kitnet: Kitnet;
    tenant: KitnetTenant;
    contract: KitnetContract;
  } | null;
  settings: SystemSettings;
  onClose: () => void;
}

export const KitnetContractSuccessModal: React.FC<KitnetContractSuccessModalProps> = ({
  data,
  settings,
  onClose,
}) => {
  if (!data) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-sky-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-modal-enter relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white leading-tight">
              Contrato de Locação Residencial
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Unidade vinculada com sucesso ao inquilino.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#0E111A] border border-white/[0.08] rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Imóvel / Unidade:</span>
            <span className="font-semibold text-white">
              {data.kitnet.name} (Unid. {data.kitnet.number})
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Locatário(a):</span>
            <span className="font-semibold text-sky-400">
              {data.tenant.fullName}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>CPF:</span>
            <span className="font-mono text-white">
              {formatCPF(data.tenant.cpf)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Aluguel Mensal:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {formatCurrency(data.contract.rentValue)} / mês
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              generateKitnetContractPdfFile({
                kitnet: data.kitnet,
                contract: data.contract,
                tenant: data.tenant,
                settings,
                autoDownload: true,
              });
            }}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Contrato de Locação (Baixar PDF)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-white/[0.10] active:scale-95 cursor-pointer"
          >
            Fechar / Visualizar Unidade
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
