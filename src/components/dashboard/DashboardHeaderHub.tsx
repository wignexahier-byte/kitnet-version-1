import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Calculator,
  Phone,
  Smartphone,
  Bell,
  FileSpreadsheet,
  AlertTriangle,
  Scale,
  FileCheck2,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { TabType } from '../Navigation';

interface DashboardHeaderHubProps {
  notificationState: string;
  onEnableNotifications: () => void;
  onOpenReportModal: () => void;
  onOpenSimulator?: () => void;
  onOpenContacts?: () => void;
  onOpenPwaGuide?: () => void;
  onNavigateTab: (tab: TabType) => void;
  totalInadimplenciaGeral: number;
  totalMotos: number;
  totalKitnets: number;
  motosAlugadas: number;
  kitnetsAlugadas: number;
  totalContratosAtivos: number;
}

export const DashboardHeaderHub: React.FC<DashboardHeaderHubProps> = ({
  notificationState,
  onEnableNotifications,
  onOpenReportModal,
  onOpenSimulator,
  onOpenContacts,
  onOpenPwaGuide,
  onNavigateTab,
  totalInadimplenciaGeral,
  totalMotos,
  totalKitnets,
  motosAlugadas,
  kitnetsAlugadas,
  totalContratosAtivos,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="app-card p-5 sm:p-6 relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/12 border border-[#8B5CF6]/25 text-[#8B5CF6] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span>Controle Patrimonial & Financeiro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#9A9AA2] max-w-xl">
            Visão consolidada da operação, faturamento real, liquidez e gestão de inadimplência.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="btn-primary px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shrink-0"
            title="Gerar e exportar relatório executivo consolidado"
          >
            <FileText className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>

          {onOpenSimulator && (
            <button
              type="button"
              onClick={onOpenSimulator}
              className="btn-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0"
              title="Simulador de Compra e Retorno de Investimento"
            >
              <Calculator className="w-4 h-4 text-[#8B5CF6]" />
              <span>Simulador</span>
            </button>
          )}

          {onOpenContacts && (
            <button
              type="button"
              onClick={onOpenContacts}
              className="btn-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0"
              title="Central de Contatos Rápidos"
            >
              <Phone className="w-4 h-4 text-[#8B5CF6]" />
              <span>Contatos</span>
            </button>
          )}

          {onOpenPwaGuide && (
            <button
              type="button"
              onClick={onOpenPwaGuide}
              className="btn-secondary px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0"
              title="Instalar aplicativo no celular ou computador"
            >
              <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
              <span>App Celular</span>
            </button>
          )}

          {notificationState !== 'granted' && (
            <button
              type="button"
              onClick={onEnableNotifications}
              className="px-3.5 py-2.5 rounded-xl bg-[#8B5CF6]/12 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
              title="Ativar notificações em tempo real"
            >
              <Bell className="w-4 h-4 animate-bounce" />
              <span>Ativar Alertas</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Access Navigation Hub Grid */}
      <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.07)]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#9A9AA2] mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Acesso Rápido</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Hub 1: Cobranças */}
          <button
            type="button"
            id="dashboard-btn-cobrancas"
            onClick={() => onNavigateTab('cobrancas')}
            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer active:scale-98 ${
              totalInadimplenciaGeral > 0
                ? 'bg-[#EF4444]/10 hover:bg-[#EF4444]/15 border-[#EF4444]/30'
                : 'bg-[#141418] hover:bg-[#1E1D24] border-[rgba(255,255,255,0.07)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`p-2 rounded-lg ${
                  totalInadimplenciaGeral > 0 ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-white/5 text-[#9A9AA2]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              {totalInadimplenciaGeral > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                  Atrasos
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F7]">Central de Cobranças</h4>
              <p
                className={`text-[11px] font-semibold mt-0.5 truncate ${
                  totalInadimplenciaGeral > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}
              >
                {totalInadimplenciaGeral > 0 ? `${formatCurrency(totalInadimplenciaGeral)} pendente` : 'Tudo em dia'}
              </p>
            </div>
          </button>

          {/* Hub 2: Financeiro */}
          <button
            type="button"
            id="dashboard-btn-financeiro"
            onClick={() => onNavigateTab('financeiro')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1E1D24] border border-[rgba(255,255,255,0.07)] text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white/5 text-[#E07A3F] group-hover:text-[#F5F5F7]">
                <Scale className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F7]">Fluxo de Caixa</h4>
              <p className="text-[11px] text-[#9A9AA2] font-medium mt-0.5 truncate">
                Receitas e despesas do mês
              </p>
            </div>
          </button>

          {/* Hub 3: Clientes & Score */}
          <button
            type="button"
            id="dashboard-btn-clientes"
            onClick={() => onNavigateTab('clientes')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1E1D24] border border-[rgba(255,255,255,0.07)] text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-white/5 text-[#9A9AA2] group-hover:text-[#F5F5F7]">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F7]">Clientes & Score</h4>
              <p className="text-[11px] text-[#9A9AA2] font-medium mt-0.5 truncate">
                {totalContratosAtivos} locatários ativos
              </p>
            </div>
          </button>

          {/* Hub 4: Relatórios & Exportação */}
          <button
            type="button"
            id="dashboard-btn-relatorios"
            onClick={() => onNavigateTab('relatorios')}
            className="p-3.5 rounded-xl bg-[#141418] hover:bg-[#1E1D24] border border-[rgba(255,255,255,0.07)] text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-[#10B981]">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9A9AA2] group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#F5F5F7]">Relatórios & DRE</h4>
              <p className="text-[11px] text-[#9A9AA2] font-medium mt-0.5 truncate">
                Exportações em Excel e PDF
              </p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
