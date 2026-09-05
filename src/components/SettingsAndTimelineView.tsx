import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { SettingsAccountSection } from './settings/SettingsAccountSection';
import { SettingsSecuritySection } from './settings/SettingsSecuritySection';
import { SettingsLocadorSection } from './settings/SettingsLocadorSection';
import { SettingsBackupSection } from './settings/SettingsBackupSection';
import { SettingsAuditTimelineSection } from './settings/SettingsAuditTimelineSection';
import { SettingsModals } from './settings/SettingsModals';
import { Settings, Shield, Building, Database, Clock, LayoutGrid, CheckCircle2, Users } from 'lucide-react';

interface SettingsAndTimelineViewProps {
  onOpenPwaGuide?: () => void;
}

export const SettingsAndTimelineView: React.FC<SettingsAndTimelineViewProps> = ({ onOpenPwaGuide }) => {
  const {
    timeline,
    settings,
    updateSettings,
    clearTimeline,
    exportBackup,
    importBackup,
    lockApp,
    clearGoogleSession,
    googleSession,
    isDemoMode,
    toggleDemoMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'locador' | 'security' | 'timeline'>('all');

  // Modals state
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showClearTimelineModal, setShowClearTimelineModal] = useState<boolean>(false);

  useBodyScrollLock(Boolean(showLogoutModal || showClearTimelineModal));

  const sessionStartDate = googleSession?.authenticatedAt
    ? formatDate(googleSession.authenticatedAt)
    : 'Hoje';

  interface SettingsTabItem {
    id: 'all' | 'locador' | 'security' | 'timeline';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const tabs: SettingsTabItem[] = [
    { id: 'all', label: 'Tudo', icon: LayoutGrid },
    { id: 'locador', label: 'Locador & PIX', icon: Building },
    { id: 'security', label: 'Segurança & Backup', icon: Shield },
    { id: 'timeline', label: 'Auditoria', icon: Clock, count: timeline.length },
  ];


  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Configurações do Sistema
            </h1>
            <p className="text-xs text-slate-400">
              Gerencie dados cadastrais, segurança, backups e histórico de auditoria
            </p>
          </div>
        </div>

        {/* Tab Filters: container box stays fixed, only buttons scroll horizontally */}
        <div className="w-full sm:w-auto p-1 bg-[#10131e] border border-white/[0.08] rounded-xl max-w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="shrink-0">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Account Section (Always visible or in 'all' / 'locador') */}
      {(activeTab === 'all' || activeTab === 'locador') && (
        <SettingsAccountSection
          settings={settings}
          googleSession={googleSession}
          sessionStartDate={sessionStartDate}
          onOpenPwaGuide={onOpenPwaGuide}
        />
      )}

      {/* 2. Locador & PIX Section */}
      {(activeTab === 'all' || activeTab === 'locador') && (
        <SettingsLocadorSection
          settings={settings}
          updateSettings={updateSettings}
        />
      )}

      {/* 3. Security Section */}
      {(activeTab === 'all' || activeTab === 'security') && (
        <SettingsSecuritySection
          settings={settings}
          lockApp={lockApp}
          onOpenLogoutModal={() => setShowLogoutModal(true)}
        />
      )}

      {/* Modo de Demonstração (Dados de Teste) */}
      {(activeTab === 'all' || activeTab === 'security') && (
        <div className="p-4 sm:p-5 bg-[#14141C] border border-purple-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Modo de Demonstração</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isDemoMode
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 ring-1 ring-purple-500/20'
                      : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {isDemoMode ? 'Ativo' : 'Desativado'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Carrega clientes, kitnets e motos fictícias para demonstração e testes do aplicativo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleDemoMode()}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
              isDemoMode
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/[0.1]'
            }`}
          >
            <span>{isDemoMode ? 'Desligar Modo Demo' : 'Ligar Modo Demo'}</span>
          </button>
        </div>
      )}

      {/* 4. Backup Section */}
      {(activeTab === 'all' || activeTab === 'security') && (
        <SettingsBackupSection
          settings={settings}
          exportBackup={exportBackup}
          importBackup={importBackup}
        />
      )}

      {/* 5. Timeline de Auditoria */}
      {(activeTab === 'all' || activeTab === 'timeline') && (
        <SettingsAuditTimelineSection
          timeline={timeline}
          onOpenClearTimelineModal={() => setShowClearTimelineModal(true)}
        />
      )}

      {/* 6. System Status & Version Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span>Sistema Operacional &middot; Integridade 100%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-400">v2.4.0</span>
          <span>&middot;</span>
          <span>Admin: <strong className="text-slate-300 font-semibold">{settings.adminName || 'Wigne Leal'}</strong></span>
        </div>
      </div>

      {/* Modais de Confirmação */}
      <SettingsModals
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        onConfirmLogout={clearGoogleSession}
        showClearTimelineModal={showClearTimelineModal}
        setShowClearTimelineModal={setShowClearTimelineModal}
        onConfirmClearTimeline={clearTimeline}
      />
    </div>
  );
};

