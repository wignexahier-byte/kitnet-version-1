import React from 'react';
import { Users, CheckCircle2, X } from 'lucide-react';
import { UnifiedClient } from './types';
import { formatCPF } from '../../utils/formatters';

interface ClientPickerProps {
  unifiedClients: UnifiedClient[];
  kitnetTenantsList: UnifiedClient[];
  motoTenantsList: UnifiedClient[];
  selectedClientKey: string;
  selectedClient?: UnifiedClient;
  onSelectClient: (key: string) => void;
  onClearSelection: () => void;
}

export const ClientPicker: React.FC<ClientPickerProps> = ({
  unifiedClients,
  kitnetTenantsList,
  motoTenantsList,
  selectedClientKey,
  selectedClient,
  onSelectClient,
  onClearSelection,
}) => {
  return (
    <div className="bg-[#141417] p-3.5 sm:p-4 rounded-xl border border-[#2A2A2E] space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="client-autofill-selector"
          className="flex items-center gap-2 text-xs font-bold text-[#F2F1ED]"
        >
          <div className="p-1 rounded-md bg-[#8B5CF6]/15 text-[#A78BFA]">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span>Locatário Cadastrado (Preenchimento Automático)</span>
        </label>
        <span className="text-[10px] text-[#A78BFA] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-md border border-[#8B5CF6]/20 font-medium">
          {unifiedClients.length} cadastrados
        </span>
      </div>

      <select
        id="client-autofill-selector"
        value={selectedClientKey}
        onChange={(e) => onSelectClient(e.target.value)}
        className="w-full bg-[#121214] border border-[#2A2A2E] hover:border-[#8B5CF6]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
      >
        <option value="">-- Selecione para preencher os dados do contrato --</option>
        {motoTenantsList.length > 0 && (
          <optgroup label="Locatários de Motos">
            {motoTenantsList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.assetLabel} (CPF: {formatCPF(c.cpf)})
              </option>
            ))}
          </optgroup>
        )}
        {kitnetTenantsList.length > 0 && (
          <optgroup label="Inquilinos de Kitnets">
            {kitnetTenantsList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.assetLabel} (CPF: {formatCPF(c.cpf)})
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {selectedClient ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] bg-[#1C1C1F] px-3 py-2 rounded-lg border border-white/[0.04]">
          <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              {selectedClient.fullName} ({selectedClient.type === 'kitnet' ? 'Kitnet' : 'Moto'}) — {selectedClient.assetLabel}
            </span>
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-1 text-[11px] text-[#9C9CA3] hover:text-[#EF4444] transition-colors cursor-pointer font-medium"
          >
            <X className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-[#9C9CA3] pl-0.5">
          Selecione um cliente acima ou preencha os campos avulsos abaixo livremente.
        </p>
      )}
    </div>
  );
};
