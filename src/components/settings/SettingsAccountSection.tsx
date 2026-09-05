import React from 'react';
import { Smartphone, Sparkles, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { SystemSettings } from '../../types';

interface SettingsAccountSectionProps {
  settings: SystemSettings;
  googleSession: any;
  sessionStartDate: string;
  onOpenPwaGuide?: () => void;
}

export const SettingsAccountSection: React.FC<SettingsAccountSectionProps> = ({
  settings,
  googleSession,
  sessionStartDate,
  onOpenPwaGuide,
}) => {
  const initial = settings.adminName?.charAt(0) || 'W';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141724] via-[#10121c] to-[#0a0c13] border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 p-5 sm:p-6 shadow-xl shadow-black/40">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
          {/* Avatar with glowing ring */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-violet-600/30 ring-2 ring-violet-400/30 overflow-hidden">
              {googleSession?.picture ? (
                <img
                  src={googleSession.picture}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            {/* Online Indicator */}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-[#10121c]" />
            </span>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight break-words">
                {settings.adminName || 'Administrador'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30">
                <ShieldCheck className="w-3 h-3 text-violet-400" />
                Administrador
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {settings.adminEmail || 'wleal0131@gmail.com'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500 text-[11px] font-sans">
                <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                Ativo desde {sessionStartDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right: PWA Install Button */}
        {onOpenPwaGuide && (
          <button
            type="button"
            onClick={onOpenPwaGuide}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 border border-violet-500/30 hover:border-violet-500/50 text-violet-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-violet-900/20 active:scale-95 shrink-0 group"
          >
            <Smartphone className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
            <span>Instalar no Celular</span>
            <Sparkles className="w-3.5 h-3.5 text-violet-400/70" />
          </button>
        )}
      </div>
    </div>
  );
};

