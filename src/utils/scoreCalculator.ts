import { MotoTenant, KitnetTenant, MotoContract, KitnetContract, ClientScore } from '../types';
import { isInstallmentOverdue } from './formatters';

export function calculateClientScore(
  tenant: MotoTenant | KitnetTenant,
  contracts: (MotoContract | KitnetContract)[]
): ClientScore {
  let punctualityScore = 30; // base
  let longevityScore = 15;
  let documentationScore = 15;
  let penalty = 0;

  // Find all contracts belonging to this tenant
  const userContracts = contracts.filter((c) => c.tenantId === tenant.id);
  
  if (userContracts.length > 0) {
    let totalInstallments = 0;
    let paidOnTime = 0;
    let latePayments = 0;

    userContracts.forEach((contract) => {
      contract.installments.forEach((inst) => {
        if (inst.status === 'pago') {
          totalInstallments++;
          if (inst.paidDate && inst.paidDate <= inst.dueDate) {
            paidOnTime++;
          } else {
            // paid with delay
            paidOnTime += 0.7;
          }
        } else if (isInstallmentOverdue(inst)) {
          totalInstallments++;
          latePayments++;
        }
      });
    });

    if (totalInstallments > 0) {
      const onTimeRate = paidOnTime / totalInstallments;
      punctualityScore = Math.round(onTimeRate * 40);
    } else {
      punctualityScore = 35;
    }

    // Longevity
    const maxInstallmentsPaid = Math.max(
      ...userContracts.map((c) => c.installments.filter((i) => i.status === 'pago').length),
      0
    );
    if (maxInstallmentsPaid >= 12) {
      longevityScore = 25;
    } else if (maxInstallmentsPaid >= 6) {
      longevityScore = 20;
    } else if (maxInstallmentsPaid >= 2) {
      longevityScore = 15;
    } else {
      longevityScore = 10;
    }

    // Penalty for active late payments
    penalty += latePayments * 12;
  } else {
    punctualityScore = 30;
    longevityScore = 10;
  }

  // Documentation completeness
  if ('cnh' in tenant) {
    // Moto tenant
    const mt = tenant as MotoTenant;
    let docPts = 0;
    if (mt.documents.cnhFront && mt.documents.cnhBack) docPts += 8;
    if (mt.documents.proofOfAddress) docPts += 4;
    if (mt.documents.proofOfIncome) docPts += 4;
    if (mt.approvalChecklist.cnhValid) docPts += 4;
    documentationScore = docPts;
  } else {
    // Kitnet tenant
    const kt = tenant as KitnetTenant;
    let docPts = 0;
    if (kt.documents.proofOfIncome) docPts += 8;
    if (kt.documents.proofOfAddress) docPts += 6;
    if (kt.documents.bankStatement || kt.documents.paystub) docPts += 6;
    documentationScore = docPts;
  }

  // Check occurrences penalty
  const occurrences = tenant.occurrences || [];
  const severeOccurrences = occurrences.filter(
    (o) => o.category === 'atraso' || o.category === 'sinistro'
  ).length;
  penalty += severeOccurrences * 8;

  // Bonus for clean negotiations
  const positiveOccurrences = occurrences.filter((o) => o.category === 'pagamento').length;
  const bonus = Math.min(positiveOccurrences * 2, 5);

  let finalScore = Math.max(0, Math.min(100, punctualityScore + longevityScore + documentationScore - penalty + bonus));

  let classification: 'excelente' | 'medio' | 'alto_risco';
  let summary: string;

  if (finalScore >= 80) {
    classification = 'excelente';
    summary = 'Cliente de alta confiabilidade, pagamentos rigorosamente em dia e documentação aprovada.';
  } else if (finalScore >= 50) {
    classification = 'medio';
    summary = 'Cliente com bom relacionamento, mas com histórico pontual de atraso ou documentação parcial.';
  } else {
    classification = 'alto_risco';
    summary = 'Atenção: Cliente com atrasos pendentes ou ocorrências contratuais recentes.';
  }

  return {
    score: finalScore,
    classification,
    factors: {
      punctuality: punctualityScore,
      longevity: longevityScore,
      documentation: documentationScore,
      occurrencesPenalty: penalty,
    },
    summary,
  };
}
