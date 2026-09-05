import React, { useState } from 'react';
import { Moto, MotoContract, MotoTenant, MotoStatus } from '../../../types';
import { validateLicensePlate, getTodayLocalDateString, formatCurrency } from '../../../utils/formatters';
import { compressImage } from '../../../utils/imageUtils';

export const formatFullAddress = (formData: any) => {
  const parts: string[] = [];
  if (formData.tenantStreet) {
    let street = formData.tenantStreet.trim();
    if (formData.tenantNumber) street += `, ${formData.tenantNumber.trim()}`;
    if (formData.tenantComplement) street += ` (${formData.tenantComplement.trim()})`;
    parts.push(street);
  }
  if (formData.tenantNeighborhood) parts.push(formData.tenantNeighborhood.trim());
  if (formData.tenantCity || formData.tenantState) {
    parts.push(
      `${formData.tenantCity?.trim() || ''}${
        formData.tenantState ? `/${formData.tenantState.trim().toUpperCase()}` : ''
      }`
    );
  }
  if (formData.tenantCep) parts.push(`CEP: ${formData.tenantCep.trim()}`);
  return parts.length > 0 ? parts.join(' - ') : formData.tenantAddress || 'Endereço não informado';
};

interface UseMotoCreationProps {
  selectedMoto: Moto | undefined;
  motoContracts: MotoContract[];
  motoTenants: MotoTenant[];
  addMoto: (moto: Omit<Moto, 'id' | 'kmLogs' | 'maintenances'>) => string;
  updateMoto: (id: string, updates: Partial<Moto>) => void;
  addMotoTenant: (tenant: Omit<MotoTenant, 'id'>) => string;
  updateMotoTenant: (id: string, updates: Partial<MotoTenant>) => void;
  createMotoContract: (contract: Omit<MotoContract, 'id' | 'installments'>) => string;
  updateMotoContract?: (id: string, updates: Partial<MotoContract>) => void;
  setSelectedMotoId: (id: string) => void;
  setShowNewMotoModal: (open: boolean) => void;
  setShowNewContractModal: (open: boolean) => void;
  setNewContractSuccessData: (data: { moto: Moto; tenant: MotoTenant; contract: MotoContract } | null) => void;
}

export function useMotoCreation({
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
  setShowNewMotoModal,
  setShowNewContractModal,
  setNewContractSuccessData,
}: UseMotoCreationProps) {
  const [motoToEdit, setMotoToEdit] = useState<Moto | null>(null);
  const [motoToTerminate, setMotoToTerminate] = useState<{
    contract: MotoContract;
    moto: Moto;
  } | null>(null);

  // Form states - Unified Moto + Client + Financial Registration
  const [newMotoForm, setNewMotoForm] = useState({
    brand: '',
    model: '',
    year: '' as unknown as number,
    color: '',
    plate: '',
    renavam: '',
    chassi: '',
    status: 'disponivel' as MotoStatus,
    statusNote: 'Revisada e pronta para locação',
    purchaseDate: '',
    purchasePrice: 0,
    currentKm: 0,
    frontPhoto: '',
    rearPhoto: '',
    rightSidePhoto: '',
    leftSidePhoto: '',
    dashboardPhoto: '',
    tenantName: '',
    tenantCpf: '',
    tenantRg: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantCep: '',
    tenantStreet: '',
    tenantNumber: '',
    tenantNeighborhood: '',
    tenantCity: '',
    tenantState: '',
    tenantComplement: '',
    tenantProfession: '',
    tenantPhoto: '',
    cnhCategory: 'A',
    cnhNumber: '',
    cnhExpiration: '',
    durationMonths: 36 as 24 | 36,
    paymentFrequency: 'mensal' as 'mensal' | 'semanal',
    startDate: getTodayLocalDateString(),
    dueDay: 10,
    dueDayOfWeek: 1,
    monthlyValue: 0,
    weeklyValue: 0,
    totalAgreedValue: 0,
    deposit: 0,
    depositStatus: 'retida' as 'retida' | 'devolvida' | 'a_definir',
    insuranceDeductible: '' as number | string,
    firstPaymentReceived: false,
    firstPaymentPaidDate: getTodayLocalDateString(),
    firstPaymentMethod: 'PIX Instantâneo',
    firstPaymentNotes: '',
    incomeType: 'app',
    companyOrActivity: '',
    monthlyIncome: 0,
    documents: {} as Record<string, string>,
    pixKey: '',
    notes: '',
    signatureDate: getTodayLocalDateString(),
    endDate: '',
    selectedTenantId: '',
    tenantBirthDate: '',
    tenantMaritalStatus: 'solteiro',
  });

  const [standaloneContractForm, setStandaloneContractForm] = useState({
    tenantName: '',
    tenantCpf: '',
    tenantRg: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantCep: '',
    tenantStreet: '',
    tenantNumber: '',
    tenantNeighborhood: '',
    tenantCity: '',
    tenantState: '',
    tenantComplement: '',
    tenantProfession: '',
    tenantPhoto: '',
    cnhCategory: 'A',
    cnhNumber: '',
    cnhExpiration: '',
    durationMonths: 36 as number,
    paymentFrequency: 'mensal' as 'mensal' | 'semanal',
    startDate: getTodayLocalDateString(),
    dueDay: 10,
    dueDayOfWeek: 1,
    monthlyValue: 0,
    weeklyValue: 0,
    totalAgreedValue: 0,
    deposit: 0,
    depositStatus: 'retida' as 'retida' | 'devolvida' | 'a_definir',
    insuranceDeductible: '' as number | string,
    firstPaymentReceived: false,
    firstPaymentPaidDate: getTodayLocalDateString(),
    firstPaymentMethod: 'PIX Instantâneo',
    firstPaymentNotes: '',
    incomeType: 'app',
    companyOrActivity: '',
    monthlyIncome: 0,
    documents: {} as Record<string, string>,
    pixKey: '',
    notes: '',
    signatureDate: getTodayLocalDateString(),
    endDate: '',
    selectedTenantId: '',
    tenantBirthDate: '',
    tenantMaritalStatus: 'solteiro',
  });

  const [editMotoForm, setEditMotoForm] = useState({
    brand: '',
    model: '',
    year: '' as unknown as number,
    color: '',
    plate: '',
    renavam: '',
    chassi: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentKm: 0,
    status: 'disponivel' as MotoStatus,
    statusNote: '',
    frontPhoto: '',
    rearPhoto: '',
    rightSidePhoto: '',
    leftSidePhoto: '',
    dashboardPhoto: '',
    tenantName: '',
    tenantCpf: '',
    tenantRg: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantCep: '',
    tenantStreet: '',
    tenantNumber: '',
    tenantNeighborhood: '',
    tenantCity: '',
    tenantState: '',
    tenantComplement: '',
    tenantProfession: '',
    tenantPhoto: '',
    cnhCategory: 'A',
    cnhNumber: '',
    cnhExpiration: '',
    durationMonths: 36 as 24 | 36,
    paymentFrequency: 'mensal' as 'mensal' | 'semanal',
    startDate: getTodayLocalDateString(),
    dueDay: 10,
    dueDayOfWeek: 1,
    monthlyValue: 0,
    weeklyValue: 0,
    totalAgreedValue: 0,
    deposit: 0,
    depositStatus: 'retida' as 'retida' | 'devolvida' | 'a_definir',
    insuranceDeductible: '' as number | string,
  });

  const [terminateMotoForm, setTerminateMotoForm] = useState({
    finalKm: 0,
    notes: 'Devolução de moto efetuada e conferida.',
  });

  const handleNewMotoTenantPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.82);
      setNewMotoForm((prev) => ({ ...prev, tenantPhoto: compressed }));
    } catch (err) {
      console.error('Erro ao comprimir foto:', err);
    }
  };

  const handleEditMotoTenantPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.82);
      setEditMotoForm((prev) => ({ ...prev, tenantPhoto: compressed }));
    } catch (err) {
      console.error('Erro ao comprimir foto:', err);
    }
  };

  const handleStandaloneTenantPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.82);
      setStandaloneContractForm((prev) => ({ ...prev, tenantPhoto: compressed }));
    } catch (err) {
      console.error('Erro ao comprimir foto:', err);
    }
  };

  const handleCreateMotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotoForm.model.trim() || !newMotoForm.plate.trim()) {
      alert('Por favor, preencha o Modelo e a Placa da moto.');
      return;
    }

    const plateValidation = validateLicensePlate(newMotoForm.plate);
    if (!plateValidation.isValid) {
      alert(
        `Placa inválida! ${plateValidation.error || 'A placa deve seguir o padrão brasileiro (ex: ABC-1234 ou Mercosul BRA-2E19).'}`
      );
      return;
    }

    let finalStatus: MotoStatus = newMotoForm.status || 'disponivel';
    const hasTenantData = !!newMotoForm.tenantName && !!newMotoForm.tenantName.trim();

    if (hasTenantData && newMotoForm.status === 'disponivel') {
      finalStatus = 'alugada';
    }

    if (finalStatus === 'alugada' || hasTenantData) {
      const installmentValue =
        newMotoForm.paymentFrequency === 'semanal'
          ? newMotoForm.weeklyValue
          : newMotoForm.monthlyValue;
      if (!installmentValue || installmentValue <= 0) {
        alert('Por favor, informe o valor da parcela.');
        return;
      }
    }

    const newMotoId = addMoto({
      brand: newMotoForm.brand,
      model: newMotoForm.model.trim(),
      year: Number(newMotoForm.year) || new Date().getFullYear(),
      color: newMotoForm.color.trim() || 'Preta',
      plate: plateValidation.formatted,
      renavam: newMotoForm.renavam.trim(),
      chassi: newMotoForm.chassi.toUpperCase().trim(),
      purchaseDate: newMotoForm.purchaseDate,
      purchasePrice: newMotoForm.purchasePrice || 0,
      currentKm: newMotoForm.currentKm || 0,
      status: finalStatus,
      statusNote: newMotoForm.statusNote?.trim() || undefined,
      insuranceDeductible:
        typeof newMotoForm.insuranceDeductible === 'number' && newMotoForm.insuranceDeductible > 0
          ? formatCurrency(newMotoForm.insuranceDeductible).replace('R$', '').trim()
          : newMotoForm.insuranceDeductible || '',
      documents: {},
      photos: {
        front: newMotoForm.frontPhoto || undefined,
        rear: newMotoForm.rearPhoto || undefined,
        right: newMotoForm.rightSidePhoto || undefined,
        left: newMotoForm.leftSidePhoto || undefined,
        dashboard: newMotoForm.dashboardPhoto || undefined,
        damages: [],
      },
    });

    if (hasTenantData) {
      let tenantIdToUse = newMotoForm.selectedTenantId;
      let tenantToUse = motoTenants.find((t) => t.id === tenantIdToUse);

      if (!tenantIdToUse || !tenantToUse) {
        const formattedAddress = formatFullAddress(newMotoForm);
        const newTenant = {
          fullName: newMotoForm.tenantName.trim(),
          cpf: newMotoForm.tenantCpf.replace(/\D/g, '') || '00000000000',
          rg: newMotoForm.tenantRg.trim() || '',
          birthDate: newMotoForm.tenantBirthDate || '',
          phone: newMotoForm.tenantPhone.replace(/\D/g, '') || '11999999999',
          whatsapp: newMotoForm.tenantPhone.replace(/\D/g, '') || '11999999999',
          email: newMotoForm.tenantEmail.trim() || '',
          photoUrl: newMotoForm.tenantPhoto,
          address: formattedAddress,
          profession: newMotoForm.tenantProfession.trim() || 'Motorista / Entregador',
          company: newMotoForm.companyOrActivity || 'Autônomo',
          income:
            Number(newMotoForm.monthlyIncome) ||
            (newMotoForm.paymentFrequency === 'semanal'
              ? newMotoForm.weeklyValue * 4
              : newMotoForm.monthlyValue) * 3.5,
          cnh: {
            number: newMotoForm.cnhNumber || '12345678900',
            category: newMotoForm.cnhCategory || 'A',
            expirationDate:
              newMotoForm.cnhExpiration ||
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
          },
          documents: {
            ...(newMotoForm.tenantPhoto ? { photo: newMotoForm.tenantPhoto } : {}),
            ...(newMotoForm.documents || {}),
          },
          approvalChecklist: {
            cnhValid: true,
            docsChecked: true,
            addressValidated: true,
            incomeAnalyzed: true,
            depositReceived: true,
            contractSigned: true,
            result: 'aprovado' as const,
          },
        };

        tenantIdToUse = addMotoTenant(newTenant);
        tenantToUse = { ...newTenant, id: tenantIdToUse };
      }

      const newContract = {
        motoId: newMotoId,
        tenantId: tenantIdToUse,
        durationMonths: newMotoForm.durationMonths,
        paymentFrequency: newMotoForm.paymentFrequency,
        startDate: newMotoForm.startDate,
        dueDay: newMotoForm.dueDay,
        dueDayOfWeek: newMotoForm.dueDayOfWeek,
        monthlyValue: newMotoForm.monthlyValue,
        weeklyValue: newMotoForm.weeklyValue,
        deposit: newMotoForm.deposit,
        insuranceDeductible:
          typeof newMotoForm.insuranceDeductible === 'number' && newMotoForm.insuranceDeductible > 0
            ? formatCurrency(newMotoForm.insuranceDeductible).replace('R$', '').trim()
            : String(newMotoForm.insuranceDeductible || ''),
        totalAgreedValue: newMotoForm.totalAgreedValue,
        depositStatus: newMotoForm.depositStatus,
        status: 'ativo' as const,
        firstPaymentReceived: Boolean(newMotoForm.firstPaymentReceived),
        firstPaymentPaidDate: newMotoForm.firstPaymentPaidDate,
        firstPaymentMethod: newMotoForm.firstPaymentMethod,
        firstPaymentNotes: newMotoForm.firstPaymentNotes,
      };

      const createdContractId = createMotoContract(newContract);

      setNewContractSuccessData({
        moto: {
          id: newMotoId,
          brand: newMotoForm.brand,
          model: newMotoForm.model.trim(),
          year: newMotoForm.year,
          color: newMotoForm.color.trim(),
          plate: plateValidation.formatted,
          renavam: newMotoForm.renavam.trim(),
          chassi: newMotoForm.chassi.toUpperCase().trim(),
          purchaseDate: newMotoForm.purchaseDate,
          purchasePrice: newMotoForm.purchasePrice,
          currentKm: newMotoForm.currentKm,
          status: finalStatus,
          kmLogs: [],
          maintenances: [],
          documents: {},
          photos: {
            front: newMotoForm.frontPhoto || undefined,
            rear: newMotoForm.rearPhoto || undefined,
            right: newMotoForm.rightSidePhoto || undefined,
            left: newMotoForm.leftSidePhoto || undefined,
            dashboard: newMotoForm.dashboardPhoto || undefined,
            damages: [],
          },
        },
        tenant: tenantToUse,
        contract: {
          ...newContract,
          id: createdContractId,
          installments: [],
        },
      });
    }

    setSelectedMotoId(newMotoId);
    setShowNewMotoModal(false);
  };

  const handleCreateStandaloneContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoto) return;
    if (!standaloneContractForm.tenantName.trim()) {
      alert('Preencha o nome do locatário.');
      return;
    }

    const installmentValue =
      standaloneContractForm.paymentFrequency === 'semanal'
        ? standaloneContractForm.weeklyValue
        : standaloneContractForm.monthlyValue;
    if (!installmentValue || installmentValue <= 0) {
      alert('Por favor, informe o valor da parcela.');
      return;
    }

    let tenantIdToUse = standaloneContractForm.selectedTenantId;
    let tenantToUse = motoTenants.find((t) => t.id === tenantIdToUse);

    if (!tenantIdToUse || !tenantToUse) {
      const formattedAddress = formatFullAddress(standaloneContractForm);

      const newTenant = {
        fullName: standaloneContractForm.tenantName.trim(),
        cpf: standaloneContractForm.tenantCpf.replace(/\D/g, '') || '00000000000',
        rg: standaloneContractForm.tenantRg.trim() || '',
        birthDate: standaloneContractForm.tenantBirthDate || '',
        phone: standaloneContractForm.tenantPhone.replace(/\D/g, '') || '11999999999',
        whatsapp: standaloneContractForm.tenantPhone.replace(/\D/g, '') || '11999999999',
        email: standaloneContractForm.tenantEmail.trim() || '',
        photoUrl: standaloneContractForm.tenantPhoto,
        address: formattedAddress,
        profession: standaloneContractForm.tenantProfession.trim() || 'Motorista / Entregador',
        company: standaloneContractForm.companyOrActivity || 'Autônomo',
        income:
          Number(standaloneContractForm.monthlyIncome) ||
          (standaloneContractForm.paymentFrequency === 'semanal'
            ? standaloneContractForm.weeklyValue * 4
            : standaloneContractForm.monthlyValue) * 3.5,
        cnh: {
          number: standaloneContractForm.cnhNumber || '12345678900',
          category: standaloneContractForm.cnhCategory,
          expirationDate: standaloneContractForm.cnhExpiration,
        },
        documents: {
          ...(standaloneContractForm.tenantPhoto ? { photo: standaloneContractForm.tenantPhoto } : {}),
          ...(standaloneContractForm.documents || {}),
        },
        approvalChecklist: {
          cnhValid: true,
          docsChecked: true,
          addressValidated: true,
          incomeAnalyzed: true,
          depositReceived: true,
          contractSigned: true,
          result: 'aprovado' as const,
        },
      };

      tenantIdToUse = addMotoTenant(newTenant);
      tenantToUse = { ...newTenant, id: tenantIdToUse };
    }

    const newContract = {
      motoId: selectedMoto.id,
      tenantId: tenantIdToUse,
      durationMonths: (standaloneContractForm.durationMonths as 24 | 36) || 24,
      paymentFrequency: standaloneContractForm.paymentFrequency,
      startDate: standaloneContractForm.startDate,
      dueDay: standaloneContractForm.dueDay,
      dueDayOfWeek: standaloneContractForm.dueDayOfWeek,
      monthlyValue: standaloneContractForm.monthlyValue,
      weeklyValue: standaloneContractForm.weeklyValue,
      deposit: standaloneContractForm.deposit,
      insuranceDeductible:
        typeof standaloneContractForm.insuranceDeductible === 'number' && standaloneContractForm.insuranceDeductible > 0
          ? formatCurrency(standaloneContractForm.insuranceDeductible).replace('R$', '').trim()
          : String(standaloneContractForm.insuranceDeductible || ''),
      totalAgreedValue: standaloneContractForm.totalAgreedValue,
      depositStatus: standaloneContractForm.depositStatus,
      status: 'ativo' as const,
      firstPaymentReceived: Boolean(standaloneContractForm.firstPaymentReceived),
      firstPaymentPaidDate: standaloneContractForm.firstPaymentPaidDate,
      firstPaymentMethod: standaloneContractForm.firstPaymentMethod,
      firstPaymentNotes: standaloneContractForm.firstPaymentNotes,
    };

    const createdContractId = createMotoContract(newContract);
    updateMoto(selectedMoto.id, { status: 'alugada' });
    setShowNewContractModal(false);

    setNewContractSuccessData({
      moto: selectedMoto,
      tenant: tenantToUse,
      contract: {
        ...newContract,
        id: createdContractId,
        installments: [],
      } as unknown as MotoContract,
    });
  };

  const handleOpenEditModal = (m: Moto) => {
    setMotoToEdit(m);
    const contract = motoContracts.find((c) => c.motoId === m.id && c.status === 'ativo');
    const tenant = motoTenants.find((t) => t.id === contract?.tenantId);

    setEditMotoForm({
      brand: m.brand,
      model: m.model,
      year: m.year,
      color: m.color,
      plate: m.plate,
      renavam: m.renavam || '',
      chassi: m.chassi || '',
      purchaseDate: m.purchaseDate,
      purchasePrice: m.purchasePrice,
      currentKm: m.currentKm,
      status: m.status,
      statusNote: m.statusNote || m.notes || '',
      frontPhoto: m.photos?.front || '',
      rearPhoto: m.photos?.rear || '',
      rightSidePhoto: m.photos?.right || '',
      leftSidePhoto: m.photos?.left || '',
      dashboardPhoto: m.photos?.dashboard || '',
      tenantName: tenant?.fullName || '',
      tenantCpf: tenant?.cpf || '',
      tenantRg: tenant?.rg || '',
      tenantPhone: tenant?.phone || tenant?.whatsapp || '',
      tenantEmail: tenant?.email || '',
      tenantCep: '',
      tenantStreet: tenant?.address || '',
      tenantNumber: '',
      tenantNeighborhood: '',
      tenantCity: '',
      tenantState: '',
      tenantComplement: '',
      tenantProfession: tenant?.profession || '',
      tenantPhoto: tenant?.photoUrl || tenant?.documents?.photo || '',
      cnhCategory: tenant?.cnh?.category || 'A',
      cnhNumber: tenant?.cnh?.number || '',
      cnhExpiration: tenant?.cnh?.expirationDate || '',
      durationMonths: contract?.durationMonths || 36,
      paymentFrequency: contract?.paymentFrequency || 'mensal',
      startDate: contract?.startDate || getTodayLocalDateString(),
      dueDay: contract?.dueDay || 10,
      dueDayOfWeek: contract?.dueDayOfWeek || 1,
      monthlyValue: contract?.monthlyValue || 0,
      weeklyValue: contract?.weeklyValue || 0,
      totalAgreedValue: contract?.totalAgreedValue || 0,
      deposit: contract?.deposit || 0,
      depositStatus: contract?.depositStatus || 'retida',
      insuranceDeductible:
        contract?.insuranceDeductible || m.insuranceDeductible || '',
    });
  };

  const handleEditMotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motoToEdit) return;

    if (!editMotoForm.purchasePrice || editMotoForm.purchasePrice <= 0) {
      alert('Por favor, informe o Valor de Compra da moto.');
      return;
    }

    const plateValidation = validateLicensePlate(editMotoForm.plate);
    if (!plateValidation.isValid) {
      alert(`Placa inválida! ${plateValidation.error || 'A placa deve seguir o padrão brasileiro.'}`);
      return;
    }

    const formattedInsuranceDeductible: string =
      typeof editMotoForm.insuranceDeductible === 'number' && editMotoForm.insuranceDeductible > 0
        ? formatCurrency(editMotoForm.insuranceDeductible).replace('R$', '').trim()
        : String(editMotoForm.insuranceDeductible || '');

    updateMoto(motoToEdit.id, {
      brand: editMotoForm.brand,
      model: editMotoForm.model,
      year: editMotoForm.year,
      color: editMotoForm.color,
      plate: plateValidation.formatted,
      renavam: editMotoForm.renavam,
      chassi: editMotoForm.chassi.toUpperCase().trim(),
      purchaseDate: editMotoForm.purchaseDate,
      purchasePrice: editMotoForm.purchasePrice,
      currentKm: editMotoForm.currentKm,
      status: editMotoForm.status,
      statusNote: editMotoForm.statusNote?.trim() || undefined,
      insuranceDeductible: formattedInsuranceDeductible,
      photos: {
        ...motoToEdit.photos,
        front: editMotoForm.frontPhoto || undefined,
        rear: editMotoForm.rearPhoto || undefined,
        right: editMotoForm.rightSidePhoto || undefined,
        left: editMotoForm.leftSidePhoto || undefined,
        dashboard: editMotoForm.dashboardPhoto || undefined,
      },
    });

    const existingContract = motoContracts.find(
      (c) => c.motoId === motoToEdit.id && c.status === 'ativo'
    );
    const existingTenant = motoTenants.find((t) => t.id === existingContract?.tenantId);

    if (existingContract && updateMotoContract) {
      updateMotoContract(existingContract.id, {
        durationMonths: editMotoForm.durationMonths,
        paymentFrequency: editMotoForm.paymentFrequency,
        startDate: editMotoForm.startDate,
        dueDay: editMotoForm.dueDay,
        dueDayOfWeek: editMotoForm.dueDayOfWeek,
        monthlyValue: editMotoForm.monthlyValue,
        weeklyValue: editMotoForm.weeklyValue,
        deposit: editMotoForm.deposit,
        insuranceDeductible: formattedInsuranceDeductible,
        depositStatus: editMotoForm.depositStatus,
      });
    }

    if (editMotoForm.tenantName.trim()) {
      const formattedAddress = formatFullAddress(editMotoForm);
      if (existingTenant) {
        updateMotoTenant(existingTenant.id, {
          fullName: editMotoForm.tenantName.trim(),
          cpf: editMotoForm.tenantCpf.replace(/\D/g, '') || existingTenant.cpf,
          rg: editMotoForm.tenantRg.trim() || existingTenant.rg,
          phone: editMotoForm.tenantPhone.replace(/\D/g, '') || existingTenant.phone,
          whatsapp: editMotoForm.tenantPhone.replace(/\D/g, '') || existingTenant.whatsapp,
          email: editMotoForm.tenantEmail.trim() || existingTenant.email,
          address: formattedAddress,
          profession: editMotoForm.tenantProfession.trim() || existingTenant.profession,
          photoUrl: editMotoForm.tenantPhoto || existingTenant.photoUrl,
          cnh: {
            number: editMotoForm.cnhNumber || existingTenant.cnh.number,
            category: editMotoForm.cnhCategory || existingTenant.cnh.category,
            expirationDate: editMotoForm.cnhExpiration || existingTenant.cnh.expirationDate,
          },
        });
      } else {
        // Criar locatário e contrato se não existiam antes
        const newTenantId = addMotoTenant({
          fullName: editMotoForm.tenantName.trim(),
          cpf: editMotoForm.tenantCpf.replace(/\D/g, '') || '00000000000',
          rg: editMotoForm.tenantRg.trim() || '',
          birthDate: '',
          phone: editMotoForm.tenantPhone.replace(/\D/g, '') || '11999999999',
          whatsapp: editMotoForm.tenantPhone.replace(/\D/g, '') || '11999999999',
          email: editMotoForm.tenantEmail.trim() || '',
          photoUrl: editMotoForm.tenantPhoto,
          address: formattedAddress,
          profession: editMotoForm.tenantProfession.trim() || 'Motorista / Entregador',
          company: 'Autônomo',
          income:
            (editMotoForm.paymentFrequency === 'semanal'
              ? editMotoForm.weeklyValue * 4
              : editMotoForm.monthlyValue) * 3.5,
          cnh: {
            number: editMotoForm.cnhNumber || '12345678900',
            category: editMotoForm.cnhCategory,
            expirationDate: editMotoForm.cnhExpiration,
          },
          documents: {
            ...(editMotoForm.tenantPhoto ? { photo: editMotoForm.tenantPhoto } : {}),
          },
          approvalChecklist: {
            cnhValid: true,
            docsChecked: true,
            addressValidated: true,
            incomeAnalyzed: true,
            depositReceived: true,
            contractSigned: true,
            result: 'aprovado' as const,
          },
        });

        createMotoContract({
          motoId: motoToEdit.id,
          tenantId: newTenantId,
          durationMonths: editMotoForm.durationMonths,
          paymentFrequency: editMotoForm.paymentFrequency,
          startDate: editMotoForm.startDate,
          dueDay: editMotoForm.dueDay,
          dueDayOfWeek: editMotoForm.dueDayOfWeek,
          monthlyValue: editMotoForm.monthlyValue,
          weeklyValue: editMotoForm.weeklyValue,
          deposit: editMotoForm.deposit,
          insuranceDeductible: formattedInsuranceDeductible,
          totalAgreedValue: editMotoForm.totalAgreedValue,
          depositStatus: editMotoForm.depositStatus,
          status: 'ativo' as const,
        });

        updateMoto(motoToEdit.id, { status: 'alugada' });
      }
    }

    setMotoToEdit(null);
  };

  return {
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
  };
}
