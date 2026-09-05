/**
 * Testes de Sincronização entre Páginas e Isolamento de Dados Demo
 * 
 * Regra 18: INITIAL DATA - Isolamento rigoroso entre dados demo e dados reais.
 * Regra 22: SINCRONIZAÇÃO ENTRE PÁGINAS - Fonte Única da Verdade para cálculos.
 * 
 * Exemplo do Usuário:
 * Se um contrato de Kitnet possui:
 * Aluguel = R$ 2.200
 * Água = R$ 100
 * Internet = R$ 50
 * todas as telas que representam o valor mensal devem chegar ao mesmo resultado:
 * R$ 2.350 sem cada página criar sua própria fórmula.
 */

import {
  getKitnetMonthlyTotal,
  getKitnetMonthlyBreakdown,
  getKitnetAssetMonthlyBase,
  getMotoMonthlyTotal,
  safeAdd,
  safeSub,
} from '../domain/calculations';
import { DashboardService } from '../services/DashboardService';
import { contractService } from '../services/contractService';
import { generateContractSchedule } from '../utils/contractCalculations';
import {
  initialMotos,
  initialKitnets,
  initialMotoContracts,
  initialKitnetContracts,
  initialExpenses,
} from '../utils/initialData';
import {
  isDemoEntity,
  filterOutDemoEntities,
} from '../utils/demoDataSecurity';
import { Kitnet, KitnetContract, Moto, MotoContract } from '../types';

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

console.log('=== TESTE DE SINCRONIZAÇÃO ENTRE PÁGINAS (REGRA 22) ===\n');

// 1. Cenário Oficial do Usuário: Kitnet com Aluguel R$ 2.200, Água R$ 100, Internet R$ 50
const sampleContract: KitnetContract = {
  id: 'contract-sync-test-1',
  kitnetId: 'k-sync-1',
  tenantId: 't-sync-1',
  startDate: '2026-09-01',
  endDate: '2027-08-31',
  dueDay: 10,
  rentValue: 2200,
  waterValue: 100,
  internetValue: 50,
  deposit: 1500,
  status: 'ativo',
  durationMonths: 12,
  installments: [],
};

// 1.1 Cálculo Centralizado Direto
const totalMonthlyFromCalculations = getKitnetMonthlyTotal(sampleContract);
assert(
  totalMonthlyFromCalculations === 2350,
  '1.1 getKitnetMonthlyTotal calcula exatamente R$ 2.350,00 (2200 + 100 + 50)',
  totalMonthlyFromCalculations
);

// 1.2 Breakdown detalhado
const breakdown = getKitnetMonthlyBreakdown(sampleContract);
assert(
  breakdown.rent === 2200 &&
  breakdown.water === 100 &&
  breakdown.internet === 50 &&
  breakdown.total === 2350,
  '1.2 getKitnetMonthlyBreakdown retorna os componentes e a soma correta R$ 2.350,00',
  breakdown
);

// 1.3 Geração de Cronograma via contractService.generateMonthlyPayments
const scheduleFromService = contractService.generateMonthlyPayments(
  sampleContract.startDate,
  sampleContract.durationMonths,
  totalMonthlyFromCalculations,
  sampleContract.dueDay
);

assert(
  scheduleFromService.installments.length === 12,
  '1.3 Cronograma gerou 12 parcelas mensais'
);
assert(
  scheduleFromService.installments.every((i) => i.amount === 2350),
  '1.4 Todas as parcelas do cronograma têm exatamente o valor mensal consolidado de R$ 2.350,00',
  scheduleFromService.installments[0]
);
assert(
  scheduleFromService.totalAgreedValue === 2350 * 12,
  '1.5 Total contratado no cronograma é R$ 28.200,00 (2.350 * 12)',
  scheduleFromService.totalAgreedValue
);

// 1.6 Geração via generateContractSchedule genérico
const genericSchedule = generateContractSchedule({
  startDate: sampleContract.startDate,
  durationMonths: sampleContract.durationMonths,
  paymentFrequency: 'mensal',
  monthlyValue: totalMonthlyFromCalculations,
  dueDay: sampleContract.dueDay,
});
assert(
  genericSchedule.installments.every((i) => i.amount === 2350),
  '1.6 generateContractSchedule produz exatamente R$ 2.350,00 por parcela'
);

// 1.7 Integração no DashboardService
const sampleKitnet: Kitnet = {
  id: 'k-sync-1',
  name: 'Kitnet Premium Test',
  number: '101',
  address: 'Rua das Flores, 100',
  monthlyRentBase: 2200,
  monthlyWaterBase: 100,
  monthlyInternetBase: 50,
  status: 'alugada',
  photos: {},
};

const contractWithInstallments: KitnetContract = {
  ...sampleContract,
  installments: scheduleFromService.installments.map((inst, idx) => ({
    id: `inst-sync-${idx + 1}`,
    number: inst.number,
    totalInstallments: inst.totalInstallments,
    dueDate: inst.dueDate,
    amount: inst.amount,
    status: inst.status,
  })),
};

const dashboardMetrics = DashboardService.calculateConsolidatedMetrics(
  [],
  [sampleKitnet],
  [],
  [contractWithInstallments],
  [],
  '2026-09'
);

assert(
  dashboardMetrics.faturamentoMensalKitnets === 2350,
  '1.7 DashboardService calcula faturamentoMensalKitnets de exatamente R$ 2.350,00',
  dashboardMetrics.faturamentoMensalKitnets
);
assert(
  dashboardMetrics.faturamentoBrutoMensal === 2350,
  '1.8 DashboardService calcula faturamentoBrutoMensal total de exatamente R$ 2.350,00',
  dashboardMetrics.faturamentoBrutoMensal
);
assert(
  dashboardMetrics.receitaAnualProjetada === 2350 * 12,
  '1.9 DashboardService projeta faturamento anual de exatamente R$ 28.200,00 (2.350 * 12)',
  dashboardMetrics.receitaAnualProjetada
);

// 1.10 Base do Ativo (sem contrato)
const assetMonthlyBase = getKitnetAssetMonthlyBase(sampleKitnet);
assert(
  assetMonthlyBase === 2350,
  '1.10 getKitnetAssetMonthlyBase calcula a base do imóvel como R$ 2.350,00',
  assetMonthlyBase
);

// 1.11 Sincronização de Motos
const sampleMotoContract: MotoContract = {
  id: 'moto-sync-test-1',
  motoId: 'm-sync-1',
  tenantId: 't-sync-2',
  startDate: '2026-09-01',
  endDate: '2028-08-31',
  dueDay: 5,
  paymentFrequency: 'semanal',
  weeklyValue: 250,
  monthlyValue: 1083.33,
  deposit: 600,
  status: 'ativo',
  durationMonths: 24,
  totalAgreedValue: 1083.33 * 24,
  installments: [],
};

const motoMonthlyCalculated = getMotoMonthlyTotal(sampleMotoContract);
assert(
  motoMonthlyCalculated === 1083.33,
  '1.11 getMotoMonthlyTotal converte semanal para mensal de forma unificada (R$ 250 * 52/12 = R$ 1.083,33)',
  motoMonthlyCalculated
);

console.log('\n=== TESTE DE AUDITORIA DE DADOS INICIAIS & ISOLAMENTO (REGRA 18) ===\n');

// 2.1 Verificar que todos os dados de demonstração iniciais são identificados como demo
const allInitialKitnetsDemo = initialKitnets.every((k: any) => isDemoEntity(k));
const allInitialMotosDemo = initialMotos.every((m: any) => isDemoEntity(m));
const allInitialMotoContractsDemo = initialMotoContracts.every((c: any) => isDemoEntity(c));
const allInitialKitnetContractsDemo = initialKitnetContracts.every((c: any) => isDemoEntity(c));
const allInitialExpensesDemo = initialExpenses.every((e: any) => isDemoEntity(e));

assert(
  allInitialKitnetsDemo && allInitialMotosDemo,
  '2.1 Todos os ativos iniciais de demonstração são identificados rigorosamente como dados demo por isDemoEntity'
);
assert(
  allInitialMotoContractsDemo && allInitialKitnetContractsDemo,
  '2.2 Todos os contratos iniciais de demonstração são identificados rigorosamente como dados demo por isDemoEntity'
);
assert(
  allInitialExpensesDemo,
  '2.3 Todas as despesas iniciais de demonstração são identificadas rigorosamente como dados demo por isDemoEntity'
);

// 2.4 Simulação de Transição para Dados Reais
// Quando o usuário insere uma kitnet real:
const realKitnet: Kitnet = {
  id: 'real-kitnet-user-12345',
  name: 'Kitnet Real do Usuário',
  number: '01',
  address: 'Rua Principal, 500',
  monthlyRentBase: 2200,
  monthlyWaterBase: 100,
  monthlyInternetBase: 50,
  status: 'disponivel',
  photos: {},
};

// Ao transitar para dados reais, filterOutDemoEntities elimina 100% dos dados demo:
const mixedKitnets = [...initialKitnets, realKitnet];
const purgedKitnets = filterOutDemoEntities(mixedKitnets);

assert(
  purgedKitnets.length === 1 && purgedKitnets[0].id === 'real-kitnet-user-12345',
  '2.4 Purga elimina 100% dos dados demo, restando apenas o registro real do usuário'
);

// 2.5 Garantir que dados reais + dados demo NUNCA se misturam
const hasAnyDemoInPurged = purgedKitnets.some((k: any) => isDemoEntity(k));
assert(
  !hasAnyDemoInPurged,
  '2.5 Garantia estrita: dados reais + dados demo NÃO acontece após transição'
);

console.log(`\n=== RESULTADO FINAL: ${passed} PASSOU / ${failed} FALHOU ===\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ TODAS AS REGRAS 18 E 22 FORAM AUDITADAS E VALIDADAS COM SUCESSO!\n');
}
