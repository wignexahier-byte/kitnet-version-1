import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  User,
  Calendar,
  AlertTriangle,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { Moto, MotoContract, MotoTenant } from '../../types';
import { MotoIcon } from '../CategoryIcons';
import { MotoDetailContent } from '../MotoDetailContent';
import { isInstallmentOverdue } from '../../utils/formatters';
import { monthlyToWeekly } from '../../domain';

interface MotoCardItemProps {
  moto: Moto;
  index: number;
  isSelected: boolean;
  isMobileExpanded?: boolean;
  contract: MotoContract | undefined;
  tenant: MotoTenant | undefined;
  activeSubTab: 'geral' | 'contrato' | 'manutencoes' | 'locatario' | 'km' | 'vistoria' | 'fotos' | 'documentos';
  onToggleSelect: (id: string) => void;
  setActiveSubTab: (tab: 'geral' | 'contrato' | 'manutencoes' | 'locatario' | 'km' | 'vistoria' | 'fotos' | 'documentos') => void;
  handleOpenEditModal: (moto: Moto) => void;
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
  deleteMotoMaintenance: (motoId: string, maintId: string) => void;
  setShowNewKmModal: (show: boolean) => void;
  setShowDeliveryModal: (show: boolean) => void;
  setSelectedPhotoPreview: (data: { url: string; title: string }) => void;
  handleTriggerQuickUpload: (angleKey: 'front' | 'rear' | 'right' | 'left' | 'dashboard') => void;
  handleRemovePhotoAngle: (angleKey: 'front' | 'rear' | 'right' | 'left' | 'dashboard') => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
  formatCPF: (cpf: string) => string;
  formatPhone: (phone: string) => string;
  getCNHStatus: (expirationDate: string) => { label: string; badgeClass: string };
  isPlateCorruptedOrInvalid: (plate: string) => boolean;
}

export const MotoCardItem: React.FC<MotoCardItemProps> = React.memo(({
  moto,
  index,
  isSelected,
  isMobileExpanded = false,
  contract,
  tenant,
  activeSubTab,
  onToggleSelect,
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
  // Next due date formatted for active contract - dynamic based on next pending installment
  const nextDueDate = React.useMemo(() => {
    if (!contract || !contract.installments || contract.installments.length === 0) {
      return null;
    }
    // Filter all installments that are not paid
    const pendingInstallments = contract.installments.filter(
      (i) => i.status !== 'pago'
    );

    if (pendingInstallments.length === 0) {
      return 'Quitado';
    }

    // Sort by dueDate ascending, fallback to installment number
    pendingInstallments.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return a.number - b.number;
    });

    const nextPending = pendingInstallments[0];
    if (nextPending?.dueDate) {
      const parts = nextPending.dueDate.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return formatDate(nextPending.dueDate);
    }

    return null;
  }, [contract, formatDate]);

  // Is expanded (either selected or mobile expanded)
  const isExpanded = isSelected || isMobileExpanded;

  // Exact card border styling according to status
  const borderClass = React.useMemo(() => {
    if (isExpanded) {
      return 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30 shadow-2xl shadow-[#8B5CF6]/20';
    }
    if (moto.status === 'alugada') {
      return 'border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.18)]';
    }
    if (moto.status === 'manutencao') {
      return 'border-[#D97706] shadow-[0_0_20px_rgba(217,119,6,0.12)]';
    }
    return 'border-[#0284C7] shadow-[0_0_20px_rgba(2,132,199,0.18)]';
  }, [moto.status, isExpanded]);

  return (
    <div
      id={`moto-card-${moto.id}`}
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
      className={`bg-[#0C0F1D] rounded-3xl border transition-all duration-300 overflow-hidden ${borderClass}`}
    >
      {/* Clickable Header / Main Card Info */}
      <div
        onClick={() => onToggleSelect(moto.id)}
        className="p-4 sm:p-6 cursor-pointer select-none transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Square Photo Thumbnail */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden relative shrink-0 border border-white/[0.08] bg-[#161A28] shadow-md">
            {moto.photos?.front ? (
              <img
                src={moto.photos.front}
                alt={`${moto.brand} ${moto.model}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#161A28]">
                <MotoIcon size={28} color="#8B5CF6" />
              </div>
            )}
          </div>

          {/* Right Info Section */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Title & Status Badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {moto.brand} {moto.model} {moto.year}
              </h3>

              {/* Status Badge */}
              {moto.status === 'alugada' && (
                <span className="bg-[#052E20] text-[#34D399] border border-[#10B981]/50 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  ALUGADA
                </span>
              )}
              {moto.status === 'manutencao' && (
                <span className="bg-[#382008] text-[#FBBF24] border border-[#F59E0B]/50 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  MANUTENÇÃO
                </span>
              )}
              {moto.status === 'disponivel' && (
                <span className="bg-[#052838] text-[#38BDF8] border border-[#0EA5E9]/50 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  DISPONÍVEL
                </span>
              )}
              {moto.status === 'encerrada' && (
                <span className="bg-[#1C1C1F] text-[#94A3B8] border border-white/10 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  ENCERRADA
                </span>
              )}
            </div>

            {/* Row 2: Plate & KM */}
            <div className="flex items-center gap-2 mt-2 text-xs text-[#94A3B8] flex-wrap">
              <span
                className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1 shrink-0 ${
                  isPlateCorruptedOrInvalid(moto.plate)
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-[#151A29] border border-white/10 text-white'
                }`}
              >
                {moto.plate || 'SEM PLACA'}
                {isPlateCorruptedOrInvalid(moto.plate) && (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-[#94A3B8] font-medium">
                {moto.currentKm.toLocaleString('pt-BR')} KM
              </span>
            </div>

            {/* Row 3: Tenant Name or Maintenance/Availability Note */}
            <div className="mt-2.5">
              {moto.status === 'alugada' && tenant ? (
                <div className="flex items-center gap-2 text-sm text-white font-medium truncate">
                  <User className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span className="truncate">{moto.statusNote || tenant.fullName}</span>
                </div>
              ) : moto.status === 'manutencao' ? (
                <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-medium">
                  <Wrench className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>{moto.statusNote || moto.notes || 'Em oficina para revisão preventiva'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#38BDF8] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>{moto.statusNote || moto.notes || 'Revisada e pronta para locação'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Values & Due Date Container matching Kitnets design */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
          {/* Left: Valor de Locação ou Compra */}
          <div className="min-w-0">
            {contract ? (
              <>
                <div className="text-xs text-[#94A3B8] font-medium">
                  {contract.paymentFrequency === 'semanal' ? 'Aluguel Semanal' : 'Aluguel Mensal'}
                </div>
                <div className="text-base sm:text-lg font-bold text-[#10B981] mt-0.5">
                  {contract.paymentFrequency === 'semanal'
                    ? formatCurrency(contract.weeklyValue || (contract.monthlyValue ? monthlyToWeekly(contract.monthlyValue) : (contract.installments?.[0]?.amount || 0)))
                    : formatCurrency(contract.monthlyValue || 0)}
                  <span className="text-xs sm:text-sm font-semibold text-[#10B981]">
                    {contract.paymentFrequency === 'semanal' ? '/sem' : '/mês'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-[#94A3B8] font-medium">Valor de Compra</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {formatCurrency(moto.purchasePrice)}
                </div>
              </>
            )}
          </div>

          {/* Middle: Vencimento */}
          {moto.status === 'alugada' && nextDueDate ? (
            <div className="pl-4 border-l border-white/[0.08]">
              <div className="text-xs text-[#94A3B8] font-medium">Vencimento</div>
              <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2 mt-0.5">
                <Calendar className="w-4 h-4 text-white" />
                <span>{nextDueDate}</span>
              </div>
            </div>
          ) : (
            <div />
          )}

          {/* Right: Circular Chevron Button */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#151A28] hover:bg-[#1E2438] border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 group shrink-0 shadow-md ml-auto">
            <ChevronDown
              className={`w-5 h-5 text-white transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-white/[0.08] bg-[#0A0C16] p-4 sm:p-6 space-y-4"
          >
            <MotoDetailContent
              moto={moto}
              activeContract={contract}
              tenant={tenant}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              handleOpenEditModal={handleOpenEditModal}
              setShowNewContractModal={setShowNewContractModal}
              onGenerateDocument={onGenerateDocument}
              onOpenWhatsApp={onOpenWhatsApp}
              setShowMaintenanceModal={setShowMaintenanceModal}
              setShowCompareModal={setShowCompareModal}
              duplicateMoto={duplicateMoto}
              setTerminateMotoForm={setTerminateMotoForm}
              setMotoToTerminate={setMotoToTerminate}
              setMotoToDelete={setMotoToDelete}
              setShowAdjustmentModal={setShowAdjustmentModal}
              setShowPaymentModal={setShowPaymentModal}
              deleteMotoMaintenance={deleteMotoMaintenance}
              setShowNewKmModal={setShowNewKmModal}
              setShowDeliveryModal={setShowDeliveryModal}
              setSelectedPhotoPreview={setSelectedPhotoPreview}
              handleTriggerQuickUpload={handleTriggerQuickUpload}
              handleRemovePhotoAngle={handleRemovePhotoAngle}
              onOpenClientProfile={onOpenClientProfile}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatCPF={formatCPF}
              formatPhone={formatPhone}
              getCNHStatus={getCNHStatus}
              isPlateCorruptedOrInvalid={isPlateCorruptedOrInvalid}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

MotoCardItem.displayName = 'MotoCardItem';
