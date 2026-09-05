import React from 'react';
import { Shield, Lock, LogOut, CheckCircle2, ChevronRight, KeyRound } from 'lucide-react';
import { SystemSettings } from '../../types';

interface SettingsSecuritySectionProps {
  settings: SystemSettings;
  lockApp: () => void;
  onOpenLogoutModal: () => void;
}

export const SettingsSecuritySection: React.FC<SettingsSecuritySectionProps> = ({
  settings,
  lockApp,
  onOpenLogoutModal,
}) => {
  return (
    <div className="rounded-2xl bg-[#11141e]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl shadow-black/30 space-y-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Segurança & Sessão
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Google Autenticado
        </span>
      </div>

      {/* Security Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Bloquear App */}
        <button
          type="button"
          onClick={lockApp}
          className="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-b from-[#161a27] to-[#12141f] hover:from-[#1b2030] hover:to-[#151824] border border-white/[0.08] hover:border-violet-500/40 text-left flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-md hover:shadow-violet-950/20 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 group-hover:scale-105 group-hover:text-violet-300 transition-all shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                  Bloquear Acesso Agora
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Retorna à tela de login seguro
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-violet-500/20 flex items-center justify-center text-slate-400 group-hover:text-violet-300 shrink-0 transition-all group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Sair da Conta Google */}
        <button
          type="button"
          onClick={onOpenLogoutModal}
          className="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-b from-[#161a27] to-[#12141f] hover:from-rose-950/20 hover:to-[#151824] border border-white/[0.08] hover:border-rose-500/40 text-left flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer shadow-md hover:shadow-rose-950/20 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 group-hover:scale-105 group-hover:text-rose-300 transition-all shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                Encerrar Sessão
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Desconecta {settings.adminEmail || 'Google Auth'}
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-rose-500/20 flex items-center justify-center text-slate-400 group-hover:text-rose-300 shrink-0 transition-all group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

