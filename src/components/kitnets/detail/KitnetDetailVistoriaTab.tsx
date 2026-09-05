import React from 'react';
import { Kitnet } from '../../../types';
import { Camera, CheckCircle2, ClipboardCheck, Layers } from 'lucide-react';

interface KitnetDetailVistoriaTabProps {
  kitnet: Kitnet;
  formatDate: (dateStr: string) => string;
  onOpenVistorias?: () => void;
}

export const KitnetDetailVistoriaTab: React.FC<KitnetDetailVistoriaTabProps> = ({
  kitnet,
  formatDate,
  onOpenVistorias,
}) => {
  return (
    <div className="space-y-4">
      {kitnet.entryInspection ? (
        <div className="p-4 sm:p-5 bg-[#101012] border border-white/[0.08] rounded-xl space-y-4 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] text-[#10B981] uppercase font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Laudo Registrado
              </span>
              <h3 className="text-sm font-bold text-[#F5F5F7]">Vistoria de Entrada (Check-in)</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9A9AA2] font-mono">
                {formatDate(kitnet.entryInspection.date)}
              </span>
              {onOpenVistorias && (
                <button
                  type="button"
                  onClick={onOpenVistorias}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#25242C] text-[#F5F5F7] text-xs font-medium border border-white/[0.08] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Central de Vistorias</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {Object.entries(kitnet.entryInspection.itemsState).map(([item, state]) => (
              <div key={item} className="p-2 bg-[#18181B] rounded-lg border border-white/[0.08] flex items-center justify-between">
                <span className="capitalize text-[#9A9AA2]">{item}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  state === 'otimo' || state === 'bom'
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {state}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[#9A9AA2] text-xs italic bg-[#18181B] p-2.5 rounded-lg border border-white/[0.08]">
            "{kitnet.entryInspection.stateNotes}"
          </p>

          {onOpenVistorias && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onOpenVistorias}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-violet-600/20 active:scale-95"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Registrar Nova Vistoria</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#9A9AA2] bg-[#101012] border border-dashed border-white/[0.08] rounded-xl space-y-3">
          <Camera className="w-8 h-8 text-[#5F5F66] mx-auto" />
          <p className="text-[#F5F5F7] font-medium">Nenhuma vistoria de entrada salva para este imóvel.</p>
          {onOpenVistorias && (
            <button
              type="button"
              onClick={onOpenVistorias}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-sky-500/20 active:scale-95"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Registrar Vistoria da Kitnet</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

