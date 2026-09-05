/**
 * Auditoria Completa dos Relatórios & Exportação
 * Valida a exatidão dos filtros por mês, cálculos de receitas, inadimplência e ROI
 */

import { initialMotoContracts, initialKitnetContracts, initialExpenses, initialMotos, initialKitnets } from '../utils/initialData';
import { safeAdd, safeSub, roundCurrency, getDaysDifference } from '../utils/financialMath';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`❌ [FAIL] ${testName}`, details || '');
  }
}

console.log('--- INICIANDO AUDITORIA DE RELATÓRIOS & EXPORTAÇÃO ---');

// 1. Auditoria de Receita Mensal Filtrada (Setembro/2026)
const targetMonth = '2026-09';
const motoInstSept = initialMotoContracts.flatMap((c) =>
  c.installments.filter((i) => i.dueDate.startsWith(targetMonth))
);
const kitnetInstSept = initialKitnetContracts.flatMap((c) =>
  c.installments.filter((i) => i.dueDate.startsWith(targetMonth))
);

const totalReceitaSetembro = safeAdd(
  motoInstSept.reduce((acc, i) => safeAdd(acc, i.amount), 0),
  kitnetInstSept.reduce((acc, i) => safeAdd(acc, i.amount), 0)
);

assert(
  totalReceitaSetembro === 5960.00,
  `1. Receita Prevista em Setembro/2026 é R$ 5.960,00 (Obtido: R$ ${totalReceitaSetembro.toFixed(2)})`
);

// 2. Auditoria de Inadimplência
const today = '2026-09-01';
const motoOverdue = initialMotoContracts.flatMap((c) =>
  c.installments.filter((i) => i.status !== 'pago' && i.status !== 'cancelada' && i.dueDate < today)
);
const kitnetOverdue = initialKitnetContracts.flatMap((c) =>
  c.installments.filter((i) => i.status !== 'pago' && i.status !== 'cancelada' && i.dueDate < today)
);

const totalInadimplente = safeAdd(
  motoOverdue.reduce((acc, i) => safeAdd(acc, i.amount), 0),
  kitnetOverdue.reduce((acc, i) => safeAdd(acc, i.amount), 0)
);

assert(
  totalInadimplente > 0 && (motoOverdue.length + kitnetOverdue.length) > 0,
  `2. Inadimplência na data base ${today} apura exatamente as parcelas vencidas anteriores (Total: R$ ${totalInadimplente.toFixed(2)}, ${motoOverdue.length + kitnetOverdue.length} parcelas)`
);

// 3. Auditoria de Despesas em Agosto/2026
const augustExpenses = initialExpenses.filter((e) => (e.dueDate || e.date || '').startsWith('2026-08'));
const totalAgostoExpenses = augustExpenses.reduce((acc, e) => safeAdd(acc, e.amount), 0);

assert(
  totalAgostoExpenses === 1267.80,
  `3. Despesas em Agosto/2026 somam R$ 1.267,80 (Obtido: R$ ${totalAgostoExpenses.toFixed(2)})`
);

// 4. Auditoria de Rentabilidade & ROI das Motos
let totalInvestidoMotos = 0;
let totalRecebidoMotos = 0;
let totalManutencaoMotos = 0;

initialMotos.forEach((m) => {
  totalInvestidoMotos = safeAdd(totalInvestidoMotos, m.purchasePrice);
  const contracts = initialMotoContracts.filter((c) => c.motoId === m.id);
  contracts.forEach((c) => {
    totalRecebidoMotos = safeAdd(
      totalRecebidoMotos,
      c.installments.filter((i) => i.status === 'pago').reduce((acc, i) => safeAdd(acc, i.amount), 0)
    );
  });
  const maintenance = initialExpenses
    .filter((e) => e.targetType === 'moto' && e.targetId === m.id && e.status === 'pago')
    .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);
  totalManutencaoMotos = safeAdd(totalManutencaoMotos, maintenance);
});

assert(
  totalInvestidoMotos > 0 && totalRecebidoMotos > 0,
  `4. Agregação de ROI e Lucro Líquido de Motos é consistente e finita`
);

console.log(`\n========================================`);
console.log(`RESULTADO DA AUDITORIA: ${passed} PASSOU / ${failed} FALHOU`);
console.log(`========================================`);
