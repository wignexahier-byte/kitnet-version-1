import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BadgeAlert,
  Layers,
  Users,
  Calendar,
  FileSpreadsheet,
  Bot,
  FileText,
  Settings,
  Calculator,
  Phone,
  Smartphone,
  Lock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { TabType } from './Navigation';
import { useApp } from '../context/AppContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface MoreMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onOpenSimulator: () => void;
  onOpenContacts: () => void;
  onOpenPwaGuide: () => void;
  overdueCount?: number;
}

export const MoreMenuDrawer: React.FC<MoreMenuDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenSimulator,
  onOpenContacts,
  onOpenPwaGuide,
  overdueCount = 0,
}) => {
  const { lockApp, isDemoMode, toggleDemoMode } = useApp();
  useBodyScrollLock(isOpen);

  if (typeof document === 'undefined') return null;

  const menuSections = [
    {
      title: 'Módulos Operacionais',
      items: [
        {
          id: 'cobrancas' as TabType,
          label: 'Central de Cobranças',
          desc: 'Gestão de parcelas e cobrança WhatsApp',
          icon: BadgeAlert,
          color: 'text-[#EF4444]',
          bg: 'bg-[#EF4444]/15',
          badge: overdueCount > 0 ? `${overdueCount} atrasos` : undefined,
          badgeColor: 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30',
        },
        {
          id: 'clientes' as TabType,
          label: 'Clientes & Score',
          desc: 'Cadastro, histórico e pontuação',
          icon: Users,
          color: 'text-[#8B5CF6]',
          bg: 'bg-[#8B5CF6]/15',
        },
        {
          id: 'calendario' as TabType,
          label: 'Calendário Operacional',
          desc: 'Vencimentos, vistorias e manutenções',
          icon: Calendar,
          color: 'text-[#F59E0B]',
          bg: 'bg-[#F59E0B]/15',
        },
        {
          id: 'relatorios' as TabType,
          label: 'Relatórios & Exportação',
          desc: 'DRE, fluxo de caixa e exportação PDF/Excel',
          icon: FileSpreadsheet,
          color: 'text-[#10B981]',
          bg: 'bg-[#10B981]/15',
        },
        {
          id: 'documentos' as TabType,
          label: 'Documentos & Contratos',
          desc: 'Gerador de contratos e recibos com assinatura',
          icon: FileText,
          color: 'text-[#38BDF8]',
          bg: 'bg-[#38BDF8]/15',
        },
        {
          id: 'configuracoes' as TabType,
          label: 'Ajustes & Backup',
          desc: 'Configurações do sistema e dados',
          icon: Settings,
          color: 'text-[#9A9AA2]',
          bg: 'bg-white/10',
        },
      ],
    },
  ];

  const quickTools = [
    {
      label: isDemoMode ? 'Clientes Demo (LIGADO)' : 'Clientes Demo (DESLIGADO)',
      icon: Users,
      color: isDemoMode ? 'text-purple-400' : 'text-slate-400',
      onClick: () => {
        toggleDemoMode();
      },
    },
    {
      label: 'Simulador de Compra',
      icon: Calculator,
      color: 'text-[#8B5CF6]',
      onClick: () => {
        onClose();
        onOpenSimulator();
      },
    },
    {
      label: 'Contatos Rápidos',
      icon: Phone,
      color: 'text-[#10B981]',
      onClick: () => {
        onClose();
        onOpenContacts();
      },
    },
    {
      label: 'Instalar App (PWA)',
      icon: Smartphone,
      color: 'text-[#0EA5E9]',
      onClick: () => {
        onClose();
        onOpenPwaGuide();
      },
    },
    {
      label: 'Bloquear Aplicativo',
      icon: Lock,
      color: 'text-[#EF4444]',
      onClick: () => {
        onClose();
        lockApp();
      },
    },
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Centered Modal Box */}
          <motion.div
            key="drawer-body"
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-full max-w-md bg-[#12141d] border border-white/[0.12] rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/80 z-10 flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Header Centered */}
            <div className="relative pb-3 border-b border-white/[0.08] text-center">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-100 tracking-tight">Menu Completo</h3>
              </div>
              <p className="text-xs text-slate-400">Acesso rápido a todos os módulos e ferramentas</p>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-0 top-0 p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Balanced & Compact without forced scrolling */}
            <div className="py-3.5 space-y-3.5 overflow-y-auto custom-scroll pr-0.5">
              {/* Clientes Demo Toggle Banner */}
              <div className="p-3 rounded-2xl bg-[#181528] border border-purple-500/25 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isDemoMode ? 'bg-purple-500/25 text-purple-300' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-100">Clientes Demo</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          isDemoMode
                            ? 'bg-purple-500/30 text-purple-200 ring-1 ring-purple-400/40'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {isDemoMode ? 'LIGADO' : 'DESLIGADO'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {isDemoMode ? 'Exibindo dados de teste' : 'Apenas dados reais'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDemoMode()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
                    isDemoMode
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs shadow-purple-600/30'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                  }`}
                >
                  {isDemoMode ? 'Desligar' : 'Ligar'}
                </button>
              </div>

              {/* Operational Modules - 2-Column Balanced Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Módulos Operacionais
                  </span>
                  {overdueCount > 0 && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.2 rounded-full border border-rose-500/20">
                      {overdueCount} atrasados
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {menuSections[0].items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectTab(item.id);
                        }}
                        className="p-2.5 rounded-2xl bg-[#161a26] hover:bg-[#1f2436] active:bg-[#252b40] border border-white/[0.07] hover:border-violet-500/30 flex flex-col items-start justify-between text-left transition-all cursor-pointer group active:scale-96 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className={`p-2 rounded-xl ${item.bg} ${item.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>

                        <div className="w-full min-w-0">
                          <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-violet-300 transition-colors">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-sans">
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Tools - Compact 4-Grid */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
                  Ações Rápidas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {quickTools.map((tool, idx) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={tool.onClick}
                        className="px-3 py-2 rounded-xl bg-[#161a26] hover:bg-[#1f2436] active:bg-[#252b40] border border-white/[0.07] flex items-center gap-2 text-left transition-all cursor-pointer group active:scale-95"
                      >
                        <Icon className={`w-4 h-4 ${tool.color} shrink-0`} />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {tool.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
