import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Motorbike,
  Home,
  Users,
  DollarSign,
  ArrowRight,
  Sparkles,
  BadgeAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getTodayLocalDateString } from '../domain';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, itemId?: string) => void;
}

type FilterCategory = 'all' | 'motos' | 'kitnets' | 'clientes' | 'despesas' | 'atrasos';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const {
    motos,
    kitnets,
    motoTenants,
    kitnetTenants,
    motoContracts,
    kitnetContracts,
    expenses,
  } = useApp();

  useBodyScrollLock(isOpen);

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  // Global keydown for Cmd+K / Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cleanText = (str?: string) =>
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Overdue installments
  const overduePayments = useMemo(() => {
    const today = getTodayLocalDateString();
    const items: Array<{
      id: string;
      title: string;
      tenantName: string;
      type: 'moto' | 'kitnet';
      amount: number;
      dueDate: string;
      targetTab: string;
    }> = [];

    motoContracts.forEach((c) => {
      const tenant = motoTenants.find((t) => t.id === c.tenantId);
      const moto = motos.find((m) => m.id === c.motoId);
      c.installments.forEach((inst) => {
        if (inst.status !== 'pago' && inst.dueDate < today) {
          items.push({
            id: `${c.id}-${inst.id}`,
            title: `Parcela #${inst.number} • Moto ${moto ? moto.model : ''}`,
            tenantName: tenant?.fullName || 'Locatário',
            type: 'moto',
            amount: inst.amount,
            dueDate: inst.dueDate,
            targetTab: 'cobrancas',
          });
        }
      });
    });

    kitnetContracts.forEach((c) => {
      const tenant = kitnetTenants.find((t) => t.id === c.tenantId);
      const kitnet = kitnets.find((k) => k.id === c.kitnetId);
      c.installments.forEach((inst) => {
        if (inst.status !== 'pago' && inst.dueDate < today) {
          items.push({
            id: `${c.id}-${inst.id}`,
            title: `Aluguel #${inst.number} • Kitnet ${kitnet ? kitnet.number : ''}`,
            tenantName: tenant?.fullName || 'Inquilino',
            type: 'kitnet',
            amount: inst.amount,
            dueDate: inst.dueDate,
            targetTab: 'cobrancas',
          });
        }
      });
    });

    return items;
  }, [motoContracts, kitnetContracts, motoTenants, kitnetTenants, motos, kitnets]);

  const searchResults = useMemo(() => {
    const q = cleanText(query.trim());

    // Filter Motos
    const matchedMotos = motos.filter((m) => {
      if (!q) return activeCategory === 'motos';
      return (
        cleanText(m.model).includes(q) ||
        cleanText(m.brand).includes(q) ||
        cleanText(m.plate).includes(q) ||
        cleanText(m.chassi).includes(q) ||
        cleanText(m.renavam).includes(q) ||
        cleanText(m.status).includes(q)
      );
    });

    // Filter Kitnets
    const matchedKitnets = kitnets.filter((k) => {
      if (!q) return activeCategory === 'kitnets';
      return (
        cleanText(k.name).includes(q) ||
        cleanText(k.number).includes(q) ||
        cleanText(k.address).includes(q) ||
        cleanText(k.status).includes(q)
      );
    });

    // Filter Moto Tenants
    const matchedMotoTenants = motoTenants.filter((t) => {
      if (!q) return activeCategory === 'clientes';
      return (
        cleanText(t.fullName).includes(q) ||
        cleanText(t.cpf).includes(q) ||
        cleanText(t.phone).includes(q) ||
        cleanText(t.email).includes(q)
      );
    });

    // Filter Kitnet Tenants
    const matchedKitnetTenants = kitnetTenants.filter((t) => {
      if (!q) return activeCategory === 'clientes';
      return (
        cleanText(t.fullName).includes(q) ||
        cleanText(t.cpf).includes(q) ||
        cleanText(t.phone).includes(q) ||
        cleanText(t.email).includes(q)
      );
    });

    // Filter Expenses
    const matchedExpenses = expenses.filter((e) => {
      if (!q) return activeCategory === 'despesas';
      return (
        cleanText(e.title).includes(q) ||
        cleanText(e.category).includes(q) ||
        cleanText(e.notes).includes(q)
      );
    });

    // Filter Overdue
    const matchedOverdue = overduePayments.filter((item) => {
      if (!q) return activeCategory === 'atrasos';
      return (
        cleanText(item.title).includes(q) ||
        cleanText(item.tenantName).includes(q)
      );
    });

    const isSearching = q.length >= 2 || activeCategory !== 'all';

    return {
      isSearching,
      motos: activeCategory === 'all' || activeCategory === 'motos' ? matchedMotos : [],
      kitnets: activeCategory === 'all' || activeCategory === 'kitnets' ? matchedKitnets : [],
      motoTenants: activeCategory === 'all' || activeCategory === 'clientes' ? matchedMotoTenants : [],
      kitnetTenants: activeCategory === 'all' || activeCategory === 'clientes' ? matchedKitnetTenants : [],
      expenses: activeCategory === 'all' || activeCategory === 'despesas' ? matchedExpenses : [],
      overdue: activeCategory === 'all' || activeCategory === 'atrasos' ? matchedOverdue : [],
      totalCount:
        (activeCategory === 'all' || activeCategory === 'motos' ? matchedMotos.length : 0) +
        (activeCategory === 'all' || activeCategory === 'kitnets' ? matchedKitnets.length : 0) +
        (activeCategory === 'all' || activeCategory === 'clientes' ? matchedMotoTenants.length + matchedKitnetTenants.length : 0) +
        (activeCategory === 'all' || activeCategory === 'despesas' ? matchedExpenses.length : 0) +
        (activeCategory === 'all' || activeCategory === 'atrasos' ? matchedOverdue.length : 0),
    };
  }, [query, activeCategory, motos, kitnets, motoTenants, kitnetTenants, expenses, overduePayments]);

  if (!isOpen) return null;

  interface FilterChipConfig {
    id: FilterCategory;
    label: string;
    count: number;
    icon: React.ReactNode;
    activeClass: string;
    activeBadgeClass: string;
  }

  const quickFilterChips: FilterChipConfig[] = [
    {
      id: 'all',
      label: 'Tudo',
      count: motos.length + kitnets.length + motoTenants.length + kitnetTenants.length + expenses.length,
      icon: <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />,
      activeClass: 'bg-violet-500/20 text-violet-200 border-violet-500/50 shadow-xs font-bold',
      activeBadgeClass: 'bg-violet-500/30 text-violet-100 border border-violet-500/30',
    },
    {
      id: 'motos',
      label: 'Motos',
      count: motos.length,
      icon: <Motorbike className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
      activeClass: 'bg-orange-500/20 text-orange-200 border-orange-500/50 shadow-xs font-bold',
      activeBadgeClass: 'bg-orange-500/30 text-orange-100 border border-orange-500/30',
    },
    {
      id: 'kitnets',
      label: 'Kitnets',
      count: kitnets.length,
      icon: <Home className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
      activeClass: 'bg-sky-500/20 text-sky-200 border-sky-500/50 shadow-xs font-bold',
      activeBadgeClass: 'bg-sky-500/30 text-sky-100 border border-sky-500/30',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      count: motoTenants.length + kitnetTenants.length,
      icon: <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
      activeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-xs font-bold',
      activeBadgeClass: 'bg-emerald-500/30 text-emerald-100 border border-emerald-500/30',
    },
    {
      id: 'despesas',
      label: 'Despesas',
      count: expenses.length,
      icon: <DollarSign className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
      activeClass: 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-xs font-bold',
      activeBadgeClass: 'bg-rose-500/30 text-rose-100 border border-rose-500/30',
    },
    {
      id: 'atrasos',
      label: 'Em Atraso',
      count: overduePayments.length,
      icon: <BadgeAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
      activeClass: 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-xs font-bold',
      activeBadgeClass: 'bg-amber-500/30 text-amber-100 border border-amber-500/30',
    },
  ];

  const handleSelectQuickSuggestion = (text: string, category: FilterCategory = 'all') => {
    setQuery(text);
    setActiveCategory(category);
    inputRef.current?.focus();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-2.5 sm:p-3 pt-4 sm:pt-16 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl max-w-2xl w-full min-w-0 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] transition-all animate-modal-enter">
        {/* Search Header */}
        <div className="p-3 sm:p-4 border-b border-[#2A2A2E] bg-[#121214] flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por placa, cliente, kitnet, CPF..."
            className="w-full bg-transparent border-none text-[#F2F1ED] placeholder-[#9C9CA3] text-xs sm:text-base font-medium focus:outline-none focus:ring-0 min-w-0"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg bg-[#1C1C1F] text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#2A2A2E] cursor-pointer transition-colors shrink-0"
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-lg bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs font-semibold text-[#9C9CA3] hover:text-[#F2F1ED] transition-colors cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>

        {/* Quick Filter Categories Bar - Standardized sizes & exact icon-matched colors */}
        <div className="px-3 sm:px-4 py-2.5 bg-[#17171A] border-b border-[#2A2A2E] overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          {quickFilterChips.map((chip) => {
            const isSelected = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveCategory(chip.id)}
                className={`h-9 px-3.5 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border select-none active:scale-95 ${
                  isSelected
                    ? chip.activeClass
                    : 'bg-[#151518] hover:bg-[#1E1E24] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                }`}
              >
                {chip.icon}
                <span className="shrink-0">{chip.label}</span>
                <span
                  className={`text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold inline-flex items-center justify-center shrink-0 leading-none tabular-nums ${
                    isSelected
                      ? chip.activeBadgeClass
                      : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results / Suggestions Container */}
        <div 
          className="overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-5 modal-scroll-container overscroll-contain flex-1 w-full max-w-full"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overflowX: 'hidden' }}
        >
          {/* Empty Search State: Quick Actions & Suggestions */}
          {!searchResults.isSearching && (
            <div className="space-y-5 py-2">
              <div className="text-center py-4 text-[#9C9CA3]">
                <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mx-auto mb-3 flex items-center justify-center text-[#8B5CF6]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#F2F1ED]">Busca Global Unificada</h3>
                <p className="text-xs text-[#9C9CA3] mt-1 max-w-sm mx-auto">
                  Localize rapidamente qualquer veículo, inquilino, imóvel, boleto ou despesa em tempo real.
                </p>
              </div>

              {/* Quick Suggestion Buttons */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#9C9CA3] mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Atalhos de Busca Frequentes</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectQuickSuggestion('', 'atrasos')}
                    className="p-3 rounded-xl bg-[#121214] hover:bg-[#EF4444]/10 border border-[#2A2A2E] hover:border-[#EF4444]/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#EF4444] mb-1">
                      <BadgeAlert className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono">{overduePayments.length}</span>
                    </div>
                    <div className="text-xs font-bold text-[#F2F1ED] group-hover:text-[#EF4444] transition-colors">
                      Aluguéis em Atraso
                    </div>
                    <div className="text-[11px] text-[#9C9CA3]">Cobranças pendentes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuickSuggestion('disponivel', 'motos')}
                    className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#8B5CF6]/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#8B5CF6] mb-1">
                      <Motorbike className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono">
                        {motos.filter((m) => m.status === 'disponivel').length}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#F2F1ED] group-hover:text-[#8B5CF6] transition-colors">
                      Motos Disponíveis
                    </div>
                    <div className="text-[11px] text-[#9C9CA3]">Prontas para locação</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuickSuggestion('ocupada', 'kitnets')}
                    className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#0EA5E9]/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#0EA5E9] mb-1">
                      <Home className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono">
                        {kitnets.filter((k) => k.status === 'alugada').length}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#F2F1ED] group-hover:text-[#0EA5E9] transition-colors">
                      Kitnets Ocupadas
                    </div>
                    <div className="text-[11px] text-[#9C9CA3]">Contratos ativos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectQuickSuggestion('', 'clientes')}
                    className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#10B981]/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[#10B981] mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-bold font-mono">
                        {motoTenants.length + kitnetTenants.length}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#F2F1ED] group-hover:text-[#10B981] transition-colors">
                      Base de Clientes
                    </div>
                    <div className="text-[11px] text-[#9C9CA3]">Scores e contatos</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No results found */}
          {searchResults.isSearching && searchResults.totalCount === 0 && (
            <div className="text-center py-12 text-[#9C9CA3] text-sm">
              <p className="font-semibold text-[#F2F1ED]">Nenhum resultado encontrado para "{query}".</p>
              <p className="text-xs text-[#9C9CA3] mt-1">Verifique o termo ou tente remover filtros de categoria.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] text-[#8B5CF6] border border-[#2A2A2E] text-xs font-semibold cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Render Active Results */}
          {searchResults.isSearching && searchResults.totalCount > 0 && (
            <div className="space-y-5">
              {/* Overdue Payments Section */}
              {searchResults.overdue.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#EF4444] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BadgeAlert className="w-3.5 h-3.5" />
                      Em Atraso ({searchResults.overdue.length})
                    </span>
                    <span className="text-[10px] font-normal lowercase">Cobrança Imediata</span>
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.overdue.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onNavigate('cobrancas');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#121214] hover:bg-[#EF4444]/10 border border-[#2A2A2E] hover:border-[#EF4444]/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center justify-center font-bold text-xs shrink-0">
                            <BadgeAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F2F1ED] group-hover:text-[#EF4444] transition-colors">
                              {item.title}
                            </div>
                            <div className="text-xs text-[#9C9CA3] flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-[#F2F1ED] font-medium">{item.tenantName}</span>
                              <span>•</span>
                              <span className="text-[#EF4444] font-bold">{formatCurrency(item.amount)}</span>
                              <span>•</span>
                              <span>Venceu em: {formatDate(item.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#9C9CA3] group-hover:text-[#EF4444] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motos Section */}
              {searchResults.motos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] mb-2 flex items-center gap-1.5">
                    <Motorbike className="w-3.5 h-3.5" />
                    Motos ({searchResults.motos.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.motos.map((moto) => (
                      <div
                        key={moto.id}
                        onClick={() => {
                          onNavigate('motos', moto.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#8B5CF6]/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 flex items-center justify-center font-bold text-xs shrink-0">
                            <Motorbike className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F2F1ED] group-hover:text-[#8B5CF6] transition-colors">
                              {moto.brand} {moto.model} ({moto.year})
                            </div>
                            <div className="text-xs text-[#9C9CA3] flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="font-mono bg-[#1C1C1F] border border-[#2A2A2E] px-1.5 py-0.5 rounded text-[#F2F1ED]">
                                {moto.plate || 'SEM PLACA'}
                              </span>
                              <span>•</span>
                              <span>KM: {moto.currentKm.toLocaleString('pt-BR')}</span>
                              <span>•</span>
                              <span
                                className={`capitalize font-bold ${
                                  moto.status === 'alugada'
                                    ? 'text-[#10B981]'
                                    : moto.status === 'disponivel'
                                    ? 'text-[#E07A3F]'
                                    : 'text-[#8B5CF6]'
                                }`}
                              >
                                {moto.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9C9CA3] group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kitnets Section */}
              {searchResults.kitnets.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0EA5E9] mb-2 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    Kitnets ({searchResults.kitnets.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.kitnets.map((kitnet) => (
                      <div
                        key={kitnet.id}
                        onClick={() => {
                          onNavigate('kitnets', kitnet.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#0EA5E9]/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 flex items-center justify-center font-bold text-xs shrink-0">
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F2F1ED] group-hover:text-[#0EA5E9] transition-colors">
                              {kitnet.name} • Unidade {kitnet.number}
                            </div>
                            <div className="text-xs text-[#9C9CA3] flex flex-wrap items-center gap-2 mt-0.5">
                              <span>Aluguel: {formatCurrency(kitnet.monthlyRentBase)}</span>
                              <span>•</span>
                              <span className="truncate max-w-[180px] sm:max-w-xs">{kitnet.address}</span>
                              <span>•</span>
                              <span className={`capitalize font-bold ${kitnet.status === 'alugada' ? 'text-[#10B981]' : 'text-[#0EA5E9]'}`}>
                                {kitnet.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9C9CA3] group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientes Locatários */}
              {(searchResults.motoTenants.length > 0 || searchResults.kitnetTenants.length > 0) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#10B981] mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Clientes / Locatários ({searchResults.motoTenants.length + searchResults.kitnetTenants.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.motoTenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        onClick={() => {
                          onNavigate('clientes', tenant.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#10B981]/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center justify-center font-bold text-xs shrink-0">
                            {tenant.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F2F1ED] group-hover:text-[#10B981] transition-colors flex items-center gap-2">
                              <span>{tenant.fullName}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#E07A3F]/15 text-[#E07A3F] border border-[#E07A3F]/30 font-bold">
                                Locatário Moto
                              </span>
                            </div>
                            <div className="text-xs text-[#9C9CA3] flex flex-wrap items-center gap-2 mt-0.5">
                              <span>CPF: {tenant.cpf}</span>
                              <span>•</span>
                              <span>Tel: {tenant.phone}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9C9CA3] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}

                    {searchResults.kitnetTenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        onClick={() => {
                          onNavigate('clientes', tenant.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#0EA5E9]/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 flex items-center justify-center font-bold text-xs shrink-0">
                            {tenant.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F2F1ED] group-hover:text-[#0EA5E9] transition-colors flex items-center gap-2">
                              <span>{tenant.fullName}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30 font-bold">
                                Inquilino Kitnet
                              </span>
                            </div>
                            <div className="text-xs text-[#9C9CA3] flex flex-wrap items-center gap-2 mt-0.5">
                              <span>CPF: {tenant.cpf}</span>
                              <span>•</span>
                              <span>Tel: {tenant.phone}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9C9CA3] group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Despesas */}
              {searchResults.expenses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#EF4444] mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Despesas ({searchResults.expenses.length})
                  </h4>
                  <div className="space-y-1.5">
                    {searchResults.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => {
                          onNavigate('financeiro');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[#121214] hover:bg-[#2A2A2E] border border-[#2A2A2E] hover:border-[#EF4444]/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 flex items-center justify-center font-bold text-xs shrink-0">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F2F1ED] group-hover:text-[#EF4444] transition-colors">
                              {exp.title}
                            </div>
                            <div className="text-xs text-[#9C9CA3] flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="text-[#EF4444] font-bold">{formatCurrency(exp.amount)}</span>
                              <span>•</span>
                              <span>Vencimento: {formatDate(exp.dueDate)}</span>
                              <span>•</span>
                              <span className="capitalize">{exp.category.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9C9CA3] group-hover:text-[#EF4444] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-[#121214] border-t border-[#2A2A2E] flex items-center justify-between text-xs text-[#9C9CA3]">
          <span className="truncate">Clique no item para abrir direto no módulo</span>
          <span className="hidden sm:inline font-mono text-[11px]">ESC para fechar</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
