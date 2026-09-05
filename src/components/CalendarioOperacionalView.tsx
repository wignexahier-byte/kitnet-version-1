import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Motorbike,
  Home,
  Shield,
  FileText,
  DollarSign,
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTodayLocalDateString, isInstallmentOverdue } from '../utils/formatters';
import { safeAdd, safeSub, roundCurrency } from '../utils/financialMath';

export interface OperationalEvent {
  id: string;
  date: string;
  type: 'parcela_moto' | 'aluguel_kitnet' | 'contrato_vencendo' | 'cnh_vencendo' | 'conta_pagar';
  title: string;
  subtitle: string;
  amount?: number;
  status: 'pago' | 'pendente' | 'atrasado' | 'aviso';
  phone?: string;
  contractId?: string;
}

export interface EventVisualConfig {
  icon: React.ComponentType<{ className?: string }>;
  colorText: string;
  dotColor: string;
  borderBadge: string;
  bgBadge: string;
  glowColor: string;
  label: string;
}

/**
 * Configuração visual centralizada e consistente para cada tipo de evento operacional.
 */
export function getEventVisualConfig(ev: OperationalEvent): EventVisualConfig {
  switch (ev.type) {
    case 'parcela_moto':
      return {
        icon: Motorbike,
        colorText: 'text-[#E07A3F]',
        dotColor: 'bg-[#E07A3F]',
        borderBadge: 'border-[#E07A3F]/35',
        bgBadge: 'bg-[#E07A3F]/10',
        glowColor: 'shadow-[#E07A3F]/20',
        label: 'Parcela Moto',
      };
    case 'aluguel_kitnet':
      return {
        icon: Home,
        colorText: 'text-[#0EA5E9]',
        dotColor: 'bg-[#0EA5E9]',
        borderBadge: 'border-[#0EA5E9]/35',
        bgBadge: 'bg-[#0EA5E9]/10',
        glowColor: 'shadow-[#0EA5E9]/20',
        label: 'Aluguel Kitnet',
      };
    case 'contrato_vencendo':
      return {
        icon: FileText,
        colorText: 'text-[#8B5CF6]',
        dotColor: 'bg-[#8B5CF6]',
        borderBadge: 'border-[#8B5CF6]/35',
        bgBadge: 'bg-[#8B5CF6]/10',
        glowColor: 'shadow-[#8B5CF6]/20',
        label: 'Término de Contrato',
      };
    case 'cnh_vencendo':
      return {
        icon: Shield,
        colorText: 'text-amber-400',
        dotColor: 'bg-amber-400',
        borderBadge: 'border-amber-500/35',
        bgBadge: 'bg-amber-500/10',
        glowColor: 'shadow-amber-500/20',
        label: 'Validade CNH',
      };
    case 'conta_pagar':
      if (ev.status === 'pago') {
        return {
          icon: DollarSign,
          colorText: 'text-[#10B981]',
          dotColor: 'bg-[#10B981]',
          borderBadge: 'border-[#10B981]/35',
          bgBadge: 'bg-[#10B981]/10',
          glowColor: 'shadow-[#10B981]/20',
          label: 'Conta Paga',
        };
      }
      if (ev.status === 'atrasado') {
        return {
          icon: DollarSign,
          colorText: 'text-[#EF4444]',
          dotColor: 'bg-[#EF4444]',
          borderBadge: 'border-[#EF4444]/35',
          bgBadge: 'bg-[#EF4444]/10',
          glowColor: 'shadow-[#EF4444]/20',
          label: 'Conta Atrasada',
        };
      }
      return {
        icon: DollarSign,
        colorText: 'text-[#94A3B8]',
        dotColor: 'bg-[#94A3B8]',
        borderBadge: 'border-white/10',
        bgBadge: 'bg-white/[0.04]',
        glowColor: 'shadow-white/5',
        label: 'Conta a Pagar',
      };
    default:
      return {
        icon: FileText,
        colorText: 'text-[#8B5CF6]',
        dotColor: 'bg-[#8B5CF6]',
        borderBadge: 'border-[#8B5CF6]/35',
        bgBadge: 'bg-[#8B5CF6]/10',
        glowColor: 'shadow-[#8B5CF6]/20',
        label: 'Compromisso',
      };
  }
}

interface CalendarioOperacionalViewProps {
  onOpenWhatsApp?: (contractId: string) => void;
}

export const CalendarioOperacionalView: React.FC<CalendarioOperacionalViewProps> = ({
  onOpenWhatsApp,
}) => {
  const { motos, kitnets, motoContracts, kitnetContracts, motoTenants, kitnetTenants, expenses } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'mensal' | 'lista'>('mensal');
  const [selectedEventType, setSelectedEventType] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<string>(getTodayLocalDateString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compila todos os Eventos Operacionais (Mensais e Semanais)
  const events: OperationalEvent[] = useMemo(() => {
    const list: OperationalEvent[] = [];
    const today = getTodayLocalDateString();

    // 1. Parcelas de Motos (Mensais e Semanais)
    motoContracts.forEach((contract) => {
      const moto = motos.find((m) => m.id === contract.motoId);
      const tenant = motoTenants.find((t) => t.id === contract.tenantId);
      const isWeekly = contract.paymentFrequency === 'semanal';
      const totalCount = contract.installments?.length || contract.durationMonths;

      contract.installments.forEach((inst) => {
        const total = inst.totalInstallments || totalCount;
        list.push({
          id: `inst-m-${contract.id}-${inst.id}`,
          date: inst.dueDate,
          type: 'parcela_moto',
          title: `Moto: ${tenant?.fullName || 'Locatário'} (${inst.number}/${total})`,
          subtitle: moto
            ? `${moto.brand} ${moto.model} [${moto.plate}] • ${isWeekly ? 'Semanal' : 'Mensal'}`
            : `Motocicleta • ${isWeekly ? 'Semanal' : 'Mensal'}`,
          amount: inst.amount,
          status: inst.status === 'pago' ? 'pago' : isInstallmentOverdue(inst) ? 'atrasado' : 'pendente',
          phone: tenant?.whatsapp || tenant?.phone,
          contractId: contract.id,
        });
      });

      // Contrato vencendo
      const lastInst = contract.installments[contract.installments.length - 1];
      if (lastInst) {
        list.push({
          id: `end-m-${contract.id}`,
          date: lastInst.dueDate,
          type: 'contrato_vencendo',
          title: `Término de Contrato (Moto) — ${tenant?.fullName || 'Locatário'}`,
          subtitle: `Transferência de DUT/CRLV prevista para ${moto?.model || 'veículo'}`,
          status: 'aviso',
          phone: tenant?.whatsapp || tenant?.phone,
          contractId: contract.id,
        });
      }
    });

    // 2. Aluguéis de Kitnets
    kitnetContracts.forEach((contract) => {
      const kitnet = kitnets.find((k) => k.id === contract.kitnetId);
      const tenant = kitnetTenants.find((t) => t.id === contract.tenantId);
      const totalCount = contract.installments?.length || contract.durationMonths;

      contract.installments.forEach((inst) => {
        const total = inst.totalInstallments || totalCount;
        list.push({
          id: `inst-k-${contract.id}-${inst.id}`,
          date: inst.dueDate,
          type: 'aluguel_kitnet',
          title: `Kitnet: ${tenant?.fullName || 'Locatário'} (${inst.number}/${total})`,
          subtitle: kitnet ? `${kitnet.name} - Nº ${kitnet.number}` : 'Kitnet',
          amount: inst.amount,
          status: inst.status === 'pago' ? 'pago' : isInstallmentOverdue(inst) ? 'atrasado' : 'pendente',
          phone: tenant?.whatsapp || tenant?.phone,
          contractId: contract.id,
        });
      });

      // Contrato vencendo
      const lastInst = contract.installments[contract.installments.length - 1];
      if (lastInst) {
        list.push({
          id: `end-k-${contract.id}`,
          date: lastInst.dueDate,
          type: 'contrato_vencendo',
          title: `Renovação de Contrato (Kitnet) — ${tenant?.fullName || 'Locatário'}`,
          subtitle: kitnet ? `Kitnet ${kitnet.number}` : 'Imóvel',
          status: 'aviso',
          phone: tenant?.whatsapp || tenant?.phone,
          contractId: contract.id,
        });
      }
    });

    // 3. CNHs Vencendo (somente para locatários com contratos ativos de moto)
    const activeMotoTenantIds = new Set(
      motoContracts.filter((c) => c.status === 'ativo').map((c) => c.tenantId)
    );

    motoTenants.forEach((tenant) => {
      if (activeMotoTenantIds.has(tenant.id) && tenant.cnh?.expirationDate) {
        list.push({
          id: `cnh-${tenant.id}`,
          date: tenant.cnh.expirationDate,
          type: 'cnh_vencendo',
          title: `Validade de CNH: ${tenant.fullName}`,
          subtitle: `CNH Cat. ${tenant.cnh.category} vence nesta data`,
          status: 'aviso',
          phone: tenant.whatsapp || tenant.phone,
        });
      }
    });

    // 4. Contas a Pagar (Despesas) com reflexo fiel do status (pago, atrasado ou pendente)
    expenses.forEach((expense) => {
      const expDate = expense.dueDate || expense.date || expense.paidDate || '';
      if (!expDate) return;
      const isOverdue = expense.status === 'atrasado' || (expense.status === 'pendente' && expDate < today);
      const effectiveStatus = expense.status === 'pago' ? 'pago' : isOverdue ? 'atrasado' : 'pendente';
      list.push({
        id: `exp-${expense.id}`,
        date: expDate,
        type: 'conta_pagar',
        title: `Conta: ${expense.title}`,
        subtitle: `Categoria: ${expense.category.toUpperCase()} (${expense.targetType})`,
        amount: expense.amount,
        status: effectiveStatus,
      });
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [motos, kitnets, motoContracts, kitnetContracts, motoTenants, kitnetTenants, expenses]);

  // Contagens para os filtros
  const eventCounts = useMemo(() => {
    return {
      todos: events.length,
      parcela_moto: events.filter((e) => e.type === 'parcela_moto').length,
      aluguel_kitnet: events.filter((e) => e.type === 'aluguel_kitnet').length,
      conta_pagar: events.filter((e) => e.type === 'conta_pagar').length,
      contrato_vencendo: events.filter((e) => e.type === 'contrato_vencendo').length,
      cnh_vencendo: events.filter((e) => e.type === 'cnh_vencendo').length,
    };
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (selectedEventType === 'todos') return events;
    return events.filter((e) => e.type === selectedEventType);
  }, [events, selectedEventType]);

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(getTodayLocalDateString());
  };

  const selectedDayEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDay);
  }, [filteredEvents, selectedDay]);

  // Métricas financeiras e operacionais auditadas do mês visível
  const monthMetrics = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const thisMonthEvents = events.filter((e) => e.date.startsWith(monthPrefix));

    // Cobranças do mês (Motos e Kitnets)
    const receitasDoMes = thisMonthEvents.filter(
      (e) => (e.type === 'parcela_moto' || e.type === 'aluguel_kitnet') && e.amount
    );

    let totalPrevisto = 0;
    let totalJaRecebido = 0;
    let totalAReceber = 0;
    let parcelasMotos = 0;
    let parcelasKitnets = 0;

    receitasDoMes.forEach((e) => {
      const valor = e.amount || 0;
      totalPrevisto = safeAdd(totalPrevisto, valor);
      if (e.type === 'parcela_moto') {
        parcelasMotos = safeAdd(parcelasMotos, valor);
      } else if (e.type === 'aluguel_kitnet') {
        parcelasKitnets = safeAdd(parcelasKitnets, valor);
      }

      if (e.status === 'pago') {
        totalJaRecebido = safeAdd(totalJaRecebido, valor);
      } else {
        totalAReceber = safeAdd(totalAReceber, valor);
      }
    });

    // Despesas e Contas do mês
    const despesasDoMes = thisMonthEvents.filter((e) => e.type === 'conta_pagar' && e.amount);
    let totalDespesas = 0;
    let totalDespesasPagas = 0;
    let totalDespesasPendentes = 0;

    despesasDoMes.forEach((e) => {
      const valor = e.amount || 0;
      totalDespesas = safeAdd(totalDespesas, valor);
      if (e.status === 'pago') {
        totalDespesasPagas = safeAdd(totalDespesasPagas, valor);
      } else {
        totalDespesasPendentes = safeAdd(totalDespesasPendentes, valor);
      }
    });

    // Balanço líquido projetado do mês
    const saldoOperacional = safeSub(totalPrevisto, totalDespesas);

    // Contadores de status de cobranças
    const totalAtrasados = thisMonthEvents.filter((e) => e.status === 'atrasado').length;
    const totalPendentes = thisMonthEvents.filter((e) => e.status === 'pendente').length;
    const totalPagos = thisMonthEvents.filter((e) => e.status === 'pago').length;

    return {
      count: thisMonthEvents.length,
      totalPrevisto,
      totalJaRecebido,
      totalAReceber,
      parcelasMotos,
      parcelasKitnets,
      totalDespesas,
      totalDespesasPagas,
      totalDespesasPendentes,
      saldoOperacional,
      totalAtrasados,
      totalPendentes,
      totalPagos,
      totalCobancasCount: receitasDoMes.length,
      totalContasCount: despesasDoMes.length,
    };
  }, [events, year, month]);

  const filterOptions = [
    {
      id: 'todos',
      label: 'Todos os Eventos',
      count: eventCounts.todos,
      activeBg: 'bg-[#8B5CF6]',
      activeText: 'text-white',
      activeShadow: 'shadow-[#8B5CF6]/30',
      badgeActive: 'bg-white/20 text-white',
      icon: Sparkles,
    },
    {
      id: 'parcela_moto',
      label: 'Parcelas Motos',
      count: eventCounts.parcela_moto,
      activeBg: 'bg-[#E07A3F]',
      activeText: 'text-white',
      activeShadow: 'shadow-[#E07A3F]/30',
      badgeActive: 'bg-black/25 text-white',
      icon: Motorbike,
    },
    {
      id: 'aluguel_kitnet',
      label: 'Aluguéis Kitnets',
      count: eventCounts.aluguel_kitnet,
      activeBg: 'bg-[#0EA5E9]',
      activeText: 'text-white',
      activeShadow: 'shadow-[#0EA5E9]/30',
      badgeActive: 'bg-black/25 text-white',
      icon: Home,
    },
    {
      id: 'conta_pagar',
      label: 'Contas a Pagar',
      count: eventCounts.conta_pagar,
      activeBg: 'bg-[#10B981]',
      activeText: 'text-white',
      activeShadow: 'shadow-[#10B981]/30',
      badgeActive: 'bg-black/25 text-white',
      icon: DollarSign,
    },
    {
      id: 'contrato_vencendo',
      label: 'Contratos Vencendo',
      count: eventCounts.contrato_vencendo,
      activeBg: 'bg-[#8B5CF6]',
      activeText: 'text-white',
      activeShadow: 'shadow-[#8B5CF6]/30',
      badgeActive: 'bg-white/20 text-white',
      icon: FileText,
    },
    {
      id: 'cnh_vencendo',
      label: 'CNHs Vencendo',
      count: eventCounts.cnh_vencendo,
      activeBg: 'bg-amber-500',
      activeText: 'text-white',
      activeShadow: 'shadow-amber-500/30',
      badgeActive: 'bg-black/25 text-white',
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn font-sans pb-10">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#161924] to-[#10131C] p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] shadow-lg shadow-[#8B5CF6]/10 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Calendário Operacional
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/25">
                  <Clock className="w-2.5 h-2.5" /> Tempo Real
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-xl">
                Vencimentos de parcelas (semanais/mensais), aluguéis, CNHs, termos de contrato e despesas fixas.
              </p>
            </div>
          </div>

          {/* View Switcher Segmented Control & Hoje Action */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Segmented Control with animated sliding pill */}
            <div className="relative flex items-center p-1 rounded-xl bg-[#0B0D14] border border-white/[0.08] shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('mensal')}
                className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  viewMode === 'mensal' ? 'text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Visão Mensal</span>
                {viewMode === 'mensal' && (
                  <motion.div
                    layoutId="activeViewTab"
                    className="absolute inset-0 bg-[#8B5CF6] rounded-lg -z-10 shadow-md shadow-[#8B5CF6]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                  viewMode === 'lista' ? 'text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lista Cronológica</span>
                {viewMode === 'lista' && (
                  <motion.div
                    layoutId="activeViewTab"
                    className="absolute inset-0 bg-[#8B5CF6] rounded-lg -z-10 shadow-md shadow-[#8B5CF6]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Quick Action: "Hoje" */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleToday}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-[#F8FAFC] text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Ir para o dia de hoje"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hoje</span>
            </motion.button>
          </div>
        </div>

        {/* Mini stats summary bar auditada */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-white/[0.025] p-2.5 rounded-xl border border-white/[0.05]">
            <span className="text-[#94A3B8] text-[11px] block">Mês Selecionado</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <strong className="text-white font-semibold text-xs sm:text-sm">{monthNames[month]} / {year}</strong>
              {month === new Date().getMonth() && year === new Date().getFullYear() && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Mês Atual" />
              )}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {monthMetrics.count} {monthMetrics.count === 1 ? 'evento' : 'eventos'} no mês
            </span>
          </div>

          <div className="bg-white/[0.025] p-2.5 rounded-xl border border-white/[0.05]">
            <span className="text-[#94A3B8] text-[11px] block">Receita Prevista</span>
            <strong className="text-[#10B981] font-mono text-xs sm:text-sm block mt-0.5">
              {formatCurrency(monthMetrics.totalPrevisto)}
            </strong>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5 truncate">
              {monthMetrics.totalJaRecebido > 0 ? `Recebido: ${formatCurrency(monthMetrics.totalJaRecebido)}` : `${monthMetrics.totalCobancasCount} cobranças`}
            </span>
          </div>

          <div className="bg-white/[0.025] p-2.5 rounded-xl border border-white/[0.05]">
            <span className="text-[#94A3B8] text-[11px] block">Saldo a Receber</span>
            <strong className="text-[#38BDF8] font-mono text-xs sm:text-sm block mt-0.5">
              {formatCurrency(monthMetrics.totalAReceber)}
            </strong>
            <span className="text-[10px] text-sky-400/80 block mt-0.5">
              {monthMetrics.totalAReceber === 0 ? '100% liquidado' : `${monthMetrics.totalPendentes} pendentes`}
            </span>
          </div>

          <div className="bg-white/[0.025] p-2.5 rounded-xl border border-white/[0.05]">
            <span className="text-[#94A3B8] text-[11px] block">Contas & Despesas</span>
            <strong className="text-amber-300 font-mono text-xs sm:text-sm block mt-0.5">
              {formatCurrency(monthMetrics.totalDespesas)}
            </strong>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">
              {monthMetrics.totalContasCount} {monthMetrics.totalContasCount === 1 ? 'conta programada' : 'contas programadas'}
            </span>
          </div>

          <div className="bg-white/[0.025] p-2.5 rounded-xl border border-white/[0.05] col-span-2 lg:col-span-1">
            <span className="text-[#94A3B8] text-[11px] block">Resultado Operacional</span>
            <strong className={`font-mono text-xs sm:text-sm block mt-0.5 ${monthMetrics.saldoOperacional >= 0 ? 'text-white' : 'text-[#EF4444]'}`}>
              {formatCurrency(monthMetrics.saldoOperacional)}
            </strong>
            <span className="text-[10px] block mt-0.5">
              {monthMetrics.totalAtrasados > 0 ? (
                <span className="text-[#EF4444] font-bold">⚠️ {monthMetrics.totalAtrasados} em atraso</span>
              ) : (
                <span className="text-emerald-400 font-medium">✓ Em dia</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Chips Carousel with NO SCROLLBAR and animated touch UX */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 scroll-smooth select-none [-webkit-overflow-scrolling:touch]">
          {filterOptions.map((f) => {
            const isSelected = selectedEventType === f.id;
            const Icon = f.icon;

            return (
              <motion.button
                key={f.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedEventType(f.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? `${f.activeBg} ${f.activeText} ${f.activeShadow} border-transparent font-semibold shadow-md`
                    : 'bg-[#12151F] border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161B28] hover:border-white/[0.14]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-current' : 'text-slate-400'}`} />
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums min-w-[20px] text-center ${
                    isSelected ? f.badgeActive : 'bg-white/[0.06] text-[#94A3B8]'
                  }`}
                >
                  {f.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Monthly Grid vs Chronological List */}
      <AnimatePresence mode="wait">
        {viewMode === 'mensal' ? (
          <motion.div
            key="view-mensal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Month Grid (2 Columns on Large Screens) */}
            <div className="lg:col-span-2 bg-[#12151F] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
              <div>
                {/* Month Navigation Bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {monthNames[month]} <span className="text-[#8B5CF6] font-mono">{year}</span>
                    </h2>
                    {month === new Date().getMonth() && year === new Date().getFullYear() && (
                      <span className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#A78BFA] text-[10px] font-bold border border-[#8B5CF6]/30">
                        Mês Atual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0D14] border border-white/[0.08]">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                      title="Mês Anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    <button
                      onClick={handleToday}
                      className="px-2.5 py-1 text-[11px] font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                    >
                      Hoje
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                      title="Próximo Mês"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-[#64748B] py-2 border-b border-white/[0.06] mb-2">
                  <span>Dom</span>
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sáb</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty leading days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[72px] sm:min-h-[92px] p-1.5 rounded-xl bg-white/[0.015] border border-white/[0.02] opacity-30"
                    />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isSelected = selectedDay === formattedDayStr;
                    const isToday = formattedDayStr === getTodayLocalDateString();

                    const dayEvents = filteredEvents.filter((e) => e.date === formattedDayStr);

                    return (
                      <motion.div
                        key={`day-${dayNum}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedDay(formattedDayStr)}
                        className={`min-h-[72px] sm:min-h-[92px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group select-none ${
                          isSelected
                            ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/15 ring-1 ring-[#8B5CF6]'
                            : isToday
                            ? 'bg-[#151926] border-[#8B5CF6]/60 shadow-sm'
                            : 'bg-[#0E111A] border-white/[0.05] hover:border-white/[0.18] hover:bg-[#131724]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold font-mono px-1.5 py-0.5 rounded-md ${
                              isToday
                                ? 'bg-[#8B5CF6] text-white font-bold shadow-xs'
                                : isSelected
                                ? 'text-[#C4B5FD] font-bold'
                                : 'text-[#94A3B8]'
                            }`}
                          >
                            {dayNum}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-60" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]" />
                            </span>
                          )}
                        </div>

                        {/* Event micro indicators */}
                        <div className="space-y-1 mt-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map((ev) => {
                            const config = getEventVisualConfig(ev);
                            return (
                              <div
                                key={ev.id}
                                className="text-[10px] truncate px-1.5 py-0.5 rounded-md bg-[#131724] text-[#94A3B8] border border-white/[0.06] flex items-center gap-1.5"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} />
                                <span className="truncate text-white font-medium">{ev.title}</span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-[#8B5CF6] font-bold text-right tracking-tight">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Legend Footer */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3 text-[11px] text-[#94A3B8]">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E07A3F]" />
                    <span>Motos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                    <span>Kitnets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span>Pago</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <span>Atrasado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>CNH</span>
                  </div>
                </div>
                <div className="text-[#64748B] text-[10px]">
                  Clique em um dia para ver os detalhes
                </div>
              </div>
            </div>

            {/* Selected Day Agenda Drawer (1 Column) */}
            <div className="bg-[#12151F] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="pb-4 border-b border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                      Agenda Detalhada
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {formatDate(selectedDay)}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
                    {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {/* Event Cards on Selected Day */}
                <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-16 px-4 text-[#64748B] text-xs flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-slate-400 font-medium">Nenhum compromisso para este dia.</p>
                      <p className="text-[11px] text-slate-500">Selecione outro dia no calendário para inspecionar parcelas e vencimentos.</p>
                    </div>
                  ) : (
                    selectedDayEvents.map((ev) => {
                      const config = getEventVisualConfig(ev);
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3.5 rounded-xl border ${config.bgBadge} ${config.borderBadge} space-y-2 relative group hover:border-opacity-60 transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg bg-black/30 ${config.colorText}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-xs text-white block leading-snug">{ev.title}</strong>
                                <p className="text-[11px] text-[#94A3B8] mt-0.5">{ev.subtitle}</p>
                              </div>
                            </div>
                            {ev.amount && (
                              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/25 shrink-0">
                                {formatCurrency(ev.amount)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                            <span
                              className={`px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                ev.status === 'pago'
                                  ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/35'
                                  : ev.status === 'atrasado'
                                  ? 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/35'
                                  : ev.type === 'cnh_vencendo'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                                  : 'bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/35'
                              }`}
                            >
                              {ev.status}
                            </span>

                            {ev.contractId && onOpenWhatsApp && (
                              <button
                                type="button"
                                onClick={() => onOpenWhatsApp(ev.contractId!)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>Lembrete WhatsApp</span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Chronological List Mode */
          <motion.div
            key="view-lista"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-[#12151F] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Lista Cronológica de Vencimentos & Compromissos
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Exibindo {filteredEvents.length} eventos ordenados por data de vencimento.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 text-[#64748B] text-xs">
                  Nenhum evento encontrado para o filtro selecionado.
                </div>
              ) : (
                filteredEvents.map((ev) => {
                  const config = getEventVisualConfig(ev);
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-[#0E111A] hover:bg-[#151926] rounded-xl border border-white/[0.06] hover:border-white/[0.15] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${config.bgBadge} ${config.borderBadge} shrink-0`}>
                          <Icon className={`w-4 h-4 ${config.colorText}`} />
                        </div>
                        <div>
                          <span className="font-bold text-white block text-sm">{ev.title}</span>
                          <span className="text-[#94A3B8] text-xs">{ev.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5">
                        <div className="text-right">
                          <span className="font-mono text-xs text-[#94A3B8] block">{formatDate(ev.date)}</span>
                          {ev.amount && (
                            <span className="font-mono font-bold text-[#10B981] text-sm block">
                              {formatCurrency(ev.amount)}
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ev.status === 'pago'
                              ? 'bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/35'
                              : ev.status === 'atrasado'
                              ? 'bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/35'
                              : ev.type === 'cnh_vencendo'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                              : 'bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/35'
                          }`}
                        >
                          {ev.status}
                        </span>

                        {ev.contractId && onOpenWhatsApp && (
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp(ev.contractId!)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                            title="Enviar Lembrete WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


