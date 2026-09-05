import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './context/AppContext';
import { usePWA } from './hooks/usePWA';
import { DisconnectingScreen } from './components/DisconnectingScreen';
import { LockScreen } from './components/LockScreen';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CentralDeCobrancasView } from './components/CentralDeCobrancasView';
import { ClientesView } from './components/ClientesView';
import { ClientDetailDrawer } from './components/ClientDetailDrawer';
import { CalendarioOperacionalView } from './components/CalendarioOperacionalView';
import { RelatoriosView } from './components/RelatoriosView';
import { MotosView } from './components/MotosView';
import { KitnetsView } from './components/KitnetsView';
import { FinanceiroView } from './components/FinanceiroView';
import { DocumentosView } from './components/DocumentosView';
import { SettingsAndTimelineView } from './components/SettingsAndTimelineView';
import { NotificationsModal } from './components/NotificationsModal';
import { WhatsAppReminderModal } from './components/WhatsAppReminderModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickContactsModal } from './components/QuickContactsModal';
import { SimuladorCompraMotoModal } from './components/SimuladorCompraMotoModal';
import { PWAInstallGuideModal } from './components/PWAInstallGuideModal';
import { OfflineBanner } from './components/OfflineBanner';
import { PWAUpdateBanner } from './components/PWAUpdateBanner';
import { StorageWarningBanner } from './components/StorageWarningBanner';
import { generateContractPDF, generateReceiptPDF } from './utils/pdfGenerator';
import { Moto, MotoContract, MotoTenant, Kitnet, KitnetContract, KitnetTenant } from './types';
import { ShieldAlert, Unlock } from 'lucide-react';
import { safeLocalStorage, safeSessionStorage } from './utils/storage';
import { getTodayLocalDateString } from './utils/formatters';
import { forceUnlockBodyScroll } from './hooks/useBodyScrollLock';

const VALID_TABS: TabType[] = [
  'dashboard',
  'cobrancas',
  'motos',
  'kitnets',
  'clientes',
  'calendario',
  'financeiro',
  'relatorios',
  'documentos',
  'configuracoes',
];

const parseTabFromHash = (): TabType => {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (VALID_TABS.includes(hash as TabType)) {
    return hash as TabType;
  }
  return 'dashboard';
};

export function App() {
  const {
    isAuthenticated,
    isDisconnecting,
    isLogoutDisconnect,
    completeDisconnect,
    settings,
    isReadOnlyMode,
    toggleReadOnlyMode,
  } = useApp();

  const { isOnline, hasUpdate, applyUpdate, isInstallable, promptInstall } = usePWA();

  const [activeTab, setActiveTabState] = useState<TabType>(() => parseTabFromHash());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [whatsAppContractId, setWhatsAppContractId] = useState<string | undefined>(undefined);
  const [whatsAppInstallmentId, setWhatsAppInstallmentId] = useState<string | undefined>(undefined);

  // Unified Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isContactsOpen, setIsContactsOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState<boolean>(false);

  // Global shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state with URL hash safely using replaceState
  const setActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    const targetHash = `#/${tab}`;
    try {
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Listen to browser Back/Forward & direct URL hash changes without reload loops
  useEffect(() => {
    const handleHashChange = () => {
      const currentHashTab = parseTabFromHash();
      setActiveTabState(currentHashTab);
    };

    try {
      if (!window.location.hash || window.location.hash === '#') {
        window.history.replaceState(null, '', '#/dashboard');
      } else {
        const initialTab = parseTabFromHash();
        setActiveTabState(initialTab);
      }
    } catch {
      // Ignore
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Unlock body scroll and scroll to top smoothly on tab switch
  useEffect(() => {
    forceUnlockBodyScroll();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Client Detail Drawer state
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedTenantType, setSelectedTenantType] = useState<'moto' | 'kitnet'>('moto');
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState<boolean>(false);

  const handleOpenInstallPrompt = async () => {
    if (isInstallable) {
      const installed = await promptInstall();
      if (!installed) {
        setIsPwaGuideOpen(true);
      }
    } else {
      setIsPwaGuideOpen(true);
    }
  };

  // If disconnecting, show animated disconnecting sequence
  if (isDisconnecting) {
    return <DisconnectingScreen onComplete={completeDisconnect} isLogout={isLogoutDisconnect} />;
  }

  // If not unlocked, show lock screen
  if (!isAuthenticated) {
    return <LockScreen />;
  }

  const handleOpenWhatsAppForContract = (contractId?: string, installmentId?: string) => {
    setWhatsAppContractId(contractId);
    setWhatsAppInstallmentId(installmentId);
    setIsWhatsAppOpen(true);
  };

  const handleOpenClientProfile = (tenantId: string, type: 'moto' | 'kitnet') => {
    setSelectedTenantId(tenantId);
    setSelectedTenantType(type);
    setIsClientDrawerOpen(true);
  };

  const handleGenerateDoc = (
    type: string,
    asset?: Moto | Kitnet,
    contract?: MotoContract | KitnetContract,
    tenant?: MotoTenant | KitnetTenant
  ) => {
    if (type === 'contrato_moto' && asset && contract && tenant) {
      const m = asset as Moto;
      const c = contract as MotoContract;
      const t = tenant as MotoTenant;
      const tenantSignature = safeLocalStorage.getItem(`signature_moto_${m.id}`) ||
                              (m.plate && safeLocalStorage.getItem(`signature_moto_${m.plate}`)) ||
                              safeLocalStorage.getItem(`signature_locatario_${t.id}`) ||
                              undefined;

      generateContractPDF({
        title: 'CONTRATO DE LOCAÇÃO DE MOTOCICLETA COM INTENÇÃO DE COMPRA',
        ownerName: settings.adminName,
        ownerCpf: settings.adminCpf,
        ownerAddress: settings.adminAddress,
        tenantName: t.fullName,
        tenantCpf: t.cpf,
        tenantRg: t.rg,
        tenantAddress: t.address,
        assetDescription: `Motocicleta ${m.brand} ${m.model}, Ano ${m.year}, Placa ${m.plate}, Renavam ${m.renavam || 'Não informado'}, Chassi ${m.chassi || 'Não informado'}`,
        valueMonthly: c.monthlyValue,
        deposit: c.deposit,
        durationMonths: c.durationMonths,
        dueDay: c.dueDay,
        startDate: c.startDate,
        tenantSignature,
        extraTerms: [
          'O LOCATÁRIO declara receber a motocicleta em perfeito estado de conservação.',
          'Manutenções preventivas e trocas de óleo são de responsabilidade do LOCATÁRIO.',
          'Ao final da quitação das parcelas, o LOCADOR providenciará a transferência de propriedade.',
        ],
      });
    } else if (type === 'recibo_pagamento' && asset && contract && tenant) {
      const c = contract as MotoContract;
      const t = tenant as MotoTenant;
      const m = asset as Moto;
      const inst = c.installments[0];
      generateReceiptPDF({
        title: 'RECIBO DE PAGAMENTO DE PARCELA',
        payerName: t.fullName,
        payerCpf: t.cpf,
        amount: inst.amount,
        description: `Quitação de parcela referente à locação do veículo placa ${m.plate}.`,
        date: getTodayLocalDateString(),
        ownerName: settings.adminName,
        ownerCpf: settings.adminCpf,
      });
    } else if (type === 'termo_entrega_moto' && asset && contract && tenant) {
      const m = asset as Moto;
      const t = tenant as MotoTenant;
      const c = contract as MotoContract;
      const tenantSignature = safeLocalStorage.getItem(`signature_moto_${m.id}`) ||
                              (m.plate && safeLocalStorage.getItem(`signature_moto_${m.plate}`)) ||
                              safeLocalStorage.getItem(`signature_locatario_${t.id}`) ||
                              undefined;

      generateContractPDF({
        title: 'TERMO DE ENTREGA E VISTORIA DA MOTOCICLETA',
        ownerName: settings.adminName,
        ownerCpf: settings.adminCpf,
        ownerAddress: settings.adminAddress,
        tenantName: t.fullName,
        tenantCpf: t.cpf,
        tenantRg: t.rg,
        tenantAddress: t.address,
        assetDescription: `Veículo ${m.brand} ${m.model}, Placa ${m.plate}, KM Inicial: ${m.delivery?.initialKm || m.currentKm} km`,
        valueMonthly: c.monthlyValue,
        deposit: c.deposit,
        durationMonths: c.durationMonths,
        dueDay: c.dueDay,
        startDate: m.delivery?.date || c.startDate,
        tenantSignature,
        extraTerms: [
          'O LOCATÁRIO declara ter recebido o veículo em perfeitas condições mecânicas e estéticas.',
          'Quilometragem e fotos registradas no aplicativo no ato da entrega.',
        ],
      });
    } else {
      setActiveTab('documentos');
    }
  };

  return (
    <div className="min-h-screen bg-[#141418] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#8B5CF6] selection:text-white">
      {/* Real-time Offline Warning Banner */}
      <OfflineBanner isOnline={isOnline} />

      {/* Device Storage Full Warning Banner */}
      <StorageWarningBanner onNavigateToSettings={() => setActiveTab('configuracoes')} />

      {/* Service Worker PWA Update Notification Banner */}
      <PWAUpdateBanner hasUpdate={hasUpdate} onApplyUpdate={applyUpdate} />

      {/* Read-Only Mode Banner */}
      {isReadOnlyMode && (
        <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>
                <strong className="font-bold">Modo Somente Leitura Ativo:</strong> Criação, edição e exclusão de dados estão bloqueadas para proteção.
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleReadOnlyMode()}
              className="px-3 py-1 bg-white text-[#7C3AED] rounded-lg text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <Unlock className="w-3.5 h-3.5" />
              Desbloquear Edição
            </button>
          </div>
        </div>
      )}

      {/* Top and Mobile Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenContacts={() => setIsContactsOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenPwaGuide={handleOpenInstallPrompt}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-24 lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={setActiveTab}
                onOpenNewMotoModal={() => setActiveTab('motos')}
                onOpenNewKitnetModal={() => setActiveTab('kitnets')}
                onOpenNewExpenseModal={() => setActiveTab('financeiro')}
                onOpenDocModal={() => setActiveTab('documentos')}
                onOpenWhatsAppModal={handleOpenWhatsAppForContract}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                onOpenContacts={() => setIsContactsOpen(true)}
                onOpenPwaGuide={handleOpenInstallPrompt}
              />
            )}

            {activeTab === 'cobrancas' && (
              <CentralDeCobrancasView
                onOpenWhatsApp={handleOpenWhatsAppForContract}
                onOpenClientProfile={handleOpenClientProfile}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'clientes' && (
              <ClientesView
                onOpenClientProfile={handleOpenClientProfile}
                onOpenWhatsApp={handleOpenWhatsAppForContract}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'calendario' && (
              <CalendarioOperacionalView onOpenWhatsApp={handleOpenWhatsAppForContract} />
            )}

            {activeTab === 'relatorios' && <RelatoriosView />}

            {activeTab === 'motos' && (
              <MotosView
                onOpenWhatsApp={handleOpenWhatsAppForContract}
                onGenerateDocument={handleGenerateDoc}
                onOpenSimulator={() => setIsSimulatorOpen(true)}
                onOpenClientProfile={handleOpenClientProfile}
              />
            )}

            {activeTab === 'kitnets' && (
              <KitnetsView
                onOpenWhatsApp={handleOpenWhatsAppForContract}
                onGenerateDocument={handleGenerateDoc}
                onOpenClientProfile={handleOpenClientProfile}
              />
            )}

            {activeTab === 'financeiro' && <FinanceiroView />}

            {activeTab === 'documentos' && <DocumentosView />}

            {activeTab === 'configuracoes' && (
              <SettingsAndTimelineView onOpenPwaGuide={handleOpenInstallPrompt} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Client Detail Drawer */}
      <ClientDetailDrawer
        isOpen={isClientDrawerOpen}
        onClose={() => setIsClientDrawerOpen(false)}
        tenantId={selectedTenantId}
        tenantType={selectedTenantType}
        onOpenWhatsApp={handleOpenWhatsAppForContract}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTab={setActiveTab}
        onOpenWhatsApp={handleOpenWhatsAppForContract}
      />

      {/* WhatsApp Message Generator Modal */}
      <WhatsAppReminderModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        contractId={whatsAppContractId}
        installmentId={whatsAppInstallmentId}
      />

      {/* Unified Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Quick Contacts Modal */}
      <QuickContactsModal
        isOpen={isContactsOpen}
        onClose={() => setIsContactsOpen(false)}
      />

      {/* Pre-purchase Financial Simulator Modal */}
      <SimuladorCompraMotoModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onNavigateToMotos={() => setActiveTab('motos')}
      />

      {/* PWA Mobile Installation Guide Modal */}
      <PWAInstallGuideModal
        isOpen={isPwaGuideOpen}
        onClose={() => setIsPwaGuideOpen(false)}
        isInstallable={isInstallable}
        onDirectInstall={async () => {
          const installed = await promptInstall();
          if (installed) {
            setIsPwaGuideOpen(false);
          }
        }}
      />
    </div>
  );
}

export default App;
