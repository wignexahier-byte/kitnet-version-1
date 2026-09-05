import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Moto,
  MotoTenant,
  MotoContract,
  MotoContractCreationParams,
  Installment,
  KmLog,
  MotoDelivery,
  MotoMaintenance,
  RentAdjustment,
  TimelineEvent,
  Expense,
} from '../types';
import { initialMotos, initialMotoTenants, initialMotoContracts } from '../utils/initialData';
import { generateContractSchedule } from '../utils/contractCalculations';
import {
  renewalService,
  reajusteService,
  leaseService,
} from '../services/contractService';
import { paymentService } from '../services/paymentService';
import { getTodayLocalDateString } from '../utils/formatters';
import { weeklyToMonthly, monthlyToWeekly } from '../domain';
import { loadFromStorage, saveToStorage } from './storageHelpers';
import { isDemoModeActive, filterOutDemoEntities } from '../utils/demoDataSecurity';

interface UseMotosManagerProps {
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpensesByTarget: (targetType: 'moto' | 'kitnet', targetId: string) => void;
  onTransitionToRealData?: () => void;
}

export function useMotosManager({
  addTimelineEvent,
  addExpense,
  deleteExpensesByTarget,
  onTransitionToRealData,
}: UseMotosManagerProps) {
  const [motos, setMotos] = useState<Moto[]>(() => loadFromStorage('motos', initialMotos));

  const [motoTenants, setMotoTenants] = useState<MotoTenant[]>(() => {
    const loadedMotos = loadFromStorage<Moto[]>('motos', initialMotos);
    const loadedTenants = loadFromStorage<MotoTenant[]>('motoTenants', initialMotoTenants);
    if (loadedMotos.length === 0) return [];
    return loadedTenants;
  });

  const motosRef = useRef(motos);
  motosRef.current = motos;

  const motoTenantsRef = useRef(motoTenants);
  motoTenantsRef.current = motoTenants;

  const [motoContracts, setMotoContracts] = useState<MotoContract[]>(() => {
    const loadedMotos = loadFromStorage<Moto[]>('motos', initialMotos);
    const loadedContracts = loadFromStorage<MotoContract[]>('motoContracts', initialMotoContracts);
    if (loadedMotos.length === 0) return [];
    const validMotoIds = new Set(loadedMotos.map((m) => m.id));
    
    // Auto-migrate stale initial sample contracts that have 2024 fixed dates causing 700+ days overdue
    const migratedContracts = loadedContracts.map((c) => {
      if ((c.id === 'contract-moto-1' || c.id === 'contract-moto-2') && c.installments?.some(i => i.dueDate?.startsWith('2024'))) {
        const freshSample = initialMotoContracts.find(sc => sc.id === c.id);
        if (freshSample) return freshSample;
      }
      return c;
    });

    const validContracts = migratedContracts
      .filter((c) => validMotoIds.has(c.motoId))
      .map((c) => leaseService.ensureFullScheduleIntegrity(c));

    return validContracts.map((c) => {
      const isWeekly = c.paymentFrequency === 'semanal' || (c.installments && c.installments.length >= 40);
      if (isWeekly) {
        const regularInstallment = c.installments?.[1]?.amount || c.installments?.[0]?.amount || 0;
        const weeklyVal = c.weeklyValue || regularInstallment || (c.monthlyValue ? monthlyToWeekly(c.monthlyValue) : 0);
        const calculatedMonthly = weeklyToMonthly(weeklyVal);
        const needsCorrection = !c.monthlyValue || c.monthlyValue < weeklyVal * 2.5;

        return {
          ...c,
          paymentFrequency: 'semanal' as const,
          weeklyValue: weeklyVal,
          monthlyValue: needsCorrection ? calculatedMonthly : c.monthlyValue,
        };
      }
      return c;
    });
  });

  useEffect(() => {
    saveToStorage('motos', motos);
  }, [motos]);

  useEffect(() => {
    saveToStorage('motoTenants', motoTenants);
  }, [motoTenants]);

  useEffect(() => {
    saveToStorage('motoContracts', motoContracts);
  }, [motoContracts]);

  const addMoto = (motoData: Omit<Moto, 'id' | 'kmLogs'>): string => {
    if (isDemoModeActive() && onTransitionToRealData) {
      onTransitionToRealData();
    }
    const id = `moto-${Date.now()}`;
    const initialKmLog: KmLog = {
      id: `km-${Date.now()}`,
      date: motoData.purchaseDate || getTodayLocalDateString(),
      km: motoData.currentKm,
      notes: 'Cadastro inicial do veículo',
    };
    const newMoto: Moto = {
      ...motoData,
      id,
      kmLogs: [initialKmLog],
    };
    motosRef.current = [newMoto, ...filterOutDemoEntities(motosRef.current)];
    setMotos((prev) => [newMoto, ...filterOutDemoEntities(prev)]);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Nova Moto Cadastrada: ${newMoto.brand} ${newMoto.model}`,
      description: `Placa ${newMoto.plate}, Ano ${newMoto.year}, KM inicial: ${newMoto.currentKm}.`,
      entityType: 'moto',
      entityId: id,
    });
    return id;
  };

  const duplicateMoto = (motoId: string): string => {
    const original = motos.find((m) => m.id === motoId);
    if (!original) return '';

    const id = `moto-${Date.now()}`;
    const initialKmLog: KmLog = {
      id: `km-${Date.now()}`,
      date: getTodayLocalDateString(),
      km: 0,
      notes: `Cópia do cadastro da moto ${original.model} (${original.plate || 'sem placa'})`,
    };

    const newMoto: Moto = {
      ...original,
      id,
      plate: '',
      renavam: '',
      chassi: '',
      currentKm: 0,
      status: 'disponivel',
      purchaseDate: getTodayLocalDateString(),
      documents: { outros: [] },
      photos: {},
      kmLogs: [initialKmLog],
      maintenances: [],
    };

    setMotos((prev) => [newMoto, ...prev]);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Moto Duplicada: ${newMoto.brand} ${newMoto.model}`,
      description: `Cadastro base copiado da moto modelo ${original.model}. Preencha placa, chassi e renavam do novo veículo.`,
      entityType: 'moto',
      entityId: id,
    });
    return id;
  };

  const updateMoto = (id: string, updates: Partial<Moto>) => {
    setMotos((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMoto = (id: string) => {
    const moto = motos.find((m) => m.id === id);
    const relatedContracts = motoContracts.filter((c) => c.motoId === id);
    const relatedTenantIds = new Set(relatedContracts.map((c) => c.tenantId));

    setMotos((prev) => prev.filter((m) => m.id !== id));
    setMotoContracts((prev) => prev.filter((c) => c.motoId !== id));
    deleteExpensesByTarget('moto', id);

    setMotoTenants((prev) => {
      const remainingContractTenantIds = new Set(
        motoContracts.filter((c) => c.motoId !== id).map((c) => c.tenantId)
      );
      return prev.filter((t) => !relatedTenantIds.has(t.id) || remainingContractTenantIds.has(t.id));
    });

    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Moto Removida do Sistema: ${moto?.brand || ''} ${moto?.model || ''}`,
      description: `Registro da moto com placa ${moto?.plate || id} foi excluído do sistema.`,
      entityType: 'moto',
      entityId: id,
    });
  };

  const addKmLog = (motoId: string, km: number, notes?: string, photoUrl?: string) => {
    const moto = motos.find((m) => m.id === motoId);
    if (!moto) return;
    const newLog: KmLog = {
      id: `km-${Date.now()}`,
      date: getTodayLocalDateString(),
      km,
      notes: notes || 'Atualização periódica de quilometragem',
      photoUrl,
    };
    const updatedLogs = [newLog, ...moto.kmLogs];
    updateMoto(motoId, {
      currentKm: Math.max(moto.currentKm, km),
      kmLogs: updatedLogs,
    });
    addTimelineEvent({
      type: 'km_atualizado',
      title: `KM Atualizado: ${moto.brand} ${moto.model}`,
      description: `Nova marcação de ${km.toLocaleString('pt-BR')} km registrada.`,
      entityType: 'moto',
      entityId: motoId,
    });
  };

  const recordMotoDelivery = (motoId: string, delivery: MotoDelivery) => {
    const moto = motos.find((m) => m.id === motoId);
    if (!moto) return;
    updateMoto(motoId, {
      delivery,
      currentKm: delivery.initialKm,
      status: 'alugada',
    });
    addKmLog(motoId, delivery.initialKm, 'Quilometragem oficial de entrega ao locatário');
    addTimelineEvent({
      type: 'moto_entregue',
      title: `Moto Entregue: ${moto.brand} ${moto.model}`,
      description: `Entregue com ${delivery.initialKm.toLocaleString('pt-BR')} km. ${delivery.stateNotes}`,
      entityType: 'moto',
      entityId: motoId,
    });
  };

  const addMotoMaintenance = (
    motoId: string,
    maintenanceData: Omit<MotoMaintenance, 'id' | 'motoId'>
  ) => {
    const maintenanceId = `maint-${Date.now()}`;
    const newMaintenance: MotoMaintenance = {
      ...maintenanceData,
      id: maintenanceId,
      motoId,
    };

    setMotos((prev) =>
      prev.map((m) => {
        if (m.id !== motoId) return m;
        const currentMaintenances = m.maintenances || [];
        return {
          ...m,
          maintenances: [newMaintenance, ...currentMaintenances],
          currentKm: maintenanceData.km ? Math.max(m.currentKm, maintenanceData.km) : m.currentKm,
        };
      })
    );

    if (maintenanceData.cost > 0) {
      const typeLabels: Record<string, string> = {
        troca_oleo: 'Troca de Óleo',
        pneu_dianteiro: 'Pneu Dianteiro',
        pneu_traseiro: 'Pneu Traseiro',
        relacao_kit: 'Kit Relação (Coroa/Pinhão/Corrente)',
        freio_pastilha: 'Pastilhas/Lonas de Freio',
        revisao_geral: 'Revisão Geral Preventiva',
        eletrica: 'Manutenção Elétrica',
        bateria: 'Troca de Bateria',
        cabos_velas: 'Cabos & Velas',
        outro: 'Manutenção Técnica',
      };
      const label = typeLabels[maintenanceData.type] || 'Manutenção Moto';
      const moto = motos.find((m) => m.id === motoId);

      addExpense({
        title: `${label} - ${moto?.brand || ''} ${moto?.model || ''} (${moto?.plate || ''})`,
        category: 'manutencao_moto',
        targetType: 'moto',
        targetId: motoId,
        amount: maintenanceData.cost,
        dueDate: maintenanceData.date || getTodayLocalDateString(),
        paidDate: maintenanceData.date || getTodayLocalDateString(),
        status: 'pago',
        recurrence: 'nenhuma',
        notes: maintenanceData.description,
        receiptUrl: maintenanceData.receiptUrl,
      });
    }

    const moto = motos.find((m) => m.id === motoId);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Manutenção Técnica Registrada: ${moto?.model || ''}`,
      description: `${maintenanceData.description} • Custo: R$ ${maintenanceData.cost.toFixed(2)} • KM: ${maintenanceData.km} km.`,
      entityType: 'moto',
      entityId: motoId,
    });
  };

  const deleteMotoMaintenance = (motoId: string, maintenanceId: string) => {
    setMotos((prev) =>
      prev.map((m) => {
        if (m.id !== motoId) return m;
        return {
          ...m,
          maintenances: (m.maintenances || []).filter((item) => item.id !== maintenanceId),
        };
      })
    );
  };

  const addMotoTenant = (tenantData: Omit<MotoTenant, 'id'>): string => {
    const id = `tenant-moto-${Date.now()}`;
    const newTenant: MotoTenant = {
      ...tenantData,
      id,
    };
    motoTenantsRef.current = [newTenant, ...motoTenantsRef.current];
    setMotoTenants((prev) => [newTenant, ...prev]);
    return id;
  };

  const updateMotoTenant = (id: string, updates: Partial<MotoTenant>) => {
    setMotoTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const updateMotoContract = (id: string, updates: Partial<MotoContract>) => {
    setMotoContracts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const createMotoContract = (contractData: MotoContractCreationParams): string => {
    if (isDemoModeActive() && onTransitionToRealData) {
      onTransitionToRealData();
    }
    const id = `contract-moto-${Date.now()}`;
    const effectiveWeekly =
      contractData.weeklyValue ||
      (contractData.monthlyValue ? monthlyToWeekly(contractData.monthlyValue) : 0);
    const effectiveMonthly =
      contractData.paymentFrequency === 'semanal'
        ? (contractData.monthlyValue && contractData.monthlyValue > 0 ? contractData.monthlyValue : weeklyToMonthly(effectiveWeekly))
        : (contractData.monthlyValue || 0);

    const scheduleResult = generateContractSchedule({
      startDate: contractData.startDate,
      durationMonths: contractData.durationMonths,
      paymentFrequency: contractData.paymentFrequency || 'mensal',
      monthlyValue: effectiveMonthly,
      weeklyValue: effectiveWeekly,
      dueDay: contractData.dueDay,
      dueDayOfWeek: contractData.dueDayOfWeek,
    });

    const installments = paymentService.buildContractInstallments(
      id,
      scheduleResult.installments,
      {
        firstPaymentReceived: contractData.firstPaymentReceived,
        firstPaymentPaidDate: contractData.firstPaymentPaidDate || contractData.startDate,
        firstPaymentMethod: contractData.firstPaymentMethod || 'PIX Instantâneo',
        firstPaymentNotes: contractData.firstPaymentNotes || '1ª Parcela recebida no cadastro / entrega',
      },
      'inst'
    );

    const isFirstReceived = Boolean(contractData.firstPaymentReceived);

    const calculatedTotal =
      contractData.totalAgreedValue || installments.reduce((acc, curr) => acc + curr.amount, 0);

    const newContract: MotoContract = {
      ...contractData,
      id,
      monthlyValue: effectiveMonthly,
      weeklyValue: contractData.paymentFrequency === 'semanal' ? effectiveWeekly : undefined,
      installments,
      totalAgreedValue: calculatedTotal,
      firstInstallmentProportional: scheduleResult.isFirstInstallmentProportional,
      firstInstallmentDays: scheduleResult.partialDays,
      depositStatus: contractData.depositStatus || 'retida',
      status: 'ativo',
    };

    setMotoContracts((prev) => [newContract, ...prev]);
    updateMoto(contractData.motoId, { status: 'alugada' });

    const moto = motosRef.current.find((m) => m.id === contractData.motoId);
    const tenant = motoTenantsRef.current.find((t) => t.id === contractData.tenantId);

    const firstInstAmount = installments[0]?.amount || 0;
    const depositAmount = contractData.deposit || 0;

    if (isFirstReceived) {
      const totalReceivedInitial = firstInstAmount + depositAmount;
      addTimelineEvent({
        type: 'contrato_criado',
        title: `Contrato de Moto Criado & Entrada Recebida`,
        description: `Locatário: ${tenant?.fullName || 'N/A'} • Moto: ${moto?.brand || ''} ${moto?.model || ''} (${moto?.plate || ''}). Recebido no cadastro: R$ ${totalReceivedInitial.toFixed(2)} (1ª parcela: R$ ${firstInstAmount.toFixed(2)}${depositAmount > 0 ? ` + Caução: R$ ${depositAmount.toFixed(2)}` : ''}) via ${contractData.firstPaymentMethod || 'PIX Instantâneo'}.`,
        entityType: 'financeiro',
        entityId: contractData.motoId,
      });
    } else {
      addTimelineEvent({
        type: 'contrato_criado',
        title: `Contrato de Locação de Moto Criado`,
        description: `Locatário: ${tenant?.fullName || 'N/A'} • Moto: ${moto?.brand || ''} ${moto?.model || ''} (${moto?.plate || ''}). 1ª parcela de R$ ${firstInstAmount.toFixed(2)} pendente de recebimento (vencimento: ${installments[0]?.dueDate || 'N/A'})${depositAmount > 0 ? ` • Caução: R$ ${depositAmount.toFixed(2)}` : ''}.`,
        entityType: 'moto',
        entityId: contractData.motoId,
      });
    }

    return id;
  };

  const adjustMotoContractRent = (
    contractId: string,
    newValue: number,
    reason: string,
    effectiveFromInstallment?: number
  ) => {
    const contract = motoContracts.find((c) => c.id === contractId);
    if (!contract) return;

    const previousValue = contract.monthlyValue;
    const updatedContract = reajusteService.adjustRent(
      contract,
      newValue,
      reason,
      effectiveFromInstallment
    );

    setMotoContracts((prev) =>
      prev.map((c) => (c.id === contractId ? updatedContract : c))
    );

    const moto = motos.find((m) => m.id === contract.motoId);
    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Reajuste de Contrato Moto: ${moto?.model || ''}`,
      description: `Valor alterado de R$ ${previousValue.toFixed(2)} para R$ ${newValue.toFixed(2)}. Motivo: ${reason}`,
      entityType: 'moto',
      entityId: contract.motoId,
    });
  };

  const renewMotoContract = (
    contractId: string,
    additionalMonths: number,
    newRentValue?: number,
    reason?: string
  ) => {
    const contract = motoContracts.find((c) => c.id === contractId);
    if (!contract) return;

    const updatedContract = renewalService.renewContract(
      contract,
      additionalMonths,
      newRentValue,
      reason
    );

    setMotoContracts((prev) =>
      prev.map((c) => (c.id === contractId ? updatedContract : c))
    );

    const moto = motos.find((m) => m.id === contract.motoId);
    addTimelineEvent({
      type: 'contrato_criado',
      title: `Renovação Contrato Moto: ${moto?.model || ''}`,
      description: `Contrato prorrogado em +${additionalMonths} meses (Duração total: ${updatedContract.durationMonths} meses).`,
      entityType: 'moto',
      entityId: contract.motoId,
    });
  };

  const payMotoInstallment = (
    contractId: string,
    installmentId: string,
    notes?: string,
    receiptUrl?: string,
    paymentMethod?: string
  ) => {
    setMotoContracts((prev) =>
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

    const contract = motoContracts.find((c) => c.id === contractId);
    const tenant = motoTenants.find((t) => t.id === contract?.tenantId);
    const installment = contract?.installments.find((i) => i.id === installmentId);

    addTimelineEvent({
      type: 'pagamento_recebido',
      title: `Pagamento Parcela Moto: ${tenant?.fullName || 'Locatário'}`,
      description: `Parcela ${installment?.number}/${installment?.totalInstallments} de R$ ${installment?.amount.toFixed(2)} quitada com sucesso.`,
      entityType: 'financeiro',
      entityId: contract?.motoId,
    });
  };

  const terminateMotoContract = (contractId: string, finalKm?: number, finalNotes?: string) => {
    const contract = motoContracts.find((c) => c.id === contractId);
    if (!contract) return;
    setMotoContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedInstallments = c.installments.map((inst) =>
          inst.status === 'pendente' ? { ...inst, status: 'cancelada' as const } : inst
        );
        return { ...c, status: 'encerrado' as const, installments: updatedInstallments };
      })
    );
    const moto = motos.find((m) => m.id === contract.motoId);
    const tenant = motoTenants.find((t) => t.id === contract.tenantId);

    const kmToSet = finalKm && finalKm > 0 ? finalKm : moto?.currentKm || 0;

    updateMoto(contract.motoId, {
      status: 'disponivel',
      currentKm: kmToSet,
    });

    if (finalKm && finalKm > 0 && moto) {
      addKmLog(contract.motoId, finalKm, `Devolução de locação - Inquilino: ${tenant?.fullName || 'N/A'}`);
    }

    addTimelineEvent({
      type: 'documento_atualizado',
      title: `Contrato de Moto Finalizado: ${moto?.brand} ${moto?.model}`,
      description: `Locatário: ${tenant?.fullName || 'N/A'} • KM Final: ${kmToSet} km. Motivo/Obs: ${finalNotes || 'Locação encerrada e moto liberada para nova locação.'}`,
      entityType: 'moto',
      entityId: contract.motoId,
    });
  };

  return {
    motos,
    setMotos,
    motoTenants,
    setMotoTenants,
    motoContracts,
    setMotoContracts,
    addMoto,
    duplicateMoto,
    updateMoto,
    deleteMoto,
    addKmLog,
    recordMotoDelivery,
    addMotoMaintenance,
    deleteMotoMaintenance,
    addMotoTenant,
    updateMotoTenant,
    createMotoContract,
    updateMotoContract,
    adjustMotoContractRent,
    renewMotoContract,
    payMotoInstallment,
    terminateMotoContract,
  };
}
