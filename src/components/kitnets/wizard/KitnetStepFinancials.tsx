import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { CurrencyInput } from '../../NumericInput';

interface KitnetStepFinancialsProps {
  stepNumber?: number;
  financials: {
    rentValue: number;
    waterValue: number;
    internetValue: number;
    otherFees: number;
    deposit: number;
    cleaningFee?: number;
  };
  setFinancials: React.Dispatch<React.SetStateAction<any>>;
  totalMonthly: number;
}

export const KitnetStepFinancials: React.FC<KitnetStepFinancialsProps> = ({
  stepNumber = 5,
  financials,
  setFinancials,
  totalMonthly,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
            {stepNumber}
          </span>
          <span>Composição de Valores e Encargos</span>
        </div>
        <span className="text-xs text-slate-400">
          Aluguel e taxas mensais
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Valor do Aluguel (R$) *
          </label>
          <CurrencyInput
            value={financials.rentValue}
            onChange={(val) =>
              setFinancials({
                ...financials,
                rentValue: val,
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Taxa Fixa de Água (R$) *
          </label>
          <CurrencyInput
            value={financials.waterValue}
            onChange={(val) =>
              setFinancials({
                ...financials,
                waterValue: val,
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Taxa de Internet (Opcional - R$)
          </label>
          <CurrencyInput
            value={financials.internetValue}
            onChange={(val) =>
              setFinancials({
                ...financials,
                internetValue: val,
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Outras Taxas / Condomínio (R$)
          </label>
          <CurrencyInput
            value={financials.otherFees}
            onChange={(val) =>
              setFinancials({
                ...financials,
                otherFees: val,
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-orange-400 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Valor da Caução em Garantia (R$)
          </label>
          <CurrencyInput
            value={financials.deposit}
            onChange={(val) =>
              setFinancials({
                ...financials,
                deposit: val,
              })
            }
            className="w-full bg-[#090B10] border border-orange-500/40 hover:border-orange-500/60 focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm font-bold text-orange-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
          />
          <span className="text-[10px] text-orange-400/80 mt-1 block">
            Garantia contratual devolvida na desocupação.
          </span>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Taxa de Limpeza em Rescisão (R$)
          </label>
          <CurrencyInput
            value={financials.cleaningFee !== undefined ? financials.cleaningFee : 400}
            onChange={(val) =>
              setFinancials({
                ...financials,
                cleaningFee: val,
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Descontada da caução caso a kitnet não seja entregue limpa.
          </span>
        </div>

        {/* Total Preview Card */}
        <div className="sm:col-span-12 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0E111A] to-teal-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                Composição Mensal
              </div>
              <div className="text-xs text-slate-300 mt-1 space-x-1">
                <span>Aluguel ({formatCurrency(financials.rentValue)})</span>
                <span>+ Água ({formatCurrency(financials.waterValue)})</span>
                {financials.internetValue > 0 && <span>+ Internet ({formatCurrency(financials.internetValue)})</span>}
                {financials.otherFees > 0 && <span>+ Outros ({formatCurrency(financials.otherFees)})</span>}
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                Total Mensal
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                {formatCurrency(totalMonthly)}
                <span className="text-xs text-slate-400 font-normal"> / mês</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
