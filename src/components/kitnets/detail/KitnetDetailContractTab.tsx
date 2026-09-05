import React from 'react';
import {
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  History,
  Send,
  UserPlus,
  ShieldCheck,
  Wallet,
  User,
  Sparkles,
} from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant } from '../../../types';
import { isInstallmentOverdue } from '../../../utils/formatters';

interface KitnetDetailContractTabProps {
  kitnet: Kitnet;
  activeContract?: KitnetContract;
  tenant?: KitnetTenant;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
  handleOpenNewContract: (kitnet: Kitnet) => void;
  setRenewForm: (data: { additionalMonths: number; newRentValue: number; reason: string }) => void;
  setShowRenewModal: (show: boolean) => void;
  setShowAdjustmentModal: (show: boolean) => void;
  setShowPaymentModal: (data: { contractId: string; installment: any }) => void;
  onOpenWhatsApp?: (contractId: string, installmentId?: string) => void;
  handleSendKitnetWhatsApp: () => void;
}

export const KitnetDetailContractTab: React.FC<KitnetDetailContractTabProps> = ({
  kitnet,
  activeContract,
  tenant,
  formatCurrency,
  formatDate,
  handleOpenNewContract,
  setRenewForm,
  setShowRenewModal,
  setShowAdjustmentModal,
  setShowPaymentModal,
  onOpenWhatsApp,
  handleSendKitnetWhatsApp,
}) => {
  return (
    <div className="space-y-4">
      {activeContract ? (
        <>
          {(() => {
            const isRolloverActive = activeContract.installments.length > activeContract.durationMonths;
            const vigenciaCount = Math.ceil(activeContract.installments.length / (activeContract.durationMonths || 12));

            return (
              <>
                <div className="bg-[#101012] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3.5">
                  {/* Top: Header with Contract Badge, Tenant Name and Active Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 uppercase tracking-wider">
                          <FileText className="w-3 h-3" />
                          Contrato Residencial • {activeContract.durationMonths} Meses Iniciais
                        </span>
                        {isRolloverActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                            <Clock className="w-3 h-3" />
                            {vigenciaCount}ª Vigência • Indeterminado (Art. 46)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#9A9AA2] shrink-0">
                          <User className="w-4 h-4 text-[#0EA5E9]" />
                        </div>
                        <h3 className="text-base font-bold text-[#F5F5F7]">
                          {tenant?.fullName || 'Inquilino'}
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

                  {/* Main Highlight: Valor Mensal Total */}
                  <div className="bg-[#18181B] border border-white/[0.08] rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9A9AA2] flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                        Valor Mensal Total
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#10B981] tracking-tight tabular-nums">
                          {formatCurrency(
                            activeContract.rentValue +
                              (activeContract.waterValue || 0) +
                              (activeContract.internetValue || 0) +
                              (activeContract.otherFees || 0)
                          )}
                        </span>
                        <span className="text-xs text-[#9A9AA2] font-medium">/mês</span>
                      </div>
                    </div>

                    {/* Breakdown Chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.06] flex items-center gap-1.5 text-[#9A9AA2]">
                        <span>Aluguel:</span>
                        <strong className="text-[#F5F5F7] font-semibold">{formatCurrency(activeContract.rentValue)}</strong>
                      </div>
                      {Boolean(activeContract.waterValue) && (
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#101012] border border-white/[0.06] flex items-center gap-1.5 text-[#9A9AA2]">
                          <span>Água:</span>
                          <strong className="text-[#F5F5F7] font-semibold">+{formatCurrency(activeContract.waterValue || 0)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4-Column Structured KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-[#18181B]/70 border border-white/[0.06] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#9A9AA2] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#0EA5E9]" />
                        <span>Início</span>
                      </div>
                      <p className="text-sm font-bold text-[#F5F5F7] tabular-nums">
                        {formatDate(activeContract.startDate)}
                      </p>
                    </div>

                    <div className="p-3 bg-[#18181B]/70 border border-white/[0.06] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#9A9AA2] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Vencimento</span>
                      </div>
                      <p className="text-sm font-bold text-[#F5F5F7]">
                        Dia {activeContract.dueDay}
                      </p>
                    </div>

                    <div className="p-3 bg-[#18181B]/70 border border-orange-500/20 bg-orange-500/5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-orange-400/90 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                        <span>Caução</span>
                      </div>
                      <p className="text-sm font-bold text-orange-400 tabular-nums">
                        {formatCurrency(activeContract.deposit || 0)}
                      </p>
                    </div>

                    <div className="p-3 bg-[#18181B]/70 border border-white/[0.06] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#9A9AA2] font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>Taxa Limpeza</span>
                      </div>
                      <p className="text-sm font-bold text-[#A78BFA] tabular-nums">
                        {formatCurrency(activeContract.cleaningFee !== undefined ? activeContract.cleaningFee : (kitnet.cleaningFeeBase || 0))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner Informativo de Renovação Legal / Rollover */}
                {isRolloverActive && (
                  <div className="p-3 bg-[#18181B] border border-white/[0.08] rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#0EA5E9] font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Prorrogação Automática por Prazo Indeterminado</span>
                      </div>
                      <p className="text-[11px] text-[#9A9AA2] leading-relaxed">
                        O prazo de {activeContract.durationMonths} meses foi cumprido com sucesso. A locação segue ativa ininterruptamente nos termos do Art. 46 e 47 da Lei 8.245/91, com todas as cláusulas e garantias preservadas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRenewForm({
                          additionalMonths: 12,
                          newRentValue: activeContract.rentValue,
                          reason: `Formalização da ${vigenciaCount + 1}ª Vigência contratual`,
                        });
                        setShowRenewModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      + Aditivo / Renovação
                    </button>
                  </div>
                )}
              </>
            );
          })()}

          {/* Header com Ações de Reajuste & Renovação */}
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
                      Cronograma de Mensalidades
                    </h4>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 tabular-nums">
                      {paidCount} de {totalCount} pagas • {remainingCount} restantes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRenewForm({
                          additionalMonths: 12,
                          newRentValue: activeContract.rentValue,
                          reason: 'Prorrogação formal com extensão do cronograma de parcelas',
                        });
                        setShowRenewModal(true);
                      }}
                      className="px-2.5 py-1 bg-[#101012] hover:bg-[#25242C] text-[#F5F5F7] border border-white/[0.08] rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Gerar novo ciclo de parcelas (+12 ou +24 meses)"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>Renovar / Estender</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdjustmentModal(true)}
                      className="px-2.5 py-1 bg-[#101012] hover:bg-[#25242C] text-[#8B5CF6] border border-[#8B5CF6]/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reajustar valor das próximas mensalidades (IGP-M, IPCA ou Personalizado)"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Reajustar Aluguel</span>
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

          {/* Histórico de Reajustes Salvos */}
          {activeContract.adjustments && activeContract.adjustments.length > 0 && (
            <div className="p-3 bg-[#101012] border border-white/[0.08] rounded-xl">
              <h5 className="text-xs font-semibold text-[#8B5CF6] flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5" />
                <span>Histórico de Reajustes Anuais ({activeContract.adjustments.length})</span>
              </h5>
              <div className="space-y-1.5 text-xs text-[#9A9AA2]">
                {activeContract.adjustments.map((adj) => (
                  <div key={adj.id} className="flex items-center justify-between py-1 border-b border-white/[0.06] last:border-0">
                    <span>
                      {formatDate(adj.appliedAt)}: de <strong className="text-[#F5F5F7]">{formatCurrency(adj.previousValue)}</strong> para <strong className="text-[#10B981]">{formatCurrency(adj.newValue)}</strong>
                      {adj.percentage ? ` (+${adj.percentage}%)` : ''}
                    </span>
                    <span className="text-[11px] text-[#5F5F66] italic">{adj.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installments Table (Desktop) & Stacked Cards (Mobile) */}
          <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#101012] max-h-80 overflow-y-auto">
            {/* Mobile View: Stacked Cards */}
            <div className="block sm:hidden divide-y divide-white/[0.08] p-2 space-y-2">
              {activeContract.installments.map((inst) => (
                <div key={inst.id} className="p-3 bg-[#18181B] rounded-xl border border-white/[0.08] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#F5F5F7] bg-[#101012] px-2 py-0.5 rounded border border-white/[0.08]">
                      Mês {inst.number}
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
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        inst.status === 'pago'
                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                          : isInstallmentOverdue(inst)
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                          : 'bg-[#101012] text-[#9A9AA2] border-white/[0.08]'
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
                          onClick={() => {
                            if (onOpenWhatsApp) {
                              onOpenWhatsApp(activeContract.id, inst.id);
                            } else {
                              handleSendKitnetWhatsApp();
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#101012] hover:bg-[#25242C] text-[#10B981] font-semibold text-xs border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer"
                          title="Visualizar Mensagem de Cobrança no WhatsApp"
                        >
                          <Send className="w-3 h-3" />
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
                          <span>Dar Baixa</span>
                          <span className="px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-semibold">
                            {activeContract.installments.filter((i) => i.status !== 'pago' && i.status !== 'cancelada').length} rest.
                          </span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#10B981] font-bold">Quitado</span>
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
                    <th className="p-3">Mês</th>
                    <th className="p-3">Valor Total</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {activeContract.installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-[#18181B]/50 transition-colors">
                      <td className="p-3 font-mono font-medium text-[#F5F5F7]">Mês {inst.number}</td>
                      <td className="p-3 font-medium text-[#F5F5F7]">
                        {formatCurrency(inst.amount)}
                      </td>
                      <td className="p-3 text-[#9A9AA2] font-medium">
                        {formatDate(inst.dueDate)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            inst.status === 'pago'
                              ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                              : isInstallmentOverdue(inst)
                              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                              : 'bg-[#101012] text-[#9A9AA2] border-white/[0.08]'
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
                              onClick={() => {
                                if (onOpenWhatsApp) {
                                  onOpenWhatsApp(activeContract.id, inst.id);
                                } else {
                                  handleSendKitnetWhatsApp();
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-transparent hover:bg-[#25242C] text-[#10B981] font-medium text-[11px] border border-white/[0.08] transition-all flex items-center gap-1 cursor-pointer"
                              title="Visualizar Mensagem de Cobrança no WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>Cobrar</span>
                            </button>
                            <button
                              onClick={() =>
                                setShowPaymentModal({
                                 contractId: activeContract.id,
                                 installment: inst,
                               })
                             }
                             className="px-2.5 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-[11px] transition-all cursor-pointer shadow-sm shadow-[#10B981]/20 active:scale-95 flex items-center gap-1"
                            >
                              <span>Dar Baixa</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/25 text-[9px] font-semibold">
                                {activeContract.installments.filter((i) => i.status !== 'pago' && i.status !== 'cancelada').length} rest.
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#10B981] font-medium">Quitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center bg-[#101012] rounded-xl border border-dashed border-white/[0.08] space-y-3">
          <FileText className="w-7 h-7 text-[#5F5F66] mx-auto" />
          <div>
            <p className="text-sm font-semibold text-[#F5F5F7]">Nenhum contrato ativo para esta unidade</p>
            <p className="text-xs text-[#9A9AA2] mt-0.5">Esta kitnet está disponível para novo inquilino.</p>
          </div>
          <button
            onClick={() => handleOpenNewContract(kitnet)}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Contrato Agora</span>
          </button>
        </div>
      )}
    </div>
  );
};
