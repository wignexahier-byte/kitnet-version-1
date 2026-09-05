import React from 'react';
import { Plus, Percent, ShieldCheck, Motorbike, Crosshair, Calculator } from 'lucide-react';
import { AnimatedNumber } from '../AnimatedNumber';

interface MotoSummaryKPIsProps {
  totalMotos: number;
  occupancyPercentage: number;
  occupiedMotos: number;
  activeMonthlyRevenue: number;
  activeWeeklyRevenue?: number;
  availableMotos: number;
  maintenanceMotos: number;
  onAddNewMoto: () => void;
  onOpenSimulator?: () => void;
  onFilterClick?: (filter: string) => void;
}

export const MotoSummaryKPIs: React.FC<MotoSummaryKPIsProps> = ({
  totalMotos,
  occupancyPercentage,
  occupiedMotos,
  activeMonthlyRevenue,
  activeWeeklyRevenue = 0,
  availableMotos,
  maintenanceMotos,
  onAddNewMoto,
  onOpenSimulator,
  onFilterClick,
}) => {
  return (
    <div className="bg-[#0B0E17] rounded-2xl border border-white/[0.08] p-4 sm:p-5 shadow-lg shadow-black/40">
      {/* Header with Title, Badge and Buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Gestão da Frota de Motos
          </h1>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#211A3E] text-[#A78BFA] border border-[#8B5CF6]/30">
            {totalMotos} {totalMotos === 1 ? 'moto' : 'motos'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSimulator && (
            <button
              type="button"
              onClick={onOpenSimulator}
              className="bg-[#101322] hover:bg-[#161B2B] text-[#94A3B8] hover:text-white border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="hidden sm:inline">Simulador de</span>
              <span>Lucro</span>
            </button>
          )}

          <button
            id="btn-add-moto-main"
            type="button"
            onClick={onAddNewMoto}
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#6D28D9]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Moto</span>
          </button>
        </div>
      </div>

      {/* Compact 4-Metric Grid (2x2 on mobile, 4 columns on tablet/desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-3.5 sm:mt-4">
        {/* 1. Total de Motos */}
        <div
          onClick={() => onFilterClick && onFilterClick('todos')}
          className="bg-[#101322] rounded-xl p-3 sm:p-3.5 border border-white/[0.05] hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-[#94A3B8] font-medium truncate">
              Total da Frota
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#1C1736] flex items-center justify-center text-[#A78BFA] shrink-0 border border-[#8B5CF6]/20">
              <Motorbike className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              <AnimatedNumber value={totalMotos} />
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#64748B] block mt-0.5 truncate">
              {totalMotos} cadastradas
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
                {occupiedMotos}/{totalMotos} alugadas
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
              {activeWeeklyRevenue > 0
                ? `${activeWeeklyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/sem em contratos`
                : `${occupiedMotos} ${occupiedMotos === 1 ? 'moto alugada' : 'motos alugadas'}`}
            </span>
          </div>
        </div>

        {/* 4. Disponíveis / Manutenção */}
        <div
          onClick={() => onFilterClick && onFilterClick(maintenanceMotos > 0 ? 'manutencao' : 'disponivel')}
          className="bg-[#101322] rounded-xl p-3 sm:p-3.5 border border-white/[0.05] hover:border-[#0EA5E9]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-[#94A3B8] font-medium truncate">
              Disp. / Manutenção
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#0C2238] flex items-center justify-center text-[#38BDF8] shrink-0 border border-[#0EA5E9]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {availableMotos} / {maintenanceMotos}
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#64748B] block mt-0.5 truncate">
              {availableMotos} livres • {maintenanceMotos} manutenção
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
