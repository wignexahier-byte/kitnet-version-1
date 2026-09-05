import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Kitnet,
  KitnetTenant,
  KitnetContract,
  KitnetContractCreationParams,
  Installment,
  KitnetInspection,
  RentAdjustment,
  TimelineEvent,
} from '../types';
import { initialKitnets, initialKitnetTenants, initialKitnetContracts } from '../utils/initialData';
import {
  generatePaymentSchedule,
  generateMonthlyPayments,
  renewalService,
  reajusteService,
  leaseService,
} from '../services/contractService';
import { paymentService } from '../services/paymentService';
import { getTodayLocalDateString } from '../utils/formatters';
import { loadFromStorage, saveToStorage } from './storageHelpers';
import { getKitnetMonthlyTotal } from '../domain/calculations';
import { isDemoModeActive, filterOutDemoEntities } from '../utils/demoDataSecurity';

interface UseKitnetsManagerProps {
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  deleteExpensesByTarget: (targetType: 'moto' | 'kitnet', targetId: string) => void;
  onTransitionToRealData?: () => void;
}

export function useKitnetsManager({
  addTimelineEvent,
  deleteExpensesByTarget,
  onTransitionToRealData,
}: UseKitnetsManagerProps) {
  const [kitnets, setKitnets] = useState<Kitnet[]>(() => loadFromStorage('kitnets', initialKitnets));

  const [kitnetTenants, setKitnetTenants] = useState<KitnetTenant[]>(() => {
    const loadedKitnets = loadFromStorage<Kitnet[]>('kitnets', initialKitnets);
    const loadedTenants = loadFromStorage<KitnetTenant[]>('kitnetTenants', initialKitnetTenants);
    if (loadedKitnets.length === 0) return [];
    return loadedTenants;
  });

  const kitnetsRef = useRef(kitnets);
  kitnetsRef.current = kitnets;

  const kitnetTenantsRef = useRef(kitnetTenants);
  kitnetTenantsRef.current = kitnetTenants;

  const [kitnetContracts, setKitnetContracts] = useState<KitnetContract[]>(() => {
    const loadedKitnets = loadFromStorage<Kitnet[]>('kitnets', initialKitnets);
    const loadedContracts = loadFromStorage<KitnetContract[]>('kitnetContracts', initialKitnetContracts);
    if (loadedKitnets.length === 0) return [];
    const validKitnetIds = new Set(loadedKitnets.map((k) => k.id));

    // Auto-migrate stale initial sample contracts that have 2024 fixed dates
    const migratedContracts = loadedContracts.map((c) => {
      if ((c.id === 'contract-kitnet-1' || c.id === 'contract-kitnet-2') && c.installments?.some(i => i.dueDate?.startsWith('2024'))) {
        const freshSample = initialKitnetContracts.find(sc => sc.id === c.id);
        if (freshSample) return freshSample;
      }
      return c;
    });

    return migratedContracts
      .filter((c) => validKitnetIds.has(c.kitnetId))
      .map((c) => leaseService.ensureFullScheduleIntegrity(c));
  });

  useEffect(() => {
    saveToStorage('kitnets', kitnets);
  }, [kitnets]);

  useEffect(() => {
    saveToStorage('kitnetTenants', kitnetTenants);
  }, [kitnetTenants]);

  useEffect(() => {
    saveToStorage('kitnetContracts', kitnetContracts);
  }, [kitnetContracts]);

  const addKitnet = (kitnetData: Omit<Kitnet, 'id'>): string => {
    if (isDemoModeActive() && onTransitionToRealData) {
      onTransitionToRealData();
    }
    const id = `kitnet-${Date.now()}`;
    const newKitnet: Kitnet = {
      ...kitnetData,
      id,
    };
    kitnetsRef.current = [newKitnet, ...filterOutDemoEntities(kitnetsRef.current)];
    setKitnets((prev) => [newKitnet, ...filterOutDemoEntities(prev)]);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Nova Kitnet Cadastrada: ${newKitnet.name}`,
      description: `Unidade nº ${newKitnet.number}, Aluguel base: R$ ${newKitnet.monthlyRentBase}.`,
      entityType: 'kitnet',
      entityId: id,
    });
    return id;
  };

  const duplicateKitnet = (kitnetId: string): string => {
    const original = kitnets.find((k) => k.id === kitnetId);
    if (!original) return '';

    const id = `kitnet-${Date.now()}`;
    const nextNumber = `${Number(original.number) ? Number(original.number) + 1 : original.number + ' (Cópia)'}`;
    const newKitnet: Kitnet = {
      ...original,
      id,
      number: nextNumber,
      name: `${original.name.replace(/\d+$/, '')}${nextNumber}`,
      status: 'disponivel',
      photos: {
        general: [],
        delivery: [],
      },
      documents: [],
      entryInspection: undefined,
      exitInspection: undefined,
    };

    setKitnets((prev) => [newKitnet, ...prev]);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Kitnet Duplicada: ${newKitnet.name}`,
      description: `Cadastro base duplicado da unidade nº ${original.number} para a unidade nº ${nextNumber}.`,
      entityType: 'kitnet',
      entityId: id,
    });
    return id;
  };

  const updateKitnet = (id: string, updates: Partial<Kitnet>) => {
    setKitnets((prev) => prev.map((k) => (k.id === id ? { ...k, ...updates } : k)));
  };

  const deleteKitnet = (id: string) => {
    const kitnet = kitnets.find((k) => k.id === id);
    const relatedContracts = kitnetContracts.filter((c) => c.kitnetId === id);
    const relatedTenantIds = new Set(relatedContracts.map((c) => c.tenantId));

    setKitnets((prev) => prev.filter((k) => k.id !== id));
    setKitnetContracts((prev) => prev.filter((c) => c.kitnetId !== id));
    deleteExpensesByTarget('kitnet', id);

    setKitnetTenants((prev) => {
      const remainingContractTenantIds = new Set(
        kitnetContracts.filter((c) => c.kitnetId !== id).map((c) => c.tenantId)
      );
      return prev.filter((t) => !relatedTenantIds.has(t.id) || remainingContractTenantIds.has(t.id));
    });

    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Kitnet Removida do Sistema: ${kitnet?.name || id}`,
      description: `Registro da unidade nº ${kitnet?.number || ''} foi excluído do sistema.`,
      entityType: 'kitnet',
      entityId: id,
    });
  };

  const recordKitnetInspection = (kitnetId: string, inspection: KitnetInspection) => {
    const kitnet = kitnets.find((k) => k.id === kitnetId);
    if (!kitnet) return;
    updateKitnet(kitnetId, { entryInspection: inspection });
    addTimelineEvent({
      type: 'vistoria',
      title: `Vistoria Realizada: ${kitnet.name}`,
      description: `Laudo registrado com avaliação dos 6 ambientes. ${inspection.stateNotes}`,
      entityType: 'kitnet',
      entityId: kitnetId,
    });
  };

  const addKitnetTenant = (tenantData: Omit<KitnetTenant, 'id'>): string => {
    const id = `tenant-kitnet-${Date.now()}`;
    const newTenant: KitnetTenant = {
      ...tenantData,
      id,
    };
    kitnetTenantsRef.current = [newTenant, ...kitnetTenantsRef.current];
    setKitnetTenants((prev) => [newTenant, ...prev]);
    return id;
  };

  const updateKitnetTenant = (id: string, updates: Partial<KitnetTenant>) => {
    setKitnetTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const createKitnetContract = (
    contractData: KitnetContractCreationParams
  ): string => {
    if (isDemoModeActive() && onTransitionToRealData) {
      onTransitionToRealData();
    }
    const id = `contract-kitnet-${Date.now()}`;
    const totalMonthly = getKitnetMonthlyTotal(contractData);

    const scheduleResult = generatePaymentSchedule({
      startDate: contractData.startDate,
      durationMonths: contractData.durationMonths || 12,
      paymentFrequency: 'mensal',
      monthlyValue: totalMonthly,
      dueDay: contractData.dueDay,
    });

    const installments = paymentService.buildContractInstallments(
      id,
      scheduleResult.installments,
      {
        firstPaymentReceived: contractData.firstPaymentReceived,
        firstPaymentPaidDate: contractData.firstPaymentPaidDate || contractData.startDate,
        firstPaymentMethod: contractData.firstPaymentMethod || contractData.paymentMethod || 'PIX Instantâneo',
        firstPaymentNotes: contractData.firstPaymentNotes || '1º Aluguel recebido no cadastro / entrada',
      },
      'k-inst'
    );

    const isFirstReceived = Boolean(contractData.firstPaymentReceived);

    const newContract: KitnetContract = {
      ...contractData,
      id,
      installments,
      status: 'ativo',
    };

    setKitnetContracts((prev) => [newContract, ...prev]);
    updateKitnet(contractData.kitnetId, { status: 'alugada' });

    const kitnet = kitnetsRef.current.find((k) => k.id === contractData.kitnetId);
    const tenant = kitnetTenantsRef.current.find((t) => t.id === contractData.tenantId);

    const firstInstAmount = installments[0]?.amount || 0;
    const depositAmount = contractData.deposit || 0;

    if (isFirstReceived) {
      const totalReceivedInitial = firstInstAmount + depositAmount;
      addTimelineEvent({
        type: 'contrato_criado',
        title: `Contrato de Kitnet Criado & Entrada Recebida`,
        description: `Inquilino: ${tenant?.fullName || 'N/A'} • Imóvel: ${kitnet?.name || ''}. Recebido no cadastro: R$ ${totalReceivedInitial.toFixed(2)} (1º aluguel: R$ ${firstInstAmount.toFixed(2)}${depositAmount > 0 ? ` + Caução: R$ ${depositAmount.toFixed(2)}` : ''}) via ${contractData.firstPaymentMethod || 'PIX Instantâneo'}.`,
        entityType: 'financeiro',
        entityId: contractData.kitnetId,
      });
    } else {
      addTimelineEvent({
        type: 'contrato_criado',
        title: `Contrato de Locação de Kitnet Criado`,
        description: `Inquilino: ${tenant?.fullName || 'N/A'} • Imóvel: ${kitnet?.name || ''}. 1º aluguel de R$ ${firstInstAmount.toFixed(2)} pendente de recebimento (vencimento: ${installments[0]?.dueDate || 'N/A'})${depositAmount > 0 ? ` • Caução: R$ ${depositAmount.toFixed(2)}` : ''}.`,
        entityType: 'kitnet',
        entityId: contractData.kitnetId,
      });
    }

    return id;
  };

  const adjustKitnetContractRent = (
    contractId: string,
    newValue: number,
    reason: string,
    effectiveFromInstallment?: number
  ) => {
    const contract = kitnetContracts.find((c) => c.id === contractId);
    if (!contract) return;

    const previousValue = contract.rentValue;
    const updatedContract = reajusteService.adjustRent(
      contract,
      newValue,
      reason,
      effectiveFromInstallment
    );

    setKitnetContracts((prev) =>
      prev.map((c) => (c.id === contractId ? updatedContract : c))
    );

    const kitnet = kitnets.find((k) => k.id === contract.kitnetId);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Reajuste de Aluguel Kitnet: ${kitnet?.name || ''}`,
      description: `Aluguel reajustado de R$ ${previousValue.toFixed(2)} para R$ ${newValue.toFixed(2)}. Motivo: ${reason}`,
      entityType: 'kitnet',
      entityId: contract.kitnetId,
    });
  };

  const renewKitnetContract = (
    contractId: string,
    additionalMonths: number,
    newRentValue?: number,
    reason?: string
  ) => {
    const contract = kitnetContracts.find((c) => c.id === contractId);
    if (!contract) return;

    const updatedContract = renewalService.renewContract(
      contract,
      additionalMonths,
      newRentValue,
      reason
    );

    setKitnetContracts((prev) =>
      prev.map((c) => (c.id === contractId ? updatedContract : c))
    );

    const kitnet = kitnets.find((k) => k.id === contract.kitnetId);
    addTimelineEvent({
      type: 'contrato_criado',
      title: `Renovação Formalizada — ${kitnet?.name || 'Kitnet'}`,
      description: `Contrato prorrogado em +${additionalMonths} meses (Duração total: ${updatedContract.durationMonths} meses). Aluguel base: R$ ${(newRentValue || contract.rentValue).toFixed(2)}${reason ? ` • ${reason}` : ''}.`,
      entityType: 'kitnet',
      entityId: contract.kitnetId,
    });
  };

  const payKitnetInstallment = (
    contractId: string,
    installmentId: string,
    notes?: string,
    receiptUrl?: string,
    paymentMethod?: string
  ) => {
    setKitnetContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updated = c.installments.map((inst) => {
          if (inst.id !== installmentId) return inst;
          return {
            ...inst,
            status: 'pago' as const,
            paidDate: getTodayLocalDateString(),
            paymentMethod: paymentMethod || inst.paymentMethod || 'PIX',
            notes,
            receiptUrl,
          };
        });
        return { ...c, installments: updated };
      })
    );

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    const contract = kitnetContracts.find((c) => c.id === contractId);
    const tenant = kitnetTenants.find((t) => t.id === contract?.tenantId);
    const installment = contract?.installments.find((i) => i.id === installmentId);

    addTimelineEvent({
      type: 'pagamento_recebido',
      title: `Aluguel Recebido: ${tenant?.fullName || 'Inquilino'}`,
      description: `Mês ${installment?.number}/${installment?.totalInstallments} de R$ ${installment?.amount.toFixed(2)} recebido com sucesso.`,
      entityType: 'financeiro',
      entityId: contract?.kitnetId,
    });
  };

  const terminateKitnetContract = (
    contractId: string,
    newKitnetStatus: 'disponivel' | 'reforma' = 'disponivel',
    finalNotes?: string
  ) => {
    const contract = kitnetContracts.find((c) => c.id === contractId);
    if (!contract) return;
    setKitnetContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedInstallments = c.installments.map((inst) =>
          inst.status === 'pendente' ? { ...inst, status: 'cancelada' as const } : inst
        );
        return { ...c, status: 'encerrado' as const, installments: updatedInstallments };
      })
    );
    updateKitnet(contract.kitnetId, { status: newKitnetStatus });
    const kitnet = kitnets.find((k) => k.id === contract.kitnetId);
    const tenant = kitnetTenants.find((t) => t.id === contract.tenantId);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Contrato de Kitnet Encerrado: ${kitnet?.name}`,
      description: `Inquilino: ${tenant?.fullName || 'N/A'}. Imóvel liberado como "${newKitnetStatus}". ${finalNotes || 'Desocupação registrada.'}`,
      entityType: 'kitnet',
      entityId: contract.kitnetId,
    });
  };

  return {
    kitnets,
    setKitnets,
    kitnetTenants,
    setKitnetTenants,
    kitnetContracts,
    setKitnetContracts,
    addKitnet,
    duplicateKitnet,
    updateKitnet,
    deleteKitnet,
    recordKitnetInspection,
    addKitnetTenant,
    updateKitnetTenant,
    createKitnetContract,
    adjustKitnetContractRent,
    renewKitnetContract,
    payKitnetInstallment,
    terminateKitnetContract,
  };
}
