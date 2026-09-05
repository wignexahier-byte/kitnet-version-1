import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  DollarSign,
  Droplets,
  Zap,
  Wifi,
  Shield,
  Wrench,
  Trash2,
  X,
  Search,
  SlidersHorizontal,
  Calendar,
  CreditCard,
  ChevronRight,
  Building2,
  Receipt,
  Check,
  Smartphone,
  ExternalLink,
  ChevronDown,
  Info,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory, ExpenseRecurrence } from '../types';
import { formatCurrency, formatDate, getDaysUntil, getTodayLocalDateString } from '../utils/formatters';
import { safeAdd, safeSub } from '../utils/financialMath';
import { CurrencyInput } from './NumericInput';
import { AnimatedNumber } from './AnimatedNumber';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const FinanceiroView: React.FC = () => {
  const {
    expenses,
    motoContracts,
    kitnetContracts,
    motos,
    kitnets,
    motoTenants,
    kitnetTenants,
    addExpense,
    payExpense,
    deleteExpense,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'despesas' | 'recorrentes' | 'lancamentos'>('despesas');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'vencido' | 'pendente' | 'pago'>('todos');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState<boolean>(false);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<Expense | null>(null);
  const [expenseToPay, setExpenseToPay] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Transferência' | 'Cartão'>('PIX');
  const [paymentNote, setPaymentNote] = useState<string>('');

  useBodyScrollLock(showNewExpenseModal || !!selectedExpenseForDetail || !!expenseToPay || !!expenseToDelete);

  const [newExpForm, setNewExpForm] = useState({
    title: '',
    subtitle: '',
    category: 'internet' as ExpenseCategory,
    targetType: 'kitnet' as 'geral' | 'moto' | 'kitnet',
    targetId: '',
    amount: 129.9,
    dueDate: getTodayLocalDateString(),
    recurrence: 'mensal' as ExpenseRecurrence,
    notes: '',
  });

  // Calculate financial totals
  const totalDespesas = useMemo(() => expenses.reduce((acc, e) => safeAdd(acc, e.amount || 0), 0), [expenses]);
  const despesasPagas = useMemo(
    () => expenses.filter((e) => e.status === 'pago').reduce((acc, e) => safeAdd(acc, e.amount || 0), 0),
    [expenses]
  );
  const despesasPendentes = useMemo(
    () => expenses.filter((e) => e.status === 'pendente').reduce((acc, e) => safeAdd(acc, e.amount || 0), 0),
    [expenses]
  );

  // Calculate revenues
  const { totalReceitasPagasMotos, paidMotosList, totalReceitasPagasKitnets, paidKitnetsList } = useMemo(() => {
    let motoTotal = 0;
    const motosList: Array<{
      id: string;
      title: string;
      date: string;
      amount: number;
      type: 'moto';
      category: 'parcela' | 'caucao';
    }> = [];

    motoContracts.forEach((c) => {
      const moto = motos.find((m) => m.id === c.motoId);
      const tenant = motoTenants.find((t) => t.id === c.tenantId);

      // Caução recebida no cadastro
      if (c.deposit && c.deposit > 0 && c.depositStatus !== 'devolvida') {
        motoTotal = safeAdd(motoTotal, c.deposit);
        motosList.push({
          id: `caucao-${c.id}`,
          title: `Caução de Entrada (${moto?.brand || ''} ${moto?.model || ''}${moto?.plate ? ` • ${moto.plate}` : ''}) — ${tenant?.fullName || 'Locatário'}`,
          date: c.startDate || getTodayLocalDateString(),
          amount: c.deposit,
          type: 'moto',
          category: 'caucao',
        });
      }

      c.installments.forEach((i) => {
        if (i.status === 'pago') {
          motoTotal = safeAdd(motoTotal, i.amount);
          motosList.push({
            id: i.id,
            title: `Parcela ${i.number}/${i.totalInstallments} (${moto?.brand || ''} ${moto?.model || ''}${moto?.plate ? ` • ${moto.plate}` : ''}) — ${tenant?.fullName || 'Locatário'}`,
            date: i.paidDate || i.dueDate,
            amount: i.amount,
            type: 'moto',
            category: 'parcela',
          });
        }
      });
    });

    let kitnetTotal = 0;
    const kitnetsList: Array<{
      id: string;
      title: string;
      date: string;
      amount: number;
      type: 'kitnet';
      category: 'parcela' | 'caucao';
    }> = [];

    kitnetContracts.forEach((c) => {
      const kitnet = kitnets.find((k) => k.id === c.kitnetId);
      const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

      // Caução recebida no cadastro
      if (c.deposit && c.deposit > 0 && (c as any).depositStatus !== 'devolvida') {
        kitnetTotal = safeAdd(kitnetTotal, c.deposit);
        kitnetsList.push({
          id: `caucao-k-${c.id}`,
          title: `Caução de Entrada (${kitnet?.name || 'Kitnet'}) — ${tenant?.fullName || 'Inquilino'}`,
          date: c.startDate || getTodayLocalDateString(),
          amount: c.deposit,
          type: 'kitnet',
          category: 'caucao',
        });
      }

      c.installments.forEach((i) => {
        if (i.status === 'pago') {
          kitnetTotal = safeAdd(kitnetTotal, i.amount);
          kitnetsList.push({
            id: i.id,
            title: `Aluguel Mês ${i.number}/${i.totalInstallments} (${kitnet?.name || 'Kitnet'}) — ${tenant?.fullName || 'Inquilino'}`,
            date: i.paidDate || i.dueDate,
            amount: i.amount,
            type: 'kitnet',
            category: 'parcela',
          });
        }
      });
    });

    return {
      totalReceitasPagasMotos: motoTotal,
      paidMotosList: motosList,
      totalReceitasPagasKitnets: kitnetTotal,
      paidKitnetsList: kitnetsList,
    };
  }, [motoContracts, kitnetContracts, motos, kitnets, motoTenants, kitnetTenants]);

  const totalReceitasPagas = safeAdd(totalReceitasPagasMotos, totalReceitasPagasKitnets);
  const lucroLiquidoReal = safeSub(totalReceitasPagas, despesasPagas);

  const totalCaucoesRecebidas = useMemo(() => {
    return [...paidMotosList, ...paidKitnetsList]
      .filter((item) => item.category === 'caucao')
      .reduce((acc, item) => safeAdd(acc, item.amount), 0);
  }, [paidMotosList, paidKitnetsList]);

  const allInflows = useMemo(
    () => [...paidMotosList, ...paidKitnetsList].sort((a, b) => b.date.localeCompare(a.date)),
    [paidMotosList, paidKitnetsList]
  );

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpForm.title.trim() || newExpForm.amount <= 0) {
      alert('Preencha o título e valor da despesa.');
      return;
    }

    const fullTitle = newExpForm.subtitle.trim()
      ? `${newExpForm.title.trim()} — ${newExpForm.subtitle.trim()}`
      : newExpForm.title.trim();

    addExpense({
      title: fullTitle,
      category: newExpForm.category,
      targetType: newExpForm.targetType,
      targetId: newExpForm.targetId || undefined,
      amount: newExpForm.amount,
      dueDate: newExpForm.dueDate,
      recurrence: newExpForm.recurrence,
      notes: newExpForm.notes,
      status: 'pendente',
    });

    setShowNewExpenseModal(false);
    setNewExpForm({
      title: '',
      subtitle: '',
      category: 'internet',
      targetType: 'kitnet',
      targetId: '',
      amount: 129.9,
      dueDate: getTodayLocalDateString(),
      recurrence: 'mensal',
      notes: '',
    });
  };

  const handleConfirmPayExpense = () => {
    if (!expenseToPay) return;
    payExpense(expenseToPay.id);
    setExpenseToPay(null);
    setPaymentNote('');
  };

  // Extract title and subtitle
  const parseExpenseInfo = (exp: Expense) => {
    let mainTitle = exp.title;
    let subtitle = '';

    if (exp.title.includes(' — ')) {
      const parts = exp.title.split(' — ');
      mainTitle = parts[0];
      subtitle = parts.slice(1).join(' — ');
    } else if (exp.title.includes(' - ')) {
      const parts = exp.title.split(' - ');
      mainTitle = parts[0];
      subtitle = parts.slice(1).join(' - ');
    } else if (exp.notes) {
      subtitle = exp.notes;
    } else if (
      exp.targetType === 'moto' ||
      exp.category === 'manutencao_moto' ||
      exp.category === 'seguro' ||
      exp.title.toLowerCase().includes('moto')
    ) {
      const moto = motos.find((m) => m.id === exp.targetId);
      subtitle = moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Frota de Motos';
    } else if (
      exp.targetType === 'kitnet' ||
      exp.category === 'iptu' ||
      exp.category === 'reparo' ||
      exp.category === 'reforma' ||
      exp.category === 'agua' ||
      exp.category === 'energia' ||
      exp.category === 'internet' ||
      exp.title.toLowerCase().includes('kitnet')
    ) {
      const kitnet = kitnets.find((k) => k.id === exp.targetId);
      subtitle = kitnet ? kitnet.name : 'Geral Kitnets';
    } else {
      subtitle = 'Operacional';
    }

    return { mainTitle, subtitle };
  };

  // Category Icon Component
  const getCategoryCircleIcon = (cat: ExpenseCategory | string) => {
    switch (cat) {
      case 'internet':
        return <Wifi className="w-5 h-5 text-[#A855F7]" />;
      case 'agua':
        return <Droplets className="w-5 h-5 text-[#38BDF8]" />;
      case 'energia':
        return <Zap className="w-5 h-5 text-[#F59E0B]" />;
      case 'iptu':
        return <Building2 className="w-5 h-5 text-[#10B981]" />;
      case 'seguro':
        return <Shield className="w-5 h-5 text-[#818CF8]" />;
      case 'manutencao_moto':
      case 'reparo':
      case 'reforma':
        return <Wrench className="w-5 h-5 text-[#FB923C]" />;
      default:
        return <Receipt className="w-5 h-5 text-[#A855F7]" />;
    }
  };

  // Category Bullet Color
  const getCategoryBulletColor = (cat: ExpenseCategory | string) => {
    switch (cat) {
      case 'internet':
        return '#A855F7';
      case 'agua':
        return '#38BDF8';
      case 'energia':
        return '#F59E0B';
      case 'iptu':
        return '#10B981';
      case 'seguro':
        return '#818CF8';
      case 'manutencao_moto':
      case 'reparo':
      case 'reforma':
        return '#FB923C';
      default:
        return '#A855F7';
    }
  };

  const getCategoryLabel = (cat: ExpenseCategory | string) => {
    switch (cat) {
      case 'internet':
        return 'Internet';
      case 'agua':
        return 'Água';
      case 'energia':
        return 'Energia';
      case 'iptu':
        return 'IPTU';
      case 'seguro':
        return 'Seguro';
      case 'manutencao_moto':
        return 'Manutenção';
      case 'reparo':
        return 'Reparo';
      case 'reforma':
        return 'Reforma';
      default:
        return 'Serviços';
    }
  };

  const getRecurrenceLabel = (rec: ExpenseRecurrence) => {
    switch (rec) {
      case 'mensal':
        return 'Mensal';
      case 'anual':
        return 'Anual';
      case 'trimestral':
        return 'Trimestral';
      case 'semestral':
        return 'Semestral';
      default:
        return 'Eventual';
    }
  };

  const getExpenseStatus = (exp: Expense) => {
    if (exp.status === 'pago') return 'pago';
    const today = getTodayLocalDateString();
    if (exp.dueDate < today) return 'vencido';
    return 'pendente';
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Tab filter
      if (activeTab === 'recorrentes' && e.recurrence === 'nenhuma') return false;

      // Category chip filter
      if (filterCategory !== 'todas') {
        if (filterCategory === 'servicos') {
          if (!['outros', 'reparo', 'reforma'].includes(e.category)) {
            return false;
          }
        } else if (e.category !== filterCategory) {
          return false;
        }
      }

      // Status filter
      const currentStatus = getExpenseStatus(e);
      if (statusFilter !== 'todos' && currentStatus !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesCategory = e.category.toLowerCase().includes(q);
        const matchesNotes = (e.notes || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesNotes) return false;
      }

      return true;
    });
  }, [expenses, activeTab, filterCategory, statusFilter, searchQuery]);

  const categoryChips = [
    {
      id: 'todas',
      label: 'Todas',
      icon: Receipt,
      activeClass: 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border-violet-500/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-violet-500/40 hover:text-violet-200',
    },
    {
      id: 'internet',
      label: 'Internet',
      icon: Wifi,
      activeClass: 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border-purple-500/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-purple-500/40 hover:text-purple-200',
    },
    {
      id: 'agua',
      label: 'Água',
      icon: Droplets,
      activeClass: 'bg-sky-500 text-white shadow-md shadow-sky-500/30 border-sky-400/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-sky-500/40 hover:text-sky-200',
    },
    {
      id: 'energia',
      label: 'Energia',
      icon: Zap,
      activeClass: 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 border-amber-400/50',
      activeText: 'text-slate-950',
      hoverBorder: 'hover:border-amber-500/40 hover:text-amber-200',
    },
    {
      id: 'iptu',
      label: 'IPTU',
      icon: Building2,
      activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border-emerald-500/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-emerald-500/40 hover:text-emerald-200',
    },
    {
      id: 'servicos',
      label: 'Serviços',
      icon: Sparkles,
      activeClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border-indigo-500/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-indigo-500/40 hover:text-indigo-200',
    },
    {
      id: 'seguro',
      label: 'Seguro',
      icon: Shield,
      activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border-blue-500/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-blue-500/40 hover:text-blue-200',
    },
    {
      id: 'manutencao_moto',
      label: 'Manutenção',
      icon: Wrench,
      activeClass: 'bg-orange-500 text-white shadow-md shadow-orange-500/30 border-orange-400/50',
      activeText: 'text-white',
      hoverBorder: 'hover:border-orange-500/40 hover:text-orange-200',
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn font-sans text-slate-100 max-w-7xl mx-auto pb-2">
      {/* Top Header Card */}
      <div className="p-4 sm:p-6 bg-[#121420] border border-white/[0.08] rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Financeiro</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Receitas de parcelas e aluguéis, despesas operacionais e fluxo de caixa
          </p>
        </div>

        <button
          onClick={() => setShowNewExpenseModal(true)}
          className="px-4 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6D28D9]/25 transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Nova Despesa</span>
        </button>
      </div>

      {/* KPI Cards Overview - Compact & Elegant (2x2 Grid on Mobile, 4 Cols on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Receitas Recebidas */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121420] border border-white/[0.08] flex flex-col justify-between shadow-md hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Receitas Recebidas</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-[#10B981] tabular-nums tracking-tight mt-2 whitespace-nowrap truncate">
            <AnimatedNumber value={totalReceitasPagas} format="currency" />
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            M: {formatCurrency(totalReceitasPagasMotos)} • K: {formatCurrency(totalReceitasPagasKitnets)}
          </div>
          <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-orange-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
              Caução recebido:
            </span>
            <span className="text-orange-400 font-bold tabular-nums">
              {formatCurrency(totalCaucoesRecebidas)}
            </span>
          </div>
        </div>

        {/* Card 2: Despesas Pagas */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121420] border border-white/[0.08] flex flex-col justify-between shadow-md hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Despesas Pagas</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 text-slate-300 border border-white/[0.08] flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-100 tabular-nums tracking-tight mt-2 whitespace-nowrap truncate">
            <AnimatedNumber value={despesasPagas} format="currency" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            Contas quitadas no período
          </p>
        </div>

        {/* Card 3: Despesas a Pagar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121420] border border-white/[0.08] flex flex-col justify-between shadow-md hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Despesas a Pagar</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-[#EF4444] tabular-nums tracking-tight mt-2 whitespace-nowrap truncate">
            <AnimatedNumber value={despesasPendentes} format="currency" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            {expenses.filter((e) => e.status === 'pendente').length} conta(s) pendente(s)
          </p>
        </div>

        {/* Card 4: Saldo Líquido em Caixa */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121420] border border-white/[0.08] flex flex-col justify-between shadow-md hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">
              Saldo Líquido
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-base sm:text-xl font-bold tabular-nums tracking-tight mt-2 whitespace-nowrap truncate ${
              lucroLiquidoReal < 0 ? 'text-red-400' : lucroLiquidoReal > 0 ? 'text-emerald-400' : 'text-slate-100'
            }`}
          >
            <AnimatedNumber value={lucroLiquidoReal} format="currency" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            Receitas - Despesas pagas
          </p>
        </div>
      </div>

      {/* Main Mode Navigation Tabs - Enhanced Horizontal Scroll & Single Line Layout */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 flex items-center gap-2 sm:gap-2.5 no-scrollbar">
        <button
          onClick={() => setActiveTab('despesas')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 select-none active:scale-95 ${
            activeTab === 'despesas'
              ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30 font-bold border border-violet-400/40'
              : 'bg-[#151724] hover:bg-[#1a1d2c] text-slate-300 hover:text-white border border-white/[0.06] hover:border-violet-500/30'
          }`}
        >
          <span>Despesas & Contas</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold transition-colors ${
              activeTab === 'despesas' ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400 border border-white/[0.06]'
            }`}
          >
            {expenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recorrentes')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 select-none active:scale-95 ${
            activeTab === 'recorrentes'
              ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30 font-bold border border-violet-400/40'
              : 'bg-[#151724] hover:bg-[#1a1d2c] text-slate-300 hover:text-white border border-white/[0.06] hover:border-violet-500/30'
          }`}
        >
          <span>Contas Recorrentes</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold transition-colors ${
              activeTab === 'recorrentes' ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400 border border-white/[0.06]'
            }`}
          >
            {expenses.filter((e) => e.recurrence !== 'nenhuma').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 select-none active:scale-95 ${
            activeTab === 'lancamentos'
              ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30 font-bold border border-violet-400/40'
              : 'bg-[#151724] hover:bg-[#1a1d2c] text-slate-300 hover:text-white border border-white/[0.06] hover:border-violet-500/30'
          }`}
        >
          <span>Receitas Quitadas</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold transition-colors ${
              activeTab === 'lancamentos' ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400 border border-white/[0.06]'
            }`}
          >
            {allInflows.length}
          </span>
        </button>
      </div>

      {activeTab === 'lancamentos' ? (
        /* Inflows / Historical Revenue View */
        <div className="bg-[#11131c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 bg-[#151722]">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Histórico de Receitas Quitadas</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Entradas confirmadas de aluguéis e cauções</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Cauções: {formatCurrency(totalCaucoesRecebidas)}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">{allInflows.length} lançamentos</span>
            </div>
          </div>

          {allInflows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma receita quitada no momento.
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block sm:hidden divide-y divide-white/[0.08] p-3 space-y-2.5">
                {allInflows.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${Math.min(index * 40, 280)}ms` }}
                    className="p-3.5 bg-[#161824] rounded-xl border border-white/[0.08] space-y-2 animate-card-enter"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-xs text-white">{item.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400 capitalize">
                            Tipo: {item.type === 'moto' ? 'Moto' : 'Kitnet'}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              item.category === 'caucao'
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                : 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                            }`}
                          >
                            {item.category === 'caucao' ? 'Caução de Entrada' : 'Parcela / Aluguel'}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-bold tabular-nums shrink-0 ${
                        item.category === 'caucao' ? 'text-orange-400' : 'text-emerald-400'
                      }`}>
                        +{formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
                      <span>Recebido em: <strong className="text-slate-200">{formatDate(item.date)}</strong></span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.category === 'caucao'
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.category === 'caucao' ? 'Caução Retido' : 'Recebido'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161824] text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3.5">Origem / Referência</th>
                      <th className="p-3.5">Categoria</th>
                      <th className="p-3.5">Tipo</th>
                      <th className="p-3.5">Data de Pagamento</th>
                      <th className="p-3.5">Valor Recebido</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {allInflows.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-semibold text-slate-200">{item.title}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.category === 'caucao'
                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                : 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                            }`}
                          >
                            {item.category === 'caucao' ? 'Caução de Entrada' : 'Parcela / Aluguel'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 capitalize">{item.type === 'moto' ? 'Moto' : 'Kitnet'}</td>
                        <td className="p-3.5 text-slate-200 font-medium tabular-nums">{formatDate(item.date)}</td>
                        <td className={`p-3.5 font-bold tabular-nums whitespace-nowrap ${
                          item.category === 'caucao' ? 'text-orange-400' : 'text-emerald-400'
                        }`}>
                          +{formatCurrency(item.amount)}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                            item.category === 'caucao'
                              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.category === 'caucao' ? 'Caução Retido' : 'Recebido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Expenses Section - EXACT LAYOUT AS IN THE USER IMAGE */
        <div className="space-y-3">
          {/* Search Bar - Matching IMG_0418.jpeg */}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar despesa..."
              className="w-full bg-[#12141f] hover:bg-[#161825] focus:bg-[#161825] border border-white/[0.09] focus:border-violet-500/60 rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-md shadow-black/20"
            />
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="absolute right-3 p-1.5 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-xl transition-all cursor-pointer"
              title="Filtrar despesas"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Menu if opened */}
          {showFilterMenu && (
            <div className="p-3 bg-[#12141f] border border-white/[0.08] rounded-2xl flex flex-wrap items-center gap-2.5 animate-fadeIn">
              <span className="text-xs text-slate-400 font-semibold">Situação:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['todos', 'vencido', 'pendente', 'pago'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer border ${
                      statusFilter === st
                        ? 'bg-violet-600 text-white border-violet-500 shadow-xs'
                        : 'bg-[#181a28] text-slate-400 border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {st === 'todos' ? 'Todos os Status' : st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Chips Bar with shrink-0, smooth bouncy animations and matching category colors */}
          <div className="overflow-x-auto pb-1.5 -mx-1 px-1 flex items-center gap-2 no-scrollbar">
            {categoryChips.map((chip) => {
              const isSelected = filterCategory === chip.id;
              const IconComponent = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilterCategory(chip.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 whitespace-nowrap transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 border active:scale-95 ${
                    isSelected
                      ? `${chip.activeClass} scale-[1.03]`
                      : `bg-[#151724] hover:bg-[#1a1d2c] text-slate-300 ${chip.hoverBorder} border-white/[0.06]`
                  }`}
                >
                  <IconComponent
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isSelected ? 'scale-110' : 'opacity-70'
                    }`}
                  />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expenses List Cards - EXACT CRISP 2-ROW / DUAL-COLUMN CARD AS IN IMG_0418.jpeg */}
          <div className="space-y-2.5">
            {filteredExpenses.length === 0 ? (
              <div className="p-10 text-center bg-[#12141f] border border-white/[0.08] rounded-2xl space-y-3">
                <Receipt className="w-9 h-9 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-300 font-medium">Nenhuma despesa encontrada.</p>
                <p className="text-xs text-slate-500">Tente ajustar os filtros ou cadastre uma nova despesa.</p>
                <button
                  onClick={() => setShowNewExpenseModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-all mt-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Despesa</span>
                </button>
              </div>
            ) : (
              filteredExpenses.map((exp, index) => {
                const { mainTitle, subtitle } = parseExpenseInfo(exp);
                const status = getExpenseStatus(exp);
                const isPaid = status === 'pago';
                const isOverdue = status === 'vencido';
                const isPending = status === 'pendente';

                return (
                  <div
                    key={exp.id}
                    style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
                    className="bg-[#121420] hover:bg-[#151724] border border-white/[0.07] hover:border-white/[0.14] rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-md shadow-black/25 flex items-center justify-between gap-3 animate-card-enter group"
                  >
                    {/* Left Section: Category Icon Circle + Info Block */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Circle Icon Badge */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#181a28] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                        {getCategoryCircleIcon(exp.category)}
                      </div>

                      {/* Text details */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        {/* Main Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                          {mainTitle}
                        </h3>

                        {/* Subtitle / Location */}
                        <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">
                          {subtitle}
                        </p>

                        {/* Category • Recurrence */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-medium text-slate-300">{getCategoryLabel(exp.category)}</span>
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: getCategoryBulletColor(exp.category) }}
                          />
                          <span>{getRecurrenceLabel(exp.recurrence)}</span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            Vencimento:{' '}
                            <strong className="text-slate-200 font-medium tabular-nums">
                              {formatDate(exp.dueDate)}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                      {/* Right Section: Top (Amount + Pending/Overdue Status + Chevron) & Bottom (Pagar/Quitada + Trash) */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-3">
                        {/* Top Right: Amount + Status Pill (if pending/overdue) + Chevron */}
                        <div className="flex items-start gap-2 sm:gap-2.5">
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`text-sm sm:text-base font-bold tabular-nums tracking-tight ${
                                isPaid
                                  ? 'text-emerald-400'
                                  : isOverdue
                                  ? 'text-[#EF4444]'
                                  : 'text-slate-100'
                              }`}
                            >
                              {formatCurrency(exp.amount)}
                            </span>

                            {isOverdue && (
                              <div className="mt-0.5">
                                <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs tracking-wide select-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                                  <span>Vencido</span>
                                </span>
                              </div>
                            )}
                            {isPending && (
                              <div className="mt-0.5">
                                <span className="px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs tracking-wide select-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <span>Pendente</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chevron button to open details */}
                          <button
                            type="button"
                            onClick={() => setSelectedExpenseForDetail(exp)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08] active:scale-90 transition-all cursor-pointer mt-0.5"
                            title="Ver detalhes da despesa"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bottom Right: Green Pagar Button (when pending/overdue) OR Quitada Badge & Trash */}
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <div className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 shadow-xs select-none">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Quitada</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExpenseToPay(exp)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-[#10B981]/25 hover:shadow-[#10B981]/40 transition-all duration-150 cursor-pointer whitespace-nowrap"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pagar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpenseToDelete(exp)}
                            className="p-2 rounded-xl bg-[#181a28] hover:bg-red-500/15 border border-white/[0.08] hover:border-red-500/30 text-slate-400 hover:text-red-400 active:scale-90 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Confirm Payment (GREEN STANDARDIZED) */}
      {expenseToPay && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-[#11131c] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto animate-modal-enter">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161825]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirmar Pagamento</h3>
                  <p className="text-xs text-slate-400">Dar baixa e quitar despesa</p>
                </div>
              </div>
              <button
                onClick={() => setExpenseToPay(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-[#161825] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Despesa:</span>
                  <span className="text-xs font-bold text-white">{expenseToPay.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Categoria:</span>
                  <span className="text-slate-200 font-medium capitalize">{getCategoryLabel(expenseToPay.category)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Vencimento:</span>
                  <span className="text-slate-200 font-medium">{formatDate(expenseToPay.dueDate)}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Valor a Pagar:</span>
                  <span className="text-lg font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(expenseToPay.amount)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PIX', 'Dinheiro', 'Transferência', 'Cartão'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                        paymentMethod === method
                          ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/25'
                          : 'bg-[#161825] text-slate-400 border-white/[0.08] hover:border-white/[0.2] hover:text-white'
                      }`}
                    >
                      {method === 'PIX' && <Smartphone className="w-3.5 h-3.5" />}
                      {method === 'Dinheiro' && <DollarSign className="w-3.5 h-3.5" />}
                      {method === 'Transferência' && <CreditCard className="w-3.5 h-3.5" />}
                      {method === 'Cartão' && <CreditCard className="w-3.5 h-3.5" />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pago com chave PIX da conta bancária..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setExpenseToPay(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayExpense}
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#10B981]/25"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmar Pagamento</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: View Expense Details */}
      {selectedExpenseForDetail && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-[#11131c] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto animate-modal-enter">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161825]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1d1f30] border border-white/[0.08] flex items-center justify-center">
                  {getCategoryCircleIcon(selectedExpenseForDetail.category)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detalhes da Despesa</h3>
                  <p className="text-xs text-slate-400 capitalize">{getCategoryLabel(selectedExpenseForDetail.category)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpenseForDetail(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2 p-4 bg-[#161825] rounded-xl border border-white/[0.08]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Título Completo:</span>
                  <span className="font-bold text-white text-right">{selectedExpenseForDetail.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recorrência:</span>
                  <span className="font-medium text-slate-200 capitalize">{getRecurrenceLabel(selectedExpenseForDetail.recurrence)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vencimento:</span>
                  <span className="font-medium text-slate-200">{formatDate(selectedExpenseForDetail.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Situação:</span>
                  <span className="font-bold capitalize text-slate-200">
                    {getExpenseStatus(selectedExpenseForDetail)}
                  </span>
                </div>
                {selectedExpenseForDetail.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data de Quitação:</span>
                    <span className="font-medium text-emerald-400">{formatDate(selectedExpenseForDetail.paidDate)}</span>
                  </div>
                )}
                {selectedExpenseForDetail.notes && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <span className="text-slate-400 block mb-1">Observações:</span>
                    <p className="text-slate-200 bg-[#11131c] p-2 rounded-lg">{selectedExpenseForDetail.notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Valor Total:</span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">
                    {formatCurrency(selectedExpenseForDetail.amount)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const exp = selectedExpenseForDetail;
                    setSelectedExpenseForDetail(null);
                    setExpenseToDelete(exp);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExpenseForDetail(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                  {selectedExpenseForDetail.status !== 'pago' && (
                    <button
                      type="button"
                      onClick={() => {
                        const exp = selectedExpenseForDetail;
                        setSelectedExpenseForDetail(null);
                        setExpenseToPay(exp);
                      }}
                      className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#10B981]/25 active:scale-95 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pagar Agora</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: New Expense Modal */}
      {showNewExpenseModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-[#11131c] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-auto animate-modal-enter">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161825]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-400" />
                <span>Cadastrar Nova Despesa</span>
              </h3>
              <button
                onClick={() => setShowNewExpenseModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Título da Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Internet Fibra 600MB"
                  value={newExpForm.title}
                  onChange={(e) => setNewExpForm({ ...newExpForm, title: e.target.value })}
                  className="w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subtítulo / Local / Bloco</label>
                <input
                  type="text"
                  placeholder="Ex: Bloco Kitnets, Iluminação Externa, Geral"
                  value={newExpForm.subtitle}
                  onChange={(e) => setNewExpForm({ ...newExpForm, subtitle: e.target.value })}
                  className="w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Categoria</label>
                  <select
                    value={newExpForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as ExpenseCategory;
                      let newTarget = newExpForm.targetType;
                      let newSub = newExpForm.subtitle;
                      if (cat === 'manutencao_moto') {
                        newTarget = 'moto';
                        newSub = 'Frota de Motos';
                      } else if (cat === 'iptu' || cat === 'reparo' || cat === 'reforma' || cat === 'agua' || cat === 'energia' || cat === 'internet') {
                        newTarget = 'kitnet';
                        newSub = 'Geral Kitnets';
                      }
                      setNewExpForm({ ...newExpForm, category: cat, targetType: newTarget, subtitle: newSub });
                    }}
                    className="w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="manutencao_moto">🏍️ Manutenção de Moto</option>
                    <option value="internet">📶 Internet</option>
                    <option value="agua">💧 Água</option>
                    <option value="energia">⚡ Energia</option>
                    <option value="iptu">🏛️ IPTU</option>
                    <option value="seguro">🛡️ Seguro</option>
                    <option value="reparo">🔧 Reparo Kitnet</option>
                    <option value="reforma">🔨 Reforma</option>
                    <option value="outros">🧾 Outros / Serviços</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vínculo do Patrimônio</label>
                  <select
                    value={newExpForm.targetType}
                    onChange={(e) => {
                      const tType = e.target.value as 'kitnet' | 'moto' | 'geral';
                      let sub = newExpForm.subtitle;
                      if (tType === 'moto' && (!sub || sub === 'Geral Kitnets')) sub = 'Frota de Motos';
                      if (tType === 'kitnet' && (!sub || sub === 'Frota de Motos')) sub = 'Geral Kitnets';
                      setNewExpForm({ ...newExpForm, targetType: tType, subtitle: sub });
                    }}
                    className="w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="moto">🏍️ Frota de Motos</option>
                    <option value="kitnet">🏢 Kitnets (Imóveis)</option>
                    <option value="geral">💼 Geral / Administrativo</option>
                  </select>
                </div>
              </div>

              {newExpForm.targetType === 'moto' && motos.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Moto Específica (Opcional)</label>
                  <select
                    value={newExpForm.targetId || ''}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const selMoto = motos.find((m) => m.id === selId);
                      setNewExpForm({
                        ...newExpForm,
                        targetId: selId,
                        subtitle: selMoto ? `${selMoto.brand} ${selMoto.model} (${selMoto.plate})` : 'Frota de Motos',
                      });
                    }}
                    className="w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Todas / Frota Geral de Motos</option>
                    {motos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.brand} {m.model} — {m.plate} ({m.color})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newExpForm.targetType === 'kitnet' && kitnets.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kitnet Específica (Opcional)</label>
                  <select
                    value={newExpForm.targetId || ''}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const selKitnet = kitnets.find((k) => k.id === selId);
                      setNewExpForm({
                        ...newExpForm,
                        targetId: selId,
                        subtitle: selKitnet ? selKitnet.name : 'Geral Kitnets',
                      });
                    }}
                    className="h-11 w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Todas / Geral Kitnets</option>
                    {kitnets.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.address || `Nº ${k.number}`})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Valor (R$)</label>
                <CurrencyInput
                  value={newExpForm.amount}
                  onChange={(val) => setNewExpForm({ ...newExpForm, amount: val })}
                  className="h-11 w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={newExpForm.dueDate}
                    onChange={(e) => setNewExpForm({ ...newExpForm, dueDate: e.target.value })}
                    className="h-11 w-full flex items-center bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-violet-500 leading-normal [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recorrência</label>
                  <select
                    value={newExpForm.recurrence}
                    onChange={(e) => setNewExpForm({ ...newExpForm, recurrence: e.target.value as any })}
                    className="h-11 w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="nenhuma">Eventual / Única</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Observações (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Código do boleto, operadora, etc."
                  value={newExpForm.notes}
                  onChange={(e) => setNewExpForm({ ...newExpForm, notes: e.target.value })}
                  className="h-11 w-full bg-[#161825] border border-white/[0.1] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewExpenseModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md shadow-violet-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: Delete Expense Confirmation Modal */}
      {expenseToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-[#11131c] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-auto animate-modal-enter">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161825]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Excluir Despesa</h3>
                  <p className="text-[11px] text-slate-400">Esta ação removerá a conta do histórico</p>
                </div>
              </div>
              <button
                onClick={() => setExpenseToDelete(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-300">
                Tem certeza de que deseja excluir permanentemente a despesa{' '}
                <strong className="text-white font-semibold">"{expenseToDelete.title}"</strong>?
              </p>

              <div className="p-3.5 rounded-xl bg-[#161825] border border-white/[0.06] space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-bold text-white tabular-nums">{formatCurrency(expenseToDelete.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vencimento:</span>
                  <span className="text-slate-300 tabular-nums">{formatDate(expenseToDelete.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize text-slate-300">{expenseToDelete.status}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteExpense(expenseToDelete.id);
                    setExpenseToDelete(null);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sim, Excluir Despesa</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
