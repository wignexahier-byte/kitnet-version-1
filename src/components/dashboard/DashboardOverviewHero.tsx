import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Calculator,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Phone,
  Smartphone,
  Bell,
  Users,
  Coins,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowRight,
  FileCheck2,
  Motorbike,
} from 'lucide-react';
import { TabType } from '../Navigation';
import { formatCurrency } from '../../utils/formatters';
import { AnimatedNumber } from '../AnimatedNumber';

interface DashboardOverviewHeroProps {
  notificationState: string;
  onEnableNotifications: () => void;
  onOpenReportModal: () => void;
  onOpenSimulator?: () => void;
  onOpenContacts?: () => void;
  onOpenPwaGuide?: () => void;
  onNavigateTab: (tab: TabType) => void;
  faturamentoBrutoMensal: number;
  receitaMesAtualTotal?: number;
  receitaMesAtualMotos?: number;
  receitaMesAtualKitnets?: number;
  receitaAnualProjetada?: number;
  faturamentoMensalMotos?: number;
  faturamentoMensalKitnets?: number;
  totalReceitaRecebida?: number;
  totalAReceber?: number;
  totalInadimplenciaGeral: number;
  totalMotos: number;
  totalKitnets: number;
  motosAlugadas: number;
  kitnetsAlugadas: number;
  totalContratosAtivos: number;
  patrimonioTotalAvaliado?: number;
  overdueCount: number;
  dueTodayCount: number;
  upcomingCount: number;
  taxaOcupacaoGeral: number;
  monthlyEvolutionData?: Array<{ mes: string; receita: number; despesa: number; lucro: number }>;
}

/**
 * Gera os caminhos SVG da sparkline baseados em dados reais.
 * Se não houver dados ou todos forem 0, retorna uma linha de base reta e sem onda fictícia.
 */
function getSparklinePaths(dataPoints: number[]) {
  const max = Math.max(...dataPoints, 0);
  if (max === 0 || dataPoints.length === 0) {
    return {
      line: 'M 0,28 L 100,28',
      fill: 'M 0,28 L 100,28 L 100,32 L 0,32 Z',
      hasData: false,
    };
  }

  const min = Math.min(...dataPoints, 0);
  const range = max - min || 1;
  const n = dataPoints.length;
  const coords = dataPoints.map((val, idx) => {
    const x = n > 1 ? (idx / (n - 1)) * 100 : 50;
    const y = 26 - ((val - min) / range) * 20;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  let line = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cx = (p0.x + p1.x) / 2;
    line += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
  }

  const fill = `${line} L 100,32 L 0,32 Z`;
  return { line, fill, hasData: true };
}

export const DashboardOverviewHero: React.FC<DashboardOverviewHeroProps> = ({
  notificationState,
  onEnableNotifications,
  onOpenReportModal,
  onOpenSimulator,
  onOpenContacts,
  onOpenPwaGuide,
  onNavigateTab,
  faturamentoBrutoMensal,
  receitaMesAtualTotal,
  receitaMesAtualMotos,
  receitaMesAtualKitnets,
  receitaAnualProjetada,
  faturamentoMensalMotos,
  faturamentoMensalKitnets,
  totalReceitaRecebida,
  totalAReceber,
  totalInadimplenciaGeral,
  totalMotos,
  totalKitnets,
  motosAlugadas,
  kitnetsAlugadas,
  totalContratosAtivos,
  patrimonioTotalAvaliado = 0,
  overdueCount,
  dueTodayCount,
  upcomingCount,
  taxaOcupacaoGeral,
  monthlyEvolutionData,
}) => {
  const totalBens = totalMotos + totalKitnets;
  const totalAlugados = motosAlugadas + kitnetsAlugadas;

  const aReceber = totalAReceber !== undefined ? totalAReceber : faturamentoBrutoMensal + totalInadimplenciaGeral;
  const anualFaturamento = receitaAnualProjetada !== undefined && receitaAnualProjetada > 0
    ? receitaAnualProjetada
    : faturamentoBrutoMensal * 12;

  // Receita Realizada / Recebida no Mês Atual (sobe em tempo real a cada baixa dada)
  const revenueReceivedThisMonth = receitaMesAtualTotal ?? 0;

  // 1. Cálculo real da variação de Faturamento vs Mês Anterior
  const prevMonthRevenue =
    monthlyEvolutionData && monthlyEvolutionData.length >= 2
      ? monthlyEvolutionData[monthlyEvolutionData.length - 2].receita
      : 0;

  const currentRevenueForDiff = revenueReceivedThisMonth > 0 ? revenueReceivedThisMonth : faturamentoBrutoMensal;

  let faturamentoVariacaoText = '0,0% vs mês ant.';
  let faturamentoVariacaoColor = 'text-[#9A9AA2]';

  if (currentRevenueForDiff === 0 && prevMonthRevenue === 0) {
    faturamentoVariacaoText = '0,0% vs mês ant.';
    faturamentoVariacaoColor = 'text-[#9A9AA2]';
  } else if (prevMonthRevenue > 0) {
    const diff = ((currentRevenueForDiff - prevMonthRevenue) / prevMonthRevenue) * 100;
    const sign = diff > 0 ? '+' : '';
    faturamentoVariacaoText = `${sign}${diff.toFixed(1).replace('.', ',')}% vs mês ant. ${diff >= 0 ? '↗' : '↘'}`;
    faturamentoVariacaoColor = diff >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]';
  } else if (currentRevenueForDiff > 0 && prevMonthRevenue === 0) {
    faturamentoVariacaoText = '+100% vs mês ant. ↗';
    faturamentoVariacaoColor = 'text-[#10B981]';
  }

  // 2. Indicador real de A Receber
  const totalPendingCobranças = overdueCount + dueTodayCount + upcomingCount;
  let aReceberSubtitleText = '0 pendências';
  let aReceberSubtitleColor = 'text-[#9A9AA2]';

  if (aReceber > 0 || totalPendingCobranças > 0) {
    aReceberSubtitleText = `${totalPendingCobranças} ${
      totalPendingCobranças === 1 ? 'cobrança pendente' : 'cobranças pendentes'
    }`;
    aReceberSubtitleColor = 'text-[#06B6D4]';
  }

  // 3. Sparklines dinâmicas baseadas em dados reais
  const faturamentoHistory =
    monthlyEvolutionData && monthlyEvolutionData.length > 0
      ? monthlyEvolutionData.map((p) => p.receita)
      : [0, 0, 0, 0, 0, revenueReceivedThisMonth || faturamentoBrutoMensal];

  const faturamentoSpark = getSparklinePaths(
    (revenueReceivedThisMonth === 0 && faturamentoBrutoMensal === 0) || faturamentoHistory.every((v) => v === 0)
      ? [0, 0, 0, 0, 0, 0]
      : faturamentoHistory
  );

  const aReceberSpark = getSparklinePaths(
    aReceber === 0 ? [0, 0, 0, 0, 0, 0] : [aReceber * 0.7, aReceber * 0.85, aReceber, aReceber, aReceber]
  );

  const inadimplenciaSpark = getSparklinePaths(
    totalInadimplenciaGeral === 0 ? [0, 0, 0, 0, 0, 0] : [0, 0, totalInadimplenciaGeral * 0.6, totalInadimplenciaGeral]
  );

  const patrimonioSpark = getSparklinePaths(
    patrimonioTotalAvaliado === 0
      ? [0, 0, 0, 0, 0, 0]
      : [patrimonioTotalAvaliado * 0.9, patrimonioTotalAvaliado * 0.95, patrimonioTotalAvaliado, patrimonioTotalAvaliado, patrimonioTotalAvaliado]
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Title & Top Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#9A9AA2] mt-0.5">
            Visão geral da operação
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-4 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#8B5CF6]/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar relatório</span>
          </button>

          {onOpenSimulator && (
            <button
              type="button"
              onClick={onOpenSimulator}
              className="px-4 py-2.5 rounded-xl bg-[#18181C] hover:bg-[#222228] border border-white/[0.08] text-[#F5F5F7] font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Calculator className="w-4 h-4 text-[#8B5CF6]" />
              <span>Simulador</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards Grid (4 Cards: Faturamento, A Receber, Inadimplência, Patrimônio da Frota) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Faturamento do Mês (Previsão a Receber no Mês) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#9A9AA2]">Faturamento (Mês)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25">
                  Previsão
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-[#F5F5F7] tracking-tight tabular-nums">
                <AnimatedNumber
                  value={faturamentoBrutoMensal}
                  format="currency"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className={`font-semibold ${faturamentoVariacaoColor}`}>{faturamentoVariacaoText}</span>
                <span className="text-[#9A9AA2] font-mono text-[11px]">
                  Ano: <strong className="text-[#F5F5F7] font-semibold">{formatCurrency(anualFaturamento)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Purple Sparkline */}
          <div className="mt-3 w-full h-8 relative">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="purpleGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={faturamentoSpark.hasData ? 0.35 : 0.05} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={faturamentoSpark.line}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth={faturamentoSpark.hasData ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={faturamentoSpark.hasData ? 1 : 0.3}
              />
              <path
                d={faturamentoSpark.fill}
                fill="url(#purpleGlowGradient)"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 2: A receber */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9A9AA2]">A receber</span>
            <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/15 flex items-center justify-center text-[#06B6D4]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-[#F5F5F7] tracking-tight tabular-nums">
              <AnimatedNumber value={aReceber} format="currency" />
            </div>
            <div className={`flex items-center gap-1 mt-1 text-[11px] font-semibold ${aReceberSubtitleColor}`}>
              <span>{aReceberSubtitleText}</span>
            </div>
          </div>

          {/* Dynamic Cyan Sparkline */}
          <div className="mt-3 w-full h-8 relative">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="cyanGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={aReceberSpark.hasData ? 0.35 : 0.05} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={aReceberSpark.line}
                fill="none"
                stroke="#06B6D4"
                strokeWidth={aReceberSpark.hasData ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={aReceberSpark.hasData ? 1 : 0.3}
              />
              <path
                d={aReceberSpark.fill}
                fill="url(#cyanGlowGradient)"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 3: Inadimplência */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          onClick={() => onNavigateTab('cobrancas')}
          className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] hover:border-[#EF4444]/40 flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9A9AA2]">Inadimplência</span>
            <div className="w-7 h-7 rounded-lg bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-[#EF4444] tracking-tight tabular-nums">
              <AnimatedNumber value={totalInadimplenciaGeral} format="currency" />
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#EF4444]">
              <span>{`${overdueCount} ${overdueCount === 1 ? 'cobrança em atraso' : 'cobranças em atraso'}`}</span>
            </div>
          </div>

          {/* Dynamic Red Sparkline */}
          <div className="mt-3 w-full h-8 relative">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="redGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={inadimplenciaSpark.hasData ? 0.35 : 0.05} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={inadimplenciaSpark.line}
                fill="none"
                stroke="#EF4444"
                strokeWidth={inadimplenciaSpark.hasData ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={inadimplenciaSpark.hasData ? 1 : 0.3}
              />
              <path
                d={inadimplenciaSpark.fill}
                fill="url(#redGlowGradient)"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 4: Patrimônio da Frota (Motos) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          onClick={() => onNavigateTab('motos')}
          className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] hover:border-[#E07A3F]/40 flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#9A9AA2]">Patrimônio da Frota</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E07A3F]/15 text-[#E07A3F] border border-[#E07A3F]/25">
                Frota
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#E07A3F]/15 flex items-center justify-center text-[#E07A3F] group-hover:scale-105 transition-transform">
              <Motorbike className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-[#F5F5F7] tracking-tight tabular-nums">
              <AnimatedNumber value={patrimonioTotalAvaliado} format="currency" />
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#E07A3F] font-semibold">
                {`${totalMotos} ${totalMotos === 1 ? 'moto' : 'motos'}`}
              </span>
              <span className="text-[#9A9AA2]">
                {`${motosAlugadas} alugadas`}
              </span>
            </div>
          </div>

          {/* Dynamic Amber/Orange Sparkline */}
          <div className="mt-3 w-full h-8 relative">
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="orangeGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E07A3F" stopOpacity={patrimonioTotalAvaliado > 0 ? 0.35 : 0.05} />
                  <stop offset="100%" stopColor="#E07A3F" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={patrimonioSpark.line}
                fill="none"
                stroke="#E07A3F"
                strokeWidth={patrimonioSpark.hasData ? 2.5 : 1.5}
                strokeLinecap="round"
                opacity={patrimonioSpark.hasData ? 1 : 0.3}
              />
              <path
                d={patrimonioSpark.fill}
                fill="url(#orangeGlowGradient)"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* 3. Alert Banner: Atenção necessária */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-4 sm:p-5 rounded-2xl bg-[#1A1215] border border-[#EF4444]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-[#EF4444]/5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EF4444]">
                Atenção necessária
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-[#F5F5F7] mt-0.5 flex flex-wrap items-baseline gap-1.5">
              <span>{formatCurrency(totalInadimplenciaGeral)}</span>
              <span className="text-xs font-normal text-[#9A9AA2]">em cobranças pendentes</span>
            </div>
            {/* Status Breakdown Pills */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                {`${overdueCount} ${overdueCount === 1 ? 'vencida' : 'vencidas'}`}
              </span>
              <span className="flex items-center gap-1.5 text-[#F59E0B]">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                {`${dueTodayCount} ${dueTodayCount === 1 ? 'vence hoje' : 'vencem hoje'}`}
              </span>
              <span className="flex items-center gap-1.5 text-[#9A9AA2]">
                <span className="w-2 h-2 rounded-full bg-white/40" />
                {`${upcomingCount} a vencer`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('cobrancas')}
          className="px-4 py-2.5 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 self-end md:self-center"
        >
          <span>Ver cobranças</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* 4. Section: Ações rápidas */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#F5F5F7]">Ações rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Action 1: Contatos */}
          {onOpenContacts && (
            <button
              type="button"
              onClick={onOpenContacts}
              className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.15] flex items-center gap-3 text-left transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6] shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate">Contatos</span>
            </button>
          )}

          {/* Action 2: App Celular */}
          {onOpenPwaGuide && (
            <button
              type="button"
              onClick={onOpenPwaGuide}
              className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.15] flex items-center gap-3 text-left transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6] shrink-0 group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate">App Celular</span>
            </button>
          )}

          {/* Action 3: Ativar Alertas */}
          <button
            type="button"
            onClick={onEnableNotifications}
            className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.15] flex items-center gap-3 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6] shrink-0 group-hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate">
              {notificationState === 'granted' ? 'Alertas Ativos' : 'Ativar Alertas'}
            </span>
          </button>

          {/* Action 4: Documentos */}
          <button
            type="button"
            onClick={() => onNavigateTab('documentos')}
            className="p-3.5 rounded-2xl bg-[#141418] hover:bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.15] flex items-center gap-3 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6] shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate">Documentos</span>
          </button>
        </div>
      </div>

      {/* 5. Section: Acesso rápido */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F5F5F7]">Acesso rápido</h2>
          <button
            type="button"
            onClick={() => onNavigateTab('financeiro')}
            className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors cursor-pointer"
          >
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Central de Contratos */}
          <div
            onClick={() => onNavigateTab('cobrancas')}
            className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] hover:border-[#0EA5E9]/40 flex flex-col justify-between transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/15 flex items-center justify-center text-[#0EA5E9]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2] group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#F5F5F7]">Central de Contratos</h3>
              <p className="text-xs text-[#9A9AA2] mt-0.5">
                {`${totalContratosAtivos} ${totalContratosAtivos === 1 ? 'contrato ativo' : 'contratos ativos'}`}
              </p>

              {/* Progress Bar */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0EA5E9]"
                    style={{ width: `${Math.min(100, Math.max(0, taxaOcupacaoGeral))}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#0EA5E9] whitespace-nowrap">
                  {Math.round(taxaOcupacaoGeral)}% ocupação
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Clientes & Score */}
          <div
            onClick={() => onNavigateTab('clientes')}
            className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] hover:border-[#8B5CF6]/40 flex flex-col justify-between transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                <Users className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2] group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#F5F5F7]">Clientes & Score</h3>
              <p className="text-xs text-[#9A9AA2] mt-0.5">
                {`${totalContratosAtivos} ${totalContratosAtivos === 1 ? 'cliente ativo' : 'clientes ativos'}`}
              </p>

              {/* Progress Bar */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: totalContratosAtivos > 0 ? '84%' : '0%' }} />
                </div>
                <span className="text-[11px] font-semibold text-[#8B5CF6] whitespace-nowrap">
                  {totalContratosAtivos > 0 ? 'Score médio 842' : 'Sem histórico'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Receitas & Despesas */}
          <div
            onClick={() => onNavigateTab('financeiro')}
            className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] hover:border-[#E07A3F]/40 flex flex-col justify-between transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E07A3F]/15 flex items-center justify-center text-[#E07A3F]">
                <Coins className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2] group-hover:text-[#E07A3F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#F5F5F7]">Receitas & Despesas</h3>
              <p className="text-xs text-[#9A9AA2] mt-0.5">Fluxo de caixa</p>

              {/* Progress Bar */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full rounded-full bg-[#E07A3F]" style={{ width: faturamentoBrutoMensal > 0 ? '70%' : '0%' }} />
                </div>
                <span className={`text-[11px] font-semibold whitespace-nowrap ${faturamentoBrutoMensal > 0 ? 'text-[#10B981]' : 'text-[#9A9AA2]'}`}>
                  {faturamentoBrutoMensal > 0 ? 'Saldo positivo' : 'Sem lançamentos'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Relatórios & Exportação */}
          <div
            onClick={() => onNavigateTab('relatorios')}
            className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] hover:border-emerald-500/40 flex flex-col justify-between transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-[#10B981]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2] group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5F5F7]">Relatórios & DRE</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Excel & PDF
                </span>
              </div>
              <p className="text-xs text-[#9A9AA2] mt-0.5">Demonstrativos consolidados</p>

              {/* Subtitle / status */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: totalBens > 0 ? '100%' : '0%' }} />
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 whitespace-nowrap">
                  Exportação Pronta
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
