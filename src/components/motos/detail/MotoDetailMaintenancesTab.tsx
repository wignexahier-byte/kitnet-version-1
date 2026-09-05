import React from 'react';
import { Moto } from '../../../types';
import { Wrench, Plus, Trash2 } from 'lucide-react';

interface MotoDetailMaintenancesTabProps {
  moto: Moto;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
  setShowMaintenanceModal: (show: boolean) => void;
  deleteMotoMaintenance: (motoId: string, maintenanceId: string) => void;
}

export const MotoDetailMaintenancesTab: React.FC<MotoDetailMaintenancesTabProps> = ({
  moto,
  formatCurrency,
  formatDate,
  setShowMaintenanceModal,
  deleteMotoMaintenance,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#101012] border border-white/[0.08] rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-[#F5F5F7] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#E07A3F]" />
            <span>Histórico de Manutenções & Serviços Técnicos</span>
          </h3>
          <p className="text-xs text-[#9A9AA2] mt-0.5">
            Controle de trocas de óleo, pneus, relação, pastilhas e revisões preventivas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowMaintenanceModal(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Manutenção</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#101012] border border-white/[0.08] rounded-xl">
          <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Total em Manutenções</span>
          <p className="text-base font-bold text-[#EF4444] mt-1">
            {formatCurrency(
              (moto.maintenances || []).reduce((acc, m) => acc + (m.cost || 0), 0)
            )}
          </p>
          <span className="text-[10px] text-[#5F5F66]">{moto.maintenances?.length || 0} registros</span>
        </div>

        <div className="p-3.5 bg-[#101012] border border-white/[0.08] rounded-xl">
          <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Última Troca de Óleo</span>
          <p className="text-sm font-bold text-[#F5F5F7] mt-1">
            {(() => {
              const oleos = (moto.maintenances || []).filter((m) => m.serviceType === 'troca_oleo');
              if (oleos.length === 0) return 'Nenhuma registrada';
              const last = oleos[oleos.length - 1];
              return `${formatDate(last.date)} (${last.km.toLocaleString('pt-BR')} km)`;
            })()}
          </p>
        </div>

        <div className="p-3.5 bg-[#101012] border border-white/[0.08] rounded-xl">
          <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">KM Atual do Odômetro</span>
          <p className="text-base font-bold text-[#E07A3F] mt-1">
            {moto.currentKm.toLocaleString('pt-BR')} km
          </p>
        </div>
      </div>

      {/* Maintenances List */}
      {!moto.maintenances || moto.maintenances.length === 0 ? (
        <div className="py-8 text-center bg-[#101012] rounded-xl border border-dashed border-white/[0.08]">
          <Wrench className="w-8 h-8 text-[#5F5F66] mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-[#F5F5F7]">Nenhuma manutenção registrada</h4>
          <p className="text-xs text-[#9A9AA2] mt-1 max-w-sm mx-auto">
            Registre revisões e trocas de peças para ter controle total da moto.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012]">
          <div className="block sm:hidden divide-y divide-white/[0.08] p-2 space-y-2">
            {moto.maintenances.map((m) => (
              <div key={m.id} className="p-3 bg-[#18181B] rounded-xl border border-white/[0.08] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#F5F5F7] capitalize block">
                      {m.serviceType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#9A9AA2]">{m.description}</span>
                  </div>
                  <span className="text-sm font-bold text-[#EF4444] tabular-nums shrink-0">
                    {formatCurrency(m.cost)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#9A9AA2] pt-0.5">
                  <div>
                    <span>Data:</span> <strong className="text-[#F5F5F7] block">{formatDate(m.date)}</strong>
                  </div>
                  <div>
                    <span>Odômetro:</span> <strong className="text-[#E07A3F] font-mono block">{m.km.toLocaleString('pt-BR')} km</strong>
                  </div>
                </div>

                {m.mechanicOrShop && (
                  <div className="text-xs text-[#9A9AA2]">
                    <span>Oficina/Mecânico:</span> <strong className="text-[#F5F5F7]">{m.mechanicOrShop}</strong>
                  </div>
                )}

                <div className="flex items-center justify-end pt-1.5 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => deleteMotoMaintenance(moto.id, m.id)}
                    className="px-3 py-1 rounded-lg bg-[#101012] hover:bg-[#EF4444]/20 text-[#9A9AA2] hover:text-[#EF4444] border border-white/[0.08] cursor-pointer transition-colors text-xs font-medium flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-[#9A9AA2] uppercase text-[10px] font-medium border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Tipo de Serviço</th>
                  <th className="p-3">KM</th>
                  <th className="p-3">Oficina / Mecânico</th>
                  <th className="p-3">Custo</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {moto.maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="p-3 font-medium text-[#F5F5F7] whitespace-nowrap">
                      {formatDate(m.date)}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-[#F5F5F7] capitalize block">
                        {m.serviceType.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-[#9A9AA2]">{m.description}</span>
                    </td>
                    <td className="p-3 text-[#E07A3F] font-mono whitespace-nowrap">
                      {m.km.toLocaleString('pt-BR')} km
                    </td>
                    <td className="p-3 text-[#9A9AA2]">
                      {m.mechanicOrShop || 'Não informado'}
                    </td>
                    <td className="p-3 font-bold text-[#EF4444] whitespace-nowrap">
                      {formatCurrency(m.cost)}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteMotoMaintenance(moto.id, m.id)}
                        className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#EF4444]/20 text-[#9A9AA2] hover:text-[#EF4444] border border-white/[0.08] cursor-pointer transition-colors"
                        title="Remover registro de manutenção"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
