import React from 'react';
import { Search, Motorbike, Home, AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface BillingFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: 'todos' | 'moto' | 'kitnet';
  setFilterType: (type: 'todos' | 'moto' | 'kitnet') => void;
  activeCategory: 'todos' | 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia';
  setActiveCategory: (cat: 'todos' | 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia') => void;
  motosCount: number;
  kitnetsCount: number;
  atrasadosCount: number;
  vencendoHojeCount: number;
  proximos7DiasCount: number;
  emDiaCount: number;
  totalCount: number;
}

export const BillingFilters: React.FC<BillingFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  activeCategory,
  setActiveCategory,
  motosCount,
  kitnetsCount,
  atrasadosCount,
  vencendoHojeCount,
  proximos7DiasCount,
  emDiaCount,
  totalCount,
}) => {
  return (
    <div className="bg-[#141418] border border-white/[0.06] p-4 rounded-xl space-y-3">
      {/* Top row: Search and Asset Type */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9AA2]" />
          <input
            type="text"
            placeholder="Buscar por cliente, placa, CPF ou kitnet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E1D24] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-[#F5F5F7] placeholder-[#9A9AA2]/60 focus:outline-none focus:border-[#8B5CF6] transition-all"
          />
        </div>

        {/* Asset Type Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterType('todos')}
            className={`shrink-0 min-w-max px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterType === 'todos'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#F5F5F7] border border-white/[0.06]'
            }`}
          >
            Todos os Ativos ({motosCount + kitnetsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('moto')}
            className={`shrink-0 min-w-max px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterType === 'moto'
                ? 'bg-[#E07A3F] text-white shadow-sm'
                : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#F5F5F7] border border-white/[0.06]'
            }`}
          >
            <Motorbike className="w-3.5 h-3.5 shrink-0" />
            <span>Motos ({motosCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('kitnet')}
            className={`shrink-0 min-w-max px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterType === 'kitnet'
                ? 'bg-[#0EA5E9] text-white shadow-sm'
                : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#F5F5F7] border border-white/[0.06]'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>Kitnets ({kitnetsCount})</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Status Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/[0.06] pb-1 scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory('todos')}
          className={`shrink-0 min-w-max px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCategory === 'todos'
              ? 'bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/50 shadow-sm'
              : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#F5F5F7] border border-white/[0.06]'
          }`}
        >
          <span className="shrink-0 whitespace-nowrap">Todos</span>
          <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/[0.10] text-[#F5F5F7] text-[11px] font-bold tabular-nums">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('atrasado')}
          className={`shrink-0 min-w-max px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCategory === 'atrasado'
              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 shadow-sm font-bold'
              : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#EF4444] border border-white/[0.06]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
          <span className="shrink-0 whitespace-nowrap">Atrasados</span>
          <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF4444]/20 text-[#EF4444] text-[11px] font-bold tabular-nums">
            {atrasadosCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('vencendo_hoje')}
          className={`shrink-0 min-w-max px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCategory === 'vencendo_hoje'
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 shadow-sm font-bold'
              : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#F59E0B] border border-white/[0.06]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
          <span className="shrink-0 whitespace-nowrap">Vencendo Hoje</span>
          <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-[11px] font-bold tabular-nums">
            {vencendoHojeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('proximos_7_dias')}
          className={`shrink-0 min-w-max px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCategory === 'proximos_7_dias'
              ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/50 shadow-sm font-bold'
              : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#8B5CF6] border border-white/[0.06]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
          <span className="shrink-0 whitespace-nowrap">Próximos 7 Dias</span>
          <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-[11px] font-bold tabular-nums">
            {proximos7DiasCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('em_dia')}
          className={`shrink-0 min-w-max px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeCategory === 'em_dia'
              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 shadow-sm font-bold'
              : 'bg-[#1E1D24] text-[#9A9AA2] hover:text-[#10B981] border border-white/[0.06]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
          <span className="shrink-0 whitespace-nowrap">Em Dia</span>
          <span className="shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-[11px] font-bold tabular-nums">
            {emDiaCount}
          </span>
        </button>
      </div>
    </div>
  );
};
