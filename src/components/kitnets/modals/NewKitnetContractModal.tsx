import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  User,
  FileCheck,
  Calendar,
  DollarSign,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Kitnet, KitnetTenant, IncomeType } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { getTodayLocalDateString } from '../../../utils/formatters';
import { compressImage } from '../../../utils/imageUtils';
import {
  generateKitnetContractPdfFile,
  getKitnetContractRawText,
  openKitnetContractPrintWindow,
} from '../../../utils/pdfGenerator';
import { KitnetStepTenant } from '../wizard/KitnetStepTenant';
import { KitnetStepIncome } from '../wizard/KitnetStepIncome';
import { KitnetStepContractTerms } from '../wizard/KitnetStepContractTerms';
import { KitnetStepFinancials } from '../wizard/KitnetStepFinancials';
import { KitnetStepPayment } from '../wizard/KitnetStepPayment';
import { KitnetStepReviewContract } from '../wizard/KitnetStepReviewContract';

interface NewKitnetContractModalProps {
  isOpen: boolean;
  selectedKitnet: Kitnet | null;
  kitnetTenants: KitnetTenant[];
  onClose: () => void;
  onSubmit: (contractData: any, newTenantData?: any) => void;
}

export const NewKitnetContractModal: React.FC<NewKitnetContractModalProps> = ({
  isOpen,
  selectedKitnet,
  kitnetTenants,
  onClose,
  onSubmit,
}) => {
  useBodyScrollLock(isOpen);
  const { settings } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [contractTab, setContractTab] = useState<'preview' | 'text'>('preview');

  // ETAPA 1 — DADOS DO INQUILINO
  const [tenantMode, setTenantMode] = useState<'new' | 'existing'>('new');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [tenantData, setTenantData] = useState({
    fullName: '',
    cpf: '',
    rg: '',
    birthDate: '1995-01-01',
    phone: '',
    whatsapp: '',
    email: '',
    photoUrl: '',
    maritalStatus: 'solteiro' as 'solteiro' | 'casado' | 'uniao_estavel' | 'divorciado' | 'viuvo',
    profession: '',
  });

  // ETAPA 2 — RENDA & DOCUMENTOS
  const [incomeType, setIncomeType] = useState<IncomeType>('CLT');
  const [incomeDetails, setIncomeDetails] = useState({
    companyOrActivity: '',
    roleOrProfession: '',
    monthlyIncome: 0,
    cnpj: '',
  });
  const [documentsFiles, setDocumentsFiles] = useState<{
    photo?: string;
    proofOfIncome?: string;
    bankStatement?: string;
    socialContract?: string;
    proofOfAddress?: string;
  }>({});

  // ETAPA 3 — TERMOS DO CONTRATO
  const [contractTerms, setContractTerms] = useState({
    signatureDate: getTodayLocalDateString(),
    startDate: getTodayLocalDateString(),
    durationOption: 12 as number | 'custom',
    customMonths: 12,
    endDate: '',
  });

  // ETAPA 4 — FINANCEIRO
  const [financials, setFinancials] = useState({
    rentValue: selectedKitnet?.monthlyRentBase || 0,
    waterValue: selectedKitnet?.monthlyWaterBase || 0,
    internetValue: selectedKitnet?.monthlyInternetBase || 0,
    otherFees: selectedKitnet?.otherFeesBase || 0,
    deposit:
      selectedKitnet?.depositBase !== undefined
        ? selectedKitnet.depositBase
        : (selectedKitnet?.monthlyRentBase || 0),
    cleaningFee:
      selectedKitnet?.cleaningFeeBase !== undefined
        ? selectedKitnet.cleaningFeeBase
        : (settings.cleaningFee || 0),
  });

  // ETAPA 5 — PAGAMENTO & COBRANÇA
  const [paymentConfig, setPaymentConfig] = useState({
    dueDay: 10,
    paymentMethod: 'PIX Instantâneo',
    pixKey: settings.adminPixKey || '',
    notes: 'Pagamento pontual até o dia de vencimento. Vistoria de entrada anexada ao contrato.',
    firstPaymentReceived: false,
    firstPaymentPaidDate: getTodayLocalDateString(),
    firstPaymentMethod: 'PIX Instantâneo',
    firstPaymentNotes: '1º Aluguel recebido no cadastro / entrada',
  });

  // Sincroniza valores padrão quando a kitnet selecionada muda
  useEffect(() => {
    if (selectedKitnet) {
      setFinancials({
        rentValue: selectedKitnet.monthlyRentBase || 0,
        waterValue: selectedKitnet.monthlyWaterBase || 0,
        internetValue: selectedKitnet.monthlyInternetBase || 0,
        otherFees: selectedKitnet.otherFeesBase || 0,
        deposit:
          selectedKitnet.depositBase !== undefined
            ? selectedKitnet.depositBase
            : (selectedKitnet.monthlyRentBase || 0),
        cleaningFee:
          selectedKitnet.cleaningFeeBase !== undefined
            ? selectedKitnet.cleaningFeeBase
            : (settings.cleaningFee || 0),
      });
      if (settings.adminPixKey) {
        setPaymentConfig((prev) => ({ ...prev, pixKey: settings.adminPixKey }));
      }
    }
  }, [selectedKitnet, settings.adminPixKey]);

  // Cálculo da data de término
  const calculateEndDate = (startDateStr: string, months: number): string => {
    if (!startDateStr) return '';
    try {
      const [year, month, day] = startDateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setMonth(date.getMonth() + months);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const effectiveMonths =
      contractTerms.durationOption === 'custom'
        ? Number(contractTerms.customMonths) || 12
        : contractTerms.durationOption;
    const computedEnd = calculateEndDate(contractTerms.startDate, effectiveMonths);
    setContractTerms((prev) => ({ ...prev, endDate: computedEnd }));
  }, [contractTerms.startDate, contractTerms.durationOption, contractTerms.customMonths]);

  if (!isOpen || !selectedKitnet || typeof document === 'undefined') return null;

  const totalMonthly =
    Number(financials.rentValue || 0) +
    Number(financials.waterValue || 0) +
    Number(financials.internetValue || 0) +
    Number(financials.otherFees || 0);

  const steps = [
    { num: 1, label: 'Inquilino', shortLabel: 'Inquilino', icon: User },
    { num: 2, label: 'Renda & Docs', shortLabel: 'Renda & Docs', icon: FileCheck },
    { num: 3, label: 'Contrato', shortLabel: 'Contrato', icon: Calendar },
    { num: 4, label: 'Valores', shortLabel: 'Valores', icon: DollarSign },
    { num: 5, label: 'Pagamento', shortLabel: 'Pagamento', icon: CreditCard },
    { num: 6, label: 'Emitir Contrato', shortLabel: 'Emitir Contrato', icon: FileText },
  ];

  const handleTenantPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido.');
      return;
    }
    try {
      const compressed = await compressImage(file, 800, 800, 0.82);
      setTenantData((prev) => ({ ...prev, photoUrl: compressed }));
      setDocumentsFiles((prev) => ({ ...prev, photo: compressed }));
    } catch (err) {
      console.error('Erro ao processar foto:', err);
      alert('Não foi possível processar a foto. Tente novamente.');
    }
  };

  const handleDocUpload = (key: string, file: File) => {
    if (!file) return;
    setDocumentsFiles((prev) => ({
      ...prev,
      [key]: file.name,
    }));
  };

  const handleRemoveDoc = (key: string) => {
    setDocumentsFiles((prev) => {
      const updated = { ...prev };
      delete (updated as any)[key];
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getContractPayload = () => {
    const effectiveMonths =
      contractTerms.durationOption === 'custom'
        ? Number(contractTerms.customMonths) || 12
        : contractTerms.durationOption;

    const effectiveTenant: KitnetTenant =
      tenantMode === 'new'
        ? {
            id: selectedTenantId || 'temp-tenant',
            fullName: tenantData.fullName || `Inquilino (${selectedKitnet.name})`,
            cpf: tenantData.cpf || '000.000.000-00',
            rg: tenantData.rg || '',
            birthDate: tenantData.birthDate,
            phone: tenantData.phone || tenantData.whatsapp || '',
            whatsapp: tenantData.whatsapp || tenantData.phone || '',
            email: tenantData.email || '',
            photoUrl: tenantData.photoUrl,
            address: selectedKitnet.address,
            maritalStatus: tenantData.maritalStatus,
            profession: tenantData.profession,
            incomeType: incomeType,
            documents: {
              ...documentsFiles,
              ...(tenantData.photoUrl ? { photo: tenantData.photoUrl } : {}),
            },
          }
        : kitnetTenants.find((t) => t.id === selectedTenantId) || {
            id: 'temp-tenant',
            fullName: 'Inquilino Selecionado',
            cpf: '000.000.000-00',
            rg: '',
            birthDate: '1990-01-01',
            phone: '',
            email: '',
            address: selectedKitnet.address,
            maritalStatus: 'solteiro',
            incomeType: 'CLT',
            documents: {},
          };

    const mockContract = {
      id: 'temp-contract',
      kitnetId: selectedKitnet.id,
      tenantId: effectiveTenant.id,
      startDate: contractTerms.startDate,
      endDate: contractTerms.endDate,
      signatureDate: contractTerms.signatureDate,
      durationMonths: effectiveMonths,
      rentValue: financials.rentValue,
      waterValue: financials.waterValue,
      internetValue: financials.internetValue,
      otherFees: financials.otherFees,
      deposit: financials.deposit,
      cleaningFee: financials.cleaningFee,
      dueDay: paymentConfig.dueDay,
      paymentMethod: paymentConfig.paymentMethod,
      pixKey: paymentConfig.pixKey,
      status: 'ativo' as const,
      installments: [],
      notes: paymentConfig.notes,
    };

    return {
      kitnet: selectedKitnet,
      contract: mockContract,
      tenant: effectiveTenant,
      settings,
    };
  };

  const handleGenerateContract = (autoDownload = true) => {
    const payload = getContractPayload();
    return generateKitnetContractPdfFile({
      ...payload,
      autoDownload,
    });
  };

  const handlePrintContract = () => {
    const payload = getContractPayload();
    openKitnetContractPrintWindow(payload);
  };

  const handleCopyContractText = () => {
    const payload = getContractPayload();
    const rawText = getKitnetContractRawText(payload);
    navigator.clipboard.writeText(rawText).then(() => {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2500);
    });
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const effectiveMonths =
      contractTerms.durationOption === 'custom'
        ? Number(contractTerms.customMonths) || 12
        : contractTerms.durationOption;

    let finalTenantId = selectedTenantId;
    let newTenantDataToPass = undefined;

    if (tenantMode === 'new') {
      finalTenantId = `tenant_${Date.now()}`;
      newTenantDataToPass = {
        fullName: tenantData.fullName.trim() || `Inquilino (${selectedKitnet.name})`,
        cpf: tenantData.cpf || '000.000.000-00',
        phone: tenantData.phone || tenantData.whatsapp || '',
        whatsapp: tenantData.whatsapp || tenantData.phone || '',
        rg: tenantData.rg || '',
        birthDate: tenantData.birthDate || '1995-01-01',
        email: tenantData.email || '',
        maritalStatus: tenantData.maritalStatus || 'solteiro',
        profession: tenantData.profession || '',
        incomeType: incomeType,
        incomeDetails: incomeDetails,
        photoUrl: tenantData.photoUrl || '',
        documents: {
          ...documentsFiles,
          ...(tenantData.photoUrl ? { photo: tenantData.photoUrl } : {}),
        },
      };
    } else if (!finalTenantId && kitnetTenants.length > 0) {
      finalTenantId = kitnetTenants[0].id;
    } else if (!finalTenantId) {
      finalTenantId = `tenant_${Date.now()}`;
      newTenantDataToPass = {
        fullName: `Inquilino (${selectedKitnet.name})`,
        cpf: '000.000.000-00',
        phone: '',
        whatsapp: '',
        rg: '',
        birthDate: '1995-01-01',
        email: '',
        maritalStatus: 'solteiro',
        profession: '',
        incomeType: 'CLT',
        incomeDetails: incomeDetails,
        photoUrl: '',
        documents: {},
      };
    }

    onSubmit(
      {
        tenantId: finalTenantId,
        startDate: contractTerms.startDate || getTodayLocalDateString(),
        signatureDate: contractTerms.signatureDate || getTodayLocalDateString(),
        endDate: contractTerms.endDate,
        durationMonths: effectiveMonths || 12,
        rentValue: financials.rentValue !== undefined ? financials.rentValue : 850,
        waterValue: financials.waterValue !== undefined ? financials.waterValue : 0,
        internetValue: financials.internetValue !== undefined ? financials.internetValue : 0,
        otherFees: financials.otherFees !== undefined ? financials.otherFees : 0,
        dueDay: paymentConfig.dueDay || 10,
        paymentMethod: paymentConfig.paymentMethod,
        pixKey: paymentConfig.pixKey,
        deposit: financials.deposit !== undefined ? financials.deposit : 0,
        cleaningFee: financials.cleaningFee !== undefined ? financials.cleaningFee : 400,
        notes: paymentConfig.notes || '',
        firstPaymentReceived: paymentConfig.firstPaymentReceived,
        firstPaymentPaidDate: paymentConfig.firstPaymentPaidDate,
        firstPaymentMethod: paymentConfig.firstPaymentMethod,
        firstPaymentNotes: paymentConfig.firstPaymentNotes,
      },
      newTenantDataToPass
    );
  };

  return createPortal(
    <div
      id="modal-new-kitnet-contract"
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div
        className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto animate-modal-enter min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
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
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-white/[0.08] text-slate-300 border border-white/[0.10]">
                  {selectedKitnet.name} {selectedKitnet.number ? `• Unidade ${selectedKitnet.number}` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Defina inquilino, renda, prazos, valores, regras e emita o contrato com validade jurídica.
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

        {/* Wizard Stepper Bar */}
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
                    onClick={() => setCurrentStep(s.num)}
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
                      className={`h-0.5 flex-1 min-w-[12px] rounded-full shrink-0 ${
                        currentStep > s.num ? 'bg-emerald-500/60' : 'bg-white/[0.08]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-w-0"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {currentStep === 1 && (
            <KitnetStepTenant
              stepNumber={1}
              tenantMode={tenantMode}
              setTenantMode={setTenantMode}
              selectedTenantId={selectedTenantId}
              setSelectedTenantId={setSelectedTenantId}
              kitnetTenants={kitnetTenants}
              tenantData={tenantData}
              setTenantData={setTenantData}
              handleTenantPhotoUpload={handleTenantPhotoUpload}
              onRemovePhoto={() => {
                setTenantData((prev) => ({ ...prev, photoUrl: '' }));
                setDocumentsFiles((prev) => {
                  const updated = { ...prev };
                  delete updated.photo;
                  return updated;
                });
              }}
            />
          )}

          {currentStep === 2 && (
            <KitnetStepIncome
              stepNumber={2}
              incomeType={incomeType}
              setIncomeType={setIncomeType}
              incomeDetails={incomeDetails}
              setIncomeDetails={setIncomeDetails}
              documentsFiles={documentsFiles}
              handleDocUpload={handleDocUpload}
              handleRemoveDoc={handleRemoveDoc}
            />
          )}

          {currentStep === 3 && (
            <KitnetStepContractTerms
              stepNumber={3}
              contractTerms={contractTerms}
              setContractTerms={setContractTerms}
            />
          )}

          {currentStep === 4 && (
            <KitnetStepFinancials
              stepNumber={4}
              financials={financials}
              setFinancials={setFinancials}
              totalMonthly={totalMonthly}
            />
          )}

          {currentStep === 5 && (
            <KitnetStepPayment
              stepNumber={5}
              paymentConfig={paymentConfig}
              setPaymentConfig={setPaymentConfig}
              contractTerms={contractTerms}
              financials={financials}
              totalMonthly={totalMonthly}
            />
          )}

          {currentStep === 6 && (
            <KitnetStepReviewContract
              settings={settings}
              kitnetData={{
                number: selectedKitnet.number || '',
                name: selectedKitnet.name,
                address: selectedKitnet.address || '',
              }}
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

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-5 border-t border-white/[0.08] flex items-center justify-between bg-[#0E111A]/95 backdrop-blur-sm shrink-0 gap-2">
          <div>
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                Cancelar
              </button>
            ) : (
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
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-1 ring-emerald-400/40 hover:brightness-110 active:scale-[0.98]"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFinalSubmit()}
                className="px-6 sm:px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-1 ring-emerald-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 hover:brightness-110"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Criar e Ativar Contrato</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
