import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calculator,
  RotateCcw,
  TrendingUp,
  Clock,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { CurrencyInput } from './NumericInput';
import { safeAdd, safeSub, safeMul, safeDiv } from '../utils/financialMath';

interface SimuladorCompraMotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToNewMoto?: (motoData: { purchasePrice: number; model?: string }) => void;
  onNavigateToMotos?: () => void;
}

export const SimuladorCompraMotoModal: React.FC<SimuladorCompraMotoModalProps> = ({
  isOpen,
  onClose,
  onApplyToNewMoto,
}) => {
  useBodyScrollLock(isOpen);

  // Estados iniciam zerados/vazios para digitação manual sem preenchimento automático
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [initialExpenses, setInitialExpenses] = useState<number>(0);
  const [contractPeriod, setContractPeriod] = useState<12 | 24 | 36>(24);
  const [paymentFrequency, setPaymentFrequency] = useState<'mensal' | 'semanal'>('mensal');
  const [periodicRent, setPeriodicRent] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);

  if (!isOpen) return null;

  // Cálculos financeiros
  const totalInvestment = safeAdd(purchasePrice, initialExpenses);

  // Receita mensal normalizada para os cálculos
  const monthlyRevenue =
    paymentFrequency === 'semanal'
      ? safeDiv(safeMul(periodicRent, 52), 12)
      : periodicRent;

  const totalGrossRevenue = safeAdd(safeMul(monthlyRevenue, contractPeriod), depositAmount);
  const totalNetProfit = safeSub(totalGrossRevenue, totalInvestment);

  // Payback (tempo para recuperar o investimento inicial considerando caução e receita mensal)
  const netInvestToRecover = safeSub(totalInvestment, depositAmount);
  const paybackMonths =
    monthlyRevenue > 0 && netInvestToRecover > 0
      ? safeDiv(netInvestToRecover, monthlyRevenue)
      : netInvestToRecover <= 0 && totalInvestment > 0
      ? 0
      : null;

  const roiTotal = totalInvestment > 0 ? (totalNetProfit / totalInvestment) * 100 : 0;
  const roiMonthly = contractPeriod > 0 && totalInvestment > 0 ? roiTotal / contractPeriod : 0;

  const handleReset = () => {
    setPurchasePrice(0);
    setInitialExpenses(0);
    setPeriodicRent(0);
    setDepositAmount(0);
    setContractPeriod(24);
    setPaymentFrequency('mensal');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141418] border border-white/[0.08] rounded-2xl max-w-xl w-full max-h-[90dvh] overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] bg-[#101012] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-[#F5F5F7]">
                Simulador de Compra & Lucro
              </h3>
              <p className="text-xs text-[#9A9AA2]">
                Projeção de payback, retorno financeiro e lucro líquido
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto modal-scroll-container overscroll-contain flex-1">
          {/* Inputs */}
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9A9AA2] mb-1">
                  Preço de Compra (R$)
                </label>
                <CurrencyInput
                  value={purchasePrice}
                  onChange={(val) => setPurchasePrice(val)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#101012] text-sm font-medium text-[#F5F5F7] focus:border-[#8B5CF6] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9A9AA2] mb-1">
                  Custos Iniciais (Doc / Revisão)
                </label>
                <CurrencyInput
                  value={initialExpenses}
                  onChange={(val) => setInitialExpenses(val)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#101012] text-sm font-medium text-[#F5F5F7] focus:border-[#8B5CF6] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9A9AA2] mb-1">
                  Frequência de Cobrança
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#101012] p-1 rounded-xl border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPaymentFrequency('mensal')}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      paymentFrequency === 'mensal'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFrequency('semanal')}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      paymentFrequency === 'semanal'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                    }`}
                  >
                    Semanal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9A9AA2] mb-1">
                  Valor {paymentFrequency === 'semanal' ? 'Semanal' : 'Mensal'} (R$)
                </label>
                <CurrencyInput
                  value={periodicRent}
                  onChange={(val) => setPeriodicRent(val)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#101012] text-sm font-medium text-[#F5F5F7] focus:border-[#8B5CF6] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9A9AA2] mb-1">
                  Duração do Contrato
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#101012] p-1 rounded-xl border border-white/[0.08]">
                  {([12, 24, 36] as const).map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setContractPeriod(months)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        contractPeriod === months
                          ? 'bg-[#8B5CF6] text-white'
                          : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
                      }`}
                    >
                      {months}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9A9AA2] mb-1">
                  Caução Inicial (R$)
                </label>
                <CurrencyInput
                  value={depositAmount}
                  onChange={(val) => setDepositAmount(val)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#101012] text-sm font-medium text-[#F5F5F7] focus:border-[#8B5CF6] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-[#101012] rounded-xl border border-white/[0.08] p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-[#F5F5F7] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Resultados dos Cálculos ({contractPeriod}x)
              </span>
              {monthlyRevenue > 0 && (
                <span className="text-xs text-[#9A9AA2] font-mono">
                  Média: {formatCurrency(monthlyRevenue)}/mês
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-[#9A9AA2] mb-1">
                  <Wallet className="w-3.5 h-3.5 text-[#9A9AA2]" />
                  <span>Investimento Total</span>
                </div>
                <span className="text-sm sm:text-base font-semibold text-[#F5F5F7] font-mono">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-[#9A9AA2] mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#9A9AA2]" />
                  <span>Receita Bruta Total</span>
                </div>
                <span className="text-sm sm:text-base font-semibold text-[#F5F5F7] font-mono">
                  {formatCurrency(totalGrossRevenue)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-[#9A9AA2] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#9A9AA2]" />
                  <span>Payback (Quitação)</span>
                </div>
                <span className="text-sm sm:text-base font-semibold text-[#8B5CF6] font-mono">
                  {paybackMonths !== null
                    ? paybackMonths === 0
                      ? 'Imediato (Caução)'
                      : `~${paybackMonths.toFixed(1)} meses`
                    : '—'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs text-[#9A9AA2] mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#9A9AA2]" />
                  <span>Lucro Líquido</span>
                </div>
                <span
                  className={`text-sm sm:text-base font-semibold font-mono ${
                    totalNetProfit > 0
                      ? 'text-[#10B981]'
                      : totalNetProfit < 0
                      ? 'text-[#EF4444]'
                      : 'text-[#F5F5F7]'
                  }`}
                >
                  {formatCurrency(totalNetProfit)}
                </span>
              </div>
            </div>

            {totalInvestment > 0 && totalGrossRevenue > 0 && (
              <div className="pt-1 flex items-center justify-between text-xs text-[#9A9AA2] border-t border-white/[0.04]">
                <span>Retorno sobre Investimento (ROI):</span>
                <span className="font-semibold text-[#F5F5F7] font-mono">
                  {roiTotal >= 0 ? `+${roiTotal.toFixed(1)}%` : `${roiTotal.toFixed(1)}%`} ({roiMonthly.toFixed(1)}%/mês)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-white/[0.08] bg-[#101012] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-medium text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/[0.08] text-xs font-semibold text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Fechar
            </button>
            {onApplyToNewMoto && purchasePrice > 0 && (
              <button
                type="button"
                onClick={() => {
                  onApplyToNewMoto({ purchasePrice });
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Aplicar no Cadastro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
