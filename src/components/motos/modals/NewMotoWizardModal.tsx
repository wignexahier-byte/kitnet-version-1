import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Motorbike,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  User,
  FileText,
  Calendar,
  DollarSign,
  Wallet,
  FileCheck,
} from 'lucide-react';
import { MotoStatus, MotoTenant } from '../../../types';
import { NewMotoStepVehicle } from './wizard/NewMotoStepVehicle';
import { NewMotoStepTenant } from './wizard/NewMotoStepTenant';
import { NewMotoStepIncome } from './wizard/NewMotoStepIncome';
import { NewMotoStepContractTerms } from './wizard/NewMotoStepContractTerms';
import { NewMotoStepFinancials } from './wizard/NewMotoStepFinancials';
import { NewMotoStepPayment } from './wizard/NewMotoStepPayment';
import { NewMotoStepReviewContract } from './wizard/NewMotoStepReviewContract';
import { validateLicensePlate } from '../../../utils/formatters';
import {
  formatCurrency as defaultFormatCurrency,
  formatDate as defaultFormatDate,
} from '../../../utils/formatters';

const defaultMaskCPF = (v: string) => {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const defaultMaskPhone = (v: string) => {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2');
};

export interface NewMotoWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleTenantPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maskCPFInput?: (v: string) => string;
  maskPhoneInput?: (v: string) => string;
  formatCurrency?: (value: number) => string;
  formatDate?: (dateStr: string) => string;
  existingTenants?: MotoTenant[];
  settings?: any;
}

export const NewMotoWizardModal: React.FC<NewMotoWizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  handleTenantPhotoUpload = () => {},
  maskCPFInput = defaultMaskCPF,
  maskPhoneInput = defaultMaskPhone,
  formatCurrency = defaultFormatCurrency,
  formatDate = defaultFormatDate,
  existingTenants = [],
  settings,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const isAlugada = form.status === 'alugada';

  // Se o status mudar para diferente de alugada, reseta para a etapa 1
  useEffect(() => {
    if (!isAlugada && currentStep !== 1) {
      setCurrentStep(1);
    }
  }, [isAlugada, currentStep]);

  if (!isOpen || typeof document === 'undefined') return null;

  const steps = [
    { num: 1 as const, label: 'Veículo', icon: Motorbike },
    { num: 2 as const, label: 'Locatário', icon: User },
    { num: 3 as const, label: 'Renda & Docs', icon: FileCheck },
    { num: 4 as const, label: 'Contrato', icon: Calendar },
    { num: 5 as const, label: 'Valores', icon: DollarSign },
    { num: 6 as const, label: 'Pagamento', icon: Wallet },
    { num: 7 as const, label: 'Emitir Contrato', icon: FileText },
  ];

  const validateForSave = () => {
    setStepError(null);

    // Passo 1: Veículo
    if (!form.model || !form.model.trim()) {
      setStepError('Por favor, informe o Modelo da moto.');
      setCurrentStep(1);
      return false;
    }
    if (!form.plate || !form.plate.trim()) {
      setStepError('Por favor, informe a Placa do veículo.');
      setCurrentStep(1);
      return false;
    }
    const val = validateLicensePlate(form.plate);
    if (!val.isValid) {
      setStepError(
        'Placa inválida. Utilize o formato tradicional (ABC-1234) ou Mercosul (BRA2E19).'
      );
      setCurrentStep(1);
      return false;
    }

    if (!isAlugada) return true;

    // Passo 2: Locatário
    if (!form.tenantName || !form.tenantName.trim()) {
      setStepError('Por favor, informe o Nome Completo do locatário.');
      setCurrentStep(2);
      return false;
    }

    // Passo 5: Valores
    const installmentValue =
      form.paymentFrequency === 'semanal' ? Number(form.weeklyValue) : Number(form.monthlyValue);
    if (!installmentValue || installmentValue <= 0) {
      setStepError('Por favor, informe o valor da locação (semanal ou mensal).');
      setCurrentStep(5);
      return false;
    }

    // Passo 6: Primeiro Pagamento (se marcado como recebido)
    if (form.firstPaymentReceived) {
      if (!form.firstPaymentPaidDate) {
        setStepError('Por favor, informe a data em que o 1º pagamento foi recebido.');
        setCurrentStep(6);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    setStepError(null);
    if (currentStep === 4 || currentStep === 5) {
      // Garante que o total acordado esteja sempre matematicamente consistente
      const isWeekly = form.paymentFrequency === 'semanal';
      const durationMonths = Number(form.durationMonths) || 36;
      const totalWeeks = Math.round(durationMonths * (52 / 12));
      const totalInstallments = isWeekly ? totalWeeks : durationMonths;
      const periodVal = isWeekly ? Number(form.weeklyValue) || 0 : Number(form.monthlyValue) || 0;
      const calculatedTotal = Math.round(periodVal * totalInstallments * 100) / 100;
      const currentTotal = Number(form.totalAgreedValue) || 0;

      if ((currentTotal === 0 || (currentTotal < 100 && calculatedTotal >= 100)) && calculatedTotal > 0) {
        setForm((prev: any) => ({ ...prev, totalAgreedValue: calculatedTotal }));
      }
    }
    if (currentStep < 7) {
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

    if (!isAlugada) {
      if (!validateForSave()) return;
      setForm((prev: any) => ({
        ...prev,
        tenantName: '',
        tenantCpf: '',
        tenantPhone: '',
        tenantEmail: '',
        tenantRg: '',
        tenantPhoto: '',
        firstPaymentReceived: false,
      }));
      onSubmit(e);
      return;
    }

    if (!validateForSave()) return;

    // Garante que o total acordado seja enviado sem anomalias
    const isWeekly = form.paymentFrequency === 'semanal';
    const durationMonths = Number(form.durationMonths) || 36;
    const totalWeeks = Math.round(durationMonths * (52 / 12));
    const totalInstallments = isWeekly ? totalWeeks : durationMonths;
    const periodVal = isWeekly ? Number(form.weeklyValue) || 0 : Number(form.monthlyValue) || 0;
    const calculatedTotal = Math.round(periodVal * totalInstallments * 100) / 100;
    const currentTotal = Number(form.totalAgreedValue) || 0;

    if ((currentTotal === 0 || (currentTotal < 100 && calculatedTotal >= 100)) && calculatedTotal > 0) {
      form.totalAgreedValue = calculatedTotal;
    }

    onSubmit(e);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto animate-modal-enter min-w-0">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0E111A]/90 backdrop-blur-sm shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-colors ${
                form.status === 'alugada'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : form.status === 'manutencao'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              }`}
            >
              <Motorbike className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                  Cadastro de Moto & Locação
                </h2>
                <span
                  className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold border shrink-0 transition-colors ${
                    form.status === 'alugada'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : form.status === 'manutencao'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  }`}
                >
                  {isAlugada ? `Passo ${currentStep} de 7` : 'Etapa Única'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                {isAlugada
                  ? 'Cadastre a moto, vincule o condutor, configure valores, primeiro pagamento e emita o contrato.'
                  : 'Cadastre a moto e defina seu status operacional no pátio.'}
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

        {/* STEPPER BAR (QUANDO ALUGADA - 7 ETAPAS COMPLETAS) */}
        {isAlugada && (
          <div className="bg-[#090B10] border-b border-white/[0.08] px-3 sm:px-5 py-2.5 overflow-x-auto scrollbar-none shrink-0 animate-fadeIn">
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
        )}

        {/* FEEDBACK DE ERRO */}
        {stepError && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 animate-shake shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{stepError}</span>
          </div>
        )}

        {/* MODAL BODY (FORM STEP RENDER) */}
        <form
          id="moto-wizard-form"
          onSubmit={handleFinalSubmit}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
        >
          {/* ETAPA 1: VEÍCULO */}
          {currentStep === 1 && (
            <NewMotoStepVehicle
              form={form}
              setForm={setForm}
            />
          )}

          {/* ETAPA 2: LOCATÁRIO (DADOS PESSOAIS & ENDEREÇO) */}
          {currentStep === 2 && isAlugada && (
            <NewMotoStepTenant
              form={form}
              setForm={setForm}
              handleTenantPhotoUpload={handleTenantPhotoUpload}
              maskCPFInput={maskCPFInput}
              maskPhoneInput={maskPhoneInput}
              existingTenants={existingTenants}
            />
          )}

          {/* ETAPA 3: CNH, RENDA & DOCUMENTOS */}
          {currentStep === 3 && isAlugada && (
            <NewMotoStepIncome
              form={form}
              setForm={setForm}
              handleTenantPhotoUpload={handleTenantPhotoUpload}
            />
          )}

          {/* ETAPA 4: TERMOS DO CONTRATO */}
          {currentStep === 4 && isAlugada && (
            <NewMotoStepContractTerms
              form={form}
              setForm={setForm}
            />
          )}

          {/* ETAPA 5: VALORES & CONDIÇÕES FINANCEIRAS */}
          {currentStep === 5 && isAlugada && (
            <NewMotoStepFinancials
              form={form}
              setForm={setForm}
            />
          )}

          {/* ETAPA 6: PAGAMENTO & PRIMEIRO PAGAMENTO (SIM/NÃO) */}
          {currentStep === 6 && isAlugada && (
            <NewMotoStepPayment
              form={form}
              setForm={setForm}
              settings={settings}
            />
          )}

          {/* ETAPA 7: EMITIR CONTRATO & REVISÃO */}
          {currentStep === 7 && isAlugada && (
            <NewMotoStepReviewContract
              form={form}
              settings={settings}
            />
          )}
        </form>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] flex items-center justify-between bg-[#0E111A]/90 backdrop-blur-sm shrink-0 gap-3">
          <div>
            {isAlugada && currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {/* SE NÃO FOR ALUGADA OU SE JÁ ESTIVER NA ÚLTIMA ETAPA (7) -> SALVAR */}
            {!isAlugada || currentStep === 7 ? (
              <button
                type="submit"
                form="moto-wizard-form"
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  form.status === 'alugada'
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25'
                    : form.status === 'manutencao'
                    ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/25'
                    : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/25'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {isAlugada ? 'Concluir Locação e Gerar Contrato' : 'Salvar Moto no Pátio'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
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
