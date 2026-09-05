import React from 'react';
import { Edit } from 'lucide-react';
import { Kitnet, KitnetTenant } from '../../../types';

interface KitnetDetailGeneralTabProps {
  kitnet: Kitnet;
  tenant?: KitnetTenant;
  formatCurrency: (value: number) => string;
  formatCPF: (cpf: string) => string;
  setActiveSubTab: (tab: 'geral' | 'contrato' | 'inquilino' | 'vistoria' | 'fotos') => void;
  handleOpenEditModal: (kitnet: Kitnet) => void;
}

export const KitnetDetailGeneralTab: React.FC<KitnetDetailGeneralTabProps> = ({
  kitnet,
  tenant,
  formatCurrency,
  formatCPF,
  setActiveSubTab,
  handleOpenEditModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
        <div className="p-3.5 bg-[#101012] rounded-xl border border-white/[0.08] min-w-0">
          <span className="text-[11px] text-[#9A9AA2] uppercase font-medium">Aluguel Base</span>
          <p className="text-base font-bold text-[#F5F5F7] mt-1 truncate">
            {formatCurrency(kitnet.monthlyRentBase)}
          </p>
          <span className="text-[11px] text-[#5F5F66] truncate block">Valor líquido mensal</span>
        </div>

        <div className="p-3.5 bg-[#101012] rounded-xl border border-white/[0.08] min-w-0">
          <span className="text-[11px] text-[#9A9AA2] uppercase font-medium">Taxa Fixa de Água</span>
          <p className="text-base font-bold text-[#F5F5F7] mt-1 truncate">
            {formatCurrency(kitnet.monthlyWaterBase)}
          </p>
          <span className="text-[11px] text-[#5F5F66] truncate block">Rateio de fornecimento</span>
        </div>

        <div className="p-3.5 bg-[#101012] rounded-xl border border-white/[0.08] min-w-0">
          <span className="text-[11px] text-[#9A9AA2] uppercase font-medium">Total Mensal</span>
          <p className="text-base font-bold text-[#10B981] mt-1 truncate">
            {formatCurrency(kitnet.monthlyRentBase + kitnet.monthlyWaterBase)}
          </p>
          <span className="text-[11px] text-[#5F5F66] truncate block">Aluguel + Água</span>
        </div>
      </div>

      {/* Quick Inquilino Summary */}
      {tenant && (
        <div className="p-3.5 bg-[#18181B] rounded-xl border border-[#0EA5E9]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#101012] border border-white/[0.08] flex items-center justify-center shrink-0">
              {tenant.photoUrl || tenant.documents?.photo ? (
                <img
                  src={tenant.photoUrl || tenant.documents?.photo}
                  alt={tenant.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#0EA5E9] font-bold text-base">{tenant.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0EA5E9]">
                  Inquilino Atual
                </span>
                <span className="text-[10px] text-[#9A9AA2]">CPF: {formatCPF(tenant.cpf)}</span>
              </div>
              <h4 className="text-sm font-bold text-[#F5F5F7]">{tenant.fullName}</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubTab('inquilino')}
            className="px-3 py-1.5 bg-[#101012] hover:bg-[#25242C] text-[#0EA5E9] border border-[#0EA5E9]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Ver Inquilino
          </button>
        </div>
      )}

      <div className="p-4 bg-[#101012] rounded-xl border border-white/[0.08] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <strong className="text-[#F5F5F7] font-semibold">Informações & Observações da Unidade:</strong>
          <button
            onClick={() => handleOpenEditModal(kitnet)}
            className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium flex items-center gap-1 cursor-pointer"
          >
            <Edit className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>
        <p className="text-[#9A9AA2] leading-relaxed">
          {kitnet.notes || 'Kitnet com banheiro privativo, pia em granito, medidores e acabamento de alto padrão.'}
        </p>
        <div className="pt-2 flex items-center gap-4 text-[#5F5F66] text-[11px]">
          <span>Endereço: <strong className="text-[#9A9AA2]">{kitnet.address}</strong></span>
        </div>
      </div>
    </div>
  );
};
