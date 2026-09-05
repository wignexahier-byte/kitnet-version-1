import React from 'react';
import {
  DollarSign,
  Calendar,
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { NumericInput, CurrencyInput } from '../../../NumericInput';
import { generateContractSchedule } from '../../../../utils/contractCalculations';
import {
  formatCurrency as defaultFormatCurrency,
  formatDate as defaultFormatDate,
} from '../../../../utils/formatters';

interface NewMotoStepContractProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  formatCurrency?: (value: number) => string;
  formatDate?: (dateStr: string) => string;
}

export const NewMotoStepContract: React.FC<NewMotoStepContractProps> = ({
  form,
  setForm,
  formatCurrency = defaultFormatCurrency,
  formatDate = defaultFormatDate,
}) => {
  const schedule = generateContractSchedule({
    startDate: form.startDate,
    durationMonths: form.durationMonths,
    paymentFrequency: form.paymentFrequency,
    dueDay: form.dueDay,
    dueDayOfWeek: form.dueDayOfWeek,
    monthlyValue: form.monthlyValue,
    weeklyValue: form.weeklyValue,
  });

  const lastInstallment =
    schedule.installments && schedule.installments.length > 0
      ? schedule.installments[schedule.installments.length - 1]
      : null;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            3
          </span>
          <span>Plano Financeiro & Contrato</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Condições e Cronograma
        </span>
      </div>

      {/* CARD 1: PERIODICIDADE & PRAZO */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-white/[0.06] pb-2.5">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Condições Comerciais do Contrato</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Periodicidade de Cobrança *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentFrequency: 'mensal' })}
                className={`h-11 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  form.paymentFrequency === 'mensal'
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 ring-2 ring-emerald-500/25 font-bold shadow-md shadow-emerald-500/15'
                    : 'bg-[#0E111A] border-white/[0.12] text-slate-400 hover:text-white hover:border-white/[0.20]'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Mensal</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, paymentFrequency: 'semanal' })}
                className={`h-11 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  form.paymentFrequency === 'semanal'
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 ring-2 ring-emerald-500/25 font-bold shadow-md shadow-emerald-500/15'
                    : 'bg-[#0E111A] border-white/[0.12] text-slate-400 hover:text-white hover:border-white/[0.20]'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Semanal</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Prazo Total do Contrato
            </label>
            <select
              value={form.durationMonths}
              onChange={(e) =>
                setForm({ ...form, durationMonths: Number(e.target.value) as 12 | 24 | 36 })
              }
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer font-sans"
            >
              <option value={12}>12 Meses (~1 ano)</option>
              <option value={24}>24 Meses (~2 anos)</option>
              <option value={36}>36 Meses (~3 anos - Padrão)</option>
            </select>
          </div>
        </div>

        {/* DATA DE INÍCIO, DIA DE VENCIMENTO E VALOR DA PARCELA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Início do Contrato *
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans [color-scheme:dark]"
            />
          </div>

          {form.paymentFrequency === 'mensal' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dia do Vencimento Mensal
              </label>
              <NumericInput
                mode="integer"
                min={1}
                max={31}
                value={form.dueDay || null}
                placeholder="Ex: 10"
                onChange={(val) => setForm({ ...form, dueDay: val })}
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dia da Semana do Vencimento
              </label>
              <select
                value={form.dueDayOfWeek}
                onChange={(e) => setForm({ ...form, dueDayOfWeek: Number(e.target.value) })}
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer font-sans"
              >
                <option value={1}>Segunda-feira</option>
                <option value={2}>Terça-feira</option>
                <option value={3}>Quarta-feira</option>
                <option value={4}>Quinta-feira</option>
                <option value={5}>Sexta-feira</option>
                <option value={6}>Sábado</option>
                <option value={0}>Domingo</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valor da Parcela ({form.paymentFrequency === 'semanal' ? 'Semanal' : 'Mensal'}) *
            </label>
            <CurrencyInput
              value={
                form.paymentFrequency === 'semanal'
                  ? form.weeklyValue || null
                  : form.monthlyValue || null
              }
              placeholder="0,00"
              onChange={(val) => {
                if (form.paymentFrequency === 'semanal') {
                  setForm({ ...form, weeklyValue: val });
                } else {
                  setForm({ ...form, monthlyValue: val });
                }
              }}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans font-semibold"
            />
          </div>
        </div>

        {/* CAUÇÃO, GARANTIA & SEGURO */}
        <div className="pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valor do Caução / Garantia (R$)
            </label>
            <CurrencyInput
              value={form.deposit || null}
              placeholder="0,00"
              onChange={(val) => setForm({ ...form, deposit: val })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Franquia do Seguro (R$)</span>
              <span className="text-[10px] text-emerald-400 font-normal">Sinistro</span>
            </label>
            <CurrencyInput
              value={
                typeof form.insuranceDeductible === 'number'
                  ? form.insuranceDeductible > 0
                    ? form.insuranceDeductible
                    : null
                  : form.insuranceDeductible && form.insuranceDeductible !== ''
                  ? Number(String(form.insuranceDeductible).replace(/\D/g, '')) / 100 || null
                  : null
              }
              placeholder="0,00"
              onChange={(val) => setForm({ ...form, insuranceDeductible: val })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status do Caução
            </label>
            <select
              value={form.depositStatus}
              onChange={(e) =>
                setForm({
                  ...form,
                  depositStatus: e.target.value as 'retida' | 'devolvida' | 'a_definir',
                })
              }
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer font-sans"
            >
              <option value="retida">Retida com a Locadora (Padrão)</option>
              <option value="devolvida">Devolvida ao Locatário</option>
              <option value="a_definir">A Definir / Parcelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* CARD 2: RESUMO DA PROGRAMAÇÃO FINANCEIRA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-emerald-500/30 space-y-3 shadow-sm shadow-emerald-500/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Resumo da Programação Financeira</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
            {schedule.totalInstallments} parcelas {form.paymentFrequency}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#0E111A] border border-white/[0.06]">
            <p className="text-slate-400 text-[11px]">Total Contratado</p>
            <p className="font-bold text-white text-xs sm:text-sm mt-1">
              {formatCurrency(schedule.totalAgreedValue)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0E111A] border border-white/[0.06]">
            <p className="text-slate-400 text-[11px]">
              Por {form.paymentFrequency === 'semanal' ? 'Semana' : 'Mês'}
            </p>
            <p className="font-bold text-emerald-400 text-xs sm:text-sm mt-1">
              {formatCurrency(
                form.paymentFrequency === 'semanal'
                  ? form.weeklyValue || 0
                  : form.monthlyValue || 0
              )}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0E111A] border border-white/[0.06]">
            <p className="text-slate-400 text-[11px]">1º Vencimento</p>
            <p className="font-bold text-white text-xs sm:text-sm mt-1">
              {schedule.installments && schedule.installments[0]
                ? formatDate(schedule.installments[0].dueDate)
                : 'A definir'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0E111A] border border-white/[0.06]">
            <p className="text-slate-400 text-[11px]">Término Estimado</p>
            <p className="font-bold text-slate-300 text-xs sm:text-sm mt-1">
              {lastInstallment ? formatDate(lastInstallment.dueDate) : 'A definir'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
