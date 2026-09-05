import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Home,
  User,
  FileCheck,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant } from '../types';
import { useApp } from '../context/AppContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { KitnetStepProperty } from './kitnets/wizard/KitnetStepProperty';
import { KitnetStepTenant } from './kitnets/wizard/KitnetStepTenant';
import { KitnetStepIncome } from './kitnets/wizard/KitnetStepIncome';
import { KitnetStepContractTerms } from './kitnets/wizard/KitnetStepContractTerms';
import { KitnetStepFinancials } from './kitnets/wizard/KitnetStepFinancials';
import { KitnetStepPayment } from './kitnets/wizard/KitnetStepPayment';
import { KitnetStepReviewContract } from './kitnets/wizard/KitnetStepReviewContract';
import { useKitnetWizard } from './kitnets/wizard/useKitnetWizard';

interface CadastroKitnetWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    kitnetId: string,
    contractDetails?: { kitnet: Kitnet; tenant: KitnetTenant; contract: KitnetContract }
  ) => void;
}

export const CadastroKitnetWizardModal: React.FC<CadastroKitnetWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  useBodyScrollLock(isOpen);
  const { settings } = useApp();

  const {
    currentStep,
    setCurrentStep,
    copiedContract,
    contractTab,
    setContractTab,
    kitnetData,
    setKitnetData,
    tenantMode,
    setTenantMode,
    selectedTenantId,
    setSelectedTenantId,
    tenantData,
    setTenantData,
    incomeType,
    setIncomeType,
    incomeDetails,
    setIncomeDetails,
    documentsFiles,
    contractTerms,
    setContractTerms,
    financials,
    setFinancials,
    paymentConfig,
    setPaymentConfig,
    totalMonthly,
    handleTenantPhotoUpload,
    handleDocUpload,
    handleRemoveDoc,
    handleNext,
    handlePrev,
    getContractPayload,
    handleGenerateContract,
    handlePrintContract,
    handleCopyContractText,
    handleFinalSubmit,
    kitnetTenants,
  } = useKitnetWizard({ isOpen, onSuccess, onClose });

  if (!isOpen || typeof document === 'undefined') return null;

  const steps = [
    { num: 1, label: 'Imóvel', icon: Home },
    { num: 2, label: 'Inquilino', icon: User },
    { num: 3, label: 'Renda & Docs', icon: FileCheck },
    { num: 4, label: 'Contrato', icon: Calendar },
    { num: 5, label: 'Valores', icon: DollarSign },
    { num: 6, label: 'Pagamento', icon: CreditCard },
    { num: 7, label: 'Emitir Contrato', icon: FileText },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto animate-modal-enter min-w-0">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0E111A]/90 backdrop-blur-sm shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-colors ${
                kitnetData.status === 'alugada'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : kitnetData.status === 'reforma'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                  Cadastro de Kitnet & Locação
                </h2>
                <span
                  className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold border shrink-0 transition-colors ${
                    kitnetData.status === 'alugada'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : kitnetData.status === 'reforma'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}
                >
                  {kitnetData.status === 'alugada' ? `Passo ${currentStep} de 7` : 'Etapa Única'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Cadastre o imóvel, inquilino, caução e gere o contrato com validade jurídica.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.10] transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Stepper - Only needed when status is alugada */}
        {kitnetData.status === 'alugada' && (
          <div className="bg-[#090B10] border-b border-white/[0.08] px-3 sm:px-5 py-2.5 overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center min-w-[580px] gap-2">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isCompleted = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                return (
                  <React.Fragment key={s.num}>
                    <button
                      type="button"
                      onClick={() => {
                        if (s.num <= currentStep || kitnetData.status === 'alugada') {
                          setCurrentStep(s.num);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        isCurrent
                          ? kitnetData.status === 'alugada'
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                            : kitnetData.status === 'reforma'
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                            : 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25'
                          : isCompleted
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          isCurrent
                            ? kitnetData.status === 'alugada'
                              ? 'bg-slate-950 text-emerald-400'
                              : kitnetData.status === 'reforma'
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-slate-950 text-sky-400'
                            : isCompleted
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-white/[0.10] text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.num}
                      </div>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 min-w-[8px] rounded-full shrink-0 ${
                          currentStep > s.num ? 'bg-emerald-500/60' : 'bg-white/[0.08]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Wizard Step Content Body */}
        <div
          className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 overscroll-contain modal-scroll-container pb-8 w-full max-w-full"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overflowX: 'hidden' }}
        >
          {currentStep === 1 && (
            <KitnetStepProperty kitnetData={kitnetData} setKitnetData={setKitnetData} />
          )}

          {currentStep === 2 && (
            <KitnetStepTenant
              tenantMode={tenantMode}
              setTenantMode={setTenantMode}
              selectedTenantId={selectedTenantId}
              setSelectedTenantId={setSelectedTenantId}
              tenantData={tenantData}
              setTenantData={setTenantData}
              kitnetTenants={kitnetTenants}
              handleTenantPhotoUpload={handleTenantPhotoUpload}
              onRemovePhoto={() => setTenantData((prev) => ({ ...prev, photoUrl: '' }))}
            />
          )}

          {currentStep === 3 && (
            <KitnetStepIncome
              incomeType={incomeType}
              setIncomeType={setIncomeType}
              incomeDetails={incomeDetails}
              setIncomeDetails={setIncomeDetails}
              documentsFiles={documentsFiles}
              handleDocUpload={handleDocUpload}
              handleRemoveDoc={handleRemoveDoc}
            />
          )}

          {currentStep === 4 && (
            <KitnetStepContractTerms
              contractTerms={contractTerms}
              setContractTerms={setContractTerms}
            />
          )}

          {currentStep === 5 && (
            <KitnetStepFinancials
              financials={financials}
              setFinancials={setFinancials}
              totalMonthly={totalMonthly}
            />
          )}

          {currentStep === 6 && (
            <KitnetStepPayment
              paymentConfig={paymentConfig}
              setPaymentConfig={setPaymentConfig}
              contractTerms={contractTerms}
              financials={financials}
              totalMonthly={totalMonthly}
            />
          )}

          {currentStep === 7 && (
            <KitnetStepReviewContract
              settings={settings}
              kitnetData={kitnetData}
              tenantMode={tenantMode}
              tenantData={tenantData}
              selectedTenantId={selectedTenantId}
              kitnetTenants={kitnetTenants}
              financials={financials}
              contractTerms={contractTerms}
              paymentConfig={paymentConfig}
              contractTab={contractTab}
              setContractTab={setContractTab}
              copiedContract={copiedContract}
              handleCopyContractText={handleCopyContractText}
              handlePrintContract={handlePrintContract}
              handleGenerateContract={handleGenerateContract}
              getContractPayload={getContractPayload}
            />
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0E111A]/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              currentStep === 1
                ? 'opacity-0 pointer-events-none'
                : 'bg-white/[0.06] text-slate-200 border border-white/[0.10] hover:bg-white/[0.10]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              Cancelar
            </button>

            {currentStep === 7 || (currentStep === 1 && kitnetData.status !== 'alugada') ? (
              <button
                type="button"
                onClick={() => handleFinalSubmit(kitnetData.status === 'alugada')}
                className={`px-6 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 hover:brightness-110 ${
                  kitnetData.status === 'alugada'
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-1 ring-emerald-400/40'
                    : kitnetData.status === 'reforma'
                    ? 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 ring-1 ring-amber-400/40'
                    : 'bg-sky-500 hover:bg-sky-400 shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 ring-1 ring-sky-400/40'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {kitnetData.status === 'alugada' ? 'Concluir e Salvar' : 'Cadastrar Kitnet'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-1 ring-emerald-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 hover:brightness-110"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
