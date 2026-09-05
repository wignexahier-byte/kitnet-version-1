import { useState, useMemo, useEffect } from 'react';
import {
  generateContractPDF,
  generateReceiptPDF,
  generateDepositReceiptPDF,
  generateLatePaymentNoticePDF,
  generateTerminationAgreementPDF,
  generateKitnetContractPdfFile,
  generateMotoRentalContractPdfFile,
} from '../../utils/pdfGenerator';
import { generateDocumentHtml } from '../../utils/pdf/htmlTemplates';
import { formatCPF, formatPhone, getTodayLocalDateString } from '../../utils/formatters';
import {
  weeklyToMonthly,
  monthlyToWeekly,
  calculateContractTotalValue,
  getKitnetMonthlyTotal,
  calculateOverdueCharges,
  roundCurrency,
  safeAdd,
  safeMul,
} from '../../domain';
import {
  Moto,
  MotoContract,
  MotoTenant,
  Kitnet,
  KitnetContract,
  KitnetTenant,
  SystemSettings,
} from '../../types';
import { UnifiedClient } from './types';

interface UseDocumentGenerationProps {
  motos: Moto[];
  motoContracts: MotoContract[];
  motoTenants: MotoTenant[];
  kitnets: Kitnet[];
  kitnetContracts: KitnetContract[];
  kitnetTenants: KitnetTenant[];
  settings: SystemSettings;
}

export function useDocumentGeneration({
  motos,
  motoContracts,
  motoTenants,
  kitnets,
  kitnetContracts,
  kitnetTenants,
  settings,
}: UseDocumentGenerationProps) {
  const [docType, setDocType] = useState<string>('recibo_caucao');

  const isKitnetDoc = docType === 'contrato_kitnet' || docType === 'vistoria_kitnet';
  const isMotoDoc =
    docType === 'contrato_locacao_moto_completo' ||
    docType === 'contrato_moto' ||
    docType === 'termo_entrega_moto' ||
    docType === 'termo_quitacao';

  // Build unified list of all clients (both Kitnet and Moto tenants) with full real contract/asset properties
  const unifiedClients = useMemo<UnifiedClient[]>(() => {
    const list: UnifiedClient[] = [];

    // 1. Kitnet Tenants
    kitnetTenants.forEach((tenant) => {
      const contract =
        kitnetContracts.find((c) => c.tenantId === tenant.id && c.status === 'ativo') ||
        kitnetContracts.find((c) => c.tenantId === tenant.id) ||
        kitnetContracts[0];
      const kitnet = kitnets.find((k) => k.id === contract?.kitnetId) || kitnets[0];

      const deposit = contract?.deposit ?? kitnet?.depositBase ?? 0;
      const rentValue = contract?.rentValue ?? kitnet?.monthlyRentBase ?? 0;
      const waterValue = contract?.waterValue ?? kitnet?.monthlyWaterBase ?? 0;
      const internetValue = contract?.internetValue ?? kitnet?.monthlyInternetBase ?? 0;
      const otherFees = contract?.otherFees ?? kitnet?.otherFeesBase ?? 0;
      const totalRent = getKitnetMonthlyTotal({ rentValue, waterValue, internetValue, otherFees });
      const durationMonths = contract?.durationMonths ?? 12;

      const assetLabel = kitnet ? `${kitnet.name} (Nº ${kitnet.number})` : 'Kitnet Residencial';
      const assetDescription = kitnet
        ? `Kitnet Individual nº ${kitnet.number || '01'}, situada na ${kitnet.address || settings.adminAddress}`
        : `Kitnet Individual situada na ${settings.adminAddress}`;

      list.push({
        id: `kitnet_${tenant.id}`,
        type: 'kitnet',
        tenantId: tenant.id,
        fullName: tenant.fullName,
        cpf: tenant.cpf,
        rg: tenant.rg,
        phone: tenant.phone || tenant.whatsapp,
        address: tenant.address,
        assetLabel,
        assetDescription,
        deposit,
        rentOrMonthlyValue: totalRent,
        monthlyValue: totalRent,
        paymentFrequency: 'mensal',
        waterValue,
        durationMonths,
        contractId: contract?.id,
        contractStartDate: contract?.startDate,
        dueDay: contract?.dueDay || 10,
        model: kitnet?.name,
      });
    });

    // 2. Moto Tenants
    motoTenants.forEach((tenant) => {
      const contract =
        motoContracts.find((c) => c.tenantId === tenant.id && c.status === 'ativo') ||
        motoContracts.find((c) => c.tenantId === tenant.id) ||
        motoContracts[0];
      const moto = motos.find((m) => m.id === contract?.motoId) || motos[0];

      const paymentFrequency: 'mensal' | 'semanal' =
        contract?.paymentFrequency === 'semanal' || (Boolean(contract?.weeklyValue) && !contract?.monthlyValue)
          ? 'semanal'
          : 'mensal';

      const deposit = contract?.deposit !== undefined ? contract.deposit : 0;
      const monthlyValue =
        contract?.monthlyValue ?? (contract?.weeklyValue ? weeklyToMonthly(contract.weeklyValue) : 0);
      const weeklyValue =
        contract?.weeklyValue ?? (contract?.monthlyValue ? monthlyToWeekly(contract.monthlyValue) : 0);
      const rentOrMonthlyValue = paymentFrequency === 'semanal' ? weeklyValue : monthlyValue;
      const durationMonths = contract?.durationMonths ?? 0;
      const totalAgreedValue =
        contract?.totalAgreedValue ??
        (contract?.installments && contract.installments.length > 0
          ? calculateContractTotalValue(contract.installments)
          : (paymentFrequency === 'semanal' ? weeklyValue * (durationMonths * 4) : durationMonths * monthlyValue));
      const initialKm = moto?.delivery?.initialKm ?? moto?.currentKm ?? 0;

      const assetLabel = moto
        ? `${moto.brand} ${moto.model} (${moto.plate})`
        : 'Motocicleta';
      const assetDescription = moto
        ? `Motocicleta ${moto.brand} ${moto.model} (${moto.year}), Cor ${moto.color}, Placa ${moto.plate}, Renavam ${moto.renavam || 'N/A'}, Chassi ${moto.chassi || 'N/A'}`
        : 'Motocicleta com Opção de Compra';

      list.push({
        id: `moto_${tenant.id}`,
        type: 'moto',
        tenantId: tenant.id,
        fullName: tenant.fullName,
        cpf: tenant.cpf,
        rg: tenant.rg,
        phone: tenant.phone || tenant.whatsapp,
        address: tenant.address,
        assetLabel,
        assetDescription,
        deposit,
        rentOrMonthlyValue,
        monthlyValue,
        weeklyValue,
        paymentFrequency,
        insuranceDeductible: contract?.insuranceDeductible || '1.500,00',
        durationMonths,
        totalAgreedValue,
        initialKm,
        plate: moto?.plate,
        brand: moto?.brand,
        model: moto?.model,
        renavam: moto?.renavam,
        contractId: contract?.id,
        contractStartDate: contract?.startDate,
        dueDay: contract?.dueDay || 10,
        dueDayOfWeek: contract?.dueDayOfWeek,
      });
    });

    return list;
  }, [kitnetTenants, kitnetContracts, kitnets, motoTenants, motoContracts, motos, settings]);

  const kitnetTenantsList = useMemo(
    () => unifiedClients.filter((c) => c.type === 'kitnet'),
    [unifiedClients]
  );
  const motoTenantsList = useMemo(
    () => unifiedClients.filter((c) => c.type === 'moto'),
    [unifiedClients]
  );

  // Auto-selected client key
  const [selectedClientKey, setSelectedClientKey] = useState<string>(() => {
    return unifiedClients[0]?.id || '';
  });

  const [selectedMotoContractId, setSelectedMotoContractId] = useState<string>(
    motoContracts[0]?.id || ''
  );
  const [selectedKitnetContractId, setSelectedKitnetContractId] = useState<string>(
    kitnetContracts[0]?.id || ''
  );

  // Active client object
  const selectedClient = useMemo(() => {
    if (selectedClientKey) {
      const found = unifiedClients.find((c) => c.id === selectedClientKey);
      if (found) return found;
    }
    // Fallback based on document context
    if (isKitnetDoc && kitnetTenantsList.length > 0) return kitnetTenantsList[0];
    if (isMotoDoc && motoTenantsList.length > 0) return motoTenantsList[0];
    return unifiedClients[0];
  }, [unifiedClients, selectedClientKey, isKitnetDoc, isMotoDoc, kitnetTenantsList, motoTenantsList]);

  // Underlying contract & asset resolution
  const selectedMotoContract =
    motoContracts.find((c) => c.id === selectedMotoContractId) ||
    motoContracts.find((c) => c.tenantId === selectedClient?.tenantId) ||
    motoContracts[0];
  const moto =
    motos.find((m) => m.id === selectedMotoContract?.motoId) ||
    motos.find((m) => m.plate === selectedClient?.plate) ||
    motos[0];
  const motoTenant =
    motoTenants.find((t) => t.id === selectedMotoContract?.tenantId) ||
    motoTenants.find((t) => t.id === selectedClient?.tenantId) ||
    motoTenants[0];

  const selectedKitnetContract =
    kitnetContracts.find((c) => c.id === selectedKitnetContractId) ||
    kitnetContracts.find((c) => c.tenantId === selectedClient?.tenantId) ||
    kitnetContracts[0];
  const kitnet =
    kitnets.find((k) => k.id === selectedKitnetContract?.kitnetId) ||
    kitnets[0];
  const kitnetTenant =
    kitnetTenants.find((t) => t.id === selectedKitnetContract?.tenantId) ||
    kitnetTenants.find((t) => t.id === selectedClient?.tenantId) ||
    kitnetTenants[0];

  // Custom quick input fields for standalone generation or override
  const [customTenantName, setCustomTenantName] = useState<string>('');
  const [customTenantCpf, setCustomTenantCpf] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<number>(() => selectedClient?.deposit || 0);
  const [customDaysLate, setCustomDaysLate] = useState<number>(5);
  const [customRefundAmount, setCustomRefundAmount] = useState<number>(0);
  const [customCleaningFee, setCustomCleaningFee] = useState<number>(settings.cleaningFee ?? 0);
  const [customRepairs, setCustomRepairs] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isMonochrome, setIsMonochrome] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Specific state for full Moto Rental Contract & General Contracts
  const [customPaymentFrequency, setCustomPaymentFrequency] = useState<'mensal' | 'semanal'>(
    () => unifiedClients[0]?.paymentFrequency || 'mensal'
  );
  const [customMonthlyValue, setCustomMonthlyValue] = useState<number>(
    () => unifiedClients[0]?.monthlyValue || 0
  );
  const [customWeeklyValue, setCustomWeeklyValue] = useState<number>(
    () => unifiedClients[0]?.weeklyValue || 0
  );
  const [customDueDay, setCustomDueDay] = useState<number>(
    () => unifiedClients[0]?.dueDay || 10
  );
  const [customDueDayOfWeek, setCustomDueDayOfWeek] = useState<string>('Segunda-feira');
  const [customDueLimitTime, setCustomDueLimitTime] = useState<string>('18:00');
  const [customDeposit, setCustomDeposit] = useState<number>(() => selectedClient?.deposit || 0);
  const [customInsuranceDeductible, setCustomInsuranceDeductible] = useState<string>('1.500,00');
  const [customContractCity, setCustomContractCity] = useState<string>(
    settings.cityState || 'Barra Velha, Santa Catarina'
  );
  const [customInitialKm, setCustomInitialKm] = useState<number>(() => selectedClient?.initialKm || moto?.delivery?.initialKm || moto?.currentKm || 0);
  const [customTenantAddress, setCustomTenantAddress] = useState<string>('');
  const [customTenantPhone, setCustomTenantPhone] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState<string>(() => selectedClient?.contractStartDate || getTodayLocalDateString());

  // Dynamic Witness Configuration
  const [witnessesCount, setWitnessesCount] = useState<number>(2);
  const [witness1Name, setWitness1Name] = useState<string>('');
  const [witness1Cpf, setWitness1Cpf] = useState<string>('');
  const [witness2Name, setWitness2Name] = useState<string>('');
  const [witness2Cpf, setWitness2Cpf] = useState<string>('');

  // Helper function to auto-fill fields when a client is selected
  const handleSelectClient = (clientKey: string, targetDocType?: string) => {
    setSelectedClientKey(clientKey);
    const activeDoc = targetDocType || docType;

    if (!clientKey) {
      return;
    }

    const client = unifiedClients.find((c) => c.id === clientKey);
    if (!client) return;

    // Auto-fill Name & Formatted CPF
    setCustomTenantName(client.fullName);
    setCustomTenantCpf(formatCPF(client.cpf));

    if (client.address) {
      setCustomTenantAddress(client.address);
    }
    if (client.phone) {
      setCustomTenantPhone(formatPhone(client.phone));
    }

    // Auto-fill specific deposit & values from real client registry
    setCustomDeposit(client.deposit !== undefined ? client.deposit : 0);
    setCustomMonthlyValue(client.monthlyValue || 0);
    setCustomWeeklyValue(client.weeklyValue || (client.monthlyValue ? monthlyToWeekly(client.monthlyValue) : 0));
    setCustomDueDay(client.dueDay || 10);
    setCustomPaymentFrequency(client.paymentFrequency || 'mensal');

    if (client.insuranceDeductible) {
      setCustomInsuranceDeductible(client.insuranceDeductible);
    } else {
      setCustomInsuranceDeductible('0,00');
    }

    if (client.contractStartDate) {
      setCustomStartDate(client.contractStartDate);
    }

    // Auto-fill specific amounts according to document type
    if (activeDoc === 'recibo_caucao' || activeDoc === 'termo_rescisao') {
      setCustomAmount(client.deposit || 0);
    } else if (activeDoc === 'notificacao_cobranca' || activeDoc === 'recibo_parcela') {
      setCustomAmount(client.rentOrMonthlyValue || 0);
    } else if (activeDoc === 'contrato_kitnet' || activeDoc === 'contrato_moto') {
      setCustomAmount(client.monthlyValue || 0);
    } else if (activeDoc === 'contrato_locacao_moto_completo') {
      const isWeekly = client.paymentFrequency === 'semanal';
      setCustomAmount(isWeekly ? (client.weeklyValue || 0) : (client.monthlyValue || 0));
      if (client.dueDayOfWeek !== undefined) {
        const weekdays = [
          'Domingo',
          'Segunda-feira',
          'Terça-feira',
          'Quarta-feira',
          'Quinta-feira',
          'Sexta-feira',
          'Sábado',
        ];
        setCustomDueDayOfWeek(weekdays[client.dueDayOfWeek] || 'Segunda-feira');
      }
      setCustomInitialKm(client.initialKm || 0);
    } else if (activeDoc === 'termo_quitacao') {
      setCustomAmount(client.totalAgreedValue || 0);
    }

    // Auto-fill termination parameters
    if (activeDoc === 'termo_rescisao') {
      const relatedContract = client.contractId
        ? kitnetContracts.find((c) => c.id === client.contractId)
        : kitnetContracts.find((c) => c.tenantId === client.tenantId);
      const cleanFee =
        relatedContract?.cleaningFee !== undefined
          ? relatedContract.cleaningFee
          : (settings.cleaningFee ?? 0);
      setCustomCleaningFee(cleanFee);
      setCustomRepairs(0);
      setCustomRefundAmount(Math.max(0, (client.deposit || 0) - cleanFee));
    }

    // Auto-sync underlying contract dropdowns
    if (client.type === 'kitnet' && client.contractId) {
      setSelectedKitnetContractId(client.contractId);
    } else if (client.type === 'moto' && client.contractId) {
      setSelectedMotoContractId(client.contractId);
    }
  };

  // Sync initial client state on first load if not filled
  useEffect(() => {
    if (unifiedClients.length > 0 && !customTenantName) {
      const initialClient =
        (isKitnetDoc ? kitnetTenantsList[0] : isMotoDoc ? motoTenantsList[0] : unifiedClients[0]) ||
        unifiedClients[0];
      if (initialClient) {
        handleSelectClient(initialClient.id, docType);
      }
    }
  }, [unifiedClients, isKitnetDoc, isMotoDoc]);

  // When changing document type, intelligently switch client if type mismatch and update fields
  const handleSelectDocType = (newDocType: string) => {
    setDocType(newDocType);
    const newIsKitnet = newDocType === 'contrato_kitnet' || newDocType === 'vistoria_kitnet';
    const newIsMoto =
      newDocType === 'contrato_locacao_moto_completo' ||
      newDocType === 'contrato_moto' ||
      newDocType === 'termo_entrega_moto' ||
      newDocType === 'termo_quitacao';

    let targetKey = selectedClientKey;
    if (newIsKitnet && selectedClient?.type !== 'kitnet' && kitnetTenantsList.length > 0) {
      targetKey = kitnetTenantsList[0].id;
    } else if (newIsMoto && selectedClient?.type !== 'moto' && motoTenantsList.length > 0) {
      targetKey = motoTenantsList[0].id;
    }

    if (targetKey) {
      handleSelectClient(targetKey, newDocType);
    }
  };

  const activeTenantName =
    customTenantName ||
    selectedClient?.fullName ||
    (isKitnetDoc ? kitnetTenant?.fullName : motoTenant?.fullName) ||
    'Locatário';

  const activeTenantCpf =
    customTenantCpf ||
    (selectedClient?.cpf ? formatCPF(selectedClient.cpf) : '') ||
    (isKitnetDoc ? formatCPF(kitnetTenant?.cpf || '') : formatCPF(motoTenant?.cpf || '')) ||
    '000.000.000-00';

  const activeAssetLabel =
    selectedClient?.assetLabel ||
    (isKitnetDoc
      ? (kitnet ? `${kitnet.name} (Nº ${kitnet.number})` : 'Kitnet Residencial')
      : (moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Motocicleta'));

  const activeAssetDescription =
    selectedClient?.assetDescription ||
    (isKitnetDoc
      ? `Kitnet Individual nº ${kitnet?.number || '01'}, situada na ${kitnet?.address || settings.adminAddress}`
      : moto
      ? `Motocicleta ${moto.brand} ${moto.model} (${moto.year}), Placa ${moto.plate}, Renavam ${moto.renavam || 'N/A'}, Chassi ${moto.chassi || 'N/A'}`
      : `Kitnet Individual situada na ${settings.adminAddress}`);

  const activeTenantPhone =
    customTenantPhone ||
    (selectedClient?.phone ? formatPhone(selectedClient.phone) : '') ||
    (isKitnetDoc
      ? (kitnetTenant?.phone ? formatPhone(kitnetTenant.phone) : '')
      : (motoTenant?.phone ? formatPhone(motoTenant.phone) : ''));

  const activeTenantAddress =
    customTenantAddress ||
    selectedClient?.address ||
    (isKitnetDoc ? kitnetTenant?.address : motoTenant?.address) ||
    '';

  const activeDurationMonths =
    selectedClient?.durationMonths ||
    (isKitnetDoc ? selectedKitnetContract?.durationMonths : selectedMotoContract?.durationMonths) ||
    (isMotoDoc ? 36 : 12);

  const activeDepositAmount =
    customDeposit > 0
      ? customDeposit
      : selectedClient?.deposit ||
        (isKitnetDoc ? selectedKitnetContract?.deposit : selectedMotoContract?.deposit) ||
        0;

  const handleGenerate = () => {
    setIsGenerating(true);
    try {
      if (docType === 'recibo_caucao') {
        const depositVal =
          customAmount > 0
            ? customAmount
            : activeDepositAmount;

        generateDepositReceiptPDF({
          payerName: activeTenantName,
          payerCpf: activeTenantCpf,
          payerRg: selectedClient?.rg,
          amount: depositVal,
          assetDescription: activeAssetDescription,
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
          cityState: settings.cityState || 'Barra Velha, Santa Catarina',
          autoDownload: true,
        });
      } else if (docType === 'notificacao_cobranca') {
        const origVal =
          customAmount > 0
            ? customAmount
            : (selectedClient?.rentOrMonthlyValue || 0);
        const days = customDaysLate || 0;
        const charges = calculateOverdueCharges({
          principal: origVal,
          dueDate: getTodayLocalDateString(),
          referenceDate: getTodayLocalDateString(),
          fixedFinePercent: 0.02,
          interestMonthlyRate: 0.01,
          gracePeriodDays: 0,
        });
        const fine = days > 0 && origVal > 0 ? roundCurrency(origVal * 0.02) : charges.fineAmount;
        const dailyInterestRate = 0.01 / 30;
        const interest = days > 0 && origVal > 0 ? roundCurrency(safeMul(origVal, dailyInterestRate * days)) : charges.interestAmount;
        const total = safeAdd(safeAdd(origVal, fine), interest);

        generateLatePaymentNoticePDF({
          tenantName: activeTenantName,
          tenantCpf: activeTenantCpf,
          assetDescription: activeAssetDescription,
          dueDate: getTodayLocalDateString(),
          daysLate: days,
          originalAmount: origVal,
          fineAmount: fine,
          interestAmount: interest,
          totalAmount: total,
          pixKey: settings.adminPixKey || settings.adminEmail || '',
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
          cityState: settings.cityState || 'Barra Velha, Santa Catarina',
          autoDownload: true,
        });
      } else if (docType === 'termo_rescisao') {
        const origDep = customAmount > 0 ? customAmount : activeDepositAmount;
        const cleanFee = customCleaningFee;
        const repairs = customRepairs;
        const netRefund =
          customRefundAmount > 0
            ? customRefundAmount
            : Math.max(0, origDep - cleanFee - repairs);

        generateTerminationAgreementPDF({
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
          tenantName: activeTenantName,
          tenantCpf: activeTenantCpf,
          tenantRg: selectedClient?.rg,
          assetDescription: activeAssetDescription,
          contractStartDate: customStartDate || selectedClient?.contractStartDate || getTodayLocalDateString(),
          terminationDate: getTodayLocalDateString(),
          depositAmount: origDep,
          cleaningFeeDiscount: cleanFee,
          repairsDiscount: repairs,
          refundAmount: netRefund,
          cityState: settings.cityState || 'Barra Velha, Santa Catarina',
          autoDownload: true,
        });
      } else if (docType === 'contrato_kitnet') {
        const currKitnetContract =
          kitnetContracts.find((c) => c.id === selectedKitnetContractId) || selectedKitnetContract;
        const currKitnet =
          kitnets.find((k) => k.id === currKitnetContract?.kitnetId) || kitnet;
        const currTenant =
          kitnetTenants.find((t) => t.id === currKitnetContract?.tenantId) || kitnetTenant;

        const effectiveContract: KitnetContract = (currKitnetContract
          ? {
              ...currKitnetContract,
              deposit: activeDepositAmount,
              rentValue: customAmount > 0 ? customAmount : currKitnetContract.rentValue,
              startDate: customStartDate || currKitnetContract.startDate,
            }
          : {
              id: 'custom-contract',
              kitnetId: currKitnet?.id || 'kitnet-1',
              tenantId: currTenant?.id || 'tenant-1',
              startDate: customStartDate || getTodayLocalDateString(),
              durationMonths: activeDurationMonths || 12,
              rentValue: customAmount > 0 ? customAmount : (currKitnet?.monthlyRentBase || 0),
              waterValue: 0,
              deposit: activeDepositAmount,
              dueDay: 10,
              status: 'ativo',
              installments: [],
            }) as KitnetContract;

        const effectiveTenant: KitnetTenant = (currTenant
          ? {
              ...currTenant,
              fullName: activeTenantName,
              cpf: activeTenantCpf.replace(/\D/g, ''),
              address: activeTenantAddress || currTenant.address,
              phone: activeTenantPhone || currTenant.phone,
            }
          : {
              id: 'custom-t',
              fullName: activeTenantName,
              cpf: activeTenantCpf.replace(/\D/g, ''),
              rg: selectedClient?.rg || 'Não informado',
              birthDate: '1990-01-01',
              phone: activeTenantPhone || 'Não informado',
              whatsapp: activeTenantPhone || 'Não informado',
              email: 'locatario@email.com',
              address: activeTenantAddress || 'Não informado',
              maritalStatus: 'solteiro',
              incomeType: 'autonomo',
              documents: {},
            }) as KitnetTenant;

        generateKitnetContractPdfFile({
          kitnet: currKitnet,
          contract: effectiveContract,
          tenant: effectiveTenant,
          settings,
          witnessesCount,
          witness1Name,
          witness1Cpf,
          witness2Name,
          witness2Cpf,
          autoDownload: true,
        });
      } else if (docType === 'contrato_locacao_moto_completo') {
        const currMotoContract =
          motoContracts.find((c) => c.id === selectedMotoContractId) || selectedMotoContract;
        const currMoto = motos.find((m) => m.id === currMotoContract?.motoId) || moto;
        const currTenant =
          motoTenants.find((t) => t.id === currMotoContract?.tenantId) || motoTenant;

        const effectiveTenant: MotoTenant = (currTenant
          ? {
              ...currTenant,
              fullName: activeTenantName,
              cpf: activeTenantCpf.replace(/\D/g, ''),
              address: activeTenantAddress || currTenant.address,
              phone: activeTenantPhone || currTenant.phone,
            }
          : {
              id: 'custom-m-t',
              fullName: activeTenantName,
              cpf: activeTenantCpf.replace(/\D/g, ''),
              rg: selectedClient?.rg || 'Não informado',
              birthDate: '1990-01-01',
              email: 'locatario@email.com',
              company: 'Autônomo',
              income: 3000,
              approvalChecklist: {
                cnhValid: true,
                proofOfResidence: true,
                backgroundCheck: true,
                criminalRecordClear: true,
                securityDepositPaid: true,
              },
              documents: {
                cnhFrontUrl: '',
                cnhBackUrl: '',
                proofOfResidenceUrl: '',
              },
              phone: activeTenantPhone || 'Não informado',
              whatsapp: activeTenantPhone || 'Não informado',
              address: activeTenantAddress || 'Não informado',
              profession: 'Entregador Autônomo',
              cnh: {
                number: '00000000000',
                category: 'A',
                expirationDate: '2030-01-01',
              },
            }) as MotoTenant;

        generateMotoRentalContractPdfFile({
          moto: currMoto,
          contract: currMotoContract,
          tenant: effectiveTenant,
          settings,
          paymentFrequency: customPaymentFrequency,
          monthlyValue: customMonthlyValue,
          weeklyValue: customWeeklyValue,
          dueDay: customDueDay,
          dueDayOfWeek: customDueDayOfWeek,
          dueLimitTime: customDueLimitTime,
          deposit: activeDepositAmount,
          insuranceDeductible: customInsuranceDeductible,
          contractCity: customContractCity,
          initialKm: customInitialKm,
          startDate: customStartDate,
          witnessesCount,
          witness1Name,
          witness1Cpf,
          witness2Name,
          witness2Cpf,
          autoDownload: true,
        });
      } else if (docType === 'contrato_moto') {
        const currMotoContract =
          motoContracts.find((c) => c.id === selectedMotoContractId) || selectedMotoContract;
        const currMoto = motos.find((m) => m.id === currMotoContract?.motoId) || moto;
        const currTenant =
          motoTenants.find((t) => t.id === currMotoContract?.tenantId) || motoTenant;

        generateContractPDF({
          title: 'CONTRATO DE LOCAÇÃO DE MOTOCICLETA COM INTENÇÃO DE COMPRA',
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
          ownerAddress: settings.adminAddress,
          tenantName: activeTenantName,
          tenantCpf: activeTenantCpf,
          tenantRg: selectedClient?.rg || currTenant?.rg,
          tenantAddress: activeTenantAddress || selectedClient?.address || currTenant?.address,
          assetDescription: activeAssetDescription,
          valueMonthly: customAmount > 0 ? customAmount : (currMotoContract?.monthlyValue || 0),
          deposit: activeDepositAmount,
          durationMonths: currMotoContract?.durationMonths || 36,
          dueDay: currMotoContract?.dueDay || 10,
          startDate:
            customStartDate ||
            selectedClient?.contractStartDate ||
            currMotoContract?.startDate ||
            getTodayLocalDateString(),
          extraTerms: [
            'O LOCATÁRIO declara receber a motocicleta em perfeito estado de conservação e funcionamento.',
            'As manutenções preventivas, trocas periódicas de óleo e cuidados com o veículo são de responsabilidade do LOCATÁRIO.',
            'Ao término e quitação integral de todas as parcelas avençadas, o LOCADOR providenciará a imediata transferência de propriedade do veículo junto ao DETRAN.',
            'Em caso de atraso superior a 15 (quinze) dias no pagamento, o LOCADOR reserva-se o direito de rescisão contratual e recolhimento do veículo.',
          ],
        });
      } else if (docType === 'recibo_parcela') {
        generateReceiptPDF({
          title: 'RECIBO DE PAGAMENTO DE PARCELA',
          payerName: activeTenantName,
          payerCpf: activeTenantCpf,
          amount: customAmount > 0 ? customAmount : (selectedClient?.monthlyValue || 0),
          description: `Pagamento de parcela referente à locação do ativo: ${activeAssetDescription}`,
          date: getTodayLocalDateString(),
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
        });
      } else if (docType === 'termo_quitacao') {
        const currMotoContract =
          motoContracts.find((c) => c.id === selectedMotoContractId) || selectedMotoContract;

        generateReceiptPDF({
          title: 'TERMO DE QUITAÇÃO INTEGRAL E AUTORIZAÇÃO DE TRANSFERÊNCIA',
          payerName: activeTenantName,
          payerCpf: activeTenantCpf,
          amount:
            customAmount > 0
              ? customAmount
              : selectedClient?.totalAgreedValue ||
                currMotoContract?.totalAgreedValue ||
                (currMotoContract?.installments ? calculateContractTotalValue(currMotoContract.installments) : 0),
          description: `Declaramos que todas as parcelas acordadas foram integralmente QUITADAS. Fica autorizada a transferência da posse e propriedade do veículo: ${activeAssetDescription}.`,
          date: getTodayLocalDateString(),
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
        });
      } else if (docType === 'termo_entrega_moto') {
        const currMotoContract =
          motoContracts.find((c) => c.id === selectedMotoContractId) || selectedMotoContract;
        const currMoto = motos.find((m) => m.id === currMotoContract?.motoId) || moto;
        const currTenant =
          motoTenants.find((t) => t.id === currMotoContract?.tenantId) || motoTenant;

        generateContractPDF({
          title: 'TERMO DE VISTORIA E ENTREGA DA MOTOCICLETA',
          ownerName: settings.adminName,
          ownerCpf: settings.adminCpf,
          ownerAddress: settings.adminAddress,
          tenantName: activeTenantName,
          tenantCpf: activeTenantCpf,
          tenantRg: selectedClient?.rg || currTenant?.rg,
          tenantAddress: activeTenantAddress || selectedClient?.address || currTenant?.address,
          assetDescription: currMoto
            ? `Veículo ${currMoto.brand} ${currMoto.model} (${currMoto.year}), Placa ${currMoto.plate}, KM Inicial: ${customInitialKm || currMoto.delivery?.initialKm || currMoto.currentKm} km`
            : activeAssetDescription,
          valueMonthly: customAmount > 0 ? customAmount : (currMotoContract?.monthlyValue || 0),
          deposit: activeDepositAmount,
          durationMonths: currMotoContract?.durationMonths || 36,
          dueDay: currMotoContract?.dueDay || 10,
          startDate: customStartDate || getTodayLocalDateString(),
          extraTerms: [
            'O LOCATÁRIO declara ter inspecionado o veículo, testado faróis, freios, pneus e recebido o documento de rodagem e chaves.',
            'Todas as eventuais avarias pré-existentes foram registradas na entrega.',
          ],
        });
      }
    } finally {
      setTimeout(() => setIsGenerating(false), 900);
    }
  };

  // Compile full document HTML for preview & print
  const getPreviewHtml = (): string => {
    let docTypeMapped: any = 'contrato_locacao_moto_completo';
    let docTitle = 'DOCUMENTO OFICIAL';

    if (docType === 'contrato_locacao_moto_completo') {
      docTypeMapped = 'contrato_locacao_moto_completo';
      docTitle = 'CONTRATO DE LOCAÇÃO DE MOTOCICLETA (MODELO OFICIAL COMPLETO)';
    } else if (docType === 'contrato_moto') {
      docTypeMapped = 'contrato_moto';
      docTitle = 'CONTRATO DE LOCAÇÃO DE MOTO C/ PROMESSA DE COMPRA';
    } else if (docType === 'contrato_kitnet') {
      docTypeMapped = 'contrato_kitnet';
      docTitle = 'CONTRATO DE LOCAÇÃO RESIDENCIAL DE KITNET';
    } else if (docType === 'recibo_caucao') {
      docTypeMapped = 'recibo_caucao';
      docTitle = 'RECIBO DE DEPÓSITO DE CAUÇÃO LOCATÍCIA';
    } else if (docType === 'recibo_parcela') {
      docTypeMapped = 'recibo_pagamento';
      docTitle = 'RECIBO DE PAGAMENTO DE PARCELA';
    } else if (docType === 'notificacao_cobranca') {
      docTypeMapped = 'notificacao_cobranca';
      docTitle = 'NOTIFICAÇÃO EXTRAJUDICIAL DE COBRANÇA E VENCIMENTO';
    } else if (docType === 'termo_rescisao') {
      docTypeMapped = 'termo_rescisao';
      docTitle = 'TERMO DE RESCISÃO CONTRATUAL E DISTRATO';
    } else if (docType === 'termo_quitacao') {
      docTypeMapped = 'termo_quitacao';
      docTitle = 'TERMO DE QUITAÇÃO INTEGRAL E TRANSFERÊNCIA';
    } else if (docType === 'termo_entrega_moto') {
      docTypeMapped = 'termo_entrega_moto';
      docTitle = 'TERMO DE ENTREGA & VISTORIA DA MOTOCICLETA';
    } else if (docType === 'vistoria_kitnet') {
      docTypeMapped = 'termo_vistoria_kitnet';
      docTitle = 'LAUDO DE VISTORIA RESIDENCIAL DE ENTRADA';
    } else {
      docTypeMapped = 'contrato_locacao_moto_completo';
      docTitle = 'INSTRUMENTO PARTICULAR DE LOCAÇÃO';
    }

    const isTargetKitnet =
      docType === 'contrato_kitnet' ||
      docType === 'vistoria_kitnet' ||
      (selectedClient?.type === 'kitnet' &&
        docType !== 'contrato_locacao_moto_completo' &&
        docType !== 'contrato_moto' &&
        docType !== 'termo_entrega_moto' &&
        docType !== 'termo_quitacao');

    const isTargetMoto = !isTargetKitnet;

    const currMotoContract =
      isTargetMoto
        ? motoContracts.find((c) => c.id === selectedMotoContractId) ||
          motoContracts.find((c) => c.tenantId === selectedClient?.tenantId) ||
          selectedMotoContract
        : undefined;
    const currMoto = isTargetMoto
      ? (currMotoContract ? motos.find((m) => m.id === currMotoContract.motoId) : undefined) ||
        (selectedClient?.plate ? motos.find((m) => m.plate === selectedClient.plate) : undefined) ||
        moto
      : undefined;
    const currMotoTenant = isTargetMoto
      ? (currMotoContract ? motoTenants.find((t) => t.id === currMotoContract.tenantId) : undefined) ||
        motoTenants.find((t) => t.id === selectedClient?.tenantId) ||
        motoTenant
      : undefined;

    const currKitnetContract =
      isTargetKitnet
        ? kitnetContracts.find((c) => c.id === selectedKitnetContractId) ||
          kitnetContracts.find((c) => c.tenantId === selectedClient?.tenantId) ||
          selectedKitnetContract
        : undefined;
    const currKitnet = isTargetKitnet
      ? (currKitnetContract ? kitnets.find((k) => k.id === currKitnetContract.kitnetId) : undefined) ||
        kitnets.find((k) => k.name === selectedClient?.model) ||
        kitnet
      : undefined;
    const currKitnetTenant = isTargetKitnet
      ? (currKitnetContract ? kitnetTenants.find((t) => t.id === currKitnetContract.tenantId) : undefined) ||
        kitnetTenants.find((t) => t.id === selectedClient?.tenantId) ||
        kitnetTenant
      : undefined;

    return generateDocumentHtml({
      type: docTypeMapped,
      title: docTitle,
      clientType: isTargetKitnet ? 'kitnet' : 'moto',
      assetLabel: activeAssetLabel,
      assetDescription: activeAssetDescription,
      durationMonths: activeDurationMonths,
      moto: currMoto,
      motoContract: currMotoContract,
      motoTenant: currMotoTenant
        ? {
            ...currMotoTenant,
            fullName: activeTenantName,
            cpf: activeTenantCpf.replace(/\D/g, ''),
            address: activeTenantAddress || currMotoTenant.address,
            phone: activeTenantPhone || currMotoTenant.phone,
            whatsapp: activeTenantPhone || currMotoTenant.whatsapp,
          }
        : undefined,
      kitnet: currKitnet,
      kitnetContract: currKitnetContract,
      kitnetTenant: currKitnetTenant
        ? {
            ...currKitnetTenant,
            fullName: activeTenantName,
            cpf: activeTenantCpf.replace(/\D/g, ''),
            address: activeTenantAddress || currKitnetTenant.address,
            phone: activeTenantPhone || currKitnetTenant.phone,
            whatsapp: activeTenantPhone || currKitnetTenant.whatsapp,
          }
        : undefined,
      settings,
      isMonochrome,
      customAmount,
      customPaymentFrequency,
      customMonthlyValue,
      customWeeklyValue,
      customDueDay,
      customDueDayOfWeek,
      customDueLimitTime,
      customDeposit: activeDepositAmount,
      customInsuranceDeductible,
      customContractCity,
      customInitialKm,
      customTenantName: activeTenantName,
      customTenantCpf: activeTenantCpf,
      customTenantAddress: activeTenantAddress,
      customTenantPhone: activeTenantPhone,
      customStartDate,
      customCleaningFee,
      customRepairs,
      customRefundAmount,
      witnessesCount,
      witness1Name,
      witness1Cpf,
      witness2Name,
      witness2Cpf,
    });
  };

  const handlePrintDocument = () => {
    const html = getPreviewHtml();
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Por favor, permita popups para imprimir o documento.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>${docType}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; background: #ffffff !important; }
              @page { size: A4; margin: 12mm; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return {
    docType,
    setDocType,
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
    customTenantPhone,
    setCustomTenantPhone,
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
    kitnetTenantsList,
    motoTenantsList,
    selectedClient,
    isKitnetDoc,
    isMotoDoc,
    handleSelectClient,
    handleSelectDocType,
    activeTenantName,
    activeTenantCpf,
    activeAssetLabel,
    activeAssetDescription,
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
  };
}
