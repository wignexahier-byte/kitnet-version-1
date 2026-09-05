import React from 'react';
import {
  User,
  Shield,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import { MotoTenant, KitnetTenant } from '../../../types';
import { calculateClientScore } from '../../../utils/scoreCalculator';

interface ClientDetailProfileTabProps {
  tenant: MotoTenant | KitnetTenant;
  tenantType: 'moto' | 'kitnet';
  clientScore: ReturnType<typeof calculateClientScore>;
  scoreBadgeColors: Record<string, string>;
  setActiveTab: (tab: 'perfil' | 'contratos' | 'score' | 'ocorrencias' | 'documentos') => void;
  formatCPF: (cpf: string) => string;
  formatDate: (dateStr: string) => string;
  formatPhone: (phone: string) => string;
  formatCurrency: (value: number) => string;
  getCNHStatus: (expirationDate: string) => { label: string; badgeClass: string };
}

export const ClientDetailProfileTab: React.FC<ClientDetailProfileTabProps> = ({
  tenant,
  tenantType,
  clientScore,
  setActiveTab,
  formatCPF,
  formatDate,
  formatPhone,
  formatCurrency,
  getCNHStatus,
}) => {
  const isExcelente = clientScore.classification === 'excelente';
  const isMedio = clientScore.classification === 'medio';
  const isAltoRisco = clientScore.classification === 'alto_risco';

  const scoreBadgeStyle = isExcelente
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
    : isMedio
    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
    : 'bg-red-500/15 border-red-500/30 text-red-400';

  const scoreBarColor = isExcelente
    ? 'bg-emerald-500'
    : isMedio
    ? 'bg-amber-500'
    : 'bg-red-500';

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* Quick Score Highlight Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121420] border border-white/[0.08] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Score Interno de Confiabilidade
            </span>
            <button
              onClick={() => setActiveTab('score')}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 transition-colors cursor-pointer sm:hidden"
            >
              <span>Ver Detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {clientScore.score}
              <span className="text-base text-slate-500 font-normal">/100</span>
            </span>

            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm ${scoreBadgeStyle}`}
            >
              {isExcelente ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : isAltoRisco ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Award className="w-3.5 h-3.5" />
              )}
              <span>
                {isExcelente ? 'Excelente (Baixo Risco)' : isMedio ? 'Médio Risco' : 'Alto Risco'}
              </span>
            </div>
          </div>

          {/* Mini score progress bar */}
          <div className="w-full bg-[#161825] rounded-full h-2 overflow-hidden border border-white/[0.04] mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreBarColor}`}
              style={{ width: `${Math.max(clientScore.score, 4)}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setActiveTab('score')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161825] hover:bg-[#1f2235] text-violet-300 hover:text-white border border-violet-500/20 hover:border-violet-500/40 text-xs font-bold transition-all duration-150 cursor-pointer active:scale-95 shrink-0"
        >
          <span>Ver Detalhes do Score</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Personal Data Card - Clean Key-Value Structure */}
      <div className="bg-[#121420] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Identificação & Contato
            </h3>
            <p className="text-[11px] text-slate-400">Dados cadastrais e meios de contato</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Nome Completo
            </span>
            <strong className="text-white text-sm font-semibold block">{tenant.fullName}</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              CPF
            </span>
            <strong className="text-slate-200 text-sm font-mono font-bold block">{formatCPF(tenant.cpf)}</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              RG
            </span>
            <span className="text-slate-200 text-sm font-mono font-medium block">
              {tenant.rg || 'Não informado'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Data de Nascimento
            </span>
            <span className="text-slate-200 text-sm font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(tenant.birthDate)}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              WhatsApp / Contato
            </span>
            <a
              href={`https://wa.me/55${(tenant.whatsapp || tenant.phone).replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatPhone(tenant.whatsapp || tenant.phone)}</span>
            </a>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              E-mail
            </span>
            <span className="text-slate-200 text-sm font-medium flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{tenant.email || 'Não informado'}</span>
            </span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-white/[0.04]">
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Endereço Residencial
            </span>
            <span className="text-slate-200 text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{tenant.address || 'Endereço não cadastrado'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Moto Specific Data: CNH - Clean Layout */}
      {tenantType === 'moto' && 'cnh' in tenant && (
        <div className="bg-[#121420] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Carteira Nacional de Habilitação (CNH)
              </h3>
              <p className="text-[11px] text-slate-400">Validação documental do condutor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
                Número de Registro
              </span>
              <strong className="text-white font-mono font-bold text-sm block">{tenant.cnh.number}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
                Categoria
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold inline-block text-xs">
                {tenant.cnh.category}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
                Validade da CNH
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-violet-300 font-mono font-semibold text-xs">
                  {formatDate(tenant.cnh.expirationDate)}
                </strong>
                {(() => {
                  const cnh = getCNHStatus(tenant.cnh.expirationDate);
                  return (
                    <span
                      className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 ${cnh.badgeClass}`}
                    >
                      {cnh.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial & Income Card - Clean Layout */}
      <div className="bg-[#121420] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Perfil Profissional & Renda Declarada
            </h3>
            <p className="text-[11px] text-slate-400">Capacidade financeira e ocupação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Profissão / Ocupação
            </span>
            <strong className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {tenantType === 'moto'
                  ? (tenant as MotoTenant).profession || 'Locatário / Entregador'
                  : (tenant as KitnetTenant).incomeType?.toUpperCase() || 'Inquilino'}
              </span>
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-1">
              Renda Mensal Declarada
            </span>
            <strong className="text-emerald-400 font-mono font-bold text-sm block">
              {(() => {
                const inc = tenantType === 'moto' ? (tenant as MotoTenant).income : undefined;
                return inc !== undefined && inc !== null && inc > 0 ? formatCurrency(inc) : 'Não informado';
              })()}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

