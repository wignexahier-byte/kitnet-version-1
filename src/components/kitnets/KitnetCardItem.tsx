import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  User,
  Calendar,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant } from '../../types';
import { formatCurrency, formatDate, formatCPF, formatPhone, isInstallmentOverdue } from '../../utils/formatters';
import { KitnetIcon } from '../CategoryIcons';
import { KitnetDetailContent } from '../KitnetDetailContent';

interface KitnetCardItemProps {
  kitnet: Kitnet;
  index: number;
  isSelected: boolean;
  activeContract?: KitnetContract;
  tenant?: KitnetTenant;
  activeSubTab: 'geral' | 'contrato' | 'inquilino' | 'vistoria' | 'fotos';
  setActiveSubTab: (tab: 'geral' | 'contrato' | 'inquilino' | 'vistoria' | 'fotos') => void;
  onToggleSelect: () => void;
  duplicateKitnet: (id: string) => void;
  handleOpenEditModal: (kitnet: Kitnet) => void;
  setKitnetToDelete: (kitnet: Kitnet) => void;
  handleOpenNewContract: (kitnet: Kitnet) => void;
  setKitnetToTerminate: (data: { contract: KitnetContract; kitnet: Kitnet }) => void;
  setShowCompareModal: (val: boolean) => void;
  onOpenWhatsApp?: (contractId: string, installmentId?: string) => void;
  handleSendKitnetWhatsApp: () => void;
  onGenerateDocument: (type: any, kitnet: Kitnet, contract?: KitnetContract, tenant?: KitnetTenant) => void;
  setRenewForm: React.Dispatch<React.SetStateAction<any>>;
  setShowRenewModal: (val: boolean) => void;
  setShowAdjustmentModal: (val: boolean) => void;
  setShowPaymentModal: (val: any) => void;
  setSelectedPhotoPreview?: (photo: { url: string; title: string } | null) => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
}

export const KitnetCardItem: React.FC<KitnetCardItemProps> = ({
  kitnet,
  index,
  isSelected,
  activeContract,
  tenant,
  activeSubTab,
  setActiveSubTab,
  onToggleSelect,
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
}) => {
  // Next due date formatted - dynamic based on next pending installment
  const nextDueDate = React.useMemo(() => {
    if (!activeContract || !activeContract.installments || activeContract.installments.length === 0) {
      return null;
    }
    // Filter all installments that are not paid
    const pendingInstallments = activeContract.installments.filter(
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
  }, [activeContract]);

  // Clean title formatting (e.g. Kitnet 01 • Jardim Primavera)
  const displayTitle = React.useMemo(() => {
    return kitnet.name.replace('—', '•').replace('-', '•');
  }, [kitnet.name]);

  // Exact card border styling according to status
  const borderClass = React.useMemo(() => {
    if (isSelected) {
      return 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30 shadow-2xl shadow-[#8B5CF6]/20';
    }
    if (kitnet.status === 'alugada') {
      return 'border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.18)]';
    }
    if (kitnet.status === 'reforma') {
      return 'border-[#D97706] shadow-[0_0_20px_rgba(217,119,6,0.12)]';
    }
    return 'border-[#0284C7] shadow-[0_0_20px_rgba(2,132,199,0.18)]';
  }, [kitnet.status, isSelected]);

  return (
    <div
      id={`kitnet-card-${kitnet.id}`}
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
      className={`bg-[#0C0F1D] rounded-3xl border transition-all duration-300 overflow-hidden ${borderClass}`}
    >
      {/* Clickable Header / Main Card Info */}
      <div
        onClick={onToggleSelect}
        className="p-4 sm:p-6 cursor-pointer select-none transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Square Photo Thumbnail */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden relative shrink-0 border border-white/[0.08] bg-[#161A28] shadow-md">
            {kitnet.photos?.livingRoom || kitnet.photos?.bedroom ? (
              <img
                src={kitnet.photos.livingRoom || kitnet.photos.bedroom}
                alt={kitnet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#161A28]">
                <KitnetIcon size={28} color="#8B5CF6" />
              </div>
            )}
          </div>

          {/* Right Info Section */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Title & Status Badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {displayTitle}
              </h3>

              {/* Status Badge */}
              {kitnet.status === 'alugada' && (
                <span className="bg-[#052E20] text-[#34D399] border border-[#10B981]/50 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  ALUGADA
                </span>
              )}
              {kitnet.status === 'reforma' && (
                <span className="bg-[#382008] text-[#FBBF24] border border-[#F59E0B]/50 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  EM REFORMA
                </span>
              )}
              {kitnet.status === 'disponivel' && (
                <span className="bg-[#052838] text-[#38BDF8] border border-[#0EA5E9]/50 text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0">
                  DISPONÍVEL
                </span>
              )}
            </div>

            {/* Row 2: Unit Pill & Address */}
            <div className="flex items-center gap-2 mt-2 text-xs text-[#94A3B8] flex-wrap">
              <span className="bg-[#151A29] border border-white/10 text-white font-bold text-xs px-2.5 py-1 rounded-lg shrink-0">
                Unidade {kitnet.number}
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="truncate max-w-[220px] sm:max-w-md text-[#94A3B8]">
                {kitnet.address || 'Rua das Camélias, 320'}
              </span>
            </div>

            {/* Row 3: Tenant Name or Renovation Note or Available Status */}
            <div className="mt-2.5">
              {kitnet.status === 'alugada' && tenant ? (
                <div className="flex items-center gap-2 text-sm text-white font-medium truncate">
                  <User className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span className="truncate">{kitnet.statusNote || tenant.fullName}</span>
                </div>
              ) : kitnet.status === 'reforma' ? (
                <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-medium">
                  <Wrench className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>{kitnet.statusNote || kitnet.notes || 'Previsão de entrega: 25/06/2024'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#38BDF8] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>{kitnet.statusNote || kitnet.notes || 'Pronta para locação imediata'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Values & Due Date Container matching screenshot */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
          {/* Left: Aluguel + Água */}
          <div className="min-w-0">
            <div className="text-xs text-[#94A3B8] font-medium">Aluguel + Água</div>
            <div className="text-base sm:text-lg font-bold text-[#10B981] mt-0.5">
              {formatCurrency(
                activeContract
                  ? activeContract.rentValue + activeContract.waterValue
                  : kitnet.monthlyRentBase + kitnet.monthlyWaterBase
              )}
              <span className="text-xs sm:text-sm font-semibold text-[#10B981]">/mês</span>
            </div>
          </div>

          {/* Middle: Vencimento */}
          {kitnet.status === 'alugada' && nextDueDate ? (
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
                isSelected ? 'rotate-180' : 'group-hover:translate-y-0.5'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-white/[0.08] bg-[#0A0C16] p-4 sm:p-6 space-y-4"
          >
            <KitnetDetailContent
              kitnet={kitnet}
              activeContract={activeContract}
              tenant={tenant}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              duplicateKitnet={duplicateKitnet}
              handleOpenEditModal={handleOpenEditModal}
              setKitnetToDelete={setKitnetToDelete}
              handleOpenNewContract={handleOpenNewContract}
              setKitnetToTerminate={setKitnetToTerminate}
              setShowCompareModal={setShowCompareModal}
              onOpenWhatsApp={onOpenWhatsApp}
              handleSendKitnetWhatsApp={handleSendKitnetWhatsApp}
              onGenerateDocument={onGenerateDocument}
              setRenewForm={setRenewForm}
              setShowRenewModal={setShowRenewModal}
              setShowAdjustmentModal={setShowAdjustmentModal}
              setShowPaymentModal={setShowPaymentModal}
              setSelectedPhotoPreview={setSelectedPhotoPreview}
              onOpenClientProfile={onOpenClientProfile}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatCPF={formatCPF}
              formatPhone={formatPhone}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
