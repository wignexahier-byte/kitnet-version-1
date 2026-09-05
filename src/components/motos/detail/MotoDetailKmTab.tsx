import React from 'react';
import { Moto } from '../../../types';
import { Plus, Gauge } from 'lucide-react';

interface MotoDetailKmTabProps {
  moto: Moto;
  formatDate: (dateStr: string) => string;
  setShowNewKmModal: (show: boolean) => void;
}

export const MotoDetailKmTab: React.FC<MotoDetailKmTabProps> = ({
  moto,
  formatDate,
  setShowNewKmModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA2]">
            Histórico de Quilometragem
          </h4>
          <p className="text-[11px] text-[#5F5F66] truncate">Acompanhe medições periódicas e trocas de óleo</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewKmModal(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nova Leitura KM</span>
        </button>
      </div>

      <div className="space-y-2">
        {moto.kmLogs && moto.kmLogs.length > 0 ? (
          moto.kmLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#101012] rounded-xl border border-white/[0.08] flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#18181B] text-[#E07A3F] border border-white/[0.08] shrink-0">
                  <Gauge className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#F5F5F7] text-sm font-mono block">
                    {log.km.toLocaleString('pt-BR')} km
                  </span>
                  <p className="text-[11px] text-[#9A9AA2] truncate">{log.notes || 'Registro de rotina'}</p>
                </div>
              </div>
              <span className="text-[11px] text-[#9A9AA2] font-medium whitespace-nowrap shrink-0">
                {formatDate(log.date)}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 bg-[#101012] rounded-xl border border-white/[0.06] text-center text-xs text-slate-400">
            Nenhuma medição de quilometragem registrada.
          </div>
        )}
      </div>
    </div>
  );
};
