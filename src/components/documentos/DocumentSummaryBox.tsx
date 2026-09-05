import React, { useState } from 'react';
import { formatCPF, formatCurrency, formatDate, formatPhone } from '../../utils/formatters';
import { SystemSettings } from '../../types';
import { UnifiedClient } from './types';
import { ShieldCheck, UserCheck, Home, Motorbike, Calendar, Scale, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface DocumentSummaryBoxProps {
  settings: SystemSettings;
  activeTenantName: string;
  activeTenantCpf: string;
  activeTenantPhone?: string;
  activeTenantAddress?: string;
  activeAssetLabel?: string;
  selectedClient?: UnifiedClient;
  docTitle?: string;
  depositAmount?: number;
  periodicAmount?: number;
  startDate?: string;
  durationMonths?: number;
}

export const DocumentSummaryBox: React.FC<DocumentSummaryBoxProps> = ({
  settings,
  activeTenantName,
  activeTenantCpf,
  activeTenantPhone,
  activeTenantAddress,
  activeAssetLabel,
  selectedClient,
  depositAmount,
  startDate,
  durationMonths,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const deposit = depositAmount ?? selectedClient?.deposit ?? 0;
  const asset = activeAssetLabel || selectedClient?.assetLabel || 'Bem Cadastrado';
  const tenantName = activeTenantName || selectedClient?.fullName || 'Nome do Locatário a preencher';
  const tenantCpf = activeTenantCpf || (selectedClient?.cpf ? formatCPF(selectedClient.cpf) : '000.000.000-00');
  const duration = durationMonths ?? selectedClient?.durationMonths ?? 12;
  const tenantPhone = activeTenantPhone || (selectedClient?.phone ? formatPhone(selectedClient.phone) : 'Informado no cadastro');
  const tenantAddress = activeTenantAddress || selectedClient?.address || 'Conforme cadastro';

  const isMoto =
    selectedClient?.type === 'moto' ||
    (activeAssetLabel && (
      activeAssetLabel.toLowerCase().includes('moto') ||
      activeAssetLabel.toLowerCase().includes('honda') ||
      activeAssetLabel.toLowerCase().includes('yamaha') ||
      activeAssetLabel.toLowerCase().includes('fan') ||
      activeAssetLabel.toLowerCase().includes('titan') ||
      activeAssetLabel.toLowerCase().includes('placa')
    ));

  const AssetIcon = isMoto ? Motorbike : Home;
  const assetTypeLabel = isMoto ? 'Motocicleta' : 'Kitnet Residencial';

  return (
    <div className="space-y-3 pt-2">
      {/* 4 Essential Highlight Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Nome do Locatário */}
        <div className="bg-[#141417] p-2.5 rounded-xl border border-[#2A2A2E] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#A78BFA] tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Locatário</span>
          </div>
          <div className="mt-1">
            <div className="text-xs font-bold text-[#F2F1ED] truncate" title={tenantName}>
              {tenantName}
            </div>
            <div className="text-[10px] text-[#9C9CA3] font-mono mt-0.5 truncate">{tenantCpf}</div>
          </div>
        </div>

        {/* 2. Imóvel / Moto Locada */}
        <div className="bg-[#141417] p-2.5 rounded-xl border border-[#2A2A2E] flex flex-col justify-between">
          <div className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider ${isMoto ? 'text-[#C084FC]' : 'text-[#38BDF8]'}`}>
            <AssetIcon className={`w-3.5 h-3.5 ${isMoto ? 'text-[#A855F7]' : 'text-[#0284C7]'}`} />
            <span>{isMoto ? 'Veículo' : 'Imóvel'}</span>
          </div>
          <div className="mt-1">
            <div className="text-xs font-bold text-[#F2F1ED] truncate" title={asset}>
              {asset}
            </div>
            <div className="text-[10px] text-[#9C9CA3] truncate mt-0.5">
              {assetTypeLabel}
            </div>
          </div>
        </div>

        {/* 3. Valor da Caução */}
        <div className="bg-[#141417] p-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-orange-400 tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Caução</span>
          </div>
          <div className="mt-1">
            <div className="text-xs font-extrabold text-orange-400 font-mono">
              {formatCurrency(deposit)}
            </div>
            <div className="text-[9px] text-orange-400/80 font-medium mt-0.5">
              Garantia
            </div>
          </div>
        </div>

        {/* 4. Prazo & Vigência */}
        <div className="bg-[#141417] p-2.5 rounded-xl border border-[#2A2A2E] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Vigência</span>
          </div>
          <div className="mt-1">
            <div className="text-xs font-bold text-[#F2F1ED]">
              {duration} Meses
            </div>
            <div className="text-[10px] text-[#9C9CA3] mt-0.5 truncate">
              {startDate ? formatDate(startDate) : 'Início imediato'}
            </div>
          </div>
        </div>
      </div>

      {/* Bilateral Qualification Accordion (Clean & Compact) */}
      <div className="bg-[#141417] rounded-xl border border-[#2A2A2E] overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1E] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F2F1ED]">
            <Scale className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Qualificação das Partes (Locador & Locatário)</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#9C9CA3]">
            <span>{isDetailsOpen ? 'Ocultar' : 'Ver Detalhes'}</span>
            {isDetailsOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {isDetailsOpen && (
          <div className="p-3 border-t border-[#2A2A2E] grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] bg-[#121214]/60">
            {/* Locador */}
            <div className="bg-[#1C1C1F] p-2.5 rounded-lg border border-white/[0.04] space-y-1">
              <div className="text-[#A78BFA] font-bold text-[10px] uppercase tracking-wider">
                Locador / Proprietário
              </div>
              <p className="font-semibold text-[#F2F1ED]">{settings.adminName || 'Locador Cadastrado'}</p>
              <p className="text-[#9C9CA3]">CPF: <span className="text-[#F2F1ED] font-mono">{formatCPF(settings.adminCpf || '')}</span></p>
              <p className="text-[#9C9CA3] truncate">PIX: <span className="text-[#8B5CF6] font-mono">{settings.adminPixKey || settings.adminEmail}</span></p>
              <p className="text-[#9C9CA3]">Comarca: <span className="text-[#D4D4D8]">{settings.cityState || 'Barra Velha - SC'}</span></p>
            </div>

            {/* Locatário */}
            <div className="bg-[#1C1C1F] p-2.5 rounded-lg border border-white/[0.04] space-y-1">
              <div className="text-[#38BDF8] font-bold text-[10px] uppercase tracking-wider">
                Locatário / Inquilino
              </div>
              <p className="font-semibold text-[#F2F1ED] truncate">{tenantName}</p>
              <p className="text-[#9C9CA3]">CPF: <span className="text-[#F2F1ED] font-mono">{tenantCpf}</span></p>
              <p className="text-[#9C9CA3] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#38BDF8]" />
                <span className="text-[#D4D4D8]">{tenantPhone}</span>
              </p>
              <p className="text-[#9C9CA3] flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-[#F59E0B] shrink-0" />
                <span className="text-[#D4D4D8] truncate" title={tenantAddress}>{tenantAddress}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
