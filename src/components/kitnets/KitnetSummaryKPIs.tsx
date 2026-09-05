import React from 'react';
import { Plus, Percent, ShieldCheck, Home, Crosshair } from 'lucide-react';
import { AnimatedNumber } from '../AnimatedNumber';

interface KitnetSummaryKPIsProps {
  totalUnits: number;
  occupancyPercentage: number;
  occupiedUnits: number;
  activeMonthlyRevenue: number;
  availableUnits: number;
  inRenovationUnits: number;
  isMobileDetailOpen: boolean;
  onAddNewKitnet: () => void;
  onFilterClick?: (filter: string) => void;
}

export const KitnetSummaryKPIs: React.FC<KitnetSummaryKPIsProps> = ({
  totalUnits,
  occupancyPercentage,
  occupiedUnits,
  activeMonthlyRevenue,
  availableUnits,
  inRenovationUnits,
  isMobileDetailOpen,
  onAddNewKitnet,
  onFilterClick,
}) => {
  return (
    <div
      className={`bg-[#0B0E17] rounded-2xl border border-white/[0.08] p-4 sm:p-5 shadow-lg shadow-black/40 ${
        isMobileDetailOpen ? 'hidden lg:block' : 'block'
      }`}
    >
      {/* Header with Title, Badge and "+ Nova Kitnet" button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Administração de Kitnets
          </h1>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#211A3E] text-[#A78BFA] border border-[#8B5CF6]/30">
            {totalUnits} {totalUnits === 1 ? 'unidade' : 'unidades'}
          </span>
        </div>

        <button
          id="btn-add-kitnet-main"
          type="button"
          onClick={onAddNewKitnet}
          className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-[#6D28D9]/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Kitnet</span>
        </button>
      </div>

      {/* Compact 4-Metric Grid (2x2 on mobile, 4 columns on tablet/desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-3.5 sm:mt-4">
        {/* 1. Total de Unidades */}
        <div
          onClick={() => onFilterClick && onFilterClick('todos')}
          className="bg-[#101322] rounded-xl p-3 sm:p-3.5 border border-white/[0.05] hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-[#94A3B8] font-medium truncate">
              Total Unidades
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#1C1736] flex items-center justify-center text-[#A78BFA] shrink-0 border border-[#8B5CF6]/20">
              <Home className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              <AnimatedNumber value={totalUnits} />
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#64748B] block mt-0.5 truncate">
              {totalUnits} cadastradas
            </span>
          </div>
        </div>

        {/* 2. Taxa de Ocupação */}
        <div
          onClick={() => onFilterClick && onFilterClick('alugada')}
          className="bg-[#101322] rounded-xl p-3 sm:p-3.5 border border-white/[0.05] hover:border-[#10B981]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-[#94A3B8] font-medium truncate">
              Ocupação
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0D2821] flex items-center justify-center text-[#10B981] shrink-0 border border-[#10B981]/20">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-lg sm:text-xl font-bold text-[#10B981] tracking-tight">
              <AnimatedNumber value={occupancyPercentage} format="percent" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
                {occupiedUnits}/{totalUnits} alugadas
              </span>
            </div>
          </div>
        </div>

        {/* 3. Receita Mensal Ativa */}
        <div
          onClick={() => onFilterClick && onFilterClick('alugada')}
          className="bg-[#101322] rounded-xl p-3 sm:p-3.5 border border-white/[0.05] hover:border-[#10B981]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-[#94A3B8] font-medium truncate">
              Receita Mensal
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0D2821] flex items-center justify-center text-[#10B981] shrink-0 border border-[#10B981]/20">
              <Crosshair className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-lg sm:text-xl font-bold text-[#10B981] tracking-tight truncate">
              <AnimatedNumber value={activeMonthlyRevenue} format="currency" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#64748B] block mt-0.5 truncate">
              Aluguel + água
            </span>
          </div>
        </div>

        {/* 4. Disponíveis / Reforma */}
        <div
          onClick={() => onFilterClick && onFilterClick(inRenovationUnits > 0 ? 'reforma' : 'disponivel')}
          className="bg-[#101322] rounded-xl p-3 sm:p-3.5 border border-white/[0.05] hover:border-[#0EA5E9]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-[#94A3B8] font-medium truncate">
              Disp. / Reforma
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0C2238] flex items-center justify-center text-[#38BDF8] shrink-0 border border-[#0EA5E9]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {availableUnits} / {inRenovationUnits}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#64748B] block mt-0.5 truncate">
              {availableUnits} livres • {inRenovationUnits} ref.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
