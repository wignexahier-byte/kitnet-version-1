import React from 'react';
import {
  Plus,
  Search,
  X,
  Motorbike,
  ArrowUpCircle,
  Wrench,
} from 'lucide-react';
import { Moto, MotoContract, MotoTenant } from '../types';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  getCNHStatus,
  isPlateCorruptedOrInvalid,
} from '../utils/formatters';
import { WEEKS_PER_MONTH } from '../utils/financialMath';
import { monthlyToWeekly, weeklyToMonthly } from '../domain';
import { MotoMaintenanceModal } from './MotoMaintenanceModal';
import { RentAdjustmentModal } from './RentAdjustmentModal';
import { ComparadorVistoriaModal } from './ComparadorVistoriaModal';
import { MotoIcon } from './CategoryIcons';
import { NewMotoWizardModal } from './motos/modals/NewMotoWizardModal';
import { NewContractModal } from './motos/modals/NewContractModal';
import { EditMotoModal } from './motos/modals/EditMotoModal';
import { MotoPaymentModal } from './motos/modals/MotoPaymentModal';
import { MotoNewKmModal } from './motos/modals/MotoNewKmModal';
import { MotoDeliveryModal } from './motos/modals/MotoDeliveryModal';
import {
  DeleteMotoConfirmModal,
  TerminateMotoModal,
  PhotoLightboxModal,
  NewContractSuccessModal,
} from './motos/modals/MotoAuxiliaryModals';
import { MotoCardItem } from './motos/MotoCardItem';
import { MotoSummaryKPIs } from './motos/MotoSummaryKPIs';
import { useMotosViewLogic } from './motos/useMotosViewLogic';

interface MotosViewProps {
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  onGenerateDocument: (type: any, moto: Moto, contract?: MotoContract, tenant?: MotoTenant) => void;
  onOpenSimulator?: () => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
}

export const MotosView: React.FC<MotosViewProps> = ({
  onOpenWhatsApp,
  onGenerateDocument,
  onOpenSimulator,
  onOpenClientProfile,
}) => {
  const {
    motos,
    motoContracts,
    motoTenants,
    settings,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    selectedMotoId,
    setSelectedMotoId,
    activeSubTab,
    setActiveSubTab,
    showNewMotoModal,
    setShowNewMotoModal,
    motoToEdit,
    setMotoToEdit,
    motoToDelete,
    setMotoToDelete,
    motoToTerminate,
    setMotoToTerminate,
    showNewContractModal,
    setShowNewContractModal,
    showNewKmModal,
    setShowNewKmModal,
    showDeliveryModal,
    setShowDeliveryModal,
    showPaymentModal,
    setShowPaymentModal,
    showCompareModal,
    setShowCompareModal,
    showMaintenanceModal,
    setShowMaintenanceModal,
    showAdjustmentModal,
    setShowAdjustmentModal,
    selectedPhotoPreview,
    setSelectedPhotoPreview,
    newContractSuccessData,
    setNewContractSuccessData,
    galleryFileInputRef,
    newMotoForm,
    setNewMotoForm,
    standaloneContractForm,
    setStandaloneContractForm,
    editMotoForm,
    setEditMotoForm,
    terminateMotoForm,
    setTerminateMotoForm,
    filteredMotos,
    selectedMoto,
    activeContract,
    handleNewMotoTenantPhotoUpload,
    handleEditMotoTenantPhotoUpload,
    handleStandaloneTenantPhotoUpload,
    handleCreateMotoSubmit,
    handleCreateStandaloneContractSubmit,
    handleOpenEditModal,
    handleEditMotoSubmit,
    handleDirectGalleryUpload,
    handleTriggerQuickUpload,
    handleRemovePhotoAngle,
    duplicateMoto,
    deleteMoto,
    deleteMotoMaintenance,
    terminateMotoContract,
    addKmLog,
    recordMotoDelivery,
    payMotoInstallment,
  } = useMotosViewLogic();

  // Metrics for KPIs Header
  const totalMotos = motos.length;
  const occupiedMotos = motos.filter((m) => m.status === 'alugada').length;
  const occupancyPercentage = totalMotos > 0 ? (occupiedMotos / totalMotos) * 100 : 0;
  const availableMotos = motos.filter((m) => m.status === 'disponivel').length;
  const maintenanceMotos = motos.filter((m) => m.status === 'manutencao').length;
  const activeMonthlyRevenue = motoContracts
    .filter((c) => c.status === 'ativo')
    .reduce((sum, c) => {
      if (c.paymentFrequency === 'semanal') {
        return sum + (c.weeklyValue ? c.weeklyValue * WEEKS_PER_MONTH : 0);
      }
      return sum + (c.monthlyValue || 0);
    }, 0);

  const activeWeeklyRevenue = motoContracts
    .filter((c) => c.status === 'ativo' && c.paymentFrequency === 'semanal')
    .reduce((sum, c) => sum + (c.weeklyValue || 0), 0);

  const handleToggleMoto = (motoId: string) => {
    setSelectedMotoId((prev) => (prev === motoId ? null : motoId));
  };

  const maskCPFInput = (v: string) => {
    return v
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const maskPhoneInput = (v: string) => {
    return v
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2');
  };

  return (
    <div className="space-y-4 font-sans max-w-7xl mx-auto">
      {/* Hidden file input for quick direct uploads */}
      <input
        ref={galleryFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectGalleryUpload}
        className="hidden"
      />

      {/* Top Header & 4 Compact KPI Cards (Standardized with Kitnet design) */}
      <MotoSummaryKPIs
        totalMotos={totalMotos}
        occupancyPercentage={occupancyPercentage}
        occupiedMotos={occupiedMotos}
        activeMonthlyRevenue={activeMonthlyRevenue}
        activeWeeklyRevenue={activeWeeklyRevenue}
        availableMotos={availableMotos}
        maintenanceMotos={maintenanceMotos}
        onAddNewMoto={() => setShowNewMotoModal(true)}
        onOpenSimulator={onOpenSimulator}
        onFilterClick={setFilterStatus}
      />

      {/* Filter and Search Bar Container */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* 4 Standard Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* 1. Todas */}
            <button
              type="button"
              onClick={() => setFilterStatus('todos')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                filterStatus === 'todos'
                  ? 'bg-[#6D28D9] text-white border border-[#8B5CF6]/50 shadow-lg shadow-[#6D28D9]/25'
                  : 'bg-[#0C0F1D] text-[#94A3B8] border border-white/[0.08] hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <Motorbike className="w-4 h-4" />
              <span>Todas</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filterStatus === 'todos' ? 'bg-[#4C1D95] text-white' : 'bg-[#161B2B] text-[#94A3B8]'
                }`}
              >
                {motos.length}
              </span>
            </button>

            {/* 2. Disponíveis */}
            <button
              type="button"
              onClick={() => setFilterStatus('disponivel')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                filterStatus === 'disponivel'
                  ? 'bg-[#052838] text-[#38BDF8] border border-[#0EA5E9]/50 shadow-lg shadow-[#0EA5E9]/20'
                  : 'bg-[#0C0F1D] text-[#94A3B8] border border-white/[0.08] hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${filterStatus === 'disponivel' ? 'bg-[#38BDF8]' : 'bg-[#38BDF8]/60'}`} />
              <span>Disponíveis</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filterStatus === 'disponivel' ? 'bg-[#0C2238] text-[#38BDF8]' : 'bg-[#161B2B] text-[#94A3B8]'
                }`}
              >
                {availableMotos}
              </span>
            </button>

            {/* 3. Alugadas */}
            <button
              type="button"
              onClick={() => setFilterStatus('alugada')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                filterStatus === 'alugada'
                  ? 'bg-[#052E20] text-[#34D399] border border-[#10B981]/50 shadow-lg shadow-[#10B981]/20'
                  : 'bg-[#0C0F1D] text-[#94A3B8] border border-white/[0.08] hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <ArrowUpCircle className={`w-4 h-4 shrink-0 ${filterStatus === 'alugada' ? 'text-[#34D399]' : 'text-[#94A3B8]'}`} />
              <span>Alugadas</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filterStatus === 'alugada' ? 'bg-[#0D2821] text-[#10B981]' : 'bg-[#161B2B] text-[#94A3B8]'
                }`}
              >
                {occupiedMotos}
              </span>
            </button>

            {/* 4. Em Manutenção */}
            <button
              type="button"
              onClick={() => setFilterStatus('manutencao')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                filterStatus === 'manutencao'
                  ? 'bg-[#382008] text-[#FBBF24] border border-[#F59E0B]/50 shadow-lg shadow-[#F59E0B]/20'
                  : 'bg-[#0C0F1D] text-[#94A3B8] border border-white/[0.08] hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4 text-[#FBBF24] shrink-0" />
              <span>Em Manutenção</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filterStatus === 'manutencao' ? 'bg-[#2E1B07] text-[#FBBF24]' : 'bg-[#161B2B] text-[#94A3B8]'
                }`}
              >
                {maintenanceMotos}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por placa, modelo, chassi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#0C0F1D] border border-white/[0.08] focus:border-[#8B5CF6] rounded-xl text-xs text-white placeholder-[#64748B] outline-none transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main List of Motos (Full Width, In-Place Accordion Expansion) */}
      <div className="space-y-4">
        {filteredMotos.length === 0 ? (
          <div className="app-card p-8 text-center space-y-3 bg-[#0C0F1D] rounded-3xl border border-white/[0.08]">
            <MotoIcon size={32} color="#64646E" className="mx-auto opacity-40" />
            <div>
              <p className="text-sm font-semibold text-[#F5F5F7]">Nenhuma moto encontrada</p>
              <p className="text-xs text-[#9A9AA2] mt-0.5">Cadastre um novo veículo ou altere os filtros de busca.</p>
            </div>
            <button
              onClick={() => setShowNewMotoModal(true)}
              className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md shadow-[#6D28D9]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Moto</span>
            </button>
          </div>
        ) : (
          filteredMotos.map((moto, index) => {
            const isSelected = selectedMotoId === moto.id;
            const contract = motoContracts.find(
              (c) => c.motoId === moto.id && c.status === 'ativo'
            );
            const tenant = motoTenants.find((t) => t.id === contract?.tenantId);

            return (
              <MotoCardItem
                key={moto.id}
                moto={moto}
                index={index}
                isSelected={isSelected}
                contract={contract}
                tenant={tenant}
                activeSubTab={activeSubTab}
                onToggleSelect={handleToggleMoto}
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
            );
          })
        )}
      </div>

      {/* Modals & Wizards */}
      {showNewMotoModal && (
        <NewMotoWizardModal
          isOpen={showNewMotoModal}
          onClose={() => setShowNewMotoModal(false)}
          form={newMotoForm}
          setForm={setNewMotoForm}
          onSubmit={handleCreateMotoSubmit}
          handleTenantPhotoUpload={handleNewMotoTenantPhotoUpload}
          maskCPFInput={maskCPFInput}
          maskPhoneInput={maskPhoneInput}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          existingTenants={motoTenants}
          settings={settings}
        />
      )}

      {showNewContractModal && selectedMoto && (
        <NewContractModal
          isOpen={showNewContractModal}
          selectedMoto={selectedMoto}
          onClose={() => setShowNewContractModal(false)}
          form={standaloneContractForm}
          setForm={setStandaloneContractForm}
          onSubmit={handleCreateStandaloneContractSubmit}
          handleStandaloneTenantPhotoUpload={handleStandaloneTenantPhotoUpload}
          maskCPFInput={maskCPFInput}
          maskPhoneInput={maskPhoneInput}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          existingTenants={motoTenants}
          settings={settings}
        />
      )}

      {motoToEdit && (
        <EditMotoModal
          isOpen={Boolean(motoToEdit)}
          motoToEdit={motoToEdit}
          onClose={() => setMotoToEdit(null)}
          form={editMotoForm}
          setForm={setEditMotoForm}
          onSubmit={handleEditMotoSubmit}
          handleTenantPhotoUpload={handleEditMotoTenantPhotoUpload}
          maskCPFInput={maskCPFInput}
          maskPhoneInput={maskPhoneInput}
          isPlateCorruptedOrInvalid={isPlateCorruptedOrInvalid}
        />
      )}

      {showPaymentModal && (
        <MotoPaymentModal
          paymentData={showPaymentModal}
          onClose={() => setShowPaymentModal(null)}
          onConfirm={(contractId, instId, notes) => {
            payMotoInstallment(contractId, instId, notes);
            setShowPaymentModal(null);
          }}
        />
      )}

      {showNewKmModal && selectedMoto && (
        <MotoNewKmModal
          isOpen={showNewKmModal}
          moto={selectedMoto}
          onClose={() => setShowNewKmModal(false)}
          onConfirm={(motoId, km, notes, photoUrl) => {
            addKmLog(motoId, km, notes, photoUrl);
          }}
        />
      )}

      {showDeliveryModal && selectedMoto && (
        <MotoDeliveryModal
          isOpen={showDeliveryModal}
          moto={selectedMoto}
          onClose={() => setShowDeliveryModal(false)}
          onConfirm={(motoId, delivery) => {
            recordMotoDelivery(motoId, delivery);
          }}
        />
      )}

      {showCompareModal && selectedMoto && (
        <ComparadorVistoriaModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          assetType="moto"
          moto={selectedMoto}
        />
      )}

      {motoToDelete && (
        <DeleteMotoConfirmModal
          moto={motoToDelete}
          onClose={() => setMotoToDelete(null)}
          onConfirm={() => {
            deleteMoto(motoToDelete.id);
            setMotoToDelete(null);
            if (selectedMotoId === motoToDelete.id) {
              setSelectedMotoId(null);
            }
          }}
        />
      )}

      {motoToTerminate && (
        <TerminateMotoModal
          data={motoToTerminate}
          form={terminateMotoForm}
          setForm={setTerminateMotoForm}
          onClose={() => setMotoToTerminate(null)}
          onConfirm={() => {
            terminateMotoContract(
              motoToTerminate.contract.id,
              terminateMotoForm.finalKm,
              terminateMotoForm.notes
            );
            setMotoToTerminate(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {selectedPhotoPreview && (
        <PhotoLightboxModal
          photo={selectedPhotoPreview}
          onClose={() => setSelectedPhotoPreview(null)}
        />
      )}

      {newContractSuccessData && (
        <NewContractSuccessModal
          data={newContractSuccessData}
          onClose={() => setNewContractSuccessData(null)}
          settings={settings}
          formatCurrency={formatCurrency}
          formatCPF={formatCPF}
        />
      )}

      {showMaintenanceModal && selectedMoto && (
        <MotoMaintenanceModal
          isOpen={showMaintenanceModal}
          moto={selectedMoto}
          onClose={() => setShowMaintenanceModal(false)}
        />
      )}

      {showAdjustmentModal && selectedMoto && activeContract && (
        <RentAdjustmentModal
          isOpen={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          type="moto"
          contractId={activeContract.id}
          currentValue={
            activeContract.paymentFrequency === 'semanal'
              ? activeContract.weeklyValue || (activeContract.monthlyValue ? monthlyToWeekly(activeContract.monthlyValue) : (activeContract.installments?.[0]?.amount || 0))
              : activeContract.monthlyValue || (activeContract.weeklyValue ? weeklyToMonthly(activeContract.weeklyValue) : (activeContract.installments?.[0]?.amount || 0))
          }
          clientName={
            motoTenants.find((t) => t.id === activeContract.tenantId)?.fullName ||
            'Locatário'
          }
        />
      )}
    </div>
  );
};
