import React from 'react';
import { Motorbike, Home, Check, MessageCircle, CheckCheck } from 'lucide-react';
import { BillingItem } from './types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface BillingCardItemProps {
  item: BillingItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  onOpenSinglePay: (item: BillingItem) => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
}

export const BillingCardItem: React.FC<BillingCardItemProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onOpenWhatsApp,
  onOpenSinglePay,
  onOpenClientProfile,
}) => {
  const isAtrasado = item.status === 'atrasado';
  const isHoje = item.status === 'vencendo_hoje';
  const is7Dias = item.status === 'proximos_7_dias';
  const isEmDia = item.status === 'em_dia';

  return (
    <div
      className={`bg-[#141418] border rounded-xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isSelected
          ? 'border-[#8B5CF6] bg-[#8B5CF6]/[0.05] shadow-md shadow-[#8B5CF6]/10 ring-1 ring-[#8B5CF6]/30'
          : isAtrasado
          ? 'border-[#EF4444]/40 hover:border-[#EF4444]'
          : isHoje
          ? 'border-[#F59E0B]/40 hover:border-[#F59E0B]'
          : is7Dias
          ? 'border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60'
          : 'border-white/[0.06] hover:border-white/[0.15]'
      }`}
    >
      {/* Left: Checkbox (only for actionable items), Client & Asset info */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Checkbox Selector ONLY for items that require collection */}
        {!isEmDia && (
          <button
            type="button"
            onClick={() => onToggleSelect(item.id)}
            className={`mt-1.5 w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                : 'bg-[#1E1D24] border-white/[0.15] text-transparent hover:border-[#8B5CF6]'
            }`}
            title={isSelected ? 'Desmarcar' : 'Selecionar para cobrança em lote'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}

        <div
          className={`p-2.5 rounded-lg border shrink-0 mt-1 ${
            item.assetType === 'moto'
              ? 'bg-[#E07A3F]/10 border-[#E07A3F]/25 text-[#E07A3F]'
              : 'bg-[#0EA5E9]/10 border-[#0EA5E9]/25 text-[#0EA5E9]'
          }`}
        >
          {item.assetType === 'moto' ? <Motorbike className="w-5 h-5" /> : <Home className="w-5 h-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              onClick={() => onOpenClientProfile && onOpenClientProfile(item.tenantId, item.assetType)}
              className="text-base font-semibold text-[#F5F5F7] hover:text-[#8B5CF6] cursor-pointer transition-colors"
            >
              {item.clientName}
            </span>

            {isAtrasado && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                {item.daysOverdue} {item.daysOverdue === 1 ? 'dia' : 'dias'} em atraso
              </span>
            )}
            {isHoje && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                Vence Hoje
              </span>
            )}
            {is7Dias && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                Vence em breve
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#9A9AA2] mt-1 flex-wrap">
            <span className="font-semibold text-[#F5F5F7]">{item.assetName}</span>
            <span>•</span>
            <span className={item.assetType === 'moto' ? 'text-[#E07A3F] font-medium' : 'text-[#0EA5E9] font-medium'}>
              {item.assetDetails}
            </span>
            <span>•</span>
            <span>
              Parcela: <strong className="text-[#F5F5F7] tabular-nums">{item.installmentNumber}/{item.totalInstallments}</strong>
            </span>
            <span>•</span>
            <span>
              Vencimento: <strong className="text-[#F5F5F7] tabular-nums">{formatDate(item.dueDate)}</strong>
            </span>
          </div>

          {/* Visual Contract Progress Bar */}
          <div className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-[11px] text-[#9A9AA2] mb-1">
              <span className="text-[#F5F5F7] font-mono text-xs">{item.progressVisual}</span>
              <span className="font-bold text-[#8B5CF6] tabular-nums">{item.progressPercent}% concluído</span>
            </div>
            <div className="w-full bg-[#1E1D24] rounded-full h-1.5 overflow-hidden border border-white/[0.06]">
              <div
                className="h-full bg-[#8B5CF6] rounded-full transition-all duration-500"
                style={{ width: `${item.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#9A9AA2] mt-1">
              <span>
                Pago: <strong className="text-[#10B981] tabular-nums">{item.paidCount}x ({formatCurrency(item.paidAmount)})</strong>
              </span>
              <span>
                Restam: <strong className="text-[#9A9AA2] tabular-nums">{item.pendingCount}x ({formatCurrency(item.remainingAmount)})</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Value & Fast Actions */}
      <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
        <div className="text-left lg:text-right">
          <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Valor da Parcela</span>
          <div className="text-lg font-bold text-[#F5F5F7] tabular-nums whitespace-nowrap">
            {formatCurrency(item.amount)}
          </div>
          {isAtrasado && item.daysOverdue > 0 && (
            <div className="text-[11px] text-[#EF4444] font-semibold tabular-nums whitespace-nowrap mt-0.5" title={`Multa: ${formatCurrency(item.fineAmount)} | Juros: ${formatCurrency(item.interestAmount)}`}>
              Total c/ encargos: {formatCurrency(item.totalDueWithCharges)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEmDia ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-semibold whitespace-nowrap">
              <span>Pontual</span>
            </div>
          ) : (
            <>
              {/* Botão de Cobrança / Lembrete */}
              <button
                id={`btn-cobrar-${item.id}`}
                onClick={() => onOpenWhatsApp(item.contractId, item.installmentId)}
                className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap rounded-lg transition-all ${
                  is7Dias
                    ? 'bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#A78BFA] border border-[#8B5CF6]/30'
                    : 'btn-primary'
                }`}
                title="Gerar cobrança no WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                {is7Dias ? 'Lembrete' : 'Cobrar'}
              </button>

              {/* Baixa de Pagamento Rápida (apenas para parcelas com pendência / vencimento próximo) */}
              <button
                id={`btn-baixa-${item.id}`}
                onClick={() => onOpenSinglePay(item)}
                className="p-2 bg-[#1E1D24] hover:bg-[#25242C] text-[#10B981] hover:text-[#6ee7b7] rounded-lg transition-all border border-white/[0.08] hover:border-[#10B981]/40 cursor-pointer active:scale-95 shadow-sm"
                title="Registrar baixa de pagamento recebido"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
