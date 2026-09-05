import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  DollarSign,
  User,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant } from '../types';
import { KitnetDetailActionBar } from './kitnets/detail/KitnetDetailActionBar';
import { KitnetDetailGeneralTab } from './kitnets/detail/KitnetDetailGeneralTab';
import { KitnetDetailContractTab } from './kitnets/detail/KitnetDetailContractTab';
import { KitnetDetailTenantTab } from './kitnets/detail/KitnetDetailTenantTab';
import { KitnetDetailVistoriaTab } from './kitnets/detail/KitnetDetailVistoriaTab';
import { KitnetDetailPhotosTab } from './kitnets/detail/KitnetDetailPhotosTab';

interface KitnetDetailContentProps {
  kitnet: Kitnet;
  activeContract?: KitnetContract;
  tenant?: KitnetTenant;
  activeSubTab: 'geral' | 'contrato' | 'inquilino' | 'vistoria' | 'fotos';
  setActiveSubTab: (tab: 'geral' | 'contrato' | 'inquilino' | 'vistoria' | 'fotos') => void;
  duplicateKitnet: (id: string) => void;
  handleOpenEditModal: (kitnet: Kitnet) => void;
  setKitnetToDelete: (kitnet: Kitnet) => void;
  handleOpenNewContract: (kitnet: Kitnet) => void;
  setKitnetToTerminate: (data: { contract: KitnetContract; kitnet: Kitnet }) => void;
  setShowCompareModal: (show: boolean) => void;
  onOpenWhatsApp?: (contractId: string, installmentId?: string) => void;
  handleSendKitnetWhatsApp: () => void;
  onGenerateDocument: (type: 'contrato_kitnet', kitnet: Kitnet, contract?: KitnetContract, tenant?: KitnetTenant) => void;
  setRenewForm: (data: { additionalMonths: number; newRentValue: number; reason: string }) => void;
  setShowRenewModal: (show: boolean) => void;
  setShowAdjustmentModal: (show: boolean) => void;
  setShowPaymentModal: (data: { contractId: string; installment: any }) => void;
  setSelectedPhotoPreview?: (photo: { url: string; title: string } | null) => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
  formatCPF: (cpf: string) => string;
  formatPhone: (phone: string) => string;
}

export const KitnetDetailContent: React.FC<KitnetDetailContentProps> = ({
  kitnet,
  activeContract,
  tenant,
  activeSubTab,
  setActiveSubTab,
  duplicateKitnet,
  handleOpenEditModal,
  setKitnetToDelete,
  handleOpenNewContract,
  setKitnetToTerminate,
  setShowCompareModal,
  onOpenWhatsApp,
  handleSendKitnetWhatsApp,
  onGenerateDocument,
  setRenewForm,
  setShowRenewModal,
  setShowAdjustmentModal,
  setShowPaymentModal,
  setSelectedPhotoPreview,
  onOpenClientProfile,
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
}) => {
  const remainingInstallmentsCount = React.useMemo(() => {
    if (!activeContract || !activeContract.installments) return undefined;
    return activeContract.installments.filter(
      (i) => i.status !== 'pago' && i.status !== 'cancelada'
    ).length;
  }, [activeContract]);

  const tabs = [
    {
      id: 'geral' as const,
      label: 'Geral & Valores',
      icon: Home,
    },
    {
      id: 'contrato' as const,
      label: 'Contrato & Parcelas',
      count: remainingInstallmentsCount,
      icon: DollarSign,
    },
    {
      id: 'inquilino' as const,
      label: 'Inquilino & Renda',
      count: tenant ? 1 : 0,
      icon: User,
    },
    {
      id: 'vistoria' as const,
      label: 'Vistoria',
      count: kitnet.entryInspection ? 1 : 0,
      icon: CheckCircle2,
    },
    {
      id: 'fotos' as const,
      label: 'Fotos dos Ambientes',
      count: Object.values(kitnet.photos || {}).filter(Boolean).length || 6,
      icon: Camera,
    },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* Secondary Operational Actions Bar (matches screenshot) */}
      <KitnetDetailActionBar
        kitnet={kitnet}
        activeContract={activeContract}
        tenant={tenant}
        handleOpenNewContract={handleOpenNewContract}
        setKitnetToTerminate={setKitnetToTerminate}
        setShowCompareModal={setShowCompareModal}
        onOpenWhatsApp={onOpenWhatsApp}
        handleSendKitnetWhatsApp={handleSendKitnetWhatsApp}
        onGenerateDocument={onGenerateDocument}
        duplicateKitnet={duplicateKitnet}
        handleOpenEditModal={handleOpenEditModal}
        setKitnetToDelete={setKitnetToDelete}
      />

      {/* Sub Tabs Navigation matching screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-xs active:scale-[0.98] ${
                isActive
                  ? 'bg-[#15122E] text-[#A855F7] border border-[#8B5CF6] shadow-[#8B5CF6]/10'
                  : 'bg-[#101322] hover:bg-[#15192C] text-[#94A3B8] hover:text-white border border-white/[0.08]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? 'text-[#A855F7]' : 'text-[#94A3B8]'
                }`}
              />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 min-w-[18px] text-center rounded-full leading-none ${
                    isActive
                      ? 'bg-[#8B5CF6]/20 text-[#A855F7] border border-[#8B5CF6]/30'
                      : 'bg-[#191F34] text-[#94A3B8]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area with smooth crossfade */}
      <div className="space-y-4 pt-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="space-y-4"
          >
            {activeSubTab === 'geral' && (
              <KitnetDetailGeneralTab
                kitnet={kitnet}
                tenant={tenant}
                formatCurrency={formatCurrency}
                formatCPF={formatCPF}
                setActiveSubTab={setActiveSubTab}
                handleOpenEditModal={handleOpenEditModal}
              />
            )}

            {activeSubTab === 'contrato' && (
              <KitnetDetailContractTab
                kitnet={kitnet}
                activeContract={activeContract}
                tenant={tenant}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                handleOpenNewContract={handleOpenNewContract}
                setRenewForm={setRenewForm}
                setShowRenewModal={setShowRenewModal}
                setShowAdjustmentModal={setShowAdjustmentModal}
                setShowPaymentModal={setShowPaymentModal}
                onOpenWhatsApp={onOpenWhatsApp}
                handleSendKitnetWhatsApp={handleSendKitnetWhatsApp}
              />
            )}

            {activeSubTab === 'inquilino' && (
              <KitnetDetailTenantTab
                kitnet={kitnet}
                tenant={tenant}
                formatCurrency={formatCurrency}
                formatCPF={formatCPF}
                formatPhone={formatPhone}
                onOpenClientProfile={onOpenClientProfile}
              />
            )}

            {activeSubTab === 'vistoria' && (
              <KitnetDetailVistoriaTab
                kitnet={kitnet}
                formatDate={formatDate}
                onOpenVistorias={() => setShowCompareModal(true)}
              />
            )}

            {activeSubTab === 'fotos' && (
              <KitnetDetailPhotosTab
                kitnet={kitnet}
                setSelectedPhotoPreview={setSelectedPhotoPreview}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
