import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileSpreadsheet,
  FileText,
  Loader2,
  Download,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Motorbike,
  Home,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTodayLocalDateString, isInstallmentOverdue } from '../utils/formatters';
import { safeAdd, safeSub } from '../utils/financialMath';
import { getKitnetMonthlyTotal, getMotoMonthlyTotal } from '../domain/calculations';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { generateExecutiveDREPdf } from '../utils/pdf/reportPdfGenerators';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose }) => {
  const {
    motos,
    motoContracts,
    kitnets,
    kitnetContracts,
    expenses,
    settings,
  } = useApp();

  useBodyScrollLock(isOpen);

  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'motos' | 'kitnets'>('all');

  if (!isOpen) return null;

  // Cálculos com precisão de centavos
  const totalMotos = motos.length;
  const motosAlugadas = motos.filter((m) => m.status === 'alugada').length;
  const totalKitnets = kitnets.length;
  const kitnetsAlugadas = kitnets.filter((k) => k.status === 'alugada').length;

  let faturamentoMotos = 0;
  let inadimplenciaMotos = 0;
  let parcelasPagasMotos = 0;
  motoContracts.forEach((c) => {
    if (c.status === 'ativo') faturamentoMotos = safeAdd(faturamentoMotos, getMotoMonthlyTotal(c));
    c.installments.forEach((i) => {
      if (i.status === 'pago') parcelasPagasMotos = safeAdd(parcelasPagasMotos, i.amount);
      if (isInstallmentOverdue(i)) inadimplenciaMotos = safeAdd(inadimplenciaMotos, i.amount);
    });
  });

  let faturamentoKitnets = 0;
  let inadimplenciaKitnets = 0;
  let parcelasPagasKitnets = 0;
  kitnetContracts.forEach((c) => {
    if (c.status === 'ativo') {
      faturamentoKitnets = safeAdd(faturamentoKitnets, getKitnetMonthlyTotal(c));
    }
    c.installments.forEach((i) => {
      if (i.status === 'pago') parcelasPagasKitnets = safeAdd(parcelasPagasKitnets, i.amount);
      if (isInstallmentOverdue(i)) inadimplenciaKitnets = safeAdd(inadimplenciaKitnets, i.amount);
    });
  });

  const totalDespesas = expenses.reduce((acc, e) => safeAdd(acc, e.amount), 0);
  const faturamentoTotal = safeAdd(faturamentoMotos, faturamentoKitnets);
  const inadimplenciaTotal = safeAdd(inadimplenciaMotos, inadimplenciaKitnets);
  const totalRecebido = safeAdd(parcelasPagasMotos, parcelasPagasKitnets);
  const resultadoLiquido = safeSub(totalRecebido, totalDespesas);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'alugada' || normalized === 'ocupada' || normalized === 'ativo') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Alugada
        </span>
      );
    }
    if (normalized === 'disponivel' || normalized === 'livre') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          Disponível
        </span>
      );
    }
    if (normalized === 'manutencao' || normalized === 'manutenção' || normalized === 'reforma') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Manutenção
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-700/40 text-zinc-300 border border-zinc-700 whitespace-nowrap capitalize">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
        {status}
      </span>
    );
  };

  // Exportar CSV consolidado
  const handleExportCSV = () => {
    const rows = [
      ['RELATORIO CONSOLIDADO DE GESTAO PATRIMONIAL'],
      ['Data de Geracao:', new Date().toLocaleString('pt-BR')],
      ['Empresa:', settings.companyName || 'Gestao de Frotas & Locacoes'],
      [''],
      ['RESUMO GERAL'],
      ['Patrimonio', 'Quantidade', 'Ocupadas/Alugadas', 'Receita Mensal Prevista (R$)', 'Inadimplencia Acumulada (R$)'],
      ['Frota de Motocicletas', totalMotos, motosAlugadas, faturamentoMotos.toFixed(2), inadimplenciaMotos.toFixed(2)],
      ['Kitnets Residenciais', totalKitnets, kitnetsAlugadas, faturamentoKitnets.toFixed(2), inadimplenciaKitnets.toFixed(2)],
      ['TOTAL CONSOLIDADO', totalMotos + totalKitnets, motosAlugadas + kitnetsAlugadas, faturamentoTotal.toFixed(2), inadimplenciaTotal.toFixed(2)],
      [''],
      ['FLUXO FINANCEIRO LIQUIDO'],
      ['Total de Receitas Realizadas (Baixas)', totalRecebido.toFixed(2)],
      ['Total de Despesas Operacionais', totalDespesas.toFixed(2)],
      ['Resultado Liquido do Periodo', resultadoLiquido.toFixed(2)],
      [''],
      ['INVENTARIO DE MOTOCICLETAS'],
      ['Placa', 'Marca / Modelo', 'Status', 'Valor Compra (R$)', 'KM Atual'],
      ...motos.map((m) => [m.plate || 'S/ Placa', `${m.brand} ${m.model}`, m.status.toUpperCase(), m.purchasePrice.toFixed(2), m.currentKm]),
      [''],
      ['INVENTARIO DE KITNETS'],
      ['Unidade', 'Identificacao', 'Status', 'Aluguel Base (R$)', 'Agua Base (R$)'],
      ...kitnets.map((k) => [k.number, k.name, k.status.toUpperCase(), k.monthlyRentBase.toFixed(2), k.monthlyWaterBase.toFixed(2)]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_patrimonial_consolidado_${getTodayLocalDateString()}.csv`);
    document.body.appendChild(link);

    setIsExportingCsv(true);
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      setIsExportingCsv(false);
    }, 400);
  };

  // Gerar PDF Institucional Oficial com jsPDF (Vetorizado, sem captura de tela)
  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateExecutiveDREPdf({
        motos,
        kitnets,
        motoContracts,
        kitnetContracts,
        expenses,
        settings,
      });
    } catch (err) {
      console.error('Erro ao gerar PDF executivo:', err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 500);
    }
  };

  const filteredMotos = selectedFilter === 'kitnets' ? [] : motos;
  const filteredKitnets = selectedFilter === 'motos' ? [] : kitnets;
  const totalDisplayItems = filteredMotos.length + filteredKitnets.length;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#141418] border border-white/[0.08] rounded-2xl w-full max-w-2xl sm:max-w-3xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#101012] flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F5F5F7]">Relatório Executivo Consolidado (DRE)</h2>
              <p className="text-xs text-[#9A9AA2] hidden sm:block">Demonstrativo auditado de ativos, receitas e resultados operacionais</p>
              <p className="text-[11px] text-[#9A9AA2] sm:hidden">Indicadores patrimoniais e financeiros</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
            title="Fechar Relatório"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs text-[#F5F5F7] printable-content modal-scroll-container overscroll-contain flex-1">
          {/* Executive Summary Card */}
          <div className="p-3.5 sm:p-4 bg-[#101012] border border-white/[0.08] rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {settings.companyName || 'Gestão de Frotas & Locações'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#F5F5F7]">Demonstrativo Patrimonial e Resultados</h3>
              </div>
              <div className="text-left sm:text-right text-[11px] text-[#9A9AA2]">
                <p>Data: <strong className="text-[#F5F5F7]">{formatDate(new Date().toISOString())}</strong></p>
                <p>Responsável: <strong className="text-[#F5F5F7]">{settings.adminName || settings.primaryOwnerName || 'Administrador'}</strong></p>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              <div className="p-2.5 sm:p-3 bg-[#18181B] rounded-lg border border-white/[0.06] flex flex-col justify-between">
                <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Faturamento Previsto</span>
                <p className="text-sm sm:text-base font-bold text-emerald-400 mt-1 font-mono tracking-tight">{formatCurrency(faturamentoTotal)}</p>
                <span className="text-[9px] text-[#9A9AA2] mt-0.5">Contratos ativos/mês</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-[#18181B] rounded-lg border border-white/[0.06] flex flex-col justify-between">
                <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Receita Realizada</span>
                <p className="text-sm sm:text-base font-bold text-sky-400 mt-1 font-mono tracking-tight">{formatCurrency(totalRecebido)}</p>
                <span className="text-[9px] text-[#9A9AA2] mt-0.5">Baixas efetivadas</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-[#18181B] rounded-lg border border-white/[0.06] flex flex-col justify-between">
                <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Despesas Op.</span>
                <p className="text-sm sm:text-base font-bold text-amber-300 mt-1 font-mono tracking-tight">{formatCurrency(totalDespesas)}</p>
                <span className="text-[9px] text-[#9A9AA2] mt-0.5">Custos e manutenção</span>
              </div>
              <div className="p-2.5 sm:p-3 bg-[#18181B] rounded-lg border border-white/[0.06] flex flex-col justify-between">
                <span className="text-[10px] text-[#9A9AA2] uppercase font-semibold">Inadimplência</span>
                <p className={`text-sm sm:text-base font-bold mt-1 font-mono tracking-tight ${inadimplenciaTotal > 0 ? 'text-[#EF4444]' : 'text-emerald-400'}`}>
                  {formatCurrency(inadimplenciaTotal)}
                </p>
                <span className="text-[9px] text-[#9A9AA2] mt-0.5">{inadimplenciaTotal > 0 ? 'Valores em atraso' : '100% em dia'}</span>
              </div>
            </div>

            {/* Resultado Líquido Banner */}
            <div className="mt-2 p-2.5 bg-[#18181B] rounded-lg border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${resultadoLiquido >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#9A9AA2] block">Resultado Operacional Líquido</span>
                  <span className="text-xs text-[#9A9AA2]">Receitas Realizadas (-) Despesas</span>
                </div>
              </div>
              <span className={`text-sm sm:text-base font-bold font-mono ${resultadoLiquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(resultadoLiquido)}
              </span>
            </div>
          </div>

          {/* Breakdown Section: Motos vs Kitnets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Motos Card */}
            <div className="p-3.5 sm:p-4 bg-[#101012] border border-white/[0.08] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Motorbike className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#F5F5F7]">Locação de Motos</h4>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {motosAlugadas}/{totalMotos} Alugadas
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-[#18181B] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalMotos > 0 ? (motosAlugadas / totalMotos) * 100 : 0}%` }}
                />
              </div>

              <div className="space-y-1.5 text-xs text-[#9A9AA2]">
                <div className="flex justify-between items-center">
                  <span>Receita Mensal Prevista:</span>
                  <strong className="text-[#F5F5F7] font-mono">{formatCurrency(faturamentoMotos)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inadimplência Acumulada:</span>
                  <strong className={`font-mono ${inadimplenciaMotos > 0 ? 'text-[#EF4444]' : 'text-emerald-400'}`}>
                    {formatCurrency(inadimplenciaMotos)}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxa de Ocupação:</span>
                  <strong className="text-emerald-400 font-mono">
                    {totalMotos > 0 ? Math.round((motosAlugadas / totalMotos) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Kitnets Card */}
            <div className="p-3.5 sm:p-4 bg-[#101012] border border-white/[0.08] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <Home className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#F5F5F7]">Kitnets Residenciais</h4>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {kitnetsAlugadas}/{totalKitnets} Ocupadas
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#18181B] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalKitnets > 0 ? (kitnetsAlugadas / totalKitnets) * 100 : 0}%` }}
                />
              </div>

              <div className="space-y-1.5 text-xs text-[#9A9AA2]">
                <div className="flex justify-between items-center">
                  <span>Receita Mensal Prevista:</span>
                  <strong className="text-[#F5F5F7] font-mono">{formatCurrency(faturamentoKitnets)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inadimplência Acumulada:</span>
                  <strong className={`font-mono ${inadimplenciaKitnets > 0 ? 'text-[#EF4444]' : 'text-emerald-400'}`}>
                    {formatCurrency(inadimplenciaKitnets)}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxa de Ocupação:</span>
                  <strong className="text-emerald-400 font-mono">
                    {totalKitnets > 0 ? Math.round((kitnetsAlugadas / totalKitnets) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Assets List - Fully Refactored with Responsive Design */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#9A9AA2] flex items-center gap-1.5">
                <span>Inventário Operacional</span>
                <span className="px-1.5 py-0.2 rounded bg-white/[0.08] text-[#F5F5F7] text-[10px] font-mono">
                  {totalDisplayItems}
                </span>
              </h4>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#18181B] p-0.5 rounded-lg border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedFilter === 'all'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                  }`}
                >
                  Todos ({totalMotos + totalKitnets})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('motos')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedFilter === 'motos'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                  }`}
                >
                  <Motorbike className="w-3 h-3" />
                  Motos ({totalMotos})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('kitnets')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedFilter === 'kitnets'
                      ? 'bg-sky-500/20 text-sky-300 font-bold'
                      : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                  }`}
                >
                  <Home className="w-3 h-3" />
                  Kitnets ({totalKitnets})
                </button>
              </div>
            </div>

            <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012]">
              {/* Desktop / Tablet Table View (sm and up) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181B] text-[#9A9AA2] uppercase text-[10px] font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-3.5">Segmento</th>
                      <th className="py-3 px-3.5">Identificação</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Valor Referência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredMotos.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Motorbike className="w-3 h-3" />
                            MOTO
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-[#F5F5F7]">
                          <div className="flex flex-col">
                            <span className="font-semibold">{m.brand} {m.model}</span>
                            <span className="text-[11px] text-[#9A9AA2] font-mono">{m.plate || 'Sem Placa'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">{getStatusBadge(m.status)}</td>
                        <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#F5F5F7] whitespace-nowrap">
                          {formatCurrency(m.purchasePrice)}
                        </td>
                      </tr>
                    ))}
                    {filteredKitnets.map((k) => (
                      <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            <Home className="w-3 h-3" />
                            KITNET
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-[#F5F5F7]">
                          <div className="flex flex-col">
                            <span className="font-semibold">{k.name}</span>
                            <span className="text-[11px] text-[#9A9AA2]">Unidade {k.number}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">{getStatusBadge(k.status)}</td>
                        <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#F5F5F7] whitespace-nowrap">
                          {formatCurrency(k.monthlyRentBase)}
                          <span className="text-[10px] font-normal text-[#9A9AA2]">/mês</span>
                        </td>
                      </tr>
                    ))}
                    {totalDisplayItems === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#9A9AA2]">
                          Nenhum ativo encontrado para o filtro selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card / Row View (Crystal clear, no truncation or horizontal cut-off) */}
              <div className="block sm:hidden divide-y divide-white/[0.06]">
                {filteredMotos.map((m) => (
                  <div key={m.id} className="p-3 hover:bg-white/[0.02] transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
                          <Motorbike className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-semibold text-xs text-[#F5F5F7] truncate leading-tight">
                            {m.brand} {m.model}
                          </h5>
                          <p className="text-[11px] text-[#9A9AA2] font-mono mt-0.5">
                            {m.plate || 'Sem Placa'}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {getStatusBadge(m.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
                      <span className="text-[#9A9AA2]">Valor de Aquisição</span>
                      <span className="font-mono font-bold text-[#F5F5F7] whitespace-nowrap">
                        {formatCurrency(m.purchasePrice)}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredKitnets.map((k) => (
                  <div key={k.id} className="p-3 hover:bg-white/[0.02] transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0 mt-0.5">
                          <Home className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-semibold text-xs text-[#F5F5F7] truncate leading-tight">
                            {k.name}
                          </h5>
                          <p className="text-[11px] text-[#9A9AA2] mt-0.5">
                            Unidade {k.number}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {getStatusBadge(k.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
                      <span className="text-[#9A9AA2]">Aluguel Base</span>
                      <span className="font-mono font-bold text-[#F5F5F7] whitespace-nowrap">
                        {formatCurrency(k.monthlyRentBase)}
                        <span className="text-[10px] font-normal text-[#9A9AA2]">/mês</span>
                      </span>
                    </div>
                  </div>
                ))}

                {totalDisplayItems === 0 && (
                  <div className="p-6 text-center text-xs text-[#9A9AA2]">
                    Nenhum ativo encontrado para o filtro selecionado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-[#101012] border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <span className="text-[10px] sm:text-xs text-[#9A9AA2] text-center sm:text-left">
            Documento contábil formatado em padrão corporativo
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExportingCsv || isGeneratingPdf}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#18181B] hover:bg-[#25242C] text-[#F5F5F7] hover:text-emerald-400 font-semibold text-xs rounded-xl border border-white/[0.08] hover:border-emerald-500/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs relative overflow-hidden disabled:opacity-60"
            >
              {isExportingCsv ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400 relative z-10" />
                  <span className="relative z-10">Exportando...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Baixar CSV</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isExportingCsv || isGeneratingPdf}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-60 active:scale-98"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  <span className="relative z-10">Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Relatório PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

