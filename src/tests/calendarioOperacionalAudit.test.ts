/**
 * Auditoria Completa do Calendário Operacional e Fluxo Mensal
 * Valida a exatidão dos recebíveis, contas a pagar e consistência dos centavos.
 */

import { initialMotoContracts, initialKitnetContracts, initialExpenses } from '../utils/initialData';
import { safeAdd, safeSub, roundCurrency } from '../utils/financialMath';

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

console.log('--- INICIANDO AUDITORIA DO CALENDÁRIO OPERACIONAL ---');

// 1. Auditoria de Setembro / 2026
const targetMonthSetembro = '2026-09';
const motoInstallmentsSetembro = initialMotoContracts.flatMap((c) =>
  c.installments.filter((i) => i.dueDate.startsWith(targetMonthSetembro))
);

const sumMotos = motoInstallmentsSetembro.reduce((acc, i) => safeAdd(acc, i.amount), 0);
assert(
  motoInstallmentsSetembro.length === 2 && sumMotos === 2700,
  '1. Parcelas de Moto em Setembro/2026 (Honda CG 160 = R$ 1.250,00 + Yamaha Fazer = R$ 1.450,00 = R$ 2.700,00)'
);

const kitnetInstallmentsSetembro = initialKitnetContracts.flatMap((c) =>
  c.installments.filter((i) => i.dueDate.startsWith(targetMonthSetembro))
);

const sumKitnets = kitnetInstallmentsSetembro.reduce((acc, i) => safeAdd(acc, i.amount), 0);
assert(
  kitnetInstallmentsSetembro.length === 2 && sumKitnets === 3260,
  '2. Parcelas de Kitnets em Setembro/2026 (Kitnet 01 = R$ 1.560,00 + Kitnet 02 = R$ 1.700,00 = R$ 3.260,00)'
);

const totalSetembro = safeAdd(sumMotos, sumKitnets);
assert(
  totalSetembro === 5960.00,
  `3. Total Geral a Receber em Setembro/2026 é exatamente R$ 5.960,00 (Obtido: R$ ${totalSetembro.toFixed(2)})`
);

// 2. Auditoria de Contas/Despesas de Agosto / 2026
const targetMonthAgosto = '2026-08';
const augustExpenses = initialExpenses.filter((e) => (e.dueDate || e.date || '').startsWith(targetMonthAgosto));
const totalDespesasAgosto = augustExpenses.reduce((acc, e) => safeAdd(acc, e.amount), 0);

assert(
  augustExpenses.length === 6 && totalDespesasAgosto === 1267.80,
  `4. Total de Contas em Agosto/2026 é exatamente R$ 1.267,80 (Obtido: R$ ${totalDespesasAgosto.toFixed(2)})`
);

// 3. Auditoria de Ausência de Contas Não Cadastradas em Setembro / 2026
const setembroExpenses = initialExpenses.filter((e) => (e.dueDate || e.date || '').startsWith(targetMonthSetembro));
const totalDespesasSetembro = setembroExpenses.reduce((acc, e) => safeAdd(acc, e.amount), 0);

assert(
  setembroExpenses.length === 0 && totalDespesasSetembro === 0.00,
  `5. Total de Contas em Setembro/2026 é R$ 0,00 (Nenhuma conta cadastrada para este mês ainda)`
);

// 4. Teste de Consistência de Ponto Flutuante em Todos os 12 Meses
const months = [
  '2026-01', '2026-02', '2026-03', '2026-04',
  '2026-05', '2026-06', '2026-07', '2026-08',
  '2026-09', '2026-10', '2026-11', '2026-12'
];

let floatErrors = 0;
months.forEach((ym) => {
  const motoInst = initialMotoContracts.flatMap((c) => c.installments.filter((i) => i.dueDate.startsWith(ym)));
  const kitnetInst = initialKitnetContracts.flatMap((c) => c.installments.filter((i) => i.dueDate.startsWith(ym)));
  const expList = initialExpenses.filter((e) => (e.dueDate || e.date || '').startsWith(ym));

  const totalReceitas = safeAdd(
    motoInst.reduce((acc, i) => safeAdd(acc, i.amount), 0),
    kitnetInst.reduce((acc, i) => safeAdd(acc, i.amount), 0)
  );

  const totalDespesas = expList.reduce((acc, e) => safeAdd(acc, e.amount), 0);
  const saldo = safeSub(totalReceitas, totalDespesas);

  if (roundCurrency(saldo) !== saldo || !Number.isFinite(saldo)) {
    floatErrors++;
  }
});

assert(floatErrors === 0, '6. Consistência matemática de centavos em todos os 12 meses do ano');

console.log(`\n========================================`);
console.log(`RESULTADO DA AUDITORIA: ${passed} PASSOU / ${failed} FALHOU`);
console.log(`========================================`);
