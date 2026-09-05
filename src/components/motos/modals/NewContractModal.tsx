import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  X,
  Check,
  User,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileCheck,
  Calendar,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { Moto, MotoTenant } from '../../../types';
import { NewMotoStepTenant } from './wizard/NewMotoStepTenant';
import { NewMotoStepIncome } from './wizard/NewMotoStepIncome';
import { NewMotoStepContractTerms } from './wizard/NewMotoStepContractTerms';
import { NewMotoStepFinancials } from './wizard/NewMotoStepFinancials';
import { NewMotoStepPayment } from './wizard/NewMotoStepPayment';
import { NewMotoStepReviewContract } from './wizard/NewMotoStepReviewContract';

export interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedMoto: Moto | null;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleStandaloneTenantPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maskCPFInput: (v: string) => string;
  maskPhoneInput: (v: string) => string;
  formatCurrency?: (value: number) => string;
  formatDate?: (dateStr: string) => string;
  existingTenants?: MotoTenant[];
  settings?: any;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedMoto,
  form,
  setForm,
  handleStandaloneTenantPhotoUpload,
  maskCPFInput,
  maskPhoneInput,
  existingTenants = [],
  settings,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Garantir que os dados do veículo selecionado estejam sincronizados no form
  useEffect(() => {
    if (selectedMoto) {
      setForm((prev: any) => ({
        ...prev,
        brand: selectedMoto.brand,
        model: selectedMoto.model,
        plate: selectedMoto.plate,
        year: selectedMoto.year,
        color: selectedMoto.color,
        chassi: selectedMoto.chassi || '',
        renavam: selectedMoto.renavam || '',
        currentKm: selectedMoto.currentKm || 0,
      }));
    }
  }, [selectedMoto, setForm]);

  if (!isOpen || !selectedMoto || typeof document === 'undefined') return null;

  const steps = [
    { num: 1 as const, label: 'Locatário', icon: User },
    { num: 2 as const, label: 'Renda & Docs', icon: FileCheck },
    { num: 3 as const, label: 'Contrato', icon: Calendar },
    { num: 4 as const, label: 'Valores', icon: DollarSign },
    { num: 5 as const, label: 'Pagamento', icon: Wallet },
    { num: 6 as const, label: 'Emitir Contrato', icon: FileText },
  ];

  const validateForSave = () => {
    setStepError(null);

    // Passo 1: Locatário
    if (!form.tenantName || !form.tenantName.trim()) {
      setStepError('Por favor, informe o Nome Completo do locatário.');
      setCurrentStep(1);
      return false;
    }

    // Passo 4: Valores
    const installmentValue =
      form.paymentFrequency === 'semanal' ? Number(form.weeklyValue) : Number(form.monthlyValue);
    if (!installmentValue || installmentValue <= 0) {
      setStepError('Por favor, informe o valor da locação (semanal ou mensal).');
      setCurrentStep(4);
      return false;
    }

    // Passo 5: Primeiro Pagamento (se marcado como recebido)
    if (form.firstPaymentReceived) {
      if (!form.firstPaymentPaidDate) {
        setStepError('Por favor, informe a data em que o 1º pagamento foi recebido.');
        setCurrentStep(5);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    setStepError(null);
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handlePrev = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);
    if (!validateForSave()) return;
    onSubmit(e);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto animate-modal-enter min-w-0">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0E111A]/90 backdrop-blur-sm shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                  Novo Contrato de Locação
                </h3>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Passo {currentStep} de 6
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-white/[0.08] text-emerald-300 border border-white/[0.10] uppercase">
                  {selectedMoto.plate || 'SEM PLACA'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Moto: <strong className="text-slate-200">{selectedMoto.brand} {selectedMoto.model}</strong> • Vincule o condutor, configure valores, primeiro pagamento e emita o contrato.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.10] transition-all cursor-pointer shrink-0"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar Padronizado */}
        <div className="bg-[#090B10] border-b border-white/[0.08] px-3 sm:px-5 py-2.5 overflow-x-auto scrollbar-none shrink-0 animate-fadeIn">
          <div className="flex items-center min-w-[500px] gap-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => {
                      setStepError(null);
                      setCurrentStep(s.num);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25'
                        : isCompleted
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-slate-950 text-emerald-400'
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

        {/* Feedback de Erro */}
        {stepError && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-shake shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{stepError}</span>
          </div>
        )}

        {/* Form Body */}
        <form
          id="moto-contract-form"
          onSubmit={handleFinalSubmit}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
        >
          {/* Passo 1: Locatário */}
          {currentStep === 1 && (
            <NewMotoStepTenant
              form={form}
              setForm={setForm}
              handleTenantPhotoUpload={handleStandaloneTenantPhotoUpload}
              maskCPFInput={maskCPFInput}
              maskPhoneInput={maskPhoneInput}
              existingTenants={existingTenants}
            />
          )}

          {/* Passo 2: CNH & Renda */}
          {currentStep === 2 && (
            <NewMotoStepIncome
              form={form}
              setForm={setForm}
              handleTenantPhotoUpload={handleStandaloneTenantPhotoUpload}
            />
          )}

          {/* Passo 3: Termos do Contrato */}
          {currentStep === 3 && (
            <NewMotoStepContractTerms
              form={form}
              setForm={setForm}
            />
          )}

          {/* Passo 4: Valores & Condições Financeiras */}
          {currentStep === 4 && (
            <NewMotoStepFinancials
              form={form}
              setForm={setForm}
            />
          )}

          {/* Passo 5: Pagamento & 1ª Parcela (SIM / NÃO) */}
          {currentStep === 5 && (
            <NewMotoStepPayment
              form={form}
              setForm={setForm}
              settings={settings}
            />
          )}

          {/* Passo 6: Emitir Contrato & Minuta */}
          {currentStep === 6 && (
            <NewMotoStepReviewContract
              form={form}
              settings={settings}
            />
          )}
        </form>

        {/* Footer Padronizado */}
        <div className="p-3.5 sm:p-5 border-t border-white/[0.08] flex items-center justify-between bg-[#0E111A]/95 backdrop-blur-sm shrink-0 gap-2">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.10] transition-all cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            {currentStep === 6 ? (
              <button
                type="submit"
                form="moto-contract-form"
                className="px-6 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-1 ring-emerald-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 hover:brightness-110"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Criar Contrato</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-1 ring-emerald-400/40 hover:brightness-110 active:scale-[0.98]"
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
