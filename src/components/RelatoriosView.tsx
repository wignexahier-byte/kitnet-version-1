import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  CalendarDays,
  Layers,
  ChevronRight,
  Eye,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Motorbike,
  Home,
  User,
  Clock,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  exportMonthlyRevenueExcel,
  exportExpensesExcel,
  exportInadimplenciaExcel,
  exportProfitabilityExcel,
} from '../utils/exportUtils';
import { formatCurrency, formatDate, getTodayLocalDateString, isInstallmentOverdue } from '../utils/formatters';
import { safeAdd, safeSub, roundCurrency, getDaysDifference } from '../utils/financialMath';
import { ReportExportModal } from './ReportExportModal';
import {
  generateMonthlyRevenuePdf,
  generateInadimplenciaPdf,
  generateProfitabilityPdf,
  generateExecutiveDREPdf,
} from '../utils/pdf/reportPdfGenerators';


export const RelatoriosView: React.FC = () => {
  const {
    motos,
    kitnets,
    motoContracts,
    kitnetContracts,
    motoTenants,
    kitnetTenants,
    expenses,
    settings,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7);
  });
  const [activeReportTab, setActiveReportTab] = useState<'receitas' | 'inadimplencia' | 'rentabilidade' | 'despesas'>('receitas');
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState(false);

  // Cálculos auditados do mês selecionado
  const auditMonthData = useMemo(() => {
    let receitaPrevista = 0;
    let receitaRecebida = 0;
    let receitaPendente = 0;
    let receitaAtrasada = 0;
    let totalParcelas = 0;

    const motoList: any[] = [];
    const kitnetList: any[] = [];

    // Motos
    motoContracts.forEach((c) => {
      const moto = motos.find((m) => m.id === c.motoId);
      const tenant = motoTenants.find((t) => t.id === c.tenantId);

      c.installments.forEach((inst) => {
        if (inst.dueDate.startsWith(selectedMonth) || (inst.paidDate && inst.paidDate.startsWith(selectedMonth))) {
          const isOverdue = isInstallmentOverdue(inst);
          receitaPrevista = safeAdd(receitaPrevista, inst.amount);
          totalParcelas++;

          if (inst.status === 'pago') {
            receitaRecebida = safeAdd(receitaRecebida, inst.amount);
          } else if (isOverdue) {
            receitaAtrasada = safeAdd(receitaAtrasada, inst.amount);
          } else {
            receitaPendente = safeAdd(receitaPendente, inst.amount);
          }

          motoList.push({
            id: inst.id,
            tipo: 'Moto',
            ativo: moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Moto',
            cliente: tenant ? tenant.fullName : 'Locatário',
            contato: tenant ? tenant.whatsapp || tenant.phone : '',
            parcela: `${inst.number}/${c.durationMonths}`,
            vencimento: inst.dueDate,
            valor: inst.amount,
            status: inst.status === 'pago' ? 'pago' : isOverdue ? 'atrasado' : 'pendente',
            dataPagamento: inst.paidDate,
            forma: inst.paymentMethod || 'PIX',
          });
        }
      });
    });

    // Kitnets
    kitnetContracts.forEach((c) => {
      const kitnet = kitnets.find((k) => k.id === c.kitnetId);
      const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

      c.installments.forEach((inst) => {
        if (inst.dueDate.startsWith(selectedMonth) || (inst.paidDate && inst.paidDate.startsWith(selectedMonth))) {
          const isOverdue = isInstallmentOverdue(inst);
          receitaPrevista = safeAdd(receitaPrevista, inst.amount);
          totalParcelas++;

          if (inst.status === 'pago') {
            receitaRecebida = safeAdd(receitaRecebida, inst.amount);
          } else if (isOverdue) {
            receitaAtrasada = safeAdd(receitaAtrasada, inst.amount);
          } else {
            receitaPendente = safeAdd(receitaPendente, inst.amount);
          }

          kitnetList.push({
            id: inst.id,
            tipo: 'Kitnet',
            ativo: kitnet ? `${kitnet.name} (${kitnet.number})` : 'Kitnet',
            cliente: tenant ? tenant.fullName : 'Locatário',
            contato: tenant ? tenant.whatsapp || tenant.phone : '',
            parcela: `${inst.number}/${c.durationMonths}`,
            vencimento: inst.dueDate,
            valor: inst.amount,
            status: inst.status === 'pago' ? 'pago' : isOverdue ? 'atrasado' : 'pendente',
            dataPagamento: inst.paidDate,
            forma: inst.paymentMethod || 'PIX',
          });
        }
      });
    });

    // Despesas do mês
    const monthExpenses = expenses.filter((e) => {
      const d = e.dueDate || e.date || e.paidDate || '';
      return d.startsWith(selectedMonth);
    });

    const totalDespesas = monthExpenses.reduce((acc, e) => safeAdd(acc, e.amount), 0);
    const despesasPagas = monthExpenses.filter((e) => e.status === 'pago').reduce((acc, e) => safeAdd(acc, e.amount), 0);
    const saldoOperacional = safeSub(receitaRecebida, despesasPagas);

    return {
      receitaPrevista,
      receitaRecebida,
      receitaPendente,
      receitaAtrasada,
      totalParcelas,
      motoList,
      kitnetList,
      allCobancas: [...motoList, ...kitnetList],
      monthExpenses,
      totalDespesas,
      despesasPagas,
      saldoOperacional,
    };
  }, [selectedMonth, motoContracts, kitnetContracts, motos, kitnets, motoTenants, kitnetTenants, expenses]);

  // Lista de devedores / inadimplência geral
  const inadimplenciaGeral = useMemo(() => {
    const today = getTodayLocalDateString();
    const devedores: any[] = [];
    let montanteTotal = 0;

    motoContracts.forEach((c) => {
      const moto = motos.find((m) => m.id === c.motoId);
      const tenant = motoTenants.find((t) => t.id === c.tenantId);

      c.installments
        .filter((i) => isInstallmentOverdue(i))
        .forEach((inst) => {
          const diasAtraso = Math.max(0, getDaysDifference(inst.dueDate, today));
          montanteTotal = safeAdd(montanteTotal, inst.amount);
          devedores.push({
            id: `overdue-moto-${inst.id}`,
            tipo: 'Moto',
            ativo: moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Moto',
            cliente: tenant ? tenant.fullName : 'Locatário',
            contato: tenant ? tenant.whatsapp || tenant.phone : '',
            parcela: `${inst.number}/${c.durationMonths}`,
            vencimento: inst.dueDate,
            valor: inst.amount,
            diasAtraso,
          });
        });
    });

    kitnetContracts.forEach((c) => {
      const kitnet = kitnets.find((k) => k.id === c.kitnetId);
      const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

      c.installments
        .filter((i) => isInstallmentOverdue(i))
        .forEach((inst) => {
          const diasAtraso = Math.max(0, getDaysDifference(inst.dueDate, today));
          montanteTotal = safeAdd(montanteTotal, inst.amount);
          devedores.push({
            id: `overdue-kitnet-${inst.id}`,
            tipo: 'Kitnet',
            ativo: kitnet ? `${kitnet.name} (${kitnet.number})` : 'Kitnet',
            cliente: tenant ? tenant.fullName : 'Locatário',
            contato: tenant ? tenant.whatsapp || tenant.phone : '',
            parcela: `${inst.number}/${c.durationMonths}`,
            vencimento: inst.dueDate,
            valor: inst.amount,
            diasAtraso,
          });
        });
    });

    return {
      devedores: devedores.sort((a, b) => b.diasAtraso - a.diasAtraso),
      montanteTotal,
    };
  }, [motoContracts, kitnetContracts, motos, kitnets, motoTenants, kitnetTenants]);

  // Lista de ROI por Ativo
  const rentabilidadeAtivos = useMemo(() => {
    const list: any[] = [];

    motos.forEach((m) => {
      const contracts = motoContracts.filter((c) => c.motoId === m.id);
      let totalReceived = 0;
      contracts.forEach((c) => {
        totalReceived = safeAdd(
          totalReceived,
          c.installments.filter((i) => i.status === 'pago').reduce((acc, i) => safeAdd(acc, i.amount), 0)
        );
      });

      const maintenance = expenses
        .filter((e) => e.targetType === 'moto' && e.targetId === m.id && e.status === 'pago')
        .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

      const lucroLiquido = safeSub(safeSub(totalReceived, m.purchasePrice), maintenance);
      const roi = m.purchasePrice > 0 ? (lucroLiquido / m.purchasePrice) * 100 : 0;

      list.push({
        id: m.id,
        tipo: 'Moto',
        nome: `${m.brand} ${m.model}`,
        identificador: m.plate,
        investimento: m.purchasePrice,
        receita: totalReceived,
        custos: maintenance,
        lucro: lucroLiquido,
        roi: roi.toFixed(1),
        status: m.status,
      });
    });

    kitnets.forEach((k) => {
      const contracts = kitnetContracts.filter((c) => c.kitnetId === k.id);
      let totalReceived = 0;
      contracts.forEach((c) => {
        totalReceived = safeAdd(
          totalReceived,
          c.installments.filter((i) => i.status === 'pago').reduce((acc, i) => safeAdd(acc, i.amount), 0)
        );
      });

      const maintenance = expenses
        .filter((e) => e.targetType === 'kitnet' && e.targetId === k.id && e.status === 'pago')
        .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

      const lucroLiquido = safeSub(totalReceived, maintenance);

      list.push({
        id: k.id,
        tipo: 'Kitnet',
        nome: k.name,
        identificador: `Unidade ${k.number}`,
        investimento: 0,
        receita: totalReceived,
        custos: maintenance,
        lucro: lucroLiquido,
        roi: 'N/A',
        status: k.status,
      });
    });

    return list;
  }, [motos, kitnets, motoContracts, kitnetContracts, expenses]);

  // Funções de exportação Excel
  const handleExportReceitas = () => {
    exportMonthlyRevenueExcel(
      selectedMonth,
      motoContracts,
      kitnetContracts,
      motos,
      kitnets,
      motoTenants,
      kitnetTenants
    );
  };

  const handleExportInadimplencia = () => {
    exportInadimplenciaExcel(
      motoContracts,
      kitnetContracts,
      motos,
      kitnets,
      motoTenants,
      kitnetTenants
    );
  };

  const handleExportRentabilidade = () => {
    exportProfitabilityExcel(motos, motoContracts, kitnets, kitnetContracts, expenses);
  };

  const handleExportDespesas = () => {
    exportExpensesExcel(expenses, selectedMonth);
  };

  // Funções de exportação PDF (jsPDF de Alta Fidelidade)
  const handlePdfReceitas = () => {
    generateMonthlyRevenuePdf({
      selectedMonth,
      motoContracts,
      kitnetContracts,
      motos,
      kitnets,
      motoTenants,
      kitnetTenants,
      settings,
    });
  };

  const handlePdfInadimplencia = () => {
    generateInadimplenciaPdf({
      motoContracts,
      kitnetContracts,
      motos,
      kitnets,
      motoTenants,
      kitnetTenants,
      settings,
    });
  };

  const handlePdfRentabilidade = () => {
    generateProfitabilityPdf({
      motos,
      motoContracts,
      kitnets,
      kitnetContracts,
      expenses,
      settings,
    });
  };

  const handlePdfExecutiveDRE = () => {
    generateExecutiveDREPdf({
      motos,
      kitnets,
      motoContracts,
      kitnetContracts,
      expenses,
      settings,
    });
  };

  const handlePdfCurrentTab = () => {
    if (activeReportTab === 'receitas') {
      handlePdfReceitas();
    } else if (activeReportTab === 'inadimplencia') {
      handlePdfInadimplencia();
    } else if (activeReportTab === 'rentabilidade') {
      handlePdfRentabilidade();
    } else {
      handlePdfExecutiveDRE();
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const [currentYearStr, currentMonthStr] = selectedMonth.split('-');
  const displayMonthLabel = `${monthNames[parseInt(currentMonthStr, 10) - 1]} / ${currentYearStr}`;

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Top Header Card */}
      <div className="bg-[#141418] border border-white/[0.08] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[#10B981] shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F7] tracking-tight">
              Relatórios & Auditoria
            </h1>
            <p className="text-xs text-[#9A9AA2] mt-0.5">
              Auditoria de faturamento, fluxo de caixa, inadimplência e exportações em PDF e Excel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExecutiveModalOpen(true)}
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F5F7] border border-white/[0.1] text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            Ver DRE Executivo
          </button>
          <button
            type="button"
            onClick={handlePdfCurrentTab}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Baixar Relatório PDF
          </button>
        </div>
      </div>


      {/* KPI Stats Bar for Selected Month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Receita Prevista */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9AA2] font-medium">Receita Prevista ({displayMonthLabel})</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-[#10B981] font-mono">
              {formatCurrency(auditMonthData.receitaPrevista)}
            </div>
            <div className="text-[11px] text-[#9A9AA2] mt-1 flex items-center gap-1.5">
              <span>{auditMonthData.totalParcelas} cobranças programadas</span>
            </div>
          </div>
        </div>

        {/* Card 2: Receita Efetivada */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9AA2] font-medium">Recebido Efetivamente</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-[#38BDF8] font-mono">
              {formatCurrency(auditMonthData.receitaRecebida)}
            </div>
            <div className="text-[11px] text-[#9A9AA2] mt-1">
              A receber: <strong className="text-slate-200">{formatCurrency(auditMonthData.receitaPendente)}</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Inadimplência Total */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9AA2] font-medium">Inadimplência em Aberto</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-lg sm:text-2xl font-bold font-mono ${inadimplenciaGeral.montanteTotal > 0 ? 'text-[#EF4444]' : 'text-emerald-400'}`}>
              {formatCurrency(inadimplenciaGeral.montanteTotal)}
            </div>
            <div className="text-[11px] text-[#9A9AA2] mt-1">
              {inadimplenciaGeral.devedores.length === 0 ? (
                <span className="text-emerald-400 font-medium">Zero pendências</span>
              ) : (
                <span className="text-red-400 font-medium">{inadimplenciaGeral.devedores.length} parcelas atrasadas</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Despesas & Contas */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9AA2] font-medium">Despesas ({displayMonthLabel})</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-bold text-amber-300 font-mono">
              {formatCurrency(auditMonthData.totalDespesas)}
            </div>
            <div className="text-[11px] text-[#9A9AA2] mt-1">
              {auditMonthData.monthExpenses.length} contas cadastradas
            </div>
          </div>
        </div>
      </div>

      {/* Main Reports Hub with Selector & Live Preview */}
      <div className="bg-[#141418] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        {/* Tab Navigation & Controls Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/[0.06] overflow-x-auto w-full xl:w-auto scrollbar-none flex-nowrap shrink-0 touch-pan-x [-webkit-overflow-scrolling:touch]">
            <button
              type="button"
              onClick={() => setActiveReportTab('receitas')}
              className={`shrink-0 min-w-max px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 select-none ${
                activeReportTab === 'receitas'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[#9A9AA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>Receitas Mensais</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('inadimplencia')}
              className={`shrink-0 min-w-max px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 select-none ${
                activeReportTab === 'inadimplencia'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-[#9A9AA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Inadimplência</span>
              {inadimplenciaGeral.devedores.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono shrink-0">
                  {inadimplenciaGeral.devedores.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('rentabilidade')}
              className={`shrink-0 min-w-max px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 select-none ${
                activeReportTab === 'rentabilidade'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-[#9A9AA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Rentabilidade & ROI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('despesas')}
              className={`shrink-0 min-w-max px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 select-none ${
                activeReportTab === 'despesas'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-[#9A9AA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 shrink-0" />
              <span>Despesas & Contas</span>
            </button>
          </div>

          {/* Right-aligned Date Filter & Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end shrink-0 w-full xl:w-auto">
            {/* Date filter on the right */}
            {(activeReportTab === 'receitas' || activeReportTab === 'despesas') && (
              <div className="flex items-center gap-2 bg-[#101012] hover:bg-[#18181C] px-3 py-1.5 rounded-xl border border-white/[0.1] text-xs transition-colors shrink-0 shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-[#9A9AA2] font-medium hidden sm:inline">Mês:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs text-[#F5F5F7] font-semibold focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Action Buttons for current tab */}
            <div className="flex items-center gap-2 shrink-0">
              {activeReportTab === 'receitas' && (
                <>
                  <button
                    type="button"
                    onClick={handlePdfReceitas}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-900/20 active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportReceitas}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </>
              )}

              {activeReportTab === 'inadimplencia' && (
                <>
                  <button
                    type="button"
                    onClick={handlePdfInadimplencia}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-900/20 active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportInadimplencia}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </>
              )}

              {activeReportTab === 'rentabilidade' && (
                <>
                  <button
                    type="button"
                    onClick={handlePdfRentabilidade}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-900/20 active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportRentabilidade}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-purple-400 border border-purple-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </>
              )}

              {activeReportTab === 'despesas' && (
                <>
                  <button
                    type="button"
                    onClick={handleExportDespesas}
                    className="shrink-0 min-w-max px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV Despesas</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Content Section */}
        <div className="p-4 sm:p-6">
          {/* 1. Tab Receitas */}
          {activeReportTab === 'receitas' && (
            <div className="space-y-4">
              {/* Sub-header with icons & context */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9A9AA2] pb-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                  <span>Parcelas auditadas para <strong className="text-white">{displayMonthLabel}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px]">
                    Total: <strong className="text-white font-mono">{auditMonthData.allCobancas.length}</strong> cobranças
                  </span>
                </div>
              </div>

              {auditMonthData.allCobancas.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#9A9AA2] bg-white/[0.02] rounded-xl border border-white/[0.05] flex flex-col items-center justify-center gap-2">
                  <Layers className="w-8 h-8 text-[#9A9AA2]/50" />
                  <span>Nenhuma parcela ou cobrança encontrada para a competência selecionada.</span>
                </div>
              ) : (
                <>
                  {/* Mobile Compact Cards View */}
                  <div className="grid grid-cols-1 gap-2.5 sm:hidden">
                    {auditMonthData.allCobancas.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[#101012] border border-white/[0.08] rounded-xl space-y-2.5 hover:border-white/[0.15] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                item.tipo === 'Moto'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {item.tipo === 'Moto' ? <Motorbike className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                              <span className="uppercase font-mono">{item.tipo}</span>
                            </span>
                            <span className="font-semibold text-xs text-[#F5F5F7] truncate">{item.ativo}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0 bg-white/[0.04] px-2 py-0.5 rounded">
                            {item.parcela}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#9A9AA2] pt-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.cliente}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(item.vencimento)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            {formatCurrency(item.valor)}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              item.status === 'pago'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : item.status === 'atrasado'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.status === 'pago' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : item.status === 'atrasado' ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{item.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Full Table View */}
                  <div className="hidden sm:block border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#F5F5F7]">
                        <thead className="bg-[#18181C] text-[#9A9AA2] text-[10px] uppercase tracking-wider border-b border-white/[0.08]">
                          <tr>
                            <th className="py-3 px-4">Segmento</th>
                            <th className="py-3 px-4">Ativo</th>
                            <th className="py-3 px-4">Locatário</th>
                            <th className="py-3 px-4">Parcela</th>
                            <th className="py-3 px-4">Vencimento</th>
                            <th className="py-3 px-4 text-right">Valor</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {auditMonthData.allCobancas.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 font-medium">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider ${
                                    item.tipo === 'Moto'
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                  }`}
                                >
                                  {item.tipo === 'Moto' ? <Motorbike className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                                  {item.tipo}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-white">{item.ativo}</td>
                              <td className="py-3 px-4 text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-[#9A9AA2]" />
                                  <span>{item.cliente}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">{item.parcela}</td>
                              <td className="py-3 px-4 font-mono">{formatDate(item.vencimento)}</td>
                              <td className="py-3 px-4 font-mono font-bold text-right text-emerald-400">
                                {formatCurrency(item.valor)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    item.status === 'pago'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : item.status === 'atrasado'
                                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {item.status === 'pago' ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : item.status === 'atrasado' ? (
                                    <AlertTriangle className="w-3 h-3" />
                                  ) : (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  <span>{item.status}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2. Tab Inadimplência */}
          {activeReportTab === 'inadimplencia' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9A9AA2] pb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Cobranças atualmente com pagamento em atraso</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs">
                    Montante total: <strong className="text-red-400 font-mono font-bold">{formatCurrency(inadimplenciaGeral.montanteTotal)}</strong>
                  </span>
                </div>
              </div>

              {inadimplenciaGeral.devedores.length === 0 ? (
                <div className="text-center py-12 text-xs text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/20 flex flex-col items-center justify-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <span className="font-bold">Nenhum devedor em atraso no momento!</span>
                  <p className="text-xs text-slate-400">Todas as cobranças estão quitadas ou em dia dentro do prazo de vencimento.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="grid grid-cols-1 gap-2.5 sm:hidden">
                    {inadimplenciaGeral.devedores.map((dev) => (
                      <div
                        key={dev.id}
                        className="p-3.5 bg-[#101012] border border-red-500/20 rounded-xl space-y-2.5 hover:border-red-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                dev.tipo === 'Moto'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {dev.tipo === 'Moto' ? <Motorbike className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                              <span className="uppercase font-mono">{dev.tipo}</span>
                            </span>
                            <span className="font-semibold text-xs text-[#F5F5F7] truncate">{dev.ativo}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 shrink-0 font-mono">
                            {dev.diasAtraso}d atraso
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dev.cliente}</span>
                          </div>
                          {dev.contato && (
                            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3" />
                              <span>{dev.contato}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                          <div className="flex items-center gap-1 text-[#9A9AA2] font-mono text-[11px]">
                            <span>Venc:</span>
                            <strong className="text-red-400">{formatDate(dev.vencimento)}</strong>
                          </div>
                          <span className="font-mono font-bold text-sm text-red-400">
                            {formatCurrency(dev.valor)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#F5F5F7]">
                        <thead className="bg-[#18181C] text-[#9A9AA2] text-[10px] uppercase tracking-wider border-b border-white/[0.08]">
                          <tr>
                            <th className="py-3 px-4">Segmento</th>
                            <th className="py-3 px-4">Locatário / Contato</th>
                            <th className="py-3 px-4">Ativo</th>
                            <th className="py-3 px-4">Parcela</th>
                            <th className="py-3 px-4">Vencimento</th>
                            <th className="py-3 px-4 text-center">Mora</th>
                            <th className="py-3 px-4 text-right">Valor em Atraso</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {inadimplenciaGeral.devedores.map((dev) => (
                            <tr key={dev.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 font-medium">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider ${
                                    dev.tipo === 'Moto'
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                  }`}
                                >
                                  {dev.tipo === 'Moto' ? <Motorbike className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                                  {dev.tipo}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{dev.cliente}</span>
                                </div>
                                {dev.contato && (
                                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                                    <Phone className="w-3 h-3" />
                                    {dev.contato}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium">{dev.ativo}</td>
                              <td className="py-3 px-4 font-mono text-slate-300">{dev.parcela}</td>
                              <td className="py-3 px-4 font-mono text-red-400">{formatDate(dev.vencimento)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                  {dev.diasAtraso} {dev.diasAtraso === 1 ? 'dia' : 'dias'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-right text-red-400">
                                {formatCurrency(dev.valor)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. Tab Rentabilidade */}
          {activeReportTab === 'rentabilidade' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9A9AA2] pb-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Demonstrativo consolidado de retorno financeiro e custos por ativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px]">
                    Total de ativos: <strong className="text-white font-mono">{rentabilidadeAtivos.length}</strong>
                  </span>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-2.5 sm:hidden">
                {rentabilidadeAtivos.map((ativo) => (
                  <div
                    key={ativo.id}
                    className="p-3.5 bg-[#101012] border border-white/[0.08] rounded-xl space-y-2.5 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            ativo.tipo === 'Moto'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {ativo.tipo === 'Moto' ? <Motorbike className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                          <span className="uppercase font-mono">{ativo.tipo}</span>
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-xs text-white truncate">{ativo.nome}</p>
                          <p className="text-[10px] text-[#9A9AA2] font-mono">{ativo.identificador}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          ativo.roi === 'N/A'
                            ? 'bg-white/10 text-slate-300'
                            : Number(ativo.roi) >= 0
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ativo.roi === 'N/A' ? 'Imóvel' : `${ativo.roi}% ROI`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#9A9AA2] pt-1">
                      <div>
                        <span>Receita Paga:</span>
                        <p className="font-bold text-emerald-400 font-mono">{formatCurrency(ativo.receita)}</p>
                      </div>
                      <div>
                        <span>Custos Op.:</span>
                        <p className="font-bold text-amber-300 font-mono">{ativo.custos > 0 ? formatCurrency(ativo.custos) : 'R$ 0,00'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                      <span className="text-[#9A9AA2]">Resultado Líquido:</span>
                      <span className={`font-mono font-bold ${ativo.lucro >= 0 ? 'text-white' : 'text-red-400'}`}>
                        {formatCurrency(ativo.lucro)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#F5F5F7]">
                    <thead className="bg-[#18181C] text-[#9A9AA2] text-[10px] uppercase tracking-wider border-b border-white/[0.08]">
                      <tr>
                        <th className="py-3 px-4">Segmento / Ativo</th>
                        <th className="py-3 px-4 text-right">Aquisição / Custo</th>
                        <th className="py-3 px-4 text-right">Receita Total Paga</th>
                        <th className="py-3 px-4 text-right">Manutenção Deduzida</th>
                        <th className="py-3 px-4 text-right">Resultado Líquido</th>
                        <th className="py-3 px-4 text-center">Retorno (ROI)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {rentabilidadeAtivos.map((ativo) => (
                        <tr key={ativo.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  ativo.tipo === 'Moto'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                }`}
                              >
                                {ativo.tipo === 'Moto' ? <Motorbike className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                                {ativo.tipo}
                              </span>
                              <span>{ativo.nome}</span>
                            </div>
                            <div className="text-[11px] text-[#9A9AA2] font-mono ml-6">{ativo.identificador}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-right text-slate-300">
                            {ativo.investimento > 0 ? formatCurrency(ativo.investimento) : '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-right text-emerald-400 font-medium">
                            {formatCurrency(ativo.receita)}
                          </td>
                          <td className="py-3 px-4 font-mono text-right text-amber-300">
                            {ativo.custos > 0 ? formatCurrency(ativo.custos) : 'R$ 0,00'}
                          </td>
                          <td className={`py-3 px-4 font-mono text-right font-bold ${ativo.lucro >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {formatCurrency(ativo.lucro)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ativo.roi === 'N/A'
                                  ? 'bg-white/10 text-slate-300'
                                  : Number(ativo.roi) >= 0
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {ativo.roi === 'N/A' ? 'Imóvel' : `${ativo.roi}%`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. Tab Despesas */}
          {activeReportTab === 'despesas' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9A9AA2] pb-1">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-300" />
                  <span>Despesas e contas cadastradas para <strong className="text-white">{displayMonthLabel}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                    Total: <strong className="text-amber-300 font-mono font-bold">{formatCurrency(auditMonthData.totalDespesas)}</strong>
                  </span>
                </div>
              </div>

              {auditMonthData.monthExpenses.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#9A9AA2] bg-white/[0.02] rounded-xl border border-white/[0.05] flex flex-col items-center justify-center gap-2">
                  <Receipt className="w-8 h-8 text-[#9A9AA2]/50" />
                  <span>Nenhuma conta ou despesa lançada para o mês selecionado.</span>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className="grid grid-cols-1 gap-2.5 sm:hidden">
                    {auditMonthData.monthExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3.5 bg-[#101012] border border-white/[0.08] rounded-xl space-y-2.5 hover:border-amber-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-white truncate">{exp.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              exp.status === 'pago'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {exp.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#9A9AA2]">
                          <span className="uppercase tracking-wider font-mono">{exp.category}</span>
                          <div className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(exp.dueDate)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <span className="text-[11px] text-slate-400 uppercase font-mono">{exp.targetType}</span>
                          <span className="font-mono font-bold text-sm text-amber-300">
                            {formatCurrency(exp.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#F5F5F7]">
                        <thead className="bg-[#18181C] text-[#9A9AA2] text-[10px] uppercase tracking-wider border-b border-white/[0.08]">
                          <tr>
                            <th className="py-3 px-4">Descrição</th>
                            <th className="py-3 px-4">Categoria</th>
                            <th className="py-3 px-4">Destino</th>
                            <th className="py-3 px-4">Vencimento</th>
                            <th className="py-3 px-4 text-right">Valor</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                          {auditMonthData.monthExpenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 font-medium text-white">{exp.title}</td>
                              <td className="py-3 px-4 text-[#9A9AA2] uppercase text-[10px] tracking-wider">{exp.category}</td>
                              <td className="py-3 px-4 text-slate-300 uppercase text-[10px]">{exp.targetType}</td>
                              <td className="py-3 px-4 font-mono">{formatDate(exp.dueDate)}</td>
                              <td className="py-3 px-4 font-mono font-bold text-right text-amber-300">
                                {formatCurrency(exp.amount)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    exp.status === 'pago'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {exp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Executivo */}
      <ReportExportModal
        isOpen={isExecutiveModalOpen}
        onClose={() => setIsExecutiveModalOpen(false)}
      />
    </div>
  );
};
