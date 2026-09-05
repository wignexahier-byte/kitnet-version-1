import React from 'react';
import { Motorbike, Home, CheckCircle2, AlertCircle, Clock, Calendar, FileText } from 'lucide-react';
import { MotoContract, KitnetContract, Moto, Kitnet } from '../../../types';
import { isInstallmentOverdue } from '../../../utils/formatters';

interface ClientDetailContractsTabProps {
  userContracts: (MotoContract | KitnetContract)[];
  tenantType: 'moto' | 'kitnet';
  motos: Moto[];
  kitnets: Kitnet[];
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
}

export const ClientDetailContractsTab: React.FC<ClientDetailContractsTabProps> = ({
  userContracts,
  tenantType,
  motos,
  kitnets,
  formatCurrency,
  formatDate,
}) => {
  if (userContracts.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#121420] border border-white/[0.08] text-center space-y-2">
        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">Nenhum contrato ativo encontrado</h4>
        <p className="text-xs text-slate-400">Este cliente ainda não possui vínculos contratuais registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {userContracts.map((contract) => {
        const moto = tenantType === 'moto' ? motos.find((m) => m.id === (contract as MotoContract).motoId) : null;
        const kitnet = tenantType === 'kitnet' ? kitnets.find((k) => k.id === (contract as KitnetContract).kitnetId) : null;
        const paid = contract.installments.filter((i) => i.status === 'pago');
        const percent = Math.round((paid.length / contract.durationMonths) * 100);

        return (
          <div key={contract.id} className="bg-[#121420] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06] flex-wrap">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    tenantType === 'moto'
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                  }`}
                >
                  {tenantType === 'moto' ? <Motorbike className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                </div>
                <div>
                  <span className="font-bold text-white text-sm block">
                    {moto ? `${moto.brand} ${moto.model} (${moto.plate})` : kitnet ? `${kitnet.name} - Nº ${kitnet.number}` : 'Contrato Ativo'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">ID Contrato: #{contract.id.slice(0, 8)}</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border shadow-sm ${
                  contract.status === 'ativo'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-700/30 text-slate-300 border-white/[0.1]'
                }`}
              >
                {contract.status.toUpperCase()}
              </span>
            </div>

            {/* Visual Progress - Clean */}
            <div className="space-y-2 py-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-medium">
                  Progresso: <strong className="text-white">{paid.length}</strong> de <strong className="text-white">{contract.durationMonths}</strong> parcelas pagas
                </span>
                <strong className="text-emerald-400 font-mono">{percent}%</strong>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Installments Table */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Grade de Parcelas & Vencimentos:
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {contract.installments.map((inst) => {
                  const isPaid = inst.status === 'pago';
                  const isOverdue = isInstallmentOverdue(inst);
                  const statusLabel = isPaid ? 'PAGO' : isOverdue ? 'ATRASADO' : 'PENDENTE';

                  const badgeClass = isPaid
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isOverdue
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-violet-500/15 text-violet-300 border-violet-500/30';

                  return (
                    <div
                      key={inst.id}
                      className="py-2 px-3 hover:bg-white/[0.03] rounded-xl flex items-center justify-between text-xs transition-colors border-b border-white/[0.03] last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        {isPaid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-violet-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-white">
                            Parcela {inst.number}/{contract.durationMonths}
                          </span>
                          <span className="text-slate-400 ml-2 font-mono text-[11px]">
                            Vencimento: {formatDate(inst.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-mono font-bold text-white text-xs">{formatCurrency(inst.amount)}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border shadow-xs ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

