import { useApp } from '../../context/AppContext';
import { useMotosFilters } from './hooks/useMotosFilters';
import { useMotoDocuments } from './hooks/useMotoDocuments';
import { useMotoFinancial } from './hooks/useMotoFinancial';
import { useMotoCreation } from './hooks/useMotoCreation';
import { useMotosActions } from './hooks/useMotosActions';

export function useMotosViewLogic() {
  const {
    motos,
    motoContracts,
    motoTenants,
    settings,
    addMoto,
    updateMoto,
    deleteMoto,
    duplicateMoto,
    addKmLog,
    recordMotoDelivery,
    deleteMotoMaintenance,
    addMotoTenant,
    updateMotoTenant,
    createMotoContract,
    updateMotoContract,
    payMotoInstallment,
    terminateMotoContract,
  } = useApp();

  // 1. Filter, search and active selection state
  const {
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    selectedMotoId,
    setSelectedMotoId,
    activeSubTab,
    setActiveSubTab,
    filteredMotos,
    selectedMoto,
    activeContract,
  } = useMotosFilters(motos, motoContracts);

  // 2. Documents, gallery photos and contract success previews
  const {
    galleryFileInputRef,
    activeUploadAngle,
    setActiveUploadAngle,
    selectedPhotoPreview,
    setSelectedPhotoPreview,
    newContractSuccessData,
    setNewContractSuccessData,
    handleDirectGalleryUpload,
    handleTriggerQuickUpload,
    handleRemovePhotoAngle,
  } = useMotoDocuments({
    selectedMoto,
    updateMoto,
  });

  // 3. Financial actions & modals (payments, contract adjustments)
  const {
    showPaymentModal,
    setShowPaymentModal,
    showAdjustmentModal,
    setShowAdjustmentModal,
  } = useMotoFinancial({
    payMotoInstallment,
    terminateMotoContract,
  });

  // 4. Creation, editing, and form management
  // We'll declare setters for modal visibility managed by creation & actions
  let setShowNewMotoModalRef = (_open: boolean) => {};
  let setShowNewContractModalRef = (_open: boolean) => {};

  const {
    newMotoForm,
    setNewMotoForm,
    standaloneContractForm,
    setStandaloneContractForm,
    editMotoForm,
    setEditMotoForm,
    terminateMotoForm,
    setTerminateMotoForm,
    motoToEdit,
    setMotoToEdit,
    motoToTerminate,
    setMotoToTerminate,
    handleNewMotoTenantPhotoUpload,
    handleEditMotoTenantPhotoUpload,
    handleStandaloneTenantPhotoUpload,
    handleCreateMotoSubmit,
    handleCreateStandaloneContractSubmit,
    handleOpenEditModal,
    handleEditMotoSubmit,
  } = useMotoCreation({
    selectedMoto,
    motoContracts,
    motoTenants,
    addMoto,
    updateMoto,
    addMotoTenant,
    updateMotoTenant,
    createMotoContract,
    updateMotoContract,
    setSelectedMotoId,
    setShowNewMotoModal: (open) => setShowNewMotoModalRef(open),
    setShowNewContractModal: (open) => setShowNewContractModalRef(open),
    setNewContractSuccessData,
  });

  // 5. Actions, modal visibility & body scroll lock
  const {
    showNewMotoModal,
    setShowNewMotoModal,
    showNewContractModal,
    setShowNewContractModal,
    showNewKmModal,
    setShowNewKmModal,
    showDeliveryModal,
    setShowDeliveryModal,
    showCompareModal,
    setShowCompareModal,
    showMaintenanceModal,
    setShowMaintenanceModal,
    motoToDelete,
    setMotoToDelete,
    isAnyModalOpen,
  } = useMotosActions({
    duplicateMoto,
    deleteMoto,
    deleteMotoMaintenance,
    addKmLog,
    recordMotoDelivery,
    externalModalStates: [
      Boolean(showPaymentModal),
      Boolean(showAdjustmentModal),
      Boolean(motoToEdit),
      Boolean(motoToTerminate),
      Boolean(selectedPhotoPreview),
    ],
  });

  // Wire up mutable setters
  setShowNewMotoModalRef = setShowNewMotoModal;
  setShowNewContractModalRef = setShowNewContractModal;

  return {
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
    activeUploadAngle,
    setActiveUploadAngle,
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
    isAnyModalOpen,
  };
}
