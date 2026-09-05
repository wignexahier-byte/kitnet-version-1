import React, { useState, useMemo, memo } from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from './Navigation';
import { ReportExportModal } from './ReportExportModal';
import { useDashboardMetrics } from './dashboard/useDashboardMetrics';
import { DashboardOverviewHero } from './dashboard/DashboardOverviewHero';
import { DashboardAssetsSummary } from './dashboard/DashboardAssetsSummary';
import { DashboardAlertsList } from './dashboard/DashboardAlertsList';
import { DashboardPerformanceChart } from './dashboard/DashboardPerformanceChart';
import { isInstallmentOverdue } from '../utils/formatters';
import { getTodayLocalDateString, daysBetweenDates } from '../domain';
import { useRenderTracker } from '../utils/perfLogger';

interface DashboardViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenNewMotoModal?: () => void;
  onOpenNewKitnetModal?: () => void;
  onOpenNewExpenseModal?: () => void;
  onOpenDocModal?: () => void;
  onOpenWhatsAppModal: (contractId?: string, installmentId?: string) => void;
  onOpenSimulator?: () => void;
  onOpenContacts?: () => void;
  onOpenPwaGuide?: () => void;
}

export const DashboardViewComponent: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenWhatsAppModal,
  onOpenSimulator,
  onOpenContacts,
  onOpenPwaGuide,
}) => {
  useRenderTracker('DashboardView');

  const {
    motos,
    motoTenants,
    motoContracts,
    kitnets,
    kitnetContracts,
    kitnetTenants,
    expenses,
    settings,
    requestBrowserNotifications,
  } = useApp();

  const [notificationState, setNotificationState] = useState<string>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [chartViewMode, setChartViewMode] = useState<'evolution' | 'comparison'>('evolution');

  const handleEnableNotifications = async () => {
    const perm = await requestBrowserNotifications();
    setNotificationState(perm ? 'granted' : 'denied');
  };

  const metrics = useDashboardMetrics({
    motos,
    motoTenants,
    motoContracts,
    kitnets,
    kitnetContracts,
    kitnetTenants,
    expenses,
    settings,
  });

  // Calculate installment breakdown counts
  const { overdueCount, dueTodayCount, upcomingCount } = useMemo(() => {
    const todayStr = getTodayLocalDateString();

    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;

    const allInstallments = [
      ...motoContracts.flatMap((c) => c.installments),
      ...kitnetContracts.flatMap((c) => c.installments),
    ];

    allInstallments.forEach((inst) => {
      if (inst.status !== 'pago') {
        if (isInstallmentOverdue(inst)) {
          overdue++;
        } else if (inst.dueDate === todayStr) {
          dueToday++;
        } else {
          const diff = daysBetweenDates(todayStr, inst.dueDate);
          if (diff > 0 && diff <= 7) {
            upcoming++;
          }
        }
      }
    });

    return { overdueCount: overdue, dueTodayCount: dueToday, upcomingCount: upcoming };
  }, [motoContracts, kitnetContracts]);

  const totalBens = metrics.totalMotos + metrics.totalKitnets;
  const totalAlugados = metrics.motosAlugadas + metrics.kitnetsAlugadas;
  const taxaOcupacaoGeral = totalBens > 0 ? (totalAlugados / totalBens) * 100 : 0;

  return (
    <div className="space-y-8 font-sans pb-2">
      {/* 1. Exact Main Hero Dashboard (Header, 4 KPIs, Alert Banner, Quick Actions, Quick Access) */}
      <DashboardOverviewHero
        notificationState={notificationState}
        onEnableNotifications={handleEnableNotifications}
        onOpenReportModal={() => setShowReportModal(true)}
        onOpenSimulator={onOpenSimulator}
        onOpenContacts={onOpenContacts}
        onOpenPwaGuide={onOpenPwaGuide}
        onNavigateTab={onNavigateTab}
        faturamentoBrutoMensal={metrics.faturamentoBrutoMensal}
        receitaMesAtualTotal={metrics.receitaMesAtualTotal}
        receitaMesAtualMotos={metrics.receitaMesAtualMotos}
        receitaMesAtualKitnets={metrics.receitaMesAtualKitnets}
        receitaAnualProjetada={metrics.receitaAnualProjetada}
        faturamentoMensalMotos={metrics.faturamentoMensalMotos}
        faturamentoMensalKitnets={metrics.faturamentoMensalKitnets}
        totalReceitaRecebida={metrics.totalReceitaRecebida}
        totalAReceber={metrics.totalAReceber}
        totalInadimplenciaGeral={metrics.totalInadimplenciaGeral}
        totalMotos={metrics.totalMotos}
        totalKitnets={metrics.totalKitnets}
        motosAlugadas={metrics.motosAlugadas}
        kitnetsAlugadas={metrics.kitnetsAlugadas}
        totalContratosAtivos={metrics.totalContratosAtivos}
        patrimonioTotalAvaliado={metrics.patrimonioTotalAvaliado}
        overdueCount={overdueCount}
        dueTodayCount={dueTodayCount}
        upcomingCount={upcomingCount}
        taxaOcupacaoGeral={taxaOcupacaoGeral}
        monthlyEvolutionData={metrics.monthlyEvolutionData}
      />

      {/* 2. Gestão & Performance de Ativos (Frota de Motos & Imóveis Kitnets) */}
      <DashboardAssetsSummary
        totalMotos={metrics.totalMotos}
        motosAlugadas={metrics.motosAlugadas}
        motosDisponiveis={metrics.motosDisponiveis}
        motosManutencao={metrics.motosManutencao}
        taxaOcupacaoMotos={metrics.taxaOcupacaoMotos}
        faturamentoMensalMotos={metrics.faturamentoMensalMotos}
        receitaMesAtualMotos={metrics.receitaMesAtualMotos}
        inadimplenciaMotos={metrics.inadimplenciaMotos}
        inadimplenciaPctMotos={metrics.inadimplenciaPctMotos}
        valorInvestidoMotos={metrics.valorInvestidoMotos}
        totalKitnets={metrics.totalKitnets}
        kitnetsAlugadas={metrics.kitnetsAlugadas}
        kitnetsDisponiveis={metrics.kitnetsDisponiveis}
        kitnetsManutencao={metrics.kitnetsManutencao}
        taxaOcupacaoKitnets={metrics.taxaOcupacaoKitnets}
        faturamentoMensalKitnets={metrics.faturamentoMensalKitnets}
        receitaMesAtualKitnets={metrics.receitaMesAtualKitnets}
        inadimplenciaKitnets={metrics.inadimplenciaKitnets}
        inadimplenciaPctKitnets={metrics.inadimplenciaPctKitnets}
        valorInvestidoKitnets={metrics.valorInvestidoKitnets}
        onNavigateTab={onNavigateTab}
        onOpenReportModal={() => setShowReportModal(true)}
      />

      {/* 3. Alertas & Comparativo Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardAlertsList
          alertItems={metrics.alertItems}
          onOpenWhatsAppModal={onOpenWhatsAppModal}
        />

        <DashboardPerformanceChart
          chartViewMode={chartViewMode}
          setChartViewMode={setChartViewMode}
          monthlyEvolutionData={metrics.monthlyEvolutionData}
          revenueExpenseData={metrics.revenueExpenseData}
        />
      </div>

      {/* Modal: Relatório Executivo Exportável */}
      {showReportModal && (
        <ReportExportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export const DashboardView = memo(DashboardViewComponent);


