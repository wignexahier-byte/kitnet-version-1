import React from 'react';
import {
  Calendar,
  Clock,
  Wallet,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  QrCode,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  getTodayLocalDateString,
} from '../../../../utils/formatters';
import { generateContractSchedule, getWeekdayName } from '../../../../utils/contractCalculations';

interface NewMotoStepPaymentProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  settings: {
    adminPixKey?: string;
    adminName?: string;
  };
}

export const NewMotoStepPayment: React.FC<NewMotoStepPaymentProps> = ({
  form,
  setForm,
  settings,
}) => {
  const isWeekly = form.paymentFrequency === 'semanal';
  const durationMonths = Number(form.durationMonths) || 36;
  const effectiveMonthly = isWeekly ? (form.weeklyValue || 0) * 4 : form.monthlyValue || 0;
  const effectiveWeekly = form.weeklyValue || Math.round(effectiveMonthly / 4);

  // Simulação oficial da 1ª parcela usando a regra centralizada
  const sim = generateContractSchedule({
    startDate: form.startDate || getTodayLocalDateString(),
    durationMonths,
    paymentFrequency: form.paymentFrequency || 'mensal',
    monthlyValue: effectiveMonthly,
    weeklyValue: effectiveWeekly,
    dueDay: form.dueDay || 10,
    dueDayOfWeek: form.dueDayOfWeek || 1,
  });

  const firstInst = sim.installments[0];
  const firstInstAmount = firstInst?.amount || (isWeekly ? effectiveWeekly : effectiveMonthly);
  const isFirstPaid = Boolean(form.firstPaymentReceived);
  const depositAmount = Number(form.deposit) || 0;

  const WEEKDAYS = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            6
          </span>
          <span>Condições de Pagamento & Cobrança</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Vencimento, 1º Pagamento e Chave PIX
        </span>
      </div>

      {/* SEÇÃO OBRIGATÓRIA: PRIMEIRO PAGAMENTO */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-white/[0.12] space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Primeiro Pagamento (1ª Parcela)
              </span>
              <span className="text-xs text-slate-400">
                O primeiro pagamento já foi recebido no ato do cadastro / entrega da moto?
              </span>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${
              isFirstPaid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {isFirstPaid ? 'Entrada Recebida (No Caixa)' : 'Pendente de Recebimento'}
          </span>
        </div>

        {/* Botoes de Decisao: NAO (Padrao) vs SIM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Opção NÃO — Padrão */}
          <button
            type="button"
            onClick={() =>
              setForm((prev: any) => ({
                ...prev,
                firstPaymentReceived: false,
              }))
            }
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              !isFirstPaid
                ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-[#0E111A] border-white/[0.08] text-slate-400 hover:border-white/[0.18]'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                !isFirstPaid
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white/[0.06] text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`text-xs font-bold block ${
                  !isFirstPaid ? 'text-amber-300' : 'text-slate-300'
                }`}
              >
                NÃO — Deixar Pendente
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                A 1ª parcela ficará com status <strong>Pendente</strong> para vencimento em{' '}
                <span className="text-white font-medium">
                  {firstInst ? formatDate(firstInst.dueDate) : 'data programada'}
                </span>
                . Não entra no caixa imediatamente (Cadastro de contrato ≠ recebimento de dinheiro).
              </p>
            </div>
          </button>

          {/* Opção SIM — Recebido no ato */}
          <button
            type="button"
            onClick={() =>
              setForm((prev: any) => ({
                ...prev,
                firstPaymentReceived: true,
                firstPaymentPaidDate: prev.firstPaymentPaidDate || getTodayLocalDateString(),
                firstPaymentMethod:
                  prev.firstPaymentMethod || prev.paymentMethod || 'PIX Instantâneo',
                firstPaymentNotes:
                  prev.firstPaymentNotes || '1ª Parcela recebida no cadastro / entrega',
              }))
            }
            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              isFirstPaid
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                : 'bg-[#0E111A] border-white/[0.08] text-slate-400 hover:border-white/[0.18]'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                isFirstPaid
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/[0.06] text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`text-xs font-bold block ${
                  isFirstPaid ? 'text-emerald-300' : 'text-slate-300'
                }`}
              >
                SIM — Já Recebido no Ato
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                A 1ª parcela será marcada como <strong>Pago</strong> e entrará imediatamente no
                caixa e nos relatórios como receita recebida.
              </p>
            </div>
          </button>
        </div>

        {/* Detalhes do Recebimento (se SIM) */}
        {isFirstPaid && (
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dados do Recebimento da 1ª Parcela</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data do Recebimento *
                </label>
                <input
                  type="date"
                  value={form.firstPaymentPaidDate || getTodayLocalDateString()}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      firstPaymentPaidDate: e.target.value,
                    }))
                  }
                  className="h-10 w-full flex items-center bg-[#0E111A] border border-white/[0.12] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 leading-normal [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Forma do 1º Recebimento *
                </label>
                <select
                  value={form.firstPaymentMethod || 'PIX Instantâneo'}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      firstPaymentMethod: e.target.value,
                    }))
                  }
                  className="h-10 w-full bg-[#0E111A] border border-white/[0.12] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="PIX Instantâneo">PIX Instantâneo</option>
                  <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                  <option value="Transferência Bancária (TED/DOC)">
                    Transferência Bancária
                  </option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor que Entra no Caixa
                </label>
                <div className="h-10 w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 flex items-center justify-between text-xs text-emerald-300 font-bold">
                  <span>1ª Parcela + <strong className="text-orange-400 font-bold">Caução</strong></span>
                  <span>{formatCurrency(firstInstAmount + depositAmount)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações do 1º Recebimento
              </label>
              <input
                type="text"
                placeholder="Ex: 1ª Parcela recebida via PIX na entrega da chave"
                value={form.firstPaymentNotes || ''}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    firstPaymentNotes: e.target.value,
                  }))
                }
                className="h-10 w-full bg-[#0E111A] border border-white/[0.12] rounded-lg px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: VENCIMENTO PADRÃO DAS PARCELAS */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Vencimento Recorrente</p>
            <p className="text-[11px] text-slate-400">
              {isWeekly
                ? 'Dia da semana em que as parcelas semanais vencem'
                : 'Dia fixo do mês para o vencimento do aluguel mensal'}
            </p>
          </div>
        </div>

        {isWeekly ? (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Dia da Semana do Vencimento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = (form.dueDayOfWeek ?? 1) === day.value;
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setForm({ ...form, dueDayOfWeek: day.value })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-[#0E111A] border-white/[0.08] text-slate-300 hover:border-white/[0.18]'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dia do Vencimento Mensal *
              </label>
              <select
                value={form.dueDay || 10}
                onChange={(e) => setForm({ ...form, dueDay: parseInt(e.target.value, 10) })}
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Dia {i + 1} de cada mês
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Forma de Cobrança Padrão
              </label>
              <select
                value={form.paymentMethod || 'PIX Instantâneo'}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PIX Instantâneo">PIX Instantâneo</option>
                <option value="Boleto Bancário">Boleto Bancário</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
                <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* CARD 3: CHAVE PIX & OBSERVAÇÕES */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <QrCode className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Chave PIX & Instruções de Cobrança</p>
            <p className="text-[11px] text-slate-400">
              Dados bancários que constarão no contrato e notificações
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chave PIX do Locador
            </label>
            <input
              type="text"
              placeholder="CPF, CNPJ, Telefone, E-mail ou Chave Aleatória"
              value={form.pixKey || settings.adminPixKey || ''}
              onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Instruções / Observações no Contrato
            </label>
            <input
              type="text"
              placeholder="Ex: Troca de óleo a cada 1.000km sob pena de multa..."
              value={
                form.notes !== undefined
                  ? form.notes
                  : 'Pagamento pontual. Manutenção preventiva de óleo obrigatória a cada 1.000km.'
              }
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
