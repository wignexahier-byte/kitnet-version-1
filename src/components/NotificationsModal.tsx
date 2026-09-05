import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Bell,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Motorbike,
  Home,
  Building2,
  Receipt,
  CreditCard,
  Send,
  ShieldAlert,
  FileText,
  Wifi,
  Droplets,
  Zap,
  Wrench,
  Shield,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getCNHStatus, getDaysUntil, isInstallmentOverdue } from '../utils/formatters';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
  onOpenWhatsApp?: (contractId: string, installmentId?: string) => void;
  onOpenWhatsAppForContract?: (contractId: string, installmentId?: string) => void;
}

type FilterType = 'all' | 'critical' | 'expense' | 'rental' | 'documentos';

// Formata slugs de categorias para português legível
function formatExpenseCategoryLabel(cat?: string): string {
  if (!cat) return 'Despesa';
  const clean = cat.toLowerCase();
  switch (clean) {
    case 'internet':
      return 'Internet';
    case 'agua':
    case 'água':
      return 'Água';
    case 'energia':
    case 'luz':
      return 'Energia';
    case 'iptu':
      return 'IPTU';
    case 'seguro':
      return 'Seguro';
    case 'manutencao_moto':
    case 'manutenção moto':
    case 'manutencao':
      return 'Manutenção';
    case 'reparo':
      return 'Reparo';
    case 'reforma':
      return 'Reforma';
    case 'combustivel':
      return 'Combustível';
    case 'rastreador':
      return 'Rastreador';
    case 'imposto':
      return 'Impostos';
    default:
      return clean
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenWhatsApp,
  onOpenWhatsAppForContract,
}) => {
  const { motos, motoTenants, motoContracts, kitnets, kitnetContracts, expenses, payExpense } = useApp();
  const handleWhatsApp = onOpenWhatsApp || onOpenWhatsAppForContract;

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [justPaidId, setJustPaidId] = useState<string | null>(null);

  useBodyScrollLock(isOpen);

  interface AlertItem {
    id: string;
    expenseId?: string;
    type: 'critical' | 'warning' | 'info';
    categoryKind: 'moto' | 'kitnet' | 'cnh' | 'expense' | 'ipva';
    specificExpenseCategory?: string;
    categoryLabel: string;
    title: string;
    subtitle: string;
    amount?: number;
    dueDate?: string;
    statusLabel: string;
    statusSeverity: 'critical' | 'warning' | 'info';
    actionLabel: string;
    actionTab?: string;
    contractId?: string;
    installmentId?: string;
  }

  const alerts: AlertItem[] = useMemo(() => {
    const list: AlertItem[] = [];

    // 1. Parcelas de Motos
    motoContracts.forEach((contract) => {
      const moto = motos.find((m) => m.id === contract.motoId);
      const tenant = motoTenants.find((t) => t.id === contract.tenantId);
      contract.installments.forEach((inst, instIdx) => {
        if (inst.status === 'pago') return;
        const keySuffix = `${contract.id}-${inst.id || instIdx}`;
        if (isInstallmentOverdue(inst)) {
          const daysOverdue = Math.abs(getDaysUntil(inst.dueDate));
          list.push({
            id: `alert-moto-overdue-${keySuffix}`,
            type: 'critical',
            categoryKind: 'moto',
            categoryLabel: 'Parcela Moto',
            title: `${tenant?.fullName || 'Locatário'} • Parcela ${inst.number}/${inst.totalInstallments}`,
            subtitle: `${moto?.brand || ''} ${moto?.model || ''} (${moto?.plate || 'Placa n/d'})`,
            amount: inst.amount,
            dueDate: inst.dueDate,
            statusLabel: daysOverdue > 0 ? `Atrasada há ${daysOverdue}d` : `Venceu em ${formatDate(inst.dueDate)}`,
            statusSeverity: 'critical',
            actionLabel: 'Cobrar WhatsApp',
            actionTab: 'motos',
            contractId: contract.id,
            installmentId: inst.id,
          });
        } else {
          const days = getDaysUntil(inst.dueDate);
          if (days <= 3) {
            list.push({
              id: `alert-moto-due-${keySuffix}`,
              type: 'warning',
              categoryKind: 'moto',
              categoryLabel: 'Parcela Moto',
              title: `${tenant?.fullName || 'Locatário'} • Parcela ${inst.number}/${inst.totalInstallments}`,
              subtitle: `${moto?.brand || ''} ${moto?.model || ''} (${moto?.plate || 'Placa n/d'})`,
              amount: inst.amount,
              dueDate: inst.dueDate,
              statusLabel: days === 0 ? 'Vence Hoje' : `Vence em ${days}d`,
              statusSeverity: days === 0 ? 'warning' : 'info',
              actionLabel: 'Lembrar WhatsApp',
              actionTab: 'motos',
              contractId: contract.id,
              installmentId: inst.id,
            });
          }
        }
      });
    });

    // 2. Aluguel de Kitnets
    kitnetContracts.forEach((contract) => {
      const kitnet = kitnets.find((k) => k.id === contract.kitnetId);
      contract.installments.forEach((inst, instIdx) => {
        if (inst.status === 'pago') return;
        const keySuffix = `${contract.id}-${inst.id || instIdx}`;
        if (isInstallmentOverdue(inst)) {
          const daysOverdue = Math.abs(getDaysUntil(inst.dueDate));
          list.push({
            id: `alert-kitnet-overdue-${keySuffix}`,
            type: 'critical',
            categoryKind: 'kitnet',
            categoryLabel: 'Aluguel Kitnet',
            title: `${kitnet?.name || `Kitnet ${kitnet?.number || ''}`} • Parcela ${inst.number}`,
            subtitle: kitnet?.address || 'Imóvel Residencial',
            amount: inst.amount,
            dueDate: inst.dueDate,
            statusLabel: daysOverdue > 0 ? `Atrasado há ${daysOverdue}d` : `Venceu em ${formatDate(inst.dueDate)}`,
            statusSeverity: 'critical',
            actionLabel: 'Ver Kitnet',
            actionTab: 'kitnets',
          });
        } else {
          const days = getDaysUntil(inst.dueDate);
          if (days <= 3) {
            list.push({
              id: `alert-kitnet-due-${keySuffix}`,
              type: 'warning',
              categoryKind: 'kitnet',
              categoryLabel: 'Aluguel Kitnet',
              title: `${kitnet?.name || `Kitnet ${kitnet?.number || ''}`} • Parcela ${inst.number}`,
              subtitle: kitnet?.address || 'Imóvel Residencial',
              amount: inst.amount,
              dueDate: inst.dueDate,
              statusLabel: days === 0 ? 'Vence Hoje' : `Vence em ${days}d`,
              statusSeverity: days === 0 ? 'warning' : 'info',
              actionLabel: 'Ver Kitnet',
              actionTab: 'kitnets',
            });
          }
        }
      });
    });

    // 3. CNH dos Locatários Ativos
    const activeMotoTenantIds = new Set(
      motoContracts.filter((c) => c.status === 'ativo').map((c) => c.tenantId)
    );
    motoTenants.forEach((tenant) => {
      if (tenant.cnh && activeMotoTenantIds.has(tenant.id)) {
        const cnh = getCNHStatus(tenant.cnh.expirationDate);
        if (cnh.status === 'vencida') {
          list.push({
            id: `alert-cnh-vencida-${tenant.id}`,
            type: 'critical',
            categoryKind: 'cnh',
            categoryLabel: 'CNH Vencida',
            title: `${tenant.fullName} (Cat. ${tenant.cnh.category})`,
            subtitle: `Venceu em ${formatDate(tenant.cnh.expirationDate)} • Condutor em atividade`,
            statusLabel: 'CNH Vencida',
            statusSeverity: 'critical',
            actionLabel: 'Ver Locatário',
            actionTab: 'clientes',
          });
        } else if (cnh.status === 'vencendo') {
          list.push({
            id: `alert-cnh-soon-${tenant.id}`,
            type: 'warning',
            categoryKind: 'cnh',
            categoryLabel: 'CNH a Vencer',
            title: `${tenant.fullName} (Cat. ${tenant.cnh.category})`,
            subtitle: `Vence em ${cnh.days} dias (${formatDate(tenant.cnh.expirationDate)})`,
            statusLabel: `Vence em ${cnh.days}d`,
            statusSeverity: 'warning',
            actionLabel: 'Ver Locatário',
            actionTab: 'clientes',
          });
        }
      }
    });

    // 4. Despesas / Contas a Pagar
    expenses.forEach((exp) => {
      if (exp.status === 'pendente') {
        const days = getDaysUntil(exp.dueDate);
        const readableCategory = formatExpenseCategoryLabel(exp.category);
        const mainTitle = exp.title.includes(' — ')
          ? exp.title.split(' — ')[0]
          : exp.title.includes(' - ')
          ? exp.title.split(' - ')[0]
          : exp.title;

        const isMotoExpense =
          exp.targetType === 'moto' ||
          exp.category === 'manutencao_moto' ||
          exp.title.toLowerCase().includes('moto') ||
          exp.title.toLowerCase().includes('rastreador');

        const isKitnetExpense =
          !isMotoExpense &&
          (exp.targetType === 'kitnet' ||
            exp.category === 'iptu' ||
            exp.category === 'reparo' ||
            exp.category === 'reforma' ||
            exp.category === 'agua' ||
            exp.category === 'energia' ||
            exp.category === 'internet' ||
            exp.title.toLowerCase().includes('kitnet'));

        let subtitleText = '';
        if (exp.notes) {
          subtitleText = exp.notes;
        } else if (isMotoExpense) {
          const moto = motos.find((m) => m.id === exp.targetId);
          subtitleText = moto
            ? `Moto: ${moto.brand} ${moto.model} (${moto.plate})`
            : 'Despesa vinculada à Frota de Motos';
        } else if (isKitnetExpense) {
          const kitnet = kitnets.find((k) => k.id === exp.targetId);
          subtitleText = kitnet
            ? `Imóvel: ${kitnet.name}`
            : 'Despesa vinculada às Kitnets';
        } else {
          subtitleText = 'Despesa operacional';
        }

        if (days < 0) {
          const daysLate = Math.abs(days);
          list.push({
            id: `alert-exp-late-${exp.id}`,
            expenseId: exp.id,
            type: 'critical',
            categoryKind: 'expense',
            specificExpenseCategory: exp.category,
            categoryLabel: readableCategory,
            title: mainTitle,
            subtitle: subtitleText,
            amount: exp.amount,
            dueDate: exp.dueDate,
            statusLabel: daysLate > 0 ? `Vencida há ${daysLate}d` : `Venceu em ${formatDate(exp.dueDate)}`,
            statusSeverity: 'critical',
            actionLabel: 'Pagar',
            actionTab: 'financeiro',
          });
        } else if (days <= 3) {
          list.push({
            id: `alert-exp-soon-${exp.id}`,
            expenseId: exp.id,
            type: 'info',
            categoryKind: 'expense',
            specificExpenseCategory: exp.category,
            categoryLabel: readableCategory,
            title: mainTitle,
            subtitle: subtitleText,
            amount: exp.amount,
            dueDate: exp.dueDate,
            statusLabel: days === 0 ? 'Vence Hoje' : `Vence em ${days}d`,
            statusSeverity: days === 0 ? 'warning' : 'info',
            actionLabel: 'Pagar',
            actionTab: 'financeiro',
          });
        }
      }
    });

    // 5. IPVA das Motos
    const today = new Date();
    motos.forEach((m) => {
      if (m.ipvaDueDate) {
        const diffDays = Math.ceil((new Date(m.ipvaDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          list.push({
            id: `alert-ipva-late-${m.id}`,
            type: 'critical',
            categoryKind: 'ipva',
            categoryLabel: 'IPVA',
            title: `${m.brand} ${m.model} (${m.plate})`,
            subtitle: `Venceu em ${formatDate(m.ipvaDueDate)} • IPVA do veículo`,
            statusLabel: 'IPVA Vencido',
            statusSeverity: 'critical',
            actionLabel: 'Ver Moto',
            actionTab: 'motos',
          });
        } else if (diffDays <= 15) {
          list.push({
            id: `alert-ipva-soon-${m.id}`,
            type: 'warning',
            categoryKind: 'ipva',
            categoryLabel: 'IPVA',
            title: `${m.brand} ${m.model} (${m.plate})`,
            subtitle: `Vencimento do IPVA em ${diffDays === 0 ? 'hoje' : `${diffDays} dias`}`,
            statusLabel: diffDays === 0 ? 'Vence Hoje' : `Vence em ${diffDays}d`,
            statusSeverity: diffDays === 0 ? 'warning' : 'info',
            actionLabel: 'Ver Moto',
            actionTab: 'motos',
          });
        }
      }
    });

    // Ordenação: Críticos primeiro, depois avisos e informativos
    return list.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    });
  }, [motoContracts, kitnetContracts, motos, motoTenants, kitnets, expenses]);

  // Contagens para os filtros
  const counts = useMemo(() => {
    const critical = alerts.filter((a) => a.type === 'critical').length;
    const expense = alerts.filter((a) => a.categoryKind === 'expense').length;
    const rental = alerts.filter((a) => a.categoryKind === 'moto' || a.categoryKind === 'kitnet').length;
    const documentos = alerts.filter((a) => a.categoryKind === 'cnh').length;
    return { all: alerts.length, critical, expense, rental, documentos };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'critical') return alerts.filter((a) => a.type === 'critical');
    if (activeFilter === 'expense') return alerts.filter((a) => a.categoryKind === 'expense');
    if (activeFilter === 'rental') return alerts.filter((a) => a.categoryKind === 'moto' || a.categoryKind === 'kitnet');
    if (activeFilter === 'documentos') return alerts.filter((a) => a.categoryKind === 'cnh');
    return alerts;
  }, [alerts, activeFilter]);

  const handlePayExpenseDirectly = (expId: string) => {
    payExpense(expId);
    setJustPaidId(expId);
    setTimeout(() => {
      setJustPaidId(null);
    }, 1500);
  };

  if (!isOpen) return null;

  // Renderiza ícone específico com paleta elegante
  const renderItemIcon = (item: AlertItem) => {
    if (item.categoryKind === 'moto') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#E07A3F]/10 border border-[#E07A3F]/25 flex items-center justify-center text-[#E07A3F] shrink-0">
          <Motorbike className="w-5 h-5" />
        </div>
      );
    }
    if (item.categoryKind === 'kitnet') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/25 flex items-center justify-center text-[#0EA5E9] shrink-0">
          <Home className="w-5 h-5" />
        </div>
      );
    }
    if (item.categoryKind === 'cnh') {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
      );
    }
    if (item.categoryKind === 'ipva') {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      );
    }

    // Despesas por categoria
    const cat = item.specificExpenseCategory?.toLowerCase() || '';
    if (cat.includes('internet')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
          <Wifi className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('agua') || cat.includes('água')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
          <Droplets className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('energia') || cat.includes('luz')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
          <Zap className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('manut') || cat.includes('repar') || cat.includes('reform')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shrink-0">
          <Wrench className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('seguro')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes('iptu')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
        <Receipt className="w-5 h-5" />
      </div>
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#0D1017] border border-white/[0.08] rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto min-w-0 animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Limpo e Elegante */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#11141E] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight truncate">
                  Central de Notificações
                </h2>
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                    {alerts.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {counts.critical > 0
                  ? `${counts.critical} pendência(s) urgente(s)`
                  : alerts.length > 0
                  ? 'Avisos e vencimentos programados'
                  : 'Tudo em dia no momento'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer border border-transparent hover:border-white/[0.08] shrink-0"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filtros de topo padronizados e com cores harmonizadas com os ícones */}
        {alerts.length > 0 && (
          <div className="px-3 sm:px-4 py-2.5 bg-[#090C12] border-b border-white/[0.05] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 select-none active:scale-95 ${
                activeFilter === 'all'
                  ? 'bg-white/[0.16] text-white shadow-xs border border-white/30 font-bold'
                  : 'bg-[#131622] text-slate-400 hover:text-slate-200 hover:bg-[#1C2030] border border-white/[0.08]'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="shrink-0">Todos</span>
              <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center justify-center leading-none tabular-nums ${
                activeFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/[0.08] text-slate-400'
              }`}>
                {counts.all}
              </span>
            </button>

            {counts.critical > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('critical')}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 select-none active:scale-95 ${
                  activeFilter === 'critical'
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50 shadow-xs font-bold'
                    : 'bg-[#131622] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/[0.08]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="shrink-0">Atrasados</span>
                <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center justify-center leading-none tabular-nums ${
                  activeFilter === 'critical'
                    ? 'bg-rose-500/30 text-rose-100 border border-rose-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                }`}>
                  {counts.critical}
                </span>
              </button>
            )}

            {counts.expense > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('expense')}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 select-none active:scale-95 ${
                  activeFilter === 'expense'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-xs font-bold'
                    : 'bg-[#131622] text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-white/[0.08]'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="shrink-0">Despesas</span>
                <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center justify-center leading-none tabular-nums ${
                  activeFilter === 'expense'
                    ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-500/30'
                    : 'bg-white/[0.08] text-slate-400'
                }`}>
                  {counts.expense}
                </span>
              </button>
            )}

            {counts.rental > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('rental')}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 select-none active:scale-95 ${
                  activeFilter === 'rental'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/50 shadow-xs font-bold'
                    : 'bg-[#131622] text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 border border-white/[0.08]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="shrink-0">Locações</span>
                <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center justify-center leading-none tabular-nums ${
                  activeFilter === 'rental'
                    ? 'bg-sky-500/30 text-sky-100 border border-sky-500/30'
                    : 'bg-white/[0.08] text-slate-400'
                }`}>
                  {counts.rental}
                </span>
              </button>
            )}

            {counts.documentos > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('documentos')}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 select-none active:scale-95 ${
                  activeFilter === 'documentos'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-xs font-bold'
                    : 'bg-[#131622] text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-white/[0.08]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="shrink-0">Documentos</span>
                <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center justify-center leading-none tabular-nums ${
                  activeFilter === 'documentos'
                    ? 'bg-amber-500/30 text-amber-100 border border-amber-500/30'
                    : 'bg-white/[0.08] text-slate-400'
                }`}>
                  {counts.documentos}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Lista de Alertas */}
        <div
          className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 overscroll-contain bg-[#090C12]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filteredAlerts.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Tudo em Dia!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Não há cobranças atrasadas, CNHs vencendo ou contas pendentes no momento.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.type === 'critical';
              const isWhatsAppAction = alert.actionLabel.toLowerCase().includes('whatsapp');
              const isExpense = alert.categoryKind === 'expense' && alert.expenseId;
              const isPaidJustNow = alert.expenseId && justPaidId === alert.expenseId;

              return (
                <div
                  key={alert.id}
                  className="bg-[#11141E] hover:bg-[#151926] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3 sm:p-3.5 transition-all duration-150 shadow-xs flex items-center justify-between gap-3 group"
                >
                  {/* Left: Icon + Text block */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {renderItemIcon(alert)}

                    <div className="min-w-0 flex-1 space-y-0.5">
                      {/* Line 1: Title + Amount */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-slate-100">
                          {alert.title}
                        </h4>
                        {alert.amount !== undefined && (
                          <span className="text-xs sm:text-sm font-bold text-white tabular-nums shrink-0">
                            {formatCurrency(alert.amount)}
                          </span>
                        )}
                      </div>

                      {/* Line 2: Subtitle */}
                      <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                        {alert.subtitle}
                      </p>

                      {/* Line 3: Tag chips */}
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        {/* Status Tag */}
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0 ${
                            isCritical
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : alert.statusSeverity === 'warning'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-white/[0.05] text-slate-300 border border-white/[0.08]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isCritical
                                ? 'bg-rose-400 animate-pulse'
                                : alert.statusSeverity === 'warning'
                                ? 'bg-amber-400'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{alert.statusLabel}</span>
                        </span>

                        {/* Category Label */}
                        <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 rounded-md bg-white/[0.03]">
                          {alert.categoryLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button - Standardized h-8 and icon-matched colors */}
                  <div className="shrink-0 flex items-center">
                    {isExpense ? (
                      <button
                        type="button"
                        disabled={isPaidJustNow}
                        onClick={() => {
                          if (alert.expenseId) {
                            handlePayExpenseDirectly(alert.expenseId);
                          }
                        }}
                        className={`h-8 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs active:scale-95 ${
                          isPaidJustNow
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        }`}
                        title="Marcar conta como paga"
                      >
                        {isPaidJustNow ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Pago!</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pagar</span>
                          </>
                        )}
                      </button>
                    ) : isWhatsAppAction ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (alert.contractId && handleWhatsApp) {
                            handleWhatsApp(alert.contractId, alert.installmentId);
                          }
                        }}
                        className="h-8 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cobrar</span>
                        <span className="sm:hidden">WhatsApp</span>
                      </button>
                    ) : (
                      (() => {
                        const isMoto = alert.categoryKind === 'moto' || alert.actionTab === 'motos';
                        const isKitnet = alert.categoryKind === 'kitnet' || alert.actionTab === 'kitnets';
                        const isDoc = alert.categoryKind === 'cnh';
                        const isIpva = alert.categoryKind === 'ipva';

                        let btnColorClasses = 'bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.12] text-slate-200 hover:text-white';
                        if (isMoto) {
                          btnColorClasses = 'bg-orange-500/15 hover:bg-orange-500/25 border-orange-500/30 text-orange-300 hover:text-orange-200';
                        } else if (isKitnet) {
                          btnColorClasses = 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/30 text-sky-300 hover:text-sky-200';
                        } else if (isDoc) {
                          btnColorClasses = 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300 hover:text-rose-200';
                        } else if (isIpva) {
                          btnColorClasses = 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300 hover:text-amber-200';
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (alert.actionTab && onNavigateToTab) {
                                onNavigateToTab(alert.actionTab);
                              }
                            }}
                            className={`h-8 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 select-none ${btnColorClasses}`}
                          >
                            <span>Ver</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        );
                      })()
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Minimalista */}
        <div className="p-3 sm:p-3.5 border-t border-white/[0.06] bg-[#11141E] flex items-center justify-between shrink-0 gap-2">
          <span className="text-[11px] text-slate-500 font-medium">
            {alerts.length === 1
              ? '1 pendência encontrada'
              : `${alerts.length} pendências encontradas`}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95 cursor-pointer ml-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
