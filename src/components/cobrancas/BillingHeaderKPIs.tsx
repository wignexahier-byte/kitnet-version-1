import React from 'react';
import { ArrowLeft, DollarSign, Send } from 'lucide-react';
import { TabType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { AnimatedNumber } from '../AnimatedNumber';
import { BillingItem } from './types';

interface BillingHeaderKPIsProps {
  onNavigateTab?: (tab: TabType) => void;
  selectedForBatchCount: number;
  onOpenBatchModal: () => void;
  onSelectAllOverdueAndOpenModal: () => void;
  atrasados: BillingItem[];
  vencendoHoje: BillingItem[];
  proximos7Dias: BillingItem[];
  emDia: BillingItem[];
  totalAtrasadoAmount: number;
  totalHojeAmount: number;
  total7DiasAmount: number;
  activeCategory: 'todos' | 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia';
  onToggleCategory: (cat: 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia') => void;
}

export const BillingHeaderKPIs: React.FC<BillingHeaderKPIsProps> = ({
  onNavigateTab,
  selectedForBatchCount,
  onOpenBatchModal,
  onSelectAllOverdueAndOpenModal,
  atrasados,
  vencendoHoje,
  proximos7Dias,
  emDia,
  totalAtrasadoAmount,
  totalHojeAmount,
  total7DiasAmount,
  activeCategory,
  onToggleCategory,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 app-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="p-2.5 rounded-lg bg-[#1E1D24] hover:bg-[#25242C] border border-white/[0.08] text-[#9A9AA2] hover:text-[#F5F5F7] transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0 active:scale-95"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/25 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F7] tracking-tight flex items-center gap-2">
                Central de Cobranças
              </h1>
              <p className="text-xs text-[#9A9AA2] mt-0.5">
                Gestão inteligente de cobranças com envio de mensagens no WhatsApp e baixa direta
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Header Button */}
        <div className="flex items-center gap-2.5">
          {selectedForBatchCount > 0 ? (
            <button
              onClick={onOpenBatchModal}
              className="btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              Encaminhar para Selecionados ({selectedForBatchCount})
            </button>
          ) : (
            <button
              onClick={onSelectAllOverdueAndOpenModal}
              className="btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              Cobrar em Lote ({atrasados.length + vencendoHoje.length})
            </button>
          )}
        </div>
      </div>

      {/* 4 Smart Buckets Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ATRASADOS */}
        <div
          onClick={() => onToggleCategory('atrasado')}
          className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
            activeCategory === 'atrasado'
              ? 'bg-[#EF4444]/10 border-[#EF4444]/50 ring-1 ring-[#EF4444]/40'
              : 'bg-[#141418] border-white/[0.06] hover:border-[#EF4444]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              Atrasados
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#EF4444]/15 text-[#EF4444] font-bold tabular-nums">
              <AnimatedNumber value={atrasados.length} format="number" /> parcelas
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#EF4444] tabular-nums whitespace-nowrap">
              <AnimatedNumber value={totalAtrasadoAmount} format="currency" />
            </div>
            <p className="text-[11px] text-[#9A9AA2] mt-0.5">Exigem contato imediato</p>
          </div>
        </div>

        {/* 2. VENCENDO HOJE */}
        <div
          onClick={() => onToggleCategory('vencendo_hoje')}
          className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
            activeCategory === 'vencendo_hoje'
              ? 'bg-[#F59E0B]/10 border-[#F59E0B]/50 ring-1 ring-[#F59E0B]/40'
              : 'bg-[#141418] border-white/[0.06] hover:border-[#F59E0B]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              Vencendo Hoje
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#F59E0B]/15 text-[#F59E0B] font-bold tabular-nums">
              <AnimatedNumber value={vencendoHoje.length} format="number" /> parcelas
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#F59E0B] tabular-nums whitespace-nowrap">
              <AnimatedNumber value={totalHojeAmount} format="currency" />
            </div>
            <p className="text-[11px] text-[#9A9AA2] mt-0.5">Vencimento na data corrente</p>
          </div>
        </div>

        {/* 3. VENCENDO EM ATÉ 7 DIAS */}
        <div
          onClick={() => onToggleCategory('proximos_7_dias')}
          className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
            activeCategory === 'proximos_7_dias'
              ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/50 ring-1 ring-[#8B5CF6]/40'
              : 'bg-[#141418] border-white/[0.06] hover:border-[#8B5CF6]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9A9AA2] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9A9AA2]" />
              Próximos 7 Dias
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#1E1D24] text-[#F5F5F7] font-bold tabular-nums border border-white/[0.06]">
              <AnimatedNumber value={proximos7Dias.length} format="number" /> parcelas
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#F5F5F7] tabular-nums whitespace-nowrap">
              <AnimatedNumber value={total7DiasAmount} format="currency" />
            </div>
            <p className="text-[11px] text-[#9A9AA2] mt-0.5">Lembretes preventivos</p>
          </div>
        </div>

        {/* 4. EM DIA */}
        <div
          onClick={() => onToggleCategory('em_dia')}
          className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
            activeCategory === 'em_dia'
              ? 'bg-[#10B981]/10 border-[#10B981]/50 ring-1 ring-[#10B981]/40'
              : 'bg-[#141418] border-white/[0.06] hover:border-[#10B981]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Em Dia
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] font-bold tabular-nums">
              <AnimatedNumber value={emDia.length} format="number" /> parcelas
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#10B981] tabular-nums whitespace-nowrap">
              <AnimatedNumber value={emDia.reduce((acc, i) => acc + i.amount, 0)} format="currency" />
            </div>
            <p className="text-[11px] text-[#9A9AA2] mt-0.5">Contratos regulares</p>
          </div>
        </div>
      </div>
    </div>
  );
};
