import React from 'react';
import { Moto, MotoContract, MotoTenant } from '../../../types';
import {
  UserPlus,
  LogOut,
  Layers,
  Wrench,
  MessageCircle,
  FileText,
  Copy,
  Edit3,
  Trash2,
} from 'lucide-react';

interface MotoDetailActionBarProps {
  moto: Moto;
  activeContract?: MotoContract;
  tenant?: MotoTenant;
  setShowNewContractModal: (show: boolean) => void;
  setTerminateMotoForm: (data: { finalKm: number; notes: string }) => void;
  setMotoToTerminate: (data: { contract: MotoContract; moto: Moto }) => void;
  onGenerateDocument: (type: any, moto: Moto, contract?: MotoContract, tenant?: MotoTenant) => void;
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  setShowMaintenanceModal: (show: boolean) => void;
  setShowCompareModal: (show: boolean) => void;
  duplicateMoto: (id: string) => void;
  handleOpenEditModal: (moto: Moto) => void;
  setMotoToDelete: (moto: Moto) => void;
}

export const MotoDetailActionBar: React.FC<MotoDetailActionBarProps> = ({
  moto,
  activeContract,
  tenant,
  setShowNewContractModal,
  setTerminateMotoForm,
  setMotoToTerminate,
  onGenerateDocument,
  onOpenWhatsApp,
  setShowMaintenanceModal,
  setShowCompareModal,
  duplicateMoto,
  handleOpenEditModal,
  setMotoToDelete,
}) => {
  return (
    <div className="bg-[#0C0F1D] rounded-2xl border border-white/[0.08] p-3 sm:p-4 space-y-3 shadow-md">
      {/* Row 1: Two primary large action buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        {moto.status !== 'alugada' ? (
          <button
            id={`btn-new-contract-moto-${moto.id}`}
            type="button"
            onClick={() => setShowNewContractModal(true)}
            className="h-12 px-4 rounded-xl bg-[#13172B] hover:bg-[#1A203B] border border-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-xs"
            title="Iniciar contrato de locação com intenção de compra"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span className="text-white">Criar Contrato</span>
          </button>
        ) : (
          activeContract && (
            <button
              id={`btn-terminate-contract-moto-${moto.id}`}
              type="button"
              onClick={() => {
                setTerminateMotoForm({
                  finalKm: moto.currentKm,
                  notes: 'Locação finalizada e moto devolvida em boas condições.',
                });
                setMotoToTerminate({ contract: activeContract, moto });
              }}
              className="h-12 px-4 rounded-xl bg-[#13172B] hover:bg-[#1A203B] border border-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-xs"
              title="Encerrar contrato de locação e devolver caução"
            >
              <LogOut className="w-4 h-4 text-[#F87171]" />
              <span className="text-white">Encerrar Locação</span>
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => setShowCompareModal(true)}
          className="h-12 px-4 rounded-xl bg-[#13172B] hover:bg-[#1A203B] border border-white/[0.08] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 shadow-xs"
          title="Comparar fotos de entrega vs estado atual"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-white">Vistorias</span>
        </button>
      </div>

      {/* Row 2: Secondary Tools Container */}
      <div className="bg-[#101324] rounded-xl border border-white/[0.06] p-2.5 sm:p-3">
        {/* Sub-row 1: 4 quick actions in a row */}
        <div className="grid grid-cols-4 gap-1 text-center items-center">
          {/* 1. Manutenção */}
          <button
            type="button"
            onClick={() => setShowMaintenanceModal(true)}
            className="py-2 px-1 rounded-lg hover:bg-white/[0.04] text-white/90 hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
            title="Registrar manutenção"
          >
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Manutenção</span>
          </button>

          {/* 2. WhatsApp */}
          <button
            type="button"
            onClick={() => {
              if (activeContract) {
                onOpenWhatsApp(activeContract.id);
              }
            }}
            disabled={!activeContract}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
              activeContract
                ? 'hover:bg-white/[0.04] text-white/90 hover:text-white cursor-pointer'
                : 'text-white/30 cursor-not-allowed'
            }`}
            title="Enviar notificação via WhatsApp"
          >
            <MessageCircle className={`w-4 h-4 shrink-0 ${activeContract ? 'text-[#22C55E]' : 'text-white/30'}`} />
            <span className="truncate">WhatsApp</span>
          </button>

          {/* 3. PDF */}
          <button
            type="button"
            onClick={() =>
              onGenerateDocument('contrato_locacao', moto, activeContract, tenant)
            }
            className="py-2 px-1 rounded-lg hover:bg-white/[0.04] text-white/90 hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
            title="Gerar contrato em PDF"
          >
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">PDF</span>
          </button>

          {/* 4. Duplicar */}
          <button
            type="button"
            onClick={() => duplicateMoto(moto.id)}
            className="py-2 px-1 rounded-lg hover:bg-white/[0.04] text-white/90 hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
            title="Duplicar cadastro da moto"
          >
            <Copy className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Duplicar</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-2" />

        {/* Sub-row 2: Editar & Apagar with vertical divider */}
        <div className="grid grid-cols-2 items-center divide-x divide-white/[0.06]">
          {/* Editar */}
          <button
            id={`btn-edit-moto-${moto.id}`}
            type="button"
            onClick={() => handleOpenEditModal(moto)}
            className="py-2 px-2 rounded-lg hover:bg-white/[0.04] text-white flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
            title="Editar dados da moto"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Editar</span>
          </button>

          {/* Apagar */}
          <button
            id={`btn-delete-moto-${moto.id}`}
            type="button"
            onClick={() => setMotoToDelete(moto)}
            className="py-2 px-2 rounded-lg hover:bg-red-500/10 text-[#F87171] hover:text-red-400 flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
            title="Apagar moto do sistema"
          >
            <Trash2 className="w-4 h-4 text-[#F87171]" />
            <span>Apagar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
