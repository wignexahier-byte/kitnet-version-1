import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Motorbike,
  DollarSign,
  Wrench,
  User,
  Gauge,
  Camera,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { Moto, MotoContract, MotoTenant } from '../types';
import { MotoDetailActionBar } from './motos/detail/MotoDetailActionBar';
import { MotoDetailGeneralTab } from './motos/detail/MotoDetailGeneralTab';
import { MotoDetailContractTab } from './motos/detail/MotoDetailContractTab';
import { MotoDetailMaintenancesTab } from './motos/detail/MotoDetailMaintenancesTab';
import { MotoDetailTenantTab } from './motos/detail/MotoDetailTenantTab';
import { MotoDetailKmTab } from './motos/detail/MotoDetailKmTab';
import { MotoDetailVistoriaTab } from './motos/detail/MotoDetailVistoriaTab';
import { MotoDetailPhotosTab } from './motos/detail/MotoDetailPhotosTab';
import { MotoDetailDocumentsTab } from './motos/detail/MotoDetailDocumentsTab';

interface MotoDetailContentProps {
  moto: Moto;
  activeContract?: MotoContract;
  tenant?: MotoTenant;
  activeSubTab: 'geral' | 'contrato' | 'manutencoes' | 'locatario' | 'km' | 'vistoria' | 'fotos' | 'documentos';
  setActiveSubTab: (tab: 'geral' | 'contrato' | 'manutencoes' | 'locatario' | 'km' | 'vistoria' | 'fotos' | 'documentos') => void;
  handleOpenEditModal: (moto: Moto) => void;
  handleOpenNewContract?: (moto: Moto) => void;
  setShowNewContractModal: (show: boolean) => void;
  onGenerateDocument: (type: any, moto: Moto, contract?: MotoContract, tenant?: MotoTenant) => void;
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  setShowMaintenanceModal: (show: boolean) => void;
  setShowCompareModal: (show: boolean) => void;
  duplicateMoto: (id: string) => void;
  setTerminateMotoForm: (data: { finalKm: number; notes: string }) => void;
  setMotoToTerminate: (data: { contract: MotoContract; moto: Moto }) => void;
  setMotoToDelete: (moto: Moto) => void;
  setShowAdjustmentModal: (show: boolean) => void;
  setShowPaymentModal: (data: { contractId: string; installment: any }) => void;
  deleteMotoMaintenance: (motoId: string, maintenanceId: string) => void;
  setShowNewKmModal: (show: boolean) => void;
  setShowDeliveryModal: (show: boolean) => void;
  setSelectedPhotoPreview: (data: { url: string; title: string }) => void;
  handleTriggerQuickUpload: (angle: 'front' | 'rear' | 'right' | 'left' | 'dashboard') => void;
  handleRemovePhotoAngle: (angle: 'front' | 'rear' | 'right' | 'left' | 'dashboard') => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
  formatCPF: (cpf: string) => string;
  formatPhone: (phone: string) => string;
  getCNHStatus: (expirationDate: string) => { label: string; badgeClass: string };
  isPlateCorruptedOrInvalid: (plate: string) => boolean;
}

export const MotoDetailContent: React.FC<MotoDetailContentProps> = ({
  moto,
  activeContract,
  tenant,
  activeSubTab,
  setActiveSubTab,
  handleOpenEditModal,
  setShowNewContractModal,
  onGenerateDocument,
  onOpenWhatsApp,
  setShowMaintenanceModal,
  setShowCompareModal,
  duplicateMoto,
  setTerminateMotoForm,
  setMotoToTerminate,
  setMotoToDelete,
  setShowAdjustmentModal,
  setShowPaymentModal,
  deleteMotoMaintenance,
  setShowNewKmModal,
  setShowDeliveryModal,
  setSelectedPhotoPreview,
  handleTriggerQuickUpload,
  handleRemovePhotoAngle,
  onOpenClientProfile,
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  getCNHStatus,
  isPlateCorruptedOrInvalid,
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
      label: 'Dados da Moto',
      icon: Motorbike,
    },
    {
      id: 'contrato' as const,
      label: 'Contrato & Parcelas',
      count: remainingInstallmentsCount,
      icon: DollarSign,
    },
    {
      id: 'manutencoes' as const,
      label: 'Manutenções',
      count: moto.maintenances?.length || 0,
      icon: Wrench,
    },
    {
      id: 'locatario' as const,
      label: 'Locatário & CNH',
      count: tenant ? 1 : 0,
      icon: User,
    },
    {
      id: 'km' as const,
      label: 'Quilometragem',
      count: moto.kmLogs?.length || 0,
      icon: Gauge,
    },
    {
      id: 'vistoria' as const,
      label: 'Entrega & Vistoria',
      count: moto.delivery?.photos?.length || (moto.delivery ? 1 : 0),
      icon: CheckCircle2,
    },
    {
      id: 'fotos' as const,
      label: 'Fotos do Veículo',
      count: Object.values(moto.photos || {}).filter(Boolean).length || 5,
      icon: Camera,
    },
    {
      id: 'documentos' as const,
      label: 'Documentos',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* Alert Banner if Plate is Corrupted */}
      {isPlateCorruptedOrInvalid(moto.plate) && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-center justify-between gap-3 text-xs text-[#EF4444]">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
            <div>
              <span className="font-bold text-[#F5F5F7] block">Placa Inválida Detectada no Registro</span>
              <span className="text-[#9A9AA2] text-[11px] block mt-0.5">
                O valor atual é <strong className="text-[#EF4444] font-mono">"{moto.plate}"</strong>. O padrão oficial brasileiro exige <strong className="text-[#F5F5F7]">ABC-1234</strong> ou <strong className="text-[#F5F5F7]">BRA-2E19</strong>.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenEditModal(moto)}
            className="px-2.5 py-1.5 bg-[#EF4444] hover:bg-[#EF4444]/90 text-[#101012] font-bold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Corrigir</span>
          </button>
        </div>
      )}

      {/* Secondary Operational Actions Bar (matches Kitnet design) */}
      <MotoDetailActionBar
        moto={moto}
        activeContract={activeContract}
        tenant={tenant}
        setShowNewContractModal={setShowNewContractModal}
        setTerminateMotoForm={setTerminateMotoForm}
        setMotoToTerminate={setMotoToTerminate}
        onGenerateDocument={onGenerateDocument}
        onOpenWhatsApp={onOpenWhatsApp}
        setShowMaintenanceModal={setShowMaintenanceModal}
        setShowCompareModal={setShowCompareModal}
        duplicateMoto={duplicateMoto}
        handleOpenEditModal={handleOpenEditModal}
        setMotoToDelete={setMotoToDelete}
      />

      {/* Sub Tabs Navigation matching Kitnets pill styling */}
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

      {/* Tab Contents Area with smooth crossfade */}
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
              <MotoDetailGeneralTab
                moto={moto}
                tenant={tenant}
                formatCurrency={formatCurrency}
                formatCPF={formatCPF}
                setActiveSubTab={setActiveSubTab}
                setSelectedPhotoPreview={setSelectedPhotoPreview}
                handleTriggerQuickUpload={handleTriggerQuickUpload}
                handleRemovePhotoAngle={handleRemovePhotoAngle}
              />
            )}

            {activeSubTab === 'contrato' && (
              <MotoDetailContractTab
                moto={moto}
                activeContract={activeContract}
                tenant={tenant}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                setShowNewContractModal={setShowNewContractModal}
                setShowAdjustmentModal={setShowAdjustmentModal}
                setShowPaymentModal={setShowPaymentModal}
                onOpenWhatsApp={onOpenWhatsApp}
                onGenerateDocument={onGenerateDocument}
              />
            )}

            {activeSubTab === 'manutencoes' && (
              <MotoDetailMaintenancesTab
                moto={moto}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                deleteMotoMaintenance={deleteMotoMaintenance}
                setShowMaintenanceModal={setShowMaintenanceModal}
              />
            )}

            {activeSubTab === 'locatario' && (
              <MotoDetailTenantTab
                moto={moto}
                tenant={tenant}
                formatCurrency={formatCurrency}
                formatCPF={formatCPF}
                formatPhone={formatPhone}
                getCNHStatus={getCNHStatus}
                setSelectedPhotoPreview={setSelectedPhotoPreview}
                onOpenClientProfile={onOpenClientProfile}
              />
            )}

            {activeSubTab === 'km' && (
              <MotoDetailKmTab
                moto={moto}
                formatDate={formatDate}
                setShowNewKmModal={setShowNewKmModal}
              />
            )}

            {activeSubTab === 'vistoria' && (
              <MotoDetailVistoriaTab
                moto={moto}
                activeContract={activeContract}
                tenant={tenant}
                formatDate={formatDate}
                setShowDeliveryModal={setShowDeliveryModal}
                onGenerateDocument={onGenerateDocument}
                onOpenVistorias={() => setShowCompareModal(true)}
              />
            )}

            {activeSubTab === 'fotos' && (
              <MotoDetailPhotosTab
                moto={moto}
                setSelectedPhotoPreview={setSelectedPhotoPreview}
                handleTriggerQuickUpload={handleTriggerQuickUpload}
                handleRemovePhotoAngle={handleRemovePhotoAngle}
              />
            )}

            {activeSubTab === 'documentos' && (
              <MotoDetailDocumentsTab
                moto={moto}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
