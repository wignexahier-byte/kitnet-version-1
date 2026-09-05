import React from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Printer,
  Scale,
} from 'lucide-react';
import { CategoryStamp } from '../CategoryIcons';
import { formatCurrency } from '../../utils/formatters';
import { AnimatedNumber } from '../AnimatedNumber';
import { TabType } from '../Navigation';

interface DashboardAssetsSummaryProps {
  totalMotos: number;
  motosAlugadas: number;
  motosDisponiveis: number;
  motosManutencao: number;
  taxaOcupacaoMotos: number;
  faturamentoMensalMotos: number;
  receitaMesAtualMotos?: number;
  inadimplenciaMotos: number;
  inadimplenciaPctMotos?: number;
  valorInvestidoMotos?: number;
  totalKitnets: number;
  kitnetsAlugadas: number;
  kitnetsDisponiveis: number;
  kitnetsManutencao: number;
  taxaOcupacaoKitnets: number;
  faturamentoMensalKitnets: number;
  receitaMesAtualKitnets?: number;
  inadimplenciaKitnets: number;
  inadimplenciaPctKitnets?: number;
  valorInvestidoKitnets?: number;
  onNavigateTab: (tab: TabType) => void;
  onOpenReportModal?: () => void;
}

export const DashboardAssetsSummary: React.FC<DashboardAssetsSummaryProps> = ({
  totalMotos,
  motosAlugadas,
  motosDisponiveis,
  motosManutencao,
  taxaOcupacaoMotos,
  faturamentoMensalMotos,
  receitaMesAtualMotos = 0,
  inadimplenciaMotos,
  inadimplenciaPctMotos = 0,
  valorInvestidoMotos = 0,
  totalKitnets,
  kitnetsAlugadas,
  kitnetsDisponiveis,
  kitnetsManutencao,
  taxaOcupacaoKitnets,
  faturamentoMensalKitnets,
  receitaMesAtualKitnets = 0,
  inadimplenciaKitnets,
  inadimplenciaPctKitnets = 0,
  valorInvestidoKitnets = 0,
  onNavigateTab,
  onOpenReportModal,
}) => {
  return (
    <div className="space-y-3">
      {/* Optional Top Section Header with Relatório Completo button */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/[0.06]">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#8B5CF6]" />
            <span>Gestão Operacional & Financeira de Ativos</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Acompanhamento em tempo real de ocupação, faturamento mensal, projeções e patrimônio
          </p>
        </div>
        {onOpenReportModal && (
          <button
            type="button"
            onClick={onOpenReportModal}
            className="btn-secondary px-2.5 sm:px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Relatório Completo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* ================= CARD 1: FROTA DE MOTOS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.1 }}
          className="card-moto p-4 sm:p-5 space-y-3.5 flex flex-col justify-between"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E07A3F]/20">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <CategoryStamp category="moto" size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#F5F5F7]">
                    Frota de Motos
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E07A3F]/15 text-[#E07A3F] border border-[#E07A3F]/30">
                    {totalMotos} {totalMotos === 1 ? 'unidade' : 'unidades'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    {motosAlugadas}/{totalMotos} Alugadas
                  </span>
                </div>
                <p className="text-xs text-[#9A9AA2] truncate mt-0.5">
                  Locação com opção de compra semanal/mensal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('motos')}
              className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] hover:underline font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 transition-all shrink-0 ml-2"
            >
              Ver Frota →
            </button>
          </div>

          {/* Grid of 4 Metrics (2 columns on mobile, 4 columns on large screens) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* 1. Alugadas */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <span className="text-[10px] text-[#9A9AA2] font-bold uppercase tracking-wider truncate">
                Alugadas
              </span>
              <div className="text-sm sm:text-base font-bold text-[#10B981] mt-1 tabular-nums flex items-baseline gap-1 truncate font-mono">
                <AnimatedNumber value={motosAlugadas} format="number" />
                <span className="text-xs text-[#9A9AA2] font-normal">({taxaOcupacaoMotos}%)</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${taxaOcupacaoMotos}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-[#10B981] rounded-full"
                />
              </div>
            </div>

            {/* 2. Disponíveis */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <span className="text-[10px] text-[#9A9AA2] font-bold uppercase tracking-wider truncate">
                Disponíveis
              </span>
              <div className="text-sm sm:text-base font-bold text-[#F5F5F7] mt-1 tabular-nums font-mono">
                <AnimatedNumber value={motosDisponiveis} format="number" />
              </div>
              <span className="text-[10px] text-[#9A9AA2] block mt-1.5 truncate">
                {motosManutencao > 0 ? `${motosManutencao} em oficina` : 'Prontas para locação'}
              </span>
            </div>

            {/* 3. Receita (Mês) */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <span className="text-[10px] text-[#9A9AA2] font-bold uppercase tracking-wider truncate">
                Receita (Mês)
              </span>
              <div className="text-sm sm:text-base font-bold text-[#10B981] mt-1 tabular-nums truncate font-mono">
                <AnimatedNumber value={faturamentoMensalMotos} format="currency" />
              </div>
              <span
                className={`text-[10px] font-semibold block mt-1.5 truncate ${
                  inadimplenciaMotos > 0 ? 'text-[#EF4444]' : 'text-[#9A9AA2]'
                }`}
              >
                {inadimplenciaMotos > 0
                  ? `${formatCurrency(inadimplenciaMotos)} atraso`
                  : receitaMesAtualMotos > 0
                  ? `Recebido: ${formatCurrency(receitaMesAtualMotos)}`
                  : 'Em dia'}
              </span>
            </div>

            {/* 4. Projeção Anual (replaces ROI Anualizado per user request) */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <div className="flex items-center gap-1 text-[#9A9AA2]">
                <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                  Projeção Anual
                </span>
              </div>
              <div className="text-sm sm:text-base font-bold text-amber-400 mt-1 tabular-nums truncate font-mono">
                <AnimatedNumber value={faturamentoMensalMotos * 12} format="currency" />
              </div>
              <span className="text-[10px] text-[#9A9AA2] block mt-1.5 truncate">
                12 meses projetados
              </span>
            </div>
          </div>

          {/* Bottom Footer: Capital Investido & Inadimplência Detalhada */}
          <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
              <Wallet className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
              <span className="text-[11px] text-slate-400">Capital Investido:</span>
              <span className="font-semibold text-slate-200 font-mono text-[11px] sm:text-xs">
                {formatCurrency(valorInvestidoMotos)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              {inadimplenciaMotos > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="text-[11px] text-slate-400">Inadimplência:</span>
              <span
                className={`font-semibold font-mono text-[11px] sm:text-xs ${
                  inadimplenciaMotos > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {formatCurrency(inadimplenciaMotos)} ({inadimplenciaPctMotos.toFixed(1)}%)
              </span>
            </div>
          </div>
        </motion.div>

        {/* ================= CARD 2: IMÓVEIS — KITNETS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.14 }}
          className="card-kitnet p-4 sm:p-5 space-y-3.5 flex flex-col justify-between"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#0EA5E9]/20">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <CategoryStamp category="kitnet" size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#F5F5F7]">
                    Imóveis — Kitnets
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30">
                    {totalKitnets} {totalKitnets === 1 ? 'unidade' : 'unidades'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                    {kitnetsAlugadas}/{totalKitnets} Ocupadas
                  </span>
                </div>
                <p className="text-xs text-[#9A9AA2] truncate mt-0.5">
                  Locações residenciais & taxa de água
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('kitnets')}
              className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] hover:underline font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 transition-all shrink-0 ml-2"
            >
              Ver Imóveis →
            </button>
          </div>

          {/* Grid of 4 Metrics (2 columns on mobile, 4 columns on large screens) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* 1. Ocupadas */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <span className="text-[10px] text-[#9A9AA2] font-bold uppercase tracking-wider truncate">
                Ocupadas
              </span>
              <div className="text-sm sm:text-base font-bold text-[#10B981] mt-1 tabular-nums flex items-baseline gap-1 truncate font-mono">
                <AnimatedNumber value={kitnetsAlugadas} format="number" />
                <span className="text-xs text-[#9A9AA2] font-normal">({taxaOcupacaoKitnets}%)</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${taxaOcupacaoKitnets}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-[#10B981] rounded-full"
                />
              </div>
            </div>

            {/* 2. Disponíveis */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <span className="text-[10px] text-[#9A9AA2] font-bold uppercase tracking-wider truncate">
                Disponíveis
              </span>
              <div className="text-sm sm:text-base font-bold text-[#F5F5F7] mt-1 tabular-nums font-mono">
                <AnimatedNumber value={kitnetsDisponiveis} format="number" />
              </div>
              <span className="text-[10px] text-[#9A9AA2] block mt-1.5 truncate">
                {kitnetsManutencao > 0 ? `${kitnetsManutencao} em reforma` : 'Prontas para morar'}
              </span>
            </div>

            {/* 3. Receita (Mês) */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <span className="text-[10px] text-[#9A9AA2] font-bold uppercase tracking-wider truncate">
                Receita (Mês)
              </span>
              <div className="text-sm sm:text-base font-bold text-[#10B981] mt-1 tabular-nums truncate font-mono">
                <AnimatedNumber value={faturamentoMensalKitnets} format="currency" />
              </div>
              <span
                className={`text-[10px] font-semibold block mt-1.5 truncate ${
                  inadimplenciaKitnets > 0 ? 'text-[#EF4444]' : 'text-[#9A9AA2]'
                }`}
              >
                {inadimplenciaKitnets > 0
                  ? `${formatCurrency(inadimplenciaKitnets)} atraso`
                  : receitaMesAtualKitnets > 0
                  ? `Recebido: ${formatCurrency(receitaMesAtualKitnets)}`
                  : 'Em dia'}
              </span>
            </div>

            {/* 4. Projeção Anual */}
            <div className="p-3 bg-[#141418] rounded-xl border border-white/[0.06] flex flex-col justify-between min-w-0">
              <div className="flex items-center gap-1 text-[#9A9AA2]">
                <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                  Projeção Anual
                </span>
              </div>
              <div className="text-sm sm:text-base font-bold text-sky-400 mt-1 tabular-nums truncate font-mono">
                <AnimatedNumber value={faturamentoMensalKitnets * 12} format="currency" />
              </div>
              <span className="text-[10px] text-[#9A9AA2] block mt-1.5 truncate">
                12 meses projetados
              </span>
            </div>
          </div>

          {/* Bottom Footer: Patrimônio Avaliado & Inadimplência Detalhada */}
          <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
              <Wallet className="w-3.5 h-3.5 text-sky-400/90 shrink-0" />
              <span className="text-[11px] text-slate-400">Patrimônio Avaliado:</span>
              <span className="font-semibold text-slate-200 font-mono text-[11px] sm:text-xs">
                {formatCurrency(valorInvestidoKitnets)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              {inadimplenciaKitnets > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="text-[11px] text-slate-400">Inadimplência:</span>
              <span
                className={`font-semibold font-mono text-[11px] sm:text-xs ${
                  inadimplenciaKitnets > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {formatCurrency(inadimplenciaKitnets)} ({inadimplenciaPctKitnets.toFixed(1)}%)
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
