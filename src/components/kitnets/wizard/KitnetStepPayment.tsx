import React from 'react';
import { Calendar, CheckCircle2, Clock, DollarSign, Wallet } from 'lucide-react';
import { formatCurrency, formatDate, getTodayLocalDateString } from '../../../utils/formatters';
import { generateContractSchedule } from '../../../utils/contractCalculations';

interface KitnetStepPaymentProps {
  stepNumber?: number;
  paymentConfig: {
    dueDay: number;
    paymentMethod: string;
    pixKey: string;
    notes: string;
    firstPaymentReceived?: boolean;
    firstPaymentPaidDate?: string;
    firstPaymentMethod?: string;
    firstPaymentNotes?: string;
  };
  setPaymentConfig: React.Dispatch<React.SetStateAction<any>>;
  contractTerms: {
    startDate: string;
    durationOption: number | 'custom';
    customMonths: number;
  };
  financials: {
    deposit: number;
  };
  totalMonthly: number;
}

export const KitnetStepPayment: React.FC<KitnetStepPaymentProps> = ({
  stepNumber = 6,
  paymentConfig,
  setPaymentConfig,
  contractTerms,
  financials,
  totalMonthly,
}) => {
  const effectiveMonths =
    contractTerms.durationOption === 'custom'
      ? Number(contractTerms.customMonths) || 12
      : contractTerms.durationOption;
  const sim = generateContractSchedule({
    startDate: contractTerms.startDate,
    durationMonths: effectiveMonths,
    dueDay: paymentConfig.dueDay,
    monthlyValue: totalMonthly,
    paymentFrequency: 'mensal',
  });
  const firstInst = sim.installments[0];
  const isFirstPaid = Boolean(paymentConfig.firstPaymentReceived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
            {stepNumber}
          </span>
          <span>Condições de Pagamento & Cobrança</span>
        </div>
        <span className="text-xs text-slate-400">
          Vencimento, 1º Pagamento e chave PIX
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* SEÇÃO OBRIGATÓRIA: PRIMEIRO PAGAMENTO */}
        <div className="sm:col-span-12 p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-white/[0.12] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Primeiro Pagamento (1ª Mensalidade)
                </span>
                <span className="text-xs text-slate-400">
                  O primeiro pagamento já foi recebido no ato do cadastro / entrada?
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${
              isFirstPaid
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isFirstPaid ? 'Entrada Recebida (No Caixa)' : 'Pendente de Recebimento'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opção NÃO (Padrão) */}
            <button
              type="button"
              onClick={() =>
                setPaymentConfig((prev: any) => ({
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
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                !isFirstPaid ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white/[0.06] text-slate-400'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs font-bold block ${!isFirstPaid ? 'text-amber-300' : 'text-slate-300'}`}>
                  NÃO — Deixar Pendente
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  A 1ª parcela ficará com status <strong>Pendente</strong> para vencimento em{' '}
                  <span className="text-white font-medium">{firstInst ? formatDate(firstInst.dueDate) : 'data agendada'}</span>. Não entra no caixa imediatamente.
                </p>
              </div>
            </button>

            {/* Opção SIM */}
            <button
              type="button"
              onClick={() =>
                setPaymentConfig((prev: any) => ({
                  ...prev,
                  firstPaymentReceived: true,
                  firstPaymentPaidDate: prev.firstPaymentPaidDate || getTodayLocalDateString(),
                  firstPaymentMethod: prev.firstPaymentMethod || prev.paymentMethod || 'PIX Instantâneo',
                }))
              }
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                isFirstPaid
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-[#0E111A] border-white/[0.08] text-slate-400 hover:border-white/[0.18]'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                isFirstPaid ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/[0.06] text-slate-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs font-bold block ${isFirstPaid ? 'text-emerald-300' : 'text-slate-300'}`}>
                  SIM — Já Recebido no Ato
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  A 1ª parcela de <span className="text-emerald-300 font-bold">{formatCurrency(firstInst?.amount || totalMonthly)}</span> será marcada como <strong>Paga</strong> e computada no caixa e relatórios.
                </p>
              </div>
            </button>
          </div>

          {/* Campos condicionais se SIM */}
          {isFirstPaid && (
            <div className="pt-3 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Data do Recebimento da 1ª Parcela *
                </label>
                <input
                  type="date"
                  value={paymentConfig.firstPaymentPaidDate || getTodayLocalDateString()}
                  onChange={(e) =>
                    setPaymentConfig((prev: any) => ({
                      ...prev,
                      firstPaymentPaidDate: e.target.value,
                    }))
                  }
                  className="w-full flex items-center bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121420] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all leading-normal [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Forma de Recebimento do 1º Pagamento *
                </label>
                <select
                  value={paymentConfig.firstPaymentMethod || 'PIX Instantâneo'}
                  onChange={(e) =>
                    setPaymentConfig((prev: any) => ({
                      ...prev,
                      firstPaymentMethod: e.target.value,
                    }))
                  }
                  className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121420] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
                >
                  <option value="PIX Instantâneo">PIX Instantâneo</option>
                  <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Observações do 1º Recebimento (Opcional)
                </label>
                <input
                  type="text"
                  value={paymentConfig.firstPaymentNotes || ''}
                  onChange={(e) =>
                    setPaymentConfig((prev: any) => ({
                      ...prev,
                      firstPaymentNotes: e.target.value,
                    }))
                  }
                  placeholder="Ex: Recebido via PIX na assinatura das chaves..."
                  className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121420] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Dia de Vencimento Mensal das Próximas Parcelas *
          </label>
          <select
            value={paymentConfig.dueDay}
            onChange={(e) =>
              setPaymentConfig({
                ...paymentConfig,
                dueDay: Number(e.target.value),
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          >
            {[1, 5, 10, 15, 20, 25, 28, 30].map((d) => (
              <option key={d} value={d}>
                Todo dia {d} do mês
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Forma de Pagamento Padrão (Cobranças Futuras)
          </label>
          <select
            value={paymentConfig.paymentMethod}
            onChange={(e) =>
              setPaymentConfig({
                ...paymentConfig,
                paymentMethod: e.target.value,
              })
            }
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          >
            <option value="PIX Instantâneo">PIX Instantâneo</option>
            <option value="Boleto Bancário">Boleto Bancário</option>
            <option value="Transferência Bancária">Transferência Bancária</option>
            <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
          </select>
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Chave PIX para Recebimento
          </label>
          <input
            type="text"
            value={paymentConfig.pixKey}
            onChange={(e) =>
              setPaymentConfig({
                ...paymentConfig,
                pixKey: e.target.value,
              })
            }
            placeholder="Chave CPF, E-mail, Celular ou Aleatória..."
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all font-mono"
          />
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Observações e Regras do Contrato
          </label>
          <textarea
            rows={3}
            value={paymentConfig.notes}
            onChange={(e) =>
              setPaymentConfig({
                ...paymentConfig,
                notes: e.target.value,
              })
            }
            placeholder="Regras de convivência, animais, restrições ou cláusulas adicionais..."
            className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
        </div>

        {/* Card de Resumo do Cronograma de Pagamentos */}
        <div className="sm:col-span-12 p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-emerald-500/30 space-y-3.5 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Cronograma de Pagamentos
                </span>
                <span className="text-xs text-slate-400">
                  {sim.installments.length} parcelas mensais de {formatCurrency(totalMonthly)}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 whitespace-nowrap">
              Valor Fixo Mensal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isFirstPaid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#0E111A] border-white/[0.08]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 block font-medium">1ª Parcela</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isFirstPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isFirstPaid ? 'Paga (Caixa)' : 'Pendente'}
                </span>
              </div>
              <span className="font-bold text-white block text-sm">
                {firstInst ? formatDate(firstInst.dueDate) : '-'}
              </span>
              <span className="text-xs font-extrabold text-emerald-400 font-mono block">
                {firstInst ? formatCurrency(firstInst.amount) : '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E111A] border border-white/[0.08] space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {sim.installments.length > 1 ? `2ª a ${sim.installments.length}ª Parcela` : 'Demais Parcelas'}
              </span>
              <span className="font-bold text-white block text-sm">
                Todo dia {paymentConfig.dueDay}
              </span>
              <span className="text-xs font-extrabold text-slate-200 font-mono block">
                {formatCurrency(totalMonthly)} / mês
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E111A] border border-white/[0.08] space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Valor Total do Contrato</span>
              <span className="font-extrabold text-emerald-400 text-base font-mono block">
                {formatCurrency(sim.totalAgreedValue)}
              </span>
              <span className="text-[11px] text-slate-400 block font-medium">
                Caução: <span className="text-orange-400 font-bold">{formatCurrency(financials.deposit)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

