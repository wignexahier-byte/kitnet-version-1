import React, { useEffect } from 'react';
import {
  DollarSign,
  Shield,
  CreditCard,
  Calculator,
  Lock,
  RotateCcw,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';
import { CurrencyInput } from '../../../NumericInput';

interface NewMotoStepFinancialsProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const NewMotoStepFinancials: React.FC<NewMotoStepFinancialsProps> = ({
  form,
  setForm,
}) => {
  const isWeekly = form.paymentFrequency === 'semanal';
  const durationMonths = Number(form.durationMonths) || 36;

  // Cálculo correto de parcelas para o período total:
  // Se semanal: 52 semanas por ano (52 / 12 por mês). Ex: 36 meses = 156 semanas; 24 meses = 104 semanas; 12 meses = 52 semanas.
  const totalWeeks = Math.round(durationMonths * (52 / 12));
  const totalInstallments = isWeekly ? totalWeeks : durationMonths;

  const currentPeriodValue = isWeekly ? Number(form.weeklyValue) || 0 : Number(form.monthlyValue) || 0;

  // Total contratual exato calculado pelas parcelas
  const calculatedSuggestedTotal = Math.round(currentPeriodValue * totalInstallments * 100) / 100;

  // Sincronização inteligente do total acordado:
  // Se o valor estiver zerado, ou for um valor resíduo espúrio (< 100 com total calculado >= 100),
  // ou se o usuário ainda não definiu um valor personalizado, mantém sincronizado com as parcelas.
  useEffect(() => {
    const currentTotal = Number(form.totalAgreedValue) || 0;
    // Corrige o caso onde o valor congelou em centavos (ex: R$ 4,32)
    const isBogusValue = currentTotal > 0 && currentTotal < 100 && calculatedSuggestedTotal >= 100;

    if (calculatedSuggestedTotal > 0 && (currentTotal === 0 || isBogusValue)) {
      setForm((prev: any) => ({ ...prev, totalAgreedValue: calculatedSuggestedTotal }));
    }
  }, [calculatedSuggestedTotal]);

  const handleWeeklyChange = (val: number) => {
    const newTotal = Math.round(val * totalWeeks * 100) / 100;
    setForm((prev: any) => {
      const currentTotal = Number(prev.totalAgreedValue) || 0;
      const prevTotal = Math.round((Number(prev.weeklyValue) || 0) * totalWeeks * 100) / 100;
      const shouldAutoSync = currentTotal === 0 || currentTotal < 100 || currentTotal === prevTotal;
      return {
        ...prev,
        weeklyValue: val,
        monthlyValue: val > 0 ? Math.round(val * (52 / 12) * 100) / 100 : prev.monthlyValue,
        totalAgreedValue: shouldAutoSync && newTotal > 0 ? newTotal : prev.totalAgreedValue,
      };
    });
  };

  const handleMonthlyChange = (val: number) => {
    const newTotal = Math.round(val * durationMonths * 100) / 100;
    setForm((prev: any) => {
      const currentTotal = Number(prev.totalAgreedValue) || 0;
      const prevTotal = Math.round((Number(prev.monthlyValue) || 0) * durationMonths * 100) / 100;
      const shouldAutoSync = currentTotal === 0 || currentTotal < 100 || currentTotal === prevTotal;
      return {
        ...prev,
        monthlyValue: val,
        weeklyValue: val > 0 ? Math.round((val / (52 / 12)) * 100) / 100 : prev.weeklyValue,
        totalAgreedValue: shouldAutoSync && newTotal > 0 ? newTotal : prev.totalAgreedValue,
      };
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            5
          </span>
          <span>Valores Comerciais, Caução & Seguro</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Planos e Garantias
        </span>
      </div>

      {/* CARD 1: VALORES DA LOCAÇÃO */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Valor da Parcela ({isWeekly ? 'Semanal' : 'Mensal'})
              </p>
              <p className="text-[11px] text-slate-400">
                Defina o valor base cobrado periodicamente do locatário
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto shrink-0 whitespace-nowrap text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center">
            {isWeekly ? 'Cobrança Semanal' : 'Cobrança Mensal'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isWeekly ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor da Parcela Semanal (R$) *
              </label>
              <CurrencyInput
                value={form.weeklyValue || 0}
                onChange={handleWeeklyChange}
                placeholder="R$ 0,00"
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-base font-bold text-emerald-400 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Equivalente aproximado de{' '}
                <strong className="text-white">
                  {formatCurrency((form.weeklyValue || 0) * (52 / 12))}
                </strong>{' '}
                por mês ({totalWeeks} parcelas semanais).
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor do Aluguel Mensal (R$) *
              </label>
              <CurrencyInput
                value={form.monthlyValue || 0}
                onChange={handleMonthlyChange}
                placeholder="R$ 0,00"
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-base font-bold text-emerald-400 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Equivalente aproximado de{' '}
                <strong className="text-white">
                  {formatCurrency(Math.round((form.monthlyValue || 0) / (52 / 12)))}
                </strong>{' '}
                por semana ({durationMonths} parcelas mensais).
              </p>
            </div>
          )}

          {/* Valor Total Acordado (Opção de Compra) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label className="text-xs font-semibold text-slate-300 truncate">
                Valor Total Acordado (Opção de Compra)
              </label>
              {calculatedSuggestedTotal > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, totalAgreedValue: calculatedSuggestedTotal })
                  }
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer underline whitespace-nowrap shrink-0"
                >
                  Sincronizar ({formatCurrency(calculatedSuggestedTotal)})
                </button>
              )}
            </div>
            <CurrencyInput
              value={form.totalAgreedValue || 0}
              onChange={(val) => setForm({ ...form, totalAgreedValue: val })}
              placeholder="R$ 0,00"
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Total das {totalInstallments} parcelas: <strong className="text-white">{formatCurrency(calculatedSuggestedTotal)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* CARD 2: CAUÇÃO & SEGURO / FRANQUIA */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Garantias: Caução & Seguro</p>
            <p className="text-[11px] text-slate-400">
              Proteção contra inadimplência, danos operacionais e sinistros
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Valor do Caução */}
          <div>
            <label className="block text-xs font-semibold text-orange-400 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Valor da Caução (R$)
            </label>
            <CurrencyInput
              value={form.deposit || 0}
              onChange={(val) => setForm({ ...form, deposit: val })}
              placeholder="R$ 0,00"
              className="h-11 w-full bg-[#0E111A] border border-orange-500/40 hover:border-orange-500/60 focus:bg-[#121622] rounded-xl px-3.5 text-sm text-orange-400 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-sans font-bold"
            />
            <p className="text-[10px] text-orange-400/80 mt-1">Garantia retida durante o contrato</p>
          </div>

          {/* Status da Caução */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status da Caução
            </label>
            <select
              value={form.depositStatus || 'retida'}
              onChange={(e) => setForm({ ...form, depositStatus: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans cursor-pointer"
            >
              <option value="retida">Retida (Com o Locador)</option>
              <option value="a_definir">A Definir / Em Negociação</option>
              <option value="devolvida">Devolvida ao Locatário</option>
            </select>
          </div>

          {/* Franquia do Seguro */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Franquia de Seguro (R$)
            </label>
            <CurrencyInput
              value={
                typeof form.insuranceDeductible === 'number'
                  ? form.insuranceDeductible
                  : parseFloat(String(form.insuranceDeductible || '0').replace(/\D/g, '')) / 100 || 0
              }
              onChange={(val) => setForm({ ...form, insuranceDeductible: val })}
              placeholder="R$ 0,00"
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
            <p className="text-[10px] text-slate-500 mt-1">Valor assumido pelo condutor em sinistros</p>
          </div>
        </div>
      </div>

      {/* CARD 3: RESUMO EM TEMPO REAL DA SIMULAÇÃO */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <Calculator className="w-4 h-4" />
          <span>Resumo da Programação Financeira</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
            <span className="text-[11px] text-slate-400 block">Total de Parcelas</span>
            <strong className="text-white text-sm font-bold block mt-0.5">
              {totalInstallments} parcelas {isWeekly ? 'semanais' : 'mensais'}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
            <span className="text-[11px] text-slate-400 block">Valor por Período</span>
            <strong className="text-emerald-400 text-sm font-bold block mt-0.5">
              {formatCurrency(isWeekly ? form.weeklyValue || 0 : form.monthlyValue || 0)}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
            <span className="text-[11px] text-slate-400 block">Total do Plano</span>
            <strong className="text-white text-sm font-bold block mt-0.5">
              {formatCurrency(form.totalAgreedValue || calculatedSuggestedTotal)}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-black/30 border border-orange-500/20">
            <span className="text-[11px] text-orange-400 block font-medium">Garantia Caução</span>
            <strong className="text-orange-400 text-sm font-bold block mt-0.5">
              {formatCurrency(form.deposit || 0)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
