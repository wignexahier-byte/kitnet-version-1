import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Kitnet, KitnetContract, KitnetTenant, KitnetStatus, IncomeType } from '../../../types';
import { getTodayLocalDateString } from '../../../utils/formatters';
import {
  generateKitnetContractPdfFile,
  getKitnetContractRawText,
  openKitnetContractPrintWindow,
} from '../../../utils/pdfGenerator';
import { compressImage } from '../../../utils/imageUtils';
import confetti from 'canvas-confetti';

interface UseKitnetWizardProps {
  isOpen: boolean;
  onSuccess: (
    kitnetId: string,
    contractDetails?: { kitnet: Kitnet; tenant: KitnetTenant; contract: KitnetContract }
  ) => void;
  onClose: () => void;
}

export function useKitnetWizard({ onSuccess, onClose }: UseKitnetWizardProps) {
  const {
    addKitnet,
    kitnetTenants,
    addKitnetTenant,
    createKitnetContract,
    addDocument,
    settings,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);
  const [contractTab, setContractTab] = useState<'preview' | 'text'>('preview');

  // ETAPA 1 — DADOS DA KITNET
  const [kitnetData, setKitnetData] = useState({
    number: '',
    name: '',
    address: '',
    description: '',
    status: 'disponivel' as KitnetStatus,
    statusNote: 'Pronta para locação imediata',
    monthlyRentBase: 0,
    monthlyWaterBase: 0,
    monthlyInternetBase: 0,
    otherFeesBase: 0,
    depositBase: 0,
    photos: {
      livingRoom: '',
      bedroom: '',
      bathroom: '',
      kitchen: '',
      outdoor: '',
    } as Record<string, string>,
  });

  // ETAPA 2 — DADOS DO INQUILINO
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
      console.error('Erro ao processar foto do inquilino:', err);
      alert('Não foi possível processar a imagem. Tente novamente.');
    }
  };

  // ETAPA 3 — COMPROVAÇÃO DE RENDA & DOCUMENTOS
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

  // ETAPA 4 — DADOS DO CONTRATO
  const [contractTerms, setContractTerms] = useState({
    signatureDate: getTodayLocalDateString(),
    startDate: getTodayLocalDateString(),
    durationOption: 12 as number | 'custom',
    customMonths: 12,
    endDate: '',
  });

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

  // ETAPA 5 — VALORES
  const [financials, setFinancials] = useState({
    rentValue: 0,
    waterValue: 0,
    internetValue: 0,
    otherFees: 0,
    deposit: 0,
    cleaningFee: 400,
  });

  const totalMonthly =
    Number(financials.rentValue || 0) +
    Number(financials.waterValue || 0) +
    Number(financials.internetValue || 0) +
    Number(financials.otherFees || 0);

  // ETAPA 6 — PAGAMENTO
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

  useEffect(() => {
    if (kitnetData.number && (!kitnetData.name || kitnetData.name.startsWith('Kitnet '))) {
      setKitnetData((prev) => ({
        ...prev,
        name: `Kitnet ${kitnetData.number}`,
      }));
    }
  }, [kitnetData.number]);

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
    if (currentStep === 1) {
      if (!kitnetData.number.trim()) {
        alert('Por favor, informe o Número da Kitnet.');
        return;
      }
      if (!kitnetData.name.trim()) {
        alert('Por favor, informe o Nome da Kitnet.');
        return;
      }
      if (kitnetData.status === 'alugada' && !kitnetData.address.trim()) {
        alert('Por favor, preencha o endereço completo da Kitnet para geração do contrato.');
        return;
      }
      if (kitnetData.status !== 'alugada') {
        handleFinalSubmit(false);
        return;
      }
    }

    if (currentStep === 2 && kitnetData.status === 'alugada') {
      if (tenantMode === 'new') {
        if (!tenantData.fullName.trim()) {
          alert('Informe o Nome Completo do inquilino.');
          return;
        }
        if (!tenantData.cpf.trim()) {
          alert('Informe o CPF do inquilino.');
          return;
        }
      } else if (!selectedTenantId) {
        alert('Selecione um inquilino já cadastrado na lista.');
        return;
      }
    }

    if (currentStep === 5 && kitnetData.status === 'alugada') {
      if (!financials.rentValue || financials.rentValue <= 0) {
        alert('Por favor, informe o Valor do Aluguel mensal da Kitnet.');
        return;
      }
    }

    if (currentStep < 7) {
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

    const mockKitnet: Kitnet = {
      id: 'temp-kitnet',
      name: kitnetData.name || `Kitnet ${kitnetData.number || '01'}`,
      number: kitnetData.number || '01',
      address: kitnetData.address || '',
      description: kitnetData.description,
      status: kitnetData.status,
      monthlyRentBase: financials.rentValue,
      monthlyWaterBase: financials.waterValue,
      monthlyInternetBase: financials.internetValue,
      otherFeesBase: financials.otherFees,
      depositBase: financials.deposit,
      cleaningFeeBase: financials.cleaningFee,
      photos: kitnetData.photos,
    };

    const effectiveTenant: KitnetTenant =
      tenantMode === 'new'
        ? {
            id: 'temp-tenant',
            fullName: tenantData.fullName || 'Inquilino(a)',
            cpf: tenantData.cpf || '000.000.000-00',
            rg: tenantData.rg || '',
            birthDate: tenantData.birthDate,
            phone: tenantData.phone || '(00) 00000-0000',
            whatsapp: tenantData.whatsapp || tenantData.phone,
            email: tenantData.email || '',
            photoUrl: tenantData.photoUrl,
            address: kitnetData.address,
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
            phone: '(00) 00000-0000',
            email: '',
            address: kitnetData.address,
            maritalStatus: 'solteiro',
            incomeType: 'CLT',
            documents: {},
          };

    const mockContract: KitnetContract = {
      id: 'temp-contract',
      kitnetId: 'temp-kitnet',
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
      status: 'ativo',
      installments: [],
      notes: paymentConfig.notes,
    };

    return { kitnet: mockKitnet, contract: mockContract, tenant: effectiveTenant, settings };
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

  const handleFinalSubmit = (withContract = true) => {
    let finalTenantId = selectedTenantId;

    const newKitnetId = addKitnet({
      name: kitnetData.name,
      number: kitnetData.number,
      address: kitnetData.address,
      description: kitnetData.description,
      status: kitnetData.status,
      statusNote: kitnetData.statusNote?.trim() || undefined,
      monthlyRentBase: Number(financials.rentValue || kitnetData.monthlyRentBase),
      monthlyWaterBase: Number(financials.waterValue || kitnetData.monthlyWaterBase),
      monthlyInternetBase: Number(financials.internetValue || 0),
      otherFeesBase: Number(financials.otherFees || 0),
      depositBase: Number(financials.deposit || kitnetData.depositBase),
      cleaningFeeBase: Number(financials.cleaningFee !== undefined ? financials.cleaningFee : 400),
      photos: kitnetData.photos,
      documents: [],
    });

    if (kitnetData.status === 'alugada' && withContract) {
      if (tenantMode === 'new') {
        finalTenantId = addKitnetTenant({
          fullName: tenantData.fullName,
          cpf: tenantData.cpf,
          rg: tenantData.rg,
          birthDate: tenantData.birthDate,
          phone: tenantData.phone,
          whatsapp: tenantData.whatsapp || tenantData.phone,
          email: tenantData.email,
          photoUrl: tenantData.photoUrl,
          address: kitnetData.address,
          maritalStatus: tenantData.maritalStatus,
          profession: tenantData.profession,
          incomeType: incomeType,
          documents: {
            ...documentsFiles,
            ...(tenantData.photoUrl ? { photo: tenantData.photoUrl } : {}),
          },
        });
      }

      let createdContractId = '';
      if (finalTenantId) {
        const effectiveMonths =
          contractTerms.durationOption === 'custom'
            ? Number(contractTerms.customMonths) || 12
            : contractTerms.durationOption;

        createdContractId = createKitnetContract({
          kitnetId: newKitnetId,
          tenantId: finalTenantId,
          startDate: contractTerms.startDate,
          endDate: contractTerms.endDate,
          signatureDate: contractTerms.signatureDate,
          durationMonths: effectiveMonths,
          rentValue: Number(financials.rentValue),
          waterValue: Number(financials.waterValue),
          internetValue: Number(financials.internetValue || 0),
          otherFees: Number(financials.otherFees || 0),
          deposit: Number(financials.deposit),
          cleaningFee: Number(financials.cleaningFee !== undefined ? financials.cleaningFee : 400),
          dueDay: Number(paymentConfig.dueDay),
          paymentMethod: paymentConfig.paymentMethod,
          pixKey: paymentConfig.pixKey,
          status: 'ativo',
          notes: paymentConfig.notes,
          firstPaymentReceived: paymentConfig.firstPaymentReceived,
          firstPaymentPaidDate: paymentConfig.firstPaymentPaidDate,
          firstPaymentMethod: paymentConfig.firstPaymentMethod,
          firstPaymentNotes: paymentConfig.firstPaymentNotes,
        });

        try {
          const pdfRes = handleGenerateContract(false);
          if (pdfRes?.dataUri) {
            addDocument({
              title: `Contrato Locação Kitnet ${kitnetData.number} - ${tenantData.fullName || 'Inquilino'}`,
              category: 'kitnet',
              relatedId: newKitnetId,
              relatedName: `Kitnet ${kitnetData.number} (${kitnetData.name})`,
              fileUrl: pdfRes.dataUri,
              fileType: 'pdf',
              fileSize: '145 KB',
            });
          }
        } catch (err) {
          console.error('Erro ao anexar PDF de contrato:', err);
        }
      }

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      if (finalTenantId) {
        const createdKitnet: Kitnet = {
          id: newKitnetId,
          number: kitnetData.number || '01',
          name: kitnetData.name || `Kitnet ${kitnetData.number}`,
          address: kitnetData.address,
          description: kitnetData.description,
          status: 'alugada',
          monthlyRentBase: Number(financials.rentValue),
          monthlyWaterBase: Number(financials.waterValue),
          monthlyInternetBase: Number(financials.internetValue || 0),
          otherFeesBase: Number(financials.otherFees || 0),
          depositBase: Number(financials.deposit),
          photos: kitnetData.photos,
        };
        const createdTenant: KitnetTenant = {
          id: finalTenantId,
          fullName: tenantData.fullName,
          cpf: tenantData.cpf,
          rg: tenantData.rg,
          birthDate: tenantData.birthDate,
          phone: tenantData.phone,
          whatsapp: tenantData.whatsapp || tenantData.phone,
          email: tenantData.email,
          photoUrl: tenantData.photoUrl,
          address: kitnetData.address,
          maritalStatus: tenantData.maritalStatus,
          profession: tenantData.profession,
          incomeType: incomeType,
          documents: {},
        };
        const createdContract: KitnetContract = {
          id: createdContractId || `contract-kitnet-${Date.now()}`,
          kitnetId: newKitnetId,
          tenantId: finalTenantId,
          startDate: contractTerms.startDate,
          endDate: contractTerms.endDate,
          signatureDate: contractTerms.signatureDate,
          durationMonths:
            contractTerms.durationOption === 'custom'
              ? Number(contractTerms.customMonths) || 12
              : contractTerms.durationOption,
          rentValue: Number(financials.rentValue),
          waterValue: Number(financials.waterValue),
          internetValue: Number(financials.internetValue || 0),
          otherFees: Number(financials.otherFees || 0),
          deposit: Number(financials.deposit),
          dueDay: Number(paymentConfig.dueDay),
          paymentMethod: paymentConfig.paymentMethod,
          pixKey: paymentConfig.pixKey,
          status: 'ativo',
          installments: [],
        };
        onSuccess(newKitnetId, {
          kitnet: createdKitnet,
          tenant: createdTenant,
          contract: createdContract,
        });
      } else {
        onSuccess(newKitnetId);
      }
    } else {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      onSuccess(newKitnetId);
    }
    onClose();
  };

  return {
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
    setDocumentsFiles,
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
  };
}
