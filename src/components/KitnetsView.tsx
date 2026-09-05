import React, { useState } from 'react';
import {
  Plus,
  Search,
  X,
  Home,
  ArrowUpCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Kitnet, KitnetContract, KitnetTenant, Installment } from '../types';
import { generateKitnetWhatsAppMessage, openWhatsAppLink } from '../utils/whatsappGenerator';
import { isInstallmentOverdue } from '../utils/formatters';
import { getKitnetMonthlyTotal } from '../utils/contractCalculations';
import { ComparadorVistoriaModal } from './ComparadorVistoriaModal';
import { CadastroKitnetWizardModal } from './CadastroKitnetWizardModal';
import { RentAdjustmentModal } from './RentAdjustmentModal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { KitnetIcon } from './CategoryIcons';

// Subcomponents & Modals
import { KitnetSummaryKPIs } from './kitnets/KitnetSummaryKPIs';
import { KitnetCardItem } from './kitnets/KitnetCardItem';
import { EditKitnetModal } from './kitnets/modals/EditKitnetModal';
import { DeleteKitnetModal } from './kitnets/modals/DeleteKitnetModal';
import { TerminateKitnetModal } from './kitnets/modals/TerminateKitnetModal';
import { NewKitnetContractModal } from './kitnets/modals/NewKitnetContractModal';
import { RenewKitnetContractModal } from './kitnets/modals/RenewKitnetContractModal';
import { KitnetContractSuccessModal } from './kitnets/modals/KitnetContractSuccessModal';
import { KitnetPaymentModal } from './kitnets/modals/KitnetPaymentModal';
import { PhotoZoomPreviewModal } from './kitnets/modals/PhotoZoomPreviewModal';

interface KitnetsViewProps {
  onOpenWhatsApp?: (contractId: string, installmentId?: string) => void;
  onGenerateDocument: (type: any, kitnet: Kitnet, contract?: KitnetContract, tenant?: KitnetTenant) => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
}

export const KitnetsView: React.FC<KitnetsViewProps> = ({
  onOpenWhatsApp,
  onGenerateDocument,
  onOpenClientProfile,
}) => {
  const {
    kitnets,
    kitnetContracts,
    kitnetTenants,
    updateKitnet,
    deleteKitnet,
    duplicateKitnet,
    addKitnetTenant,
    createKitnetContract,
    renewKitnetContract,
    payKitnetInstallment,
    terminateKitnetContract,
    saveSignature,
    settings,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedKitnetId, setSelectedKitnetId] = useState<string | null>(null);
  const [isMobileDetailOpen] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'contrato' | 'inquilino' | 'vistoria' | 'fotos'>('geral');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<{ url: string; title: string } | null>(null);

  // Modals state
  const [showNewKitnetModal, setShowNewKitnetModal] = useState<boolean>(false);
  const [kitnetToEdit, setKitnetToEdit] = useState<Kitnet | null>(null);
  const [kitnetToDelete, setKitnetToDelete] = useState<Kitnet | null>(null);
  const [kitnetToTerminate, setKitnetToTerminate] = useState<{ contract: KitnetContract; kitnet: Kitnet } | null>(null);
  const [showNewContractModal, setShowNewContractModal] = useState<boolean>(false);
  const [showRenewModal, setShowRenewModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ contractId: string; installment: Installment } | null>(null);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);
  const [newContractSuccessData, setNewContractSuccessData] = useState<{
    kitnet: Kitnet;
    tenant: KitnetTenant;
    contract: KitnetContract;
  } | null>(null);

  const [, setRenewForm] = useState({
    additionalMonths: 12,
    newRentValue: 1560,
    reason: 'Renovação anual com emissão de novo cronograma de pagamentos',
  });

  // Filtered Kitnets
  const filteredKitnets = kitnets.filter((k) => {
    const matchesStatus = filterStatus === 'todos' || k.status === filterStatus;
    const matchesSearch =
      k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const isAnyModalOpen = Boolean(
    kitnetToEdit ||
    kitnetToDelete ||
    kitnetToTerminate ||
    showNewContractModal ||
    showRenewModal ||
    showNewKitnetModal ||
    showPaymentModal ||
    showCompareModal ||
    newContractSuccessData
  );

  useBodyScrollLock(isAnyModalOpen);

  const selectedKitnet = kitnets.find((k) => k.id === selectedKitnetId) || filteredKitnets[0] || kitnets[0];
  const activeContract = kitnetContracts.find((c) => c.kitnetId === selectedKitnet?.id && c.status === 'ativo');
  const tenant = kitnetTenants.find((t) => t.id === activeContract?.tenantId);

  const handleRenewContractSubmit = (additionalMonths: number, newRentValue: number, reason: string) => {
    if (!activeContract) return;
    renewKitnetContract(
      activeContract.id,
      additionalMonths,
      newRentValue,
      reason
    );
    setShowRenewModal(false);
  };

  const handleSaveEditKitnet = (kitnetId: string, updatedData: any) => {
    updateKitnet(kitnetId, updatedData);
    setKitnetToEdit(null);
  };

  const handleConfirmDeleteKitnet = () => {
    if (!kitnetToDelete) return;
    const deletedId = kitnetToDelete.id;
    deleteKitnet(deletedId);
    if (selectedKitnetId === deletedId) {
      const remaining = kitnets.filter((k) => k.id !== deletedId);
      setSelectedKitnetId(remaining.length > 0 ? remaining[0].id : null);
    }
    setKitnetToDelete(null);
  };

  const handleConfirmTerminate = (contractId: string, newStatus: 'disponivel' | 'reforma', notes: string) => {
    terminateKitnetContract(contractId, newStatus, notes);
    setKitnetToTerminate(null);
  };

  const handleOpenNewContract = (kitnet: Kitnet) => {
    setSelectedKitnetId(kitnet.id);
    setShowNewContractModal(true);
  };

  const handleCreateContractSubmit = (contractData: any, newTenantData?: any) => {
    if (!selectedKitnet) return;

    let finalTenantId = contractData.tenantId;

    if (newTenantData) {
      finalTenantId = addKitnetTenant(newTenantData);
    }

    if (!finalTenantId) {
      alert('Selecione ou cadastre um inquilino.');
      return;
    }

    const newContractObj: KitnetContract = {
      id: 'temp_contract',
      kitnetId: selectedKitnet.id,
      tenantId: finalTenantId,
      startDate: contractData.startDate,
      durationMonths: contractData.durationMonths,
      rentValue: contractData.rentValue,
      waterValue: contractData.waterValue,
      dueDay: contractData.dueDay,
      deposit: contractData.deposit,
      status: 'ativo',
      installments: [],
    };

    createKitnetContract(newContractObj);

    const activeTenantObj: KitnetTenant = kitnetTenants.find((t) => t.id === finalTenantId) || {
      id: finalTenantId,
      fullName: newTenantData?.fullName || 'Inquilino',
      cpf: newTenantData?.cpf || '000.000.000-00',
      rg: 'Não informado',
      birthDate: '1990-01-01',
      whatsapp: newTenantData?.phone || '',
      phone: newTenantData?.phone || '',
      email: '',
      address: selectedKitnet.address || 'Endereço da Unidade',
      maritalStatus: 'solteiro',
      profession: '',
      incomeType: newTenantData?.incomeType || 'CLT',
      documents: {},
    };

    setNewContractSuccessData({
      kitnet: selectedKitnet,
      tenant: activeTenantObj,
      contract: newContractObj,
    });

    setShowNewContractModal(false);
  };

  const handleSendKitnetWhatsApp = () => {
    if (!activeContract || !tenant) return;
    const nextInst =
      activeContract.installments.find((i) => isInstallmentOverdue(i)) ||
      activeContract.installments.find((i) => i.status === 'pendente') ||
      activeContract.installments[0];

    const message = generateKitnetWhatsAppMessage(
      activeContract,
      tenant,
      nextInst,
      settings,
      `${selectedKitnet.name} - Unidade ${selectedKitnet.number}`
    );

    if (tenant.whatsapp || tenant.phone) {
      openWhatsAppLink(tenant.whatsapp || tenant.phone, message);
    } else {
      alert('Inquilino sem telefone cadastrado.');
    }
  };

  const totalUnits = kitnets.length;
  const occupiedUnits = kitnets.filter((k) => k.status === 'alugada').length;
  const availableUnits = kitnets.filter((k) => k.status === 'disponivel').length;
  const inRenovationUnits = kitnets.filter((k) => k.status === 'reforma').length;
  const occupancyPercentage = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const activeMonthlyRevenue = kitnetContracts
    .filter((c) => c.status === 'ativo')
    .reduce((acc, c) => acc + getKitnetMonthlyTotal(c), 0);

  return (
    <div id="kitnets-view-root" className="space-y-4 sm:space-y-5 font-sans">
      {/* Top Header & Executive KPI Summary Grid */}
      <KitnetSummaryKPIs
        totalUnits={totalUnits}
        occupancyPercentage={occupancyPercentage}
        occupiedUnits={occupiedUnits}
        activeMonthlyRevenue={activeMonthlyRevenue}
        availableUnits={availableUnits}
        inRenovationUnits={inRenovationUnits}
        isMobileDetailOpen={isMobileDetailOpen}
        onAddNewKitnet={() => setShowNewKitnetModal(true)}
        onFilterClick={(filter) => setFilterStatus(filter)}
      />

      {/* Filter Pills Bar & Search Bar (Image 2) */}
      <div className={`space-y-3 ${isMobileDetailOpen ? 'hidden lg:block' : 'block'}`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* 4 Exact Filter Chips from Image 2 */}
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
              <Home className="w-4 h-4" />
              <span>Todas</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filterStatus === 'todos' ? 'bg-[#4C1D95] text-white' : 'bg-[#161B2B] text-[#94A3B8]'
                }`}
              >
                {kitnets.length}
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
                {kitnets.filter((k) => k.status === 'disponivel').length}
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
                {kitnets.filter((k) => k.status === 'alugada').length}
              </span>
            </button>

            {/* 4. Em Reforma */}
            <button
              type="button"
              onClick={() => setFilterStatus('reforma')}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0 ${
                filterStatus === 'reforma'
                  ? 'bg-[#382008] text-[#FBBF24] border border-[#F59E0B]/50 shadow-lg shadow-[#F59E0B]/20'
                  : 'bg-[#0C0F1D] text-[#94A3B8] border border-white/[0.08] hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#FBBF24] shrink-0" />
              <span>Em Reforma</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar unidade, endereço..."
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

      {/* Units List matching Image 2 */}
      <div className="space-y-4">
        {filteredKitnets.length === 0 ? (
          <div className="app-card p-8 text-center space-y-3">
            <KitnetIcon size={32} color="#64646E" className="mx-auto" />
            <div>
              <p className="text-sm font-semibold text-[#F5F5F7]">Nenhuma kitnet encontrada</p>
              <p className="text-xs text-[#9A9AA2] mt-0.5">Cadastre uma nova unidade ou altere o filtro de busca.</p>
            </div>
            <button
              onClick={() => setShowNewKitnetModal(true)}
              className="btn-primary px-3.5 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Unidade</span>
            </button>
          </div>
        ) : (
          filteredKitnets.map((kitnet, index) => {
            const isSelected = selectedKitnetId === kitnet.id;
            const contract = kitnetContracts.find((c) => c.kitnetId === kitnet.id && c.status === 'ativo');
            const t = kitnetTenants.find((item) => item.id === contract?.tenantId);

            return (
              <KitnetCardItem
                key={kitnet.id}
                kitnet={kitnet}
                index={index}
                isSelected={isSelected}
                activeContract={contract}
                tenant={t}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onToggleSelect={() => setSelectedKitnetId(isSelected ? null : kitnet.id)}
                duplicateKitnet={duplicateKitnet}
                handleOpenEditModal={(k) => setKitnetToEdit(k)}
                setKitnetToDelete={(k) => setKitnetToDelete(k)}
                handleOpenNewContract={handleOpenNewContract}
                setKitnetToTerminate={(data) => setKitnetToTerminate(data)}
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
              />
            );
          })
        )}
      </div>

      {/* Modals */}
      <PhotoZoomPreviewModal
        photoPreview={selectedPhotoPreview}
        onClose={() => setSelectedPhotoPreview(null)}
      />

      <EditKitnetModal
        kitnetToEdit={kitnetToEdit}
        kitnetContracts={kitnetContracts}
        kitnetTenants={kitnetTenants}
        onClose={() => setKitnetToEdit(null)}
        onSave={handleSaveEditKitnet}
      />

      <DeleteKitnetModal
        kitnetToDelete={kitnetToDelete}
        kitnetContracts={kitnetContracts}
        onClose={() => setKitnetToDelete(null)}
        onConfirm={handleConfirmDeleteKitnet}
      />

      <TerminateKitnetModal
        kitnetToTerminate={kitnetToTerminate}
        onClose={() => setKitnetToTerminate(null)}
        onConfirm={handleConfirmTerminate}
      />

      <NewKitnetContractModal
        isOpen={showNewContractModal}
        selectedKitnet={selectedKitnet}
        kitnetTenants={kitnetTenants}
        onClose={() => setShowNewContractModal(false)}
        onSubmit={handleCreateContractSubmit}
      />

      <CadastroKitnetWizardModal
        isOpen={showNewKitnetModal}
        onClose={() => setShowNewKitnetModal(false)}
        onSuccess={(newKitnetId, contractDetails) => {
          setSelectedKitnetId(newKitnetId);
          setActiveSubTab('geral');
          if (contractDetails) {
            setNewContractSuccessData(contractDetails);
          }
        }}
      />

      <KitnetPaymentModal
        paymentData={showPaymentModal}
        onClose={() => setShowPaymentModal(null)}
        onConfirm={(contractId, installmentId) => {
          payKitnetInstallment(contractId, installmentId);
          setShowPaymentModal(null);
        }}
      />

      {selectedKitnet && (
        <ComparadorVistoriaModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          assetType="kitnet"
          kitnet={selectedKitnet}
        />
      )}

      {showAdjustmentModal && selectedKitnet && activeContract && (
        <RentAdjustmentModal
          isOpen={showAdjustmentModal}
          contractId={activeContract.id}
          currentMonthlyValue={activeContract.rentValue}
          type="kitnet"
          identifier={`${selectedKitnet.name} (Unid. ${selectedKitnet.number})`}
          tenantName={tenant?.fullName || 'Inquilino'}
          onClose={() => setShowAdjustmentModal(false)}
        />
      )}

      <KitnetContractSuccessModal
        data={newContractSuccessData}
        settings={settings}
        onClose={() => setNewContractSuccessData(null)}
      />

      <RenewKitnetContractModal
        isOpen={showRenewModal}
        selectedKitnet={selectedKitnet}
        activeContract={activeContract}
        tenant={tenant}
        onClose={() => setShowRenewModal(false)}
        onConfirm={handleRenewContractSubmit}
      />
    </div>
  );
};
