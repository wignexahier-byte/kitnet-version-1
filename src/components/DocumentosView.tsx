import React, { memo } from 'react';
import {
  Download,
  Loader2,
  Eye,
  Printer,
  FileCheck2,
  Palette,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDocumentGeneration } from './documentos/useDocumentGeneration';
import { DOCUMENT_TYPES_LIST } from './documentos/documentTypesList';
import { DocumentTypeSelector } from './documentos/DocumentTypeSelector';
import { DocumentCustomFields } from './documentos/DocumentCustomFields';
import { DocumentSummaryBox } from './documentos/DocumentSummaryBox';
import { DocumentPreviewModal } from './documentos/DocumentPreviewModal';
import { useRenderTracker } from '../utils/perfLogger';

export const DocumentosViewComponent: React.FC = () => {
  useRenderTracker('DocumentosView');

  const {
    motos,
    motoContracts,
    motoTenants,
    kitnets,
    kitnetContracts,
    kitnetTenants,
    settings,
  } = useApp();

  const {
    docType,
    selectedClientKey,
    setSelectedClientKey,
    selectedMotoContractId,
    setSelectedMotoContractId,
    selectedKitnetContractId,
    setSelectedKitnetContractId,
    customTenantName,
    setCustomTenantName,
    customTenantCpf,
    setCustomTenantCpf,
    customAmount,
    setCustomAmount,
    customPaymentFrequency,
    setCustomPaymentFrequency,
    customMonthlyValue,
    setCustomMonthlyValue,
    customDueDay,
    setCustomDueDay,
    customDaysLate,
    setCustomDaysLate,
    customRefundAmount,
    setCustomRefundAmount,
    customCleaningFee,
    setCustomCleaningFee,
    customRepairs,
    setCustomRepairs,
    isGenerating,
    customWeeklyValue,
    setCustomWeeklyValue,
    customDueDayOfWeek,
    setCustomDueDayOfWeek,
    customDueLimitTime,
    setCustomDueLimitTime,
    customDeposit,
    setCustomDeposit,
    customInsuranceDeductible,
    setCustomInsuranceDeductible,
    customContractCity,
    setCustomContractCity,
    customInitialKm,
    setCustomInitialKm,
    customTenantAddress,
    setCustomTenantAddress,
    customStartDate,
    setCustomStartDate,
    witnessesCount,
    setWitnessesCount,
    witness1Name,
    setWitness1Name,
    witness1Cpf,
    setWitness1Cpf,
    witness2Name,
    setWitness2Name,
    witness2Cpf,
    setWitness2Cpf,
    unifiedClients,
    selectedClient,
    isKitnetDoc,
    isMotoDoc,
    handleSelectClient,
    handleSelectDocType,
    activeTenantName,
    activeTenantCpf,
    activeAssetLabel,
    activeTenantPhone,
    activeTenantAddress,
    activeDurationMonths,
    activeDepositAmount,
    handleGenerate,
    isMonochrome,
    setIsMonochrome,
    isPreviewOpen,
    setIsPreviewOpen,
    getPreviewHtml,
    handlePrintDocument,
  } = useDocumentGeneration({
    motos,
    motoContracts,
    motoTenants,
    kitnets,
    kitnetContracts,
    kitnetTenants,
    settings,
  });

  const currentDocConfig = DOCUMENT_TYPES_LIST.find((d) => d.id === docType);

  return (
    <div className="space-y-6 font-sans animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* Page Header with exact Pill Toggle from screenshot (Fixed size, Never shifts or moves) */}
      <div className="bg-[#1C1C1F] p-4 sm:p-5 rounded-2xl border border-[#2A2A2E] flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#A78BFA] flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#F2F1ED] tracking-tight truncate">
              Documentos & Contratos
            </h1>
            <p className="text-xs text-[#9C9CA3] mt-0.5 hidden sm:block truncate">
              Emissão oficial com preenchimento inteligente, caução destacada e conformidade jurídica.
            </p>
          </div>
        </div>

        {/* Exact Pill Button (Single toggle with fixed width to prevent any movement) */}
        <button
          type="button"
          onClick={() => setIsMonochrome(!isMonochrome)}
          title={isMonochrome ? 'Mudar para modelo Colorido' : 'Mudar para modelo P&B (Monocromático)'}
          className={`w-[116px] h-9 px-3.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 shrink-0 border transition-colors cursor-pointer select-none ${
            !isMonochrome
              ? 'bg-[#141417] border-[#383840] text-[#E4E4E7] hover:border-[#8B5CF6]/60 hover:bg-[#1A1A1E]'
              : 'bg-[#141417] border-[#383840] text-[#A1A1AA] hover:border-zinc-500 hover:bg-[#1A1A1E]'
          }`}
        >
          <Palette className={`w-4 h-4 shrink-0 ${!isMonochrome ? 'text-[#A78BFA]' : 'text-zinc-400'}`} />
          <span className="truncate">{isMonochrome ? 'P&B' : 'Colorido'}</span>
        </button>
      </div>

      {/* 1. Document Model Selector (Stable Grid) */}
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#E07A3F] to-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F2F1ED]">
              1. Selecione o Modelo do Documento
            </h2>
          </div>
          <span className="text-[11px] text-[#A78BFA] font-medium hidden sm:inline bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full border border-[#8B5CF6]/20">
            {DOCUMENT_TYPES_LIST.length} modelos disponíveis
          </span>
        </div>

        <DocumentTypeSelector docType={docType} onSelectDocType={handleSelectDocType} />
      </div>

      {/* 2. Document Configuration & Live Output */}
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl p-4 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2A2E] pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[10px] uppercase font-bold text-[#A78BFA] tracking-wider">
                2. Configuração & Emissão
              </span>
            </div>
            <h3 className="text-base font-bold text-[#F2F1ED] mt-0.5">
              {currentDocConfig?.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#10B981] font-semibold bg-[#10B981]/10 px-2.5 py-1 rounded-lg border border-[#10B981]/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Pronto para Emissão
            </span>
          </div>
        </div>

        {/* Contract Linkers if specific Moto or Kitnet document */}
        {isMotoDoc && motoContracts.length > 0 && (
          <div className="bg-[#141417] p-3 rounded-xl border border-[#2A2A2E]">
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5">
              Contrato de Moto Vinculado:
            </label>
            <select
              value={selectedMotoContractId}
              onChange={(e) => {
                setSelectedMotoContractId(e.target.value);
                const contract = motoContracts.find((c) => c.id === e.target.value);
                const tenant = motoTenants.find((t) => t.id === contract?.tenantId);
                if (tenant) {
                  const clientMatch = unifiedClients.find(
                    (c) => c.tenantId === tenant.id && c.type === 'moto'
                  );
                  if (clientMatch) {
                    handleSelectClient(clientMatch.id);
                  }
                }
              }}
              className="w-full bg-[#121214] border border-[#2A2A2E] hover:border-[#8B5CF6]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
            >
              {motoContracts.map((c) => {
                const t = motoTenants.find((item) => item.id === c.tenantId);
                const m = motos.find((item) => item.id === c.motoId);
                return (
                  <option key={c.id} value={c.id}>
                    {m?.brand} {m?.model} ({m?.plate}) — {t?.fullName}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {isKitnetDoc && kitnetContracts.length > 0 && (
          <div className="bg-[#141417] p-3 rounded-xl border border-[#2A2A2E]">
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5">
              Contrato de Kitnet Vinculado:
            </label>
            <select
              value={selectedKitnetContractId}
              onChange={(e) => {
                setSelectedKitnetContractId(e.target.value);
                const contract = kitnetContracts.find((c) => c.id === e.target.value);
                const tenant = kitnetTenants.find((t) => t.id === contract?.tenantId);
                if (tenant) {
                  const clientMatch = unifiedClients.find(
                    (c) => c.tenantId === tenant.id && c.type === 'kitnet'
                  );
                  if (clientMatch) {
                    handleSelectClient(clientMatch.id);
                  }
                }
              }}
              className="w-full bg-[#121214] border border-[#2A2A2E] hover:border-[#8B5CF6]/50 rounded-xl px-3.5 py-2.5 text-xs text-[#F2F1ED] focus:outline-none focus:border-[#8B5CF6]"
            >
              {kitnetContracts.map((c) => {
                const t = kitnetTenants.find((item) => item.id === c.tenantId);
                const k = kitnets.find((item) => item.id === c.kitnetId);
                return (
                  <option key={c.id} value={c.id}>
                    {k?.name} (Nº {k?.number}) — {t?.fullName}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Clean, Unified Parameters Card with Autocomplete Tenant Search */}
        <div className="bg-[#141417] p-3.5 sm:p-4 rounded-xl border border-[#2A2A2E]">
          <DocumentCustomFields
            docType={docType}
            activeTenantName={activeTenantName}
            activeTenantCpf={activeTenantCpf}
            customTenantName={customTenantName}
            setCustomTenantName={setCustomTenantName}
            customTenantCpf={customTenantCpf}
            setCustomTenantCpf={setCustomTenantCpf}
            customAmount={customAmount}
            setCustomAmount={setCustomAmount}
            customPaymentFrequency={customPaymentFrequency}
            setCustomPaymentFrequency={setCustomPaymentFrequency}
            customMonthlyValue={customMonthlyValue}
            setCustomMonthlyValue={setCustomMonthlyValue}
            customDueDay={customDueDay}
            setCustomDueDay={setCustomDueDay}
            customDaysLate={customDaysLate}
            setCustomDaysLate={setCustomDaysLate}
            customRefundAmount={customRefundAmount}
            setCustomRefundAmount={setCustomRefundAmount}
            customCleaningFee={customCleaningFee}
            setCustomCleaningFee={setCustomCleaningFee}
            customRepairs={customRepairs}
            setCustomRepairs={setCustomRepairs}
            customWeeklyValue={customWeeklyValue}
            setCustomWeeklyValue={setCustomWeeklyValue}
            customDueDayOfWeek={customDueDayOfWeek}
            setCustomDueDayOfWeek={setCustomDueDayOfWeek}
            customDueLimitTime={customDueLimitTime}
            setCustomDueLimitTime={setCustomDueLimitTime}
            customDeposit={customDeposit}
            setCustomDeposit={setCustomDeposit}
            customInsuranceDeductible={customInsuranceDeductible}
            setCustomInsuranceDeductible={setCustomInsuranceDeductible}
            customContractCity={customContractCity}
            setCustomContractCity={setCustomContractCity}
            customInitialKm={customInitialKm}
            setCustomInitialKm={setCustomInitialKm}
            customTenantAddress={customTenantAddress}
            setCustomTenantAddress={setCustomTenantAddress}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            witnessesCount={witnessesCount}
            setWitnessesCount={setWitnessesCount}
            witness1Name={witness1Name}
            setWitness1Name={setWitness1Name}
            witness1Cpf={witness1Cpf}
            setWitness1Cpf={setWitness1Cpf}
            witness2Name={witness2Name}
            setWitness2Name={setWitness2Name}
            witness2Cpf={witness2Cpf}
            setWitness2Cpf={setWitness2Cpf}
            unifiedClients={unifiedClients}
            selectedClient={selectedClient}
            onSelectClient={handleSelectClient}
            onClearClient={() => {
              setSelectedClientKey('');
              setCustomTenantName('');
              setCustomTenantCpf('');
            }}
          />
        </div>

        {/* Ficha Síntese & Resumo Bilateral com Dados Reais */}
        <DocumentSummaryBox
          settings={settings}
          activeTenantName={activeTenantName}
          activeTenantCpf={activeTenantCpf}
          activeTenantPhone={activeTenantPhone}
          activeTenantAddress={activeTenantAddress}
          activeAssetLabel={activeAssetLabel}
          selectedClient={selectedClient}
          docTitle={currentDocConfig?.title}
          depositAmount={activeDepositAmount}
          periodicAmount={customPaymentFrequency === 'semanal' ? customWeeklyValue : (customMonthlyValue || customAmount)}
          startDate={customStartDate}
          durationMonths={activeDurationMonths}
        />

        {/* Action Footer (Elevated, Cohesive, Zero Overlap, Rock-solid stability) */}
        <div className="pt-5 border-t border-[#2A2A2E] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="h-11 px-4 rounded-xl font-semibold text-xs text-[#F2F1ED] bg-[#141417] border border-[#2A2A2E] hover:bg-[#1A1A1E] hover:border-[#8B5CF6]/40 hover:text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Eye className="w-4 h-4 text-[#A78BFA] shrink-0" />
              <span>Visualizar Preview</span>
            </button>

            <button
              type="button"
              onClick={handlePrintDocument}
              className="h-11 px-4 rounded-xl font-semibold text-xs text-[#F2F1ED] bg-[#141417] border border-[#2A2A2E] hover:bg-[#1A1A1E] hover:border-[#3E3E48] hover:text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 text-[#9C9CA3] shrink-0" />
              <span>Imprimir</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`h-11 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-md select-none sm:min-w-[210px] active:scale-[0.98] ${
              isGenerating
                ? 'bg-[#8B5CF6]/70 text-white cursor-wait opacity-80'
                : 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Gerando PDF Oficial...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>Baixar PDF Oficial</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        htmlContent={getPreviewHtml()}
        docTitle={currentDocConfig?.title || 'Documento Oficial'}
        isMonochrome={isMonochrome}
        onToggleMonochrome={() => setIsMonochrome(!isMonochrome)}
        onPrint={handlePrintDocument}
        onDownload={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export const DocumentosView = memo(DocumentosViewComponent);

