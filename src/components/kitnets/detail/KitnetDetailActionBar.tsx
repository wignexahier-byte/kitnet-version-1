import React from 'react';
import {
  UserPlus,
  LogOut,
  Layers,
  MessageCircle,
  FileText,
  Copy,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant } from '../../../types';

interface KitnetDetailActionBarProps {
  kitnet: Kitnet;
  activeContract?: KitnetContract;
  tenant?: KitnetTenant;
  handleOpenNewContract: (kitnet: Kitnet) => void;
  setKitnetToTerminate: (data: { contract: KitnetContract; kitnet: Kitnet }) => void;
  setShowCompareModal: (show: boolean) => void;
  onOpenWhatsApp?: (contractId: string, installmentId?: string) => void;
  handleSendKitnetWhatsApp: () => void;
  onGenerateDocument: (type: 'contrato_kitnet', kitnet: Kitnet, contract?: KitnetContract, tenant?: KitnetTenant) => void;
  duplicateKitnet: (id: string) => void;
  handleOpenEditModal: (kitnet: Kitnet) => void;
  setKitnetToDelete: (kitnet: Kitnet) => void;
}

export const KitnetDetailActionBar: React.FC<KitnetDetailActionBarProps> = ({
  kitnet,
  activeContract,
  tenant,
  handleOpenNewContract,
  setKitnetToTerminate,
  setShowCompareModal,
  onOpenWhatsApp,
  handleSendKitnetWhatsApp,
  onGenerateDocument,
  duplicateKitnet,
  handleOpenEditModal,
  setKitnetToDelete,
}) => {
  return (
    <div className="bg-[#0C0F1D] rounded-2xl border border-white/[0.08] p-3 sm:p-4 space-y-3 shadow-md">
      {/* Row 1: Two primary large action buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {kitnet.status !== 'alugada' ? (
          <button
            id={`btn-new-contract-kitnet-${kitnet.id}`}
            type="button"
            onClick={() => handleOpenNewContract(kitnet)}
            className="h-12 px-4 rounded-xl bg-[#13172B] hover:bg-[#1A203B] border border-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-sky-400" />
            <span className="text-white">Criar Contrato</span>
          </button>
        ) : (
          <button
            id={`btn-terminate-contract-${kitnet.id}`}
            type="button"
            onClick={() =>
              activeContract &&
              setKitnetToTerminate({ contract: activeContract, kitnet })
            }
            className="h-12 px-4 rounded-xl bg-[#13172B] hover:bg-[#1A203B] border border-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-xs"
          >
            <LogOut className="w-4 h-4 text-[#F87171]" />
            <span className="text-white">Encerrar Locação</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowCompareModal(true)}
          className="h-12 px-4 rounded-xl bg-[#13172B] hover:bg-[#1A203B] border border-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-xs"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-white">Vistorias</span>
        </button>
      </div>

      {/* Row 2: Secondary Tools Container */}
      <div className="bg-[#101324] rounded-xl border border-white/[0.06] p-2.5 sm:p-3">
        {/* Sub-row 1: 3 quick actions in a row */}
        <div className="grid grid-cols-3 gap-1.5 text-center items-center">
          {/* 1. WhatsApp */}
          <button
            type="button"
            onClick={() => {
              if (activeContract && onOpenWhatsApp) {
                onOpenWhatsApp(activeContract.id);
              } else {
                handleSendKitnetWhatsApp();
              }
            }}
            className="py-2 px-1 rounded-lg hover:bg-white/[0.04] text-white/90 hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span className="truncate">WhatsApp</span>
          </button>

          {/* 2. PDF */}
          <button
            type="button"
            onClick={() =>
              onGenerateDocument(
                'contrato_kitnet',
                kitnet,
                activeContract,
                tenant
              )
            }
            className="py-2 px-1 rounded-lg hover:bg-white/[0.04] text-white/90 hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">PDF</span>
          </button>

          {/* 3. Duplicar */}
          <button
            type="button"
            onClick={() => duplicateKitnet(kitnet.id)}
            className="py-2 px-1 rounded-lg hover:bg-white/[0.04] text-white/90 hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Duplicar</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-2" />

        {/* Sub-row 2: Editar & Apagar with vertical divider */}
        <div className="grid grid-cols-2 items-center divide-x divide-white/[0.06]">
          {/* Editar */}
          <button
            id={`btn-edit-kitnet-${kitnet.id}`}
            type="button"
            onClick={() => handleOpenEditModal(kitnet)}
            className="py-2 px-2 rounded-lg hover:bg-white/[0.04] text-white flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Editar</span>
          </button>

          {/* Apagar */}
          <button
            id={`btn-delete-kitnet-${kitnet.id}`}
            type="button"
            onClick={() => setKitnetToDelete(kitnet)}
            className="py-2 px-2 rounded-lg hover:bg-red-500/10 text-[#F87171] hover:text-red-400 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-[#F87171]" />
            <span>Apagar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
