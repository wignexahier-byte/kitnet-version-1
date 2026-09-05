import React from 'react';
import { Moto, MotoContract, MotoTenant } from '../../../types';
import {
  FileText,
  TrendingUp,
  History,
  Send,
  Calendar,
  Clock,
  ShieldCheck,
  Wallet,
  User,
} from 'lucide-react';
import { getWeekdayName } from '../../../utils/contractCalculations';
import { isInstallmentOverdue } from '../../../utils/formatters';

interface MotoDetailContractTabProps {
  moto: Moto;
  activeContract?: MotoContract;
  tenant?: MotoTenant;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
  setShowNewContractModal: (show: boolean) => void;
  setShowAdjustmentModal: (show: boolean) => void;
  setShowPaymentModal: (data: { contractId: string; installment: any }) => void;
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  onGenerateDocument: (type: any, moto: Moto, contract?: MotoContract, tenant?: MotoTenant) => void;
}

export const MotoDetailContractTab: React.FC<MotoDetailContractTabProps> = ({
  moto,
  activeContract,
  tenant,
  formatCurrency,
  formatDate,
  setShowNewContractModal,
  setShowAdjustmentModal,
  setShowPaymentModal,
  onOpenWhatsApp,
  onGenerateDocument,
}) => {
  if (!activeContract) {
    return (
      <div className="py-8 text-center bg-[#101012] rounded-xl border border-dashed border-white/[0.08]">
        <FileText className="w-8 h-8 text-[#5F5F66] mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-[#F5F5F7]">Nenhum contrato ativo para esta moto</h4>
        <p className="text-xs text-[#9A9AA2] mt-1 max-w-sm mx-auto">
          Inicie uma locação com intenção de compra de 24 ou 36 meses para gerar o cronograma financeiro.
        </p>
        <button
          onClick={() => setShowNewContractModal(true)}
          className="mt-4 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Criar Novo Contrato</span>
        </button>
      </div>
    );
  }

  const paidCount = activeContract.installments.filter((i) => i.status === 'pago').length;
  const totalCount = activeContract.installments.length;
  const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Contract Summary Box */}
      <div className="bg-[#101012] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3.5">
        {/* Top Header: Tag, Tenant Name and Active Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase tracking-wider">
                <FileText className="w-3 h-3 text-emerald-400" />
                Contrato {activeContract.durationMonths} Meses{' '}
                {activeContract.paymentFrequency === 'semanal'
                  ? `(${activeContract.installments.length} semanas)`
                  : ''}{' '}
                • Opção de Compra
              </span>
              {activeContract.paymentFrequency === 'semanal' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Semanal
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#9A9AA2] shrink-0">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F7]">
                {tenant?.fullName || 'Locatário Não Identificado'}
              </h3>
            </div>
          </div>

          <div className="self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Contrato Ativo
            </span>
          </div>
        </div>

        {/* Main Highlight: Valor Semanal ou Mensal */}
        <div className="bg-[#18181B] border border-white/[0.08] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {activeContract.paymentFrequency === 'semanal' ? (
            <>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9A9AA2] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                  Valor Semanal
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#10B981] tracking-tight tabular-nums">
                    {formatCurrency(
                      activeContract.weeklyValue || activeContract.installments[0]?.amount || 0
                    )}
                  </span>
                  <span className="text-xs text-[#9A9AA2] font-medium">/semana</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.06] flex items-center gap-1.5 text-[#9A9AA2]">
                  <span>4 semanas:</span>
                  <strong className="text-[#F5F5F7] font-semibold">
                    {formatCurrency((activeContract.weeklyValue || activeContract.installments[0]?.amount || 0) * 4)}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9A9AA2] flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                  Valor Mensal
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#10B981] tracking-tight tabular-nums">
                    {formatCurrency(activeContract.monthlyValue)}
                  </span>
                  <span className="text-xs text-[#9A9AA2] font-medium">/mês</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#9A9AA2]">
              Progresso das Parcelas: <strong className="text-[#F5F5F7]">{paidCount}</strong> de <strong className="text-[#F5F5F7]">{totalCount}</strong> quitadas{' '}
              {activeContract.paymentFrequency === 'semanal' ? '(semanais)' : '(mensais)'}
            </span>
            <span className="text-[#10B981] font-bold">{progressPercent}% Quitado</span>
          </div>
          <div className="w-full h-2 bg-[#18181B] rounded-full overflow-hidden border border-white/[0.08]">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3-Column Structured KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-[#18181B]/70 border border-white/[0.06] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#9A9AA2] font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Início do Contrato</span>
            </div>
            <p className="text-sm font-bold text-[#F5F5F7] tabular-nums">
              {formatDate(activeContract.startDate)}
            </p>
          </div>

          <div className="p-3 bg-[#18181B]/70 border border-white/[0.06] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#9A9AA2] font-medium">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Dia de Vencimento</span>
            </div>
            <p className="text-sm font-bold text-[#F5F5F7]">
              {activeContract.paymentFrequency === 'semanal'
                ? `Toda ${getWeekdayName(activeContract.dueDayOfWeek ?? 1)}`
                : `Todo dia ${activeContract.dueDay}`}
            </p>
          </div>

          <div className="p-3 bg-[#18181B]/70 border border-orange-500/20 bg-orange-500/5 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-orange-400/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Caução de Entrada</span>
            </div>
            <p className="text-sm font-bold text-orange-400 tabular-nums">
              {formatCurrency(activeContract.deposit)}
            </p>
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div className="space-y-3">
        {(() => {
          const pendingInstallments = activeContract.installments.filter(
            (i) => i.status !== 'pago' && i.status !== 'cancelada'
          );
          const remainingCount = pendingInstallments.length;
          const totalCount = activeContract.installments.length;
          const paidCount = totalCount - remainingCount;
          const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

          return (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA2]">
                    Tabela de Parcelas
                  </h4>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 tabular-nums">
                    {paidCount} de {totalCount} pagas • {remainingCount} restantes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjustmentModal(true)}
                    className="px-2.5 py-1 bg-[#101012] hover:bg-[#1A203B] text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Reajustar valor das parcelas futuras do contrato"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Reajustar Mensalidade</span>
                  </button>
                </div>
              </div>

              <div className="w-full bg-[#18181B] h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="bg-[#10B981] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Histórico de Reajustes se houver */}
        {activeContract.adjustments && activeContract.adjustments.length > 0 && (
          <div className="mb-3 p-3 bg-[#101012] border border-white/[0.08] rounded-xl">
            <h5 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Histórico de Reajustes Salvos ({activeContract.adjustments.length})</span>
            </h5>
            <div className="space-y-1.5 text-xs text-[#9A9AA2]">
              {activeContract.adjustments.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between py-1 border-b border-white/[0.06] last:border-0"
                >
                  <span>
                    {formatDate(adj.appliedAt)}: de{' '}
                    <strong className="text-[#F5F5F7]">{formatCurrency(adj.previousValue)}</strong>{' '}
                    para{' '}
                    <strong className="text-[#10B981]">{formatCurrency(adj.newValue)}</strong>
                    {adj.percentage ? ` (+${adj.percentage}%)` : ''}
                  </span>
                  <span className="text-[11px] text-[#5F5F66] italic">{adj.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012] max-h-80 overflow-y-auto">
          {/* Mobile View: Stacked Cards */}
          <div className="block sm:hidden divide-y divide-white/[0.08] p-2 space-y-2">
            {activeContract.installments.map((inst) => (
              <div
                key={inst.id}
                className="p-3 bg-[#18181B] rounded-xl border border-white/[0.08] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#F5F5F7] bg-[#101012] px-2 py-0.5 rounded border border-white/[0.08]">
                    Parcela {String(inst.number).padStart(2, '0')}/{inst.totalInstallments}
                  </span>
                  <span className="text-sm font-bold text-[#F5F5F7] tabular-nums">
                    {formatCurrency(inst.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#9A9AA2] pt-0.5">
                  <span>Vencimento:</span>
                  <strong className="text-[#F5F5F7]">{formatDate(inst.dueDate)}</strong>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/[0.08]">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      inst.status === 'pago'
                        ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                        : isInstallmentOverdue(inst)
                        ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {inst.status === 'pago'
                      ? 'Pago'
                      : isInstallmentOverdue(inst)
                      ? 'Atrasado'
                      : 'Pendente'}
                  </span>

                  {inst.status !== 'pago' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(activeContract.id, inst.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#101012] hover:bg-[#25242C] text-[#10B981] font-semibold text-xs border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer"
                        title="Visualizar Mensagem de Cobrança no WhatsApp"
                      >
                        <Send className="w-3 h-3 text-[#10B981]" />
                        <span>Cobrar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowPaymentModal({
                            contractId: activeContract.id,
                            installment: inst,
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition-all cursor-pointer shadow-sm shadow-[#10B981]/20 active:scale-95 flex items-center gap-1.5"
                      >
                        <span>Baixar</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-semibold">
                          {activeContract.installments.filter((i) => i.status !== 'pago' && i.status !== 'cancelada').length} rest.
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onGenerateDocument(
                          'recibo_pagamento',
                          moto,
                          activeContract,
                          tenant
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#101012] hover:bg-[#25242C] text-[#F5F5F7] text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
                    >
                      Ver Recibo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Horizontal Table */}
          <div className="hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-[#9A9AA2] uppercase text-[10px] font-medium sticky top-0 border-b border-white/[0.08]">
                <tr>
                  <th className="p-3">Nº Parcela</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {activeContract.installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-[#18181B]/50 transition-colors">
                    <td className="p-3 font-mono font-medium text-[#F5F5F7]">
                      {String(inst.number).padStart(2, '0')}/{inst.totalInstallments}
                    </td>
                    <td className="p-3 font-medium text-[#F5F5F7]">
                      {formatCurrency(inst.amount)}
                    </td>
                    <td className="p-3 text-[#9A9AA2] font-medium">
                      {formatDate(inst.dueDate)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          inst.status === 'pago'
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                            : isInstallmentOverdue(inst)
                            ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {inst.status === 'pago'
                          ? 'Pago'
                          : isInstallmentOverdue(inst)
                          ? 'Atrasado'
                          : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {inst.status !== 'pago' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenWhatsApp(activeContract.id, inst.id)}
                            className="px-2 py-1 rounded-md bg-transparent hover:bg-[#25242C] text-[#9A9AA2] hover:text-[#F5F5F7] font-medium text-[11px] border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer"
                            title="Visualizar Mensagem de Cobrança no WhatsApp"
                          >
                            <Send className="w-3 h-3 text-[#10B981]" />
                            <span>Cobrar</span>
                          </button>
                          <button
                            onClick={() =>
                              setShowPaymentModal({
                                contractId: activeContract.id,
                                installment: inst,
                              })
                            }
                            className="px-2.5 py-1 rounded-md bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm shadow-[#10B981]/20 active:scale-95 flex items-center gap-1"
                          >
                            <span>Baixar Parcela</span>
                            <span className="px-1.5 py-0.5 rounded bg-black/25 text-[9px] font-semibold">
                              {activeContract.installments.filter((i) => i.status !== 'pago' && i.status !== 'cancelada').length} rest.
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            onGenerateDocument(
                              'recibo_pagamento',
                              moto,
                              activeContract,
                              tenant
                            )
                          }
                          className="px-2.5 py-1 rounded-md bg-transparent hover:bg-[#25242C] text-[#9A9AA2] hover:text-[#F5F5F7] text-[11px] font-medium border border-white/[0.08] transition-all cursor-pointer"
                        >
                          Ver Recibo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
