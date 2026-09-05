import React, { useEffect } from 'react';
import {
  Calendar,
  Clock,
  Repeat,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { formatDate, addMonthsToDate, getTodayLocalDateString } from '../../../../utils/formatters';

interface NewMotoStepContractTermsProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const NewMotoStepContractTerms: React.FC<NewMotoStepContractTermsProps> = ({
  form,
  setForm,
}) => {
  const durationMonths = Number(form.durationMonths) || 36;
  const startDate = form.startDate || getTodayLocalDateString();
  const signatureDate = form.signatureDate || startDate;

  // Calcula a data de término prevista
  const calculatedEndDate = addMonthsToDate(startDate, durationMonths);

  useEffect(() => {
    if (!form.endDate || form.endDate !== calculatedEndDate) {
      setForm((prev: any) => ({ ...prev, endDate: calculatedEndDate }));
    }
  }, [startDate, durationMonths]);

  const DURATION_PRESETS = [
    { months: 12, label: '12 Meses', sub: '1 Ano • Curto prazo' },
    { months: 24, label: '24 Meses', sub: '2 Anos • Médio prazo' },
    { months: 36, label: '36 Meses', sub: '3 Anos • Opção de Compra (Recomendado)', featured: true },
  ];

  const isCustomDuration = ![12, 24, 36].includes(durationMonths);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            4
          </span>
          <span>Termos do Contrato & Vigência</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Prazo, Início e Periodicidade
        </span>
      </div>

      {/* CARD 1: PRAZO DE LOCAÇÃO E VIGÊNCIA */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Duração do Contrato de Locação</p>
              <p className="text-[11px] text-slate-400">
                Selecione o plano acordado com o condutor
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {durationMonths} Meses de Vigência
          </span>
        </div>

        {/* Botões de Duração Pré-definida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {DURATION_PRESETS.map((preset) => {
            const isSelected = durationMonths === preset.months && !isCustomDuration;
            return (
              <button
                key={preset.months}
                type="button"
                onClick={() => setForm({ ...form, durationMonths: preset.months })}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                    : 'bg-[#0E111A] border-white/[0.08] text-slate-300 hover:border-white/[0.18]'
                }`}
              >
                {preset.featured && (
                  <span className="absolute -top-2.5 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    Mais Popular
                  </span>
                )}
                <p className="text-sm font-bold text-white leading-tight">{preset.label}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">{preset.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Opção Duração Personalizada */}
        <div className="pt-2.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <label className="text-xs text-slate-400">Ou defina outro prazo personalizado:</label>
          <div className="flex items-center gap-2 max-w-[160px]">
            <input
              type="number"
              min={1}
              max={120}
              placeholder="Ex: 18"
              value={durationMonths}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                setForm({ ...form, durationMonths: val });
              }}
              className="h-9 w-full bg-[#0E111A] border border-white/[0.12] focus:bg-[#121622] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-semibold text-center"
            />
            <span className="text-xs text-slate-400">meses</span>
          </div>
        </div>
      </div>

      {/* CARD 2: DATAS DE INÍCIO & TÉRMINO */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Cronograma & Vigência</p>
            <p className="text-[11px] text-slate-400">
              Data de formalização, início e término do vínculo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Data de Assinatura */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Assinatura *
            </label>
            <input
              type="date"
              required
              value={signatureDate}
              onChange={(e) => setForm({ ...form, signatureDate: e.target.value })}
              className="h-11 w-full flex items-center bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans leading-normal [color-scheme:dark]"
            />
          </div>

          {/* Data de Início */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Início da Locação *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="h-11 w-full flex items-center bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans leading-normal [color-scheme:dark]"
            />
          </div>

          {/* Data Prevista de Término */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data Prevista de Término
            </label>
            <div className="h-11 w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 flex items-center justify-between text-sm text-slate-300 font-sans">
              <span className="font-medium text-white">{formatDate(calculatedEndDate)}</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
                Automático
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: PERIODICIDADE DE COBRANÇA */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Repeat className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Periodicidade do Pagamento</p>
              <p className="text-[11px] text-slate-400">
                Escolha entre cobrança semanal (padrão de apps) ou mensal
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opção Mensal */}
          <button
            type="button"
            onClick={() => setForm({ ...form, paymentFrequency: 'mensal' })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              form.paymentFrequency !== 'semanal'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                : 'bg-[#0E111A] border-white/[0.08] text-slate-400 hover:border-white/[0.18]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Mensal</span>
              {form.paymentFrequency !== 'semanal' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cobrança realizada 1 vez por mês em dia de vencimento fixo (ex: dia 10).
            </p>
          </button>

          {/* Opção Semanal */}
          <button
            type="button"
            onClick={() => setForm({ ...form, paymentFrequency: 'semanal' })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              form.paymentFrequency === 'semanal'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                : 'bg-[#0E111A] border-white/[0.08] text-slate-400 hover:border-white/[0.18]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Semanal</span>
              {form.paymentFrequency === 'semanal' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cobrança a cada 7 dias em dia específico da semana (ex: toda segunda-feira).
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
