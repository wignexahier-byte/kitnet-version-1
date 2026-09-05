import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  TrendingUp,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, isInstallmentOverdue } from '../utils/formatters';
import { RentAdjustment } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { CurrencyInput } from './NumericInput';

interface RentAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'moto' | 'kitnet';
  contractId: string;
  currentValue?: number;
  currentMonthlyValue?: number;
  contractTitle?: string;
  identifier?: string;
  clientName?: string;
  tenantName?: string;
  adjustments?: RentAdjustment[];
  pendingInstallments?: { number: number; dueDate: string; amount: number }[];
}

export const RentAdjustmentModal: React.FC<RentAdjustmentModalProps> = ({
  isOpen,
  onClose,
  type,
  contractId,
  currentValue: propCurrentValue,
  currentMonthlyValue,
  contractTitle: propContractTitle,
  identifier,
  clientName: propClientName,
  tenantName,
  adjustments: propAdjustments,
  pendingInstallments: propPendingInstallments,
}) => {
  const {
    adjustMotoContractRent,
    adjustKitnetContractRent,
    motoContracts,
    kitnetContracts,
    isReadOnlyMode,
  } = useApp();

  useBodyScrollLock(isOpen);

  // Derive contract details from context if needed
  const activeContract = useMemo(() => {
    if (type === 'moto') {
      return motoContracts.find((c) => c.id === contractId);
    }
    return kitnetContracts.find((c) => c.id === contractId);
  }, [type, contractId, motoContracts, kitnetContracts]);

  const effectiveCurrentValue =
    propCurrentValue ??
    currentMonthlyValue ??
    (type === 'moto'
      ? (activeContract as any)?.monthlyValue || 0
      : (activeContract as any)?.rentValue || 0);

  const effectiveContractTitle =
    propContractTitle || identifier || `Contrato #${contractId.slice(-6)}`;

  const effectiveClientName = propClientName || tenantName || 'Locatário';

  const effectiveAdjustments =
    propAdjustments || activeContract?.rentAdjustments || [];

  const effectivePendingInstallments = useMemo(() => {
    if (propPendingInstallments && propPendingInstallments.length > 0) {
      return propPendingInstallments;
    }
    if (activeContract?.installments) {
      return activeContract.installments
        .filter((i) => i.status === 'pendente' || isInstallmentOverdue(i))
        .map((i) => ({ number: i.number, dueDate: i.dueDate, amount: i.amount }));
    }
    return [{ number: 1, dueDate: new Date().toISOString(), amount: effectiveCurrentValue }];
  }, [propPendingInstallments, activeContract, effectiveCurrentValue]);

  const [newValue, setNewValue] = useState<number>(effectiveCurrentValue);
  const [reason, setReason] = useState<string>('Reajuste anual padrão');
  const [effectiveFrom, setEffectiveFrom] = useState<number>(
    effectivePendingInstallments.length > 0 ? effectivePendingInstallments[0].number : 1
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const diff = newValue - effectiveCurrentValue;
  const percentChange =
    effectiveCurrentValue > 0 ? (diff / effectiveCurrentValue) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnlyMode) return;
    if (newValue <= 0 || !reason.trim()) return;

    if (type === 'moto') {
      adjustMotoContractRent(contractId, newValue, reason.trim(), effectiveFrom);
    } else {
      adjustKitnetContractRent(contractId, newValue, reason.trim(), effectiveFrom);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2E] bg-[#121214] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/25 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#F2F1ED]">
                Reajustar Valor do Contrato
              </h3>
              <p className="text-xs text-[#9C9CA3] truncate max-w-[260px] sm:max-w-xs">
                {effectiveContractTitle} • {effectiveClientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#2A2A2E] transition-colors cursor-pointer border border-transparent hover:border-[#2A2A2E]"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto modal-scroll-container overscroll-contain flex-1">
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Reajuste aplicado com sucesso! As parcelas futuras foram recalculadas.</span>
            </div>
          )}

          {/* Current vs New comparison */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
            <div>
              <span className="text-[10px] font-semibold uppercase text-[#9C9CA3] block mb-0.5">
                Valor Atual
              </span>
              <span className="text-sm sm:text-base font-bold text-[#F2F1ED] font-mono">
                {formatCurrency(effectiveCurrentValue)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase text-[#9C9CA3] block mb-0.5">
                Novo Valor
              </span>
              <span className="text-sm sm:text-base font-bold text-[#8B5CF6] font-mono">
                {formatCurrency(newValue)}
              </span>
              {diff !== 0 && (
                <span className={`text-[10px] block font-bold mt-0.5 ${diff > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)} ({percentChange > 0 ? `+${percentChange.toFixed(1)}` : percentChange.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Novo Valor da Parcela / Aluguel (R$)
            </label>
            <CurrencyInput
              value={newValue}
              onChange={(val) => setNewValue(val)}
              disabled={isReadOnlyMode}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-sm font-bold text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              A partir de qual parcela aplicar?
            </label>
            <select
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(Number(e.target.value))}
              disabled={isReadOnlyMode}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-semibold text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
            >
              {effectivePendingInstallments.map((inst) => (
                <option key={inst.number} value={inst.number}>
                  Parcela nº {inst.number} (Vence em {formatDate(inst.dueDate)})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#9C9CA3] mt-1">
              As parcelas anteriores e já liquidadas permanecerão inalteradas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Motivo do Reajuste / Observações
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isReadOnlyMode}
              placeholder="Ex: Reajuste anual IPCA/IGPM, Acordo de renovação, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-medium text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
              required
            />
          </div>

          {/* Adjustments History */}
          {effectiveAdjustments.length > 0 && (
            <div className="pt-2 border-t border-[#2A2A2E] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9C9CA3] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Histórico de Reajustes Anteriores ({effectiveAdjustments.length})
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {effectiveAdjustments.map((adj) => (
                  <div
                    key={adj.id}
                    className="p-2.5 rounded-lg bg-[#121214] border border-[#2A2A2E] text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#F2F1ED]">
                        {formatCurrency(adj.previousValue)} → {formatCurrency(adj.newValue)}
                      </div>
                      <div className="text-[10px] text-[#9C9CA3] mt-0.5">
                        {adj.reason} • {formatDate(adj.date)}
                        {adj.effectiveFromInstallment ? ` (a partir da parcela ${adj.effectiveFromInstallment})` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A2A2E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2A2A2E] text-xs font-semibold text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#121214] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isReadOnlyMode || newValue <= 0}
              className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Confirmar Reajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
