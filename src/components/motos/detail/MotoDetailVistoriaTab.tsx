import React from 'react';
import { Moto, MotoContract, MotoTenant } from '../../../types';
import { Camera, CheckCircle2, FileText, Layers, ClipboardCheck } from 'lucide-react';

interface MotoDetailVistoriaTabProps {
  moto: Moto;
  activeContract?: MotoContract;
  tenant?: MotoTenant;
  formatDate: (dateStr: string) => string;
  setShowDeliveryModal: (show: boolean) => void;
  onGenerateDocument: (type: any, moto: Moto, contract?: MotoContract, tenant?: MotoTenant) => void;
  onOpenVistorias?: () => void;
}

export const MotoDetailVistoriaTab: React.FC<MotoDetailVistoriaTabProps> = ({
  moto,
  activeContract,
  tenant,
  formatDate,
  setShowDeliveryModal,
  onGenerateDocument,
  onOpenVistorias,
}) => {
  return (
    <div className="space-y-4">
      {/* Vistoria de Entrega / Inicial */}
      {moto.delivery ? (
        <div className="p-4 sm:p-5 bg-[#101012] border border-white/[0.08] rounded-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#10B981] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Entrega Oficial Realizada
              </span>
              <h4 className="text-sm font-semibold text-[#F5F5F7] mt-0.5">
                KM de Entrega: {moto.delivery.initialKm.toLocaleString('pt-BR')} km
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9A9AA2]">
                Data: {formatDate(moto.delivery.date)}
              </span>
              {(onOpenVistorias || setShowDeliveryModal) && (
                <button
                  type="button"
                  onClick={onOpenVistorias || (() => setShowDeliveryModal(true))}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#25242C] text-[#F5F5F7] text-xs font-medium border border-white/[0.08] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Central de Vistorias</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[#9A9AA2] bg-[#18181B] p-3 rounded-lg border border-white/[0.08]">
            {moto.delivery.stateNotes}
          </p>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <span className="text-xs text-[#10B981] flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Termo de entrega assinado pelo locatário
            </span>

            <button
              type="button"
              onClick={() =>
                onGenerateDocument('termo_entrega_moto', moto, activeContract, tenant)
              }
              className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-[#25242C] text-[#F5F5F7] text-xs font-medium border border-white/[0.08] flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir Termo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center bg-[#101012] rounded-xl border border-dashed border-white/[0.08] space-y-2">
          <Camera className="w-8 h-8 text-[#5F5F66] mx-auto" />
          <p className="text-xs text-[#F5F5F7] font-medium">Entrega ainda não registrada</p>
          <button
            type="button"
            onClick={onOpenVistorias || (() => setShowDeliveryModal(true))}
            className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-amber-500/20 active:scale-95"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Registrar Entrega da Moto</span>
          </button>
        </div>
      )}

      {/* Vistoria de Devolução (se houver) */}
      {moto.returnInspection && (
        <div className="p-4 sm:p-5 bg-[#101012] border border-amber-500/20 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-amber-400">
                Vistoria de Devolução / Saída
              </span>
              <h4 className="text-sm font-semibold text-[#F5F5F7] mt-0.5">
                KM Final: {moto.returnInspection.finalKm.toLocaleString('pt-BR')} km
              </h4>
            </div>
            <span className="text-xs text-[#9A9AA2]">
              Data: {formatDate(moto.returnInspection.date)}
            </span>
          </div>

          <p className="text-xs text-[#9A9AA2] bg-[#18181B] p-3 rounded-lg border border-white/[0.08]">
            {moto.returnInspection.stateNotes}
          </p>
        </div>
      )}
    </div>
  );
};

