import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { AnimatedNumber } from '../AnimatedNumber';
import { MotoIcon, KitnetIcon } from '../CategoryIcons';

interface DashboardFinancialSummaryProps {
  faturamentoBrutoMensal: number;
  faturamentoMensalMotos: number;
  faturamentoMensalKitnets: number;
  lucroLiquidoMensal: number;
  totalDespesas: number;
  totalContratosAtivos: number;
  motosAlugadas: number;
  kitnetsAlugadas: number;
  totalInadimplenciaGeral: number;
  margemLucro: number;
  mostUrgentOverdue?: { contractId: string; installmentId: string };
  onOpenWhatsAppModal: (contractId?: string, installmentId?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardFinancialSummary: React.FC<DashboardFinancialSummaryProps> = ({
  faturamentoBrutoMensal,
  faturamentoMensalMotos,
  faturamentoMensalKitnets,
  lucroLiquidoMensal,
  totalDespesas,
  totalContratosAtivos,
  motosAlugadas,
  kitnetsAlugadas,
  totalInadimplenciaGeral,
  margemLucro,
  mostUrgentOverdue,
  onOpenWhatsAppModal,
  onNavigateTab,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="app-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.07)] pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#10B981] shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#9A9AA2]">
            Demonstrativo Financeiro do Mês
          </h2>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
            margemLucro >= 0
              ? 'text-[#10B981] bg-[#10B981]/12 border-[#10B981]/25'
              : 'text-[#EF4444] bg-[#EF4444]/12 border-[#EF4444]/25'
          }`}
        >
          Margem Líquida: <AnimatedNumber value={margemLucro} format="percent" />
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Prevista (Faturamento Bruto) */}
        <div className="p-4 rounded-xl bg-[#141418] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <span className="text-xs text-[#9A9AA2] font-semibold">Receita Prevista</span>
          <div className="text-2xl font-bold text-[#F5F5F7] mt-2 tabular-nums tracking-tight">
            <AnimatedNumber value={faturamentoBrutoMensal} format="currency" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#9A9AA2] mt-1.5 pt-1.5 border-t border-white/[0.04]">
            <span className="text-[#E07A3F] font-semibold flex items-center gap-1">
              <MotoIcon size={12} color="#E07A3F" /> {formatCurrency(faturamentoMensalMotos)}
            </span>
            <span>•</span>
            <span className="text-[#0EA5E9] font-semibold flex items-center gap-1">
              <KitnetIcon size={12} color="#0EA5E9" /> {formatCurrency(faturamentoMensalKitnets)}
            </span>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="p-4 rounded-xl bg-[#141418] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9AA2] font-semibold">Lucro Líquido Real</span>
            <TrendingUp className={`w-4 h-4 ${lucroLiquidoMensal >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
          </div>
          <div
            className={`text-2xl font-bold mt-2 tabular-nums tracking-tight ${
              lucroLiquidoMensal >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            <AnimatedNumber value={lucroLiquidoMensal} format="currency" />
          </div>
          <p className="text-[11px] text-[#9A9AA2] mt-1.5 pt-1.5 border-t border-white/[0.04] truncate">
            Custos deduzidos: <span className="text-[#EF4444] font-semibold">{formatCurrency(totalDespesas)}</span>
          </p>
        </div>

        {/* Contratos Ativos */}
        <div className="p-4 rounded-xl bg-[#141418] border border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <span className="text-xs text-[#9A9AA2] font-semibold">Contratos Ativos</span>
          <div className="text-2xl font-bold text-[#F5F5F7] mt-2 tabular-nums tracking-tight">
            <AnimatedNumber value={totalContratosAtivos} format="number" />{' '}
            <span className="text-xs font-normal text-[#9A9AA2]">locações ativas</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-white/[0.04]">
            <span className="text-[#E07A3F] font-semibold">{motosAlugadas} motos</span>
            <span>•</span>
            <span className="text-[#0EA5E9] font-semibold">{kitnetsAlugadas} kitnets</span>
          </div>
        </div>

        {/* Inadimplência em Aberto */}
        <div
          onClick={() => {
            if (mostUrgentOverdue) {
              onOpenWhatsAppModal(mostUrgentOverdue.contractId, mostUrgentOverdue.installmentId);
            } else {
              onNavigateTab('cobrancas');
            }
          }}
          className="p-4 rounded-xl bg-[#141418] border border-[#EF4444]/30 hover:border-[#EF4444] transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#EF4444] font-bold uppercase tracking-wider">Inadimplência</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold text-[#EF4444] mt-2 tabular-nums tracking-tight">
            <AnimatedNumber value={totalInadimplenciaGeral} format="currency" />
          </div>
          <div className="text-[11px] text-[#9A9AA2] mt-1.5 pt-1.5 border-t border-white/[0.04] flex items-center justify-between">
            <span>{totalInadimplenciaGeral > 0 ? 'Cobrança pendente' : 'Nenhum atraso'}</span>
            <span className="text-[#8B5CF6] font-bold group-hover:underline">Gerenciar →</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
