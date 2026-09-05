import { useMemo } from 'react';
import { Moto, Kitnet, MotoContract, KitnetContract, MotoTenant, KitnetTenant } from '../../types';
import { getTodayLocalDateString } from '../../utils/formatters';
import { getDaysDifference, safeAdd, calculateOverdueCharges } from '../../utils/financialMath';
import { BillingItem } from './types';

interface UseBillingItemsProps {
  motos: Moto[];
  kitnets: Kitnet[];
  motoContracts: MotoContract[];
  kitnetContracts: KitnetContract[];
  motoTenants: MotoTenant[];
  kitnetTenants: KitnetTenant[];
  filterType: 'todos' | 'moto' | 'kitnet';
  activeCategory: 'todos' | 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia';
  searchQuery: string;
}

// Helper to generate text visual progress bar like ████████░░░░ 42%
const getVisualProgressBar = (percent: number): string => {
  const totalBars = 12;
  const filledBars = Math.round((percent / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  return '█'.repeat(Math.max(0, filledBars)) + '░'.repeat(Math.max(0, emptyBars));
};

export function useBillingItems({
  motos,
  kitnets,
  motoContracts,
  kitnetContracts,
  motoTenants,
  kitnetTenants,
  filterType,
  activeCategory,
  searchQuery,
}: UseBillingItemsProps) {
  const today = getTodayLocalDateString();

  // Compile all billing items across Motos & Kitnets
  const allBillingItems: BillingItem[] = useMemo(() => {
    const items: BillingItem[] = [];

    // Motos
    motoContracts.forEach((contract) => {
      const moto = motos.find((m) => m.id === contract.motoId);
      const tenant = motoTenants.find((t) => t.id === contract.tenantId);
      if (!tenant || contract.status !== 'ativo') return;

      const paidInstallments = contract.installments.filter((i) => i.status === 'pago');
      const paidCount = paidInstallments.length;
      const totalInstallments = contract.durationMonths || contract.installments.length;
      const pendingCount = Math.max(0, totalInstallments - paidCount);
      const paidAmount = paidInstallments.reduce((acc, i) => safeAdd(acc, i.amount), 0);
      const remainingAmount = contract.installments
        .filter((i) => i.status !== 'pago')
        .reduce((acc, i) => safeAdd(acc, i.amount), 0);
      const progressPercent = totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0;
      const progressVisual = getVisualProgressBar(progressPercent);

      const pendingInstallments = contract.installments.filter((i) => i.status !== 'pago');
      if (pendingInstallments.length === 0) return;

      // Filter actionable installments: overdue, due today, or due within 7 days
      const actionableInstallments = pendingInstallments.filter((inst) => {
        const diffDays = getDaysDifference(inst.dueDate, today);
        return diffDays >= -7;
      });

      // If there are actionable installments, show all of them.
      // Otherwise, only include the next immediate pending installment for this contract.
      const targetInstallments =
        actionableInstallments.length > 0 ? actionableInstallments : [pendingInstallments[0]];

      targetInstallments.forEach((inst) => {
        let statusCategory: 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia' = 'em_dia';
        const diffDays = getDaysDifference(inst.dueDate, today);

        if (diffDays > 0) {
          statusCategory = 'atrasado';
        } else if (diffDays === 0) {
          statusCategory = 'vencendo_hoje';
        } else if (diffDays >= -7) {
          statusCategory = 'proximos_7_dias';
        }

        const charges = calculateOverdueCharges({
          principal: inst.amount,
          dueDate: inst.dueDate,
          referenceDate: today,
          fixedFinePercent: 0.02,
          interestMonthlyRate: 0.01,
        });

        items.push({
          id: `moto-${contract.id}-${inst.id}`,
          contractId: contract.id,
          installmentId: inst.id,
          assetType: 'moto',
          assetName: `${moto?.brand || 'Moto'} ${moto?.model || ''}`,
          assetDetails: `Placa ${moto?.plate || '-'}`,
          clientName: tenant.fullName,
          clientPhone: tenant.whatsapp || tenant.phone,
          clientCpf: tenant.cpf,
          tenantId: tenant.id,
          installmentNumber: inst.number,
          totalInstallments,
          amount: inst.amount,
          dueDate: inst.dueDate,
          status: statusCategory,
          daysOverdue: Math.max(0, diffDays),
          fineAmount: charges.fineAmount,
          interestAmount: charges.interestAmount,
          totalDueWithCharges: charges.totalDue,
          paidCount,
          pendingCount,
          paidAmount,
          remainingAmount,
          progressPercent,
          progressVisual,
          rawContract: contract,
          rawInstallment: inst,
        });
      });
    });

    // Kitnets
    kitnetContracts.forEach((contract) => {
      const kitnet = kitnets.find((k) => k.id === contract.kitnetId);
      const tenant = kitnetTenants.find((t) => t.id === contract.tenantId);
      if (!tenant || contract.status !== 'ativo') return;

      const paidInstallments = contract.installments.filter((i) => i.status === 'pago');
      const paidCount = paidInstallments.length;
      const totalInstallments = contract.durationMonths || contract.installments.length;
      const pendingCount = Math.max(0, totalInstallments - paidCount);
      const paidAmount = paidInstallments.reduce((acc, i) => safeAdd(acc, i.amount), 0);
      const remainingAmount = contract.installments
        .filter((i) => i.status !== 'pago')
        .reduce((acc, i) => safeAdd(acc, i.amount), 0);
      const progressPercent = totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0;
      const progressVisual = getVisualProgressBar(progressPercent);

      const pendingInstallments = contract.installments.filter((i) => i.status !== 'pago');
      if (pendingInstallments.length === 0) return;

      // Filter actionable installments: overdue, due today, or due within 7 days
      const actionableInstallments = pendingInstallments.filter((inst) => {
        const diffDays = getDaysDifference(inst.dueDate, today);
        return diffDays >= -7;
      });

      // If there are actionable installments, show all of them.
      // Otherwise, only include the next immediate pending installment for this contract.
      const targetInstallments =
        actionableInstallments.length > 0 ? actionableInstallments : [pendingInstallments[0]];

      targetInstallments.forEach((inst) => {
        let statusCategory: 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia' = 'em_dia';
        const diffDays = getDaysDifference(inst.dueDate, today);

        if (diffDays > 0) {
          statusCategory = 'atrasado';
        } else if (diffDays === 0) {
          statusCategory = 'vencendo_hoje';
        } else if (diffDays >= -7) {
          statusCategory = 'proximos_7_dias';
        }

        const charges = calculateOverdueCharges({
          principal: inst.amount,
          dueDate: inst.dueDate,
          referenceDate: today,
          fixedFinePercent: 0.02,
          interestMonthlyRate: 0.01,
        });

        items.push({
          id: `kitnet-${contract.id}-${inst.id}`,
          contractId: contract.id,
          installmentId: inst.id,
          assetType: 'kitnet',
          assetName: kitnet ? `${kitnet.name} (${kitnet.number})` : 'Kitnet',
          assetDetails: kitnet?.address || 'Imóvel residencial',
          clientName: tenant.fullName,
          clientPhone: tenant.whatsapp || tenant.phone,
          clientCpf: tenant.cpf,
          tenantId: tenant.id,
          installmentNumber: inst.number,
          totalInstallments,
          amount: inst.amount,
          dueDate: inst.dueDate,
          status: statusCategory,
          daysOverdue: Math.max(0, diffDays),
          fineAmount: charges.fineAmount,
          interestAmount: charges.interestAmount,
          totalDueWithCharges: charges.totalDue,
          paidCount,
          pendingCount,
          paidAmount,
          remainingAmount,
          progressPercent,
          progressVisual,
          rawContract: contract,
          rawInstallment: inst,
        });
      });
    });

    // Sort by priority: atrasados first, then vencendo hoje, then proximos 7 dias, then em dia
    return items.sort((a, b) => {
      const order = { atrasado: 0, vencendo_hoje: 1, proximos_7_dias: 2, em_dia: 3 };
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      if (a.status === 'atrasado' && b.status === 'atrasado') {
        return b.daysOverdue - a.daysOverdue;
      }
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [motoContracts, kitnetContracts, motos, kitnets, motoTenants, kitnetTenants, today]);

  // Metric counts
  const atrasados = allBillingItems.filter((i) => i.status === 'atrasado');
  const vencendoHoje = allBillingItems.filter((i) => i.status === 'vencendo_hoje');
  const proximos7Dias = allBillingItems.filter((i) => i.status === 'proximos_7_dias');
  const emDia = allBillingItems.filter((i) => i.status === 'em_dia');

  const totalAtrasadoAmount = atrasados.reduce((acc, i) => safeAdd(acc, i.amount), 0);
  const totalHojeAmount = vencendoHoje.reduce((acc, i) => safeAdd(acc, i.amount), 0);
  const total7DiasAmount = proximos7Dias.reduce((acc, i) => safeAdd(acc, i.amount), 0);

  // Filtered List
  const filteredItems = useMemo(() => {
    return allBillingItems.filter((item) => {
      if (filterType !== 'todos' && item.assetType !== filterType) return false;
      if (activeCategory !== 'todos' && item.status !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.clientName.toLowerCase().includes(q);
        const matchesAsset = item.assetName.toLowerCase().includes(q) || item.assetDetails.toLowerCase().includes(q);
        const matchesCpf = item.clientCpf.includes(q);
        return matchesName || matchesAsset || matchesCpf;
      }
      return true;
    });
  }, [allBillingItems, filterType, activeCategory, searchQuery]);

  return {
    allBillingItems,
    filteredItems,
    atrasados,
    vencendoHoje,
    proximos7Dias,
    emDia,
    totalAtrasadoAmount,
    totalHojeAmount,
    total7DiasAmount,
  };
}
