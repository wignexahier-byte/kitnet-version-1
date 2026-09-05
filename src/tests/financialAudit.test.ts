/**
 * Bateria de Testes de Validação Matemática e Auditoria Financeira
 * Executado via tsx para comprovar a precisão e consistência das regras de negócio.
 */

import {
  roundCurrency,
  safeAdd,
  safeSub,
  toCents,
  fromCents,
  calculateOverdueCharges,
  calculateEarlyTermination,
  calculateDepositSettlement,
  distributeInstallments,
} from '../utils/financialMath';
import { generateContractSchedule, generateMonthlyPayments } from '../utils/contractCalculations';
import { DashboardService } from '../services/DashboardService';
import { Moto, Kitnet, MotoContract, KitnetContract, Expense } from '../types';

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

console.log('=== INICIANDO AUDITORIA FINANCEIRA E TESTES MATEMÁTICOS ===\n');

// 1. Precisão de Ponto Flutuante (0.1 + 0.2 = 0.30)
assert(safeAdd(0.1, 0.2) === 0.3, 'safeAdd(0.1, 0.2) deve ser exatamente 0.30 e não 0.30000000000000004');
assert(safeSub(1.0, 0.9) === 0.1, 'safeSub(1.0, 0.9) deve ser exatamente 0.10');
assert(roundCurrency(10.005) === 10.01, 'roundCurrency(10.005) deve arredondar para cima 10.01');
assert(toCents(1250.75) === 125075, 'toCents(1250.75) deve retornar 125075 centavos');
assert(fromCents(125075) === 1250.75, 'fromCents(125075) deve retornar 1250.75');

// 2. Divisão de Parcelas sem perda de centavos
const dist3 = distributeInstallments(100.0, 3);
const sumDist3 = dist3.reduce((a, b) => safeAdd(a, b), 0);
assert(sumDist3 === 100.0, 'Soma das parcelas divididas (R$ 100 em 3x: 33.33, 33.33, 33.34) deve ser exatamente R$ 100.00', dist3);
assert(dist3[2] === 33.34, 'Última parcela deve absorver o centavo residual (33.34)', dist3);

// 3. Encargos Moratórios (Multa 2% + Juros 1% a.m. pro-rata)
const overdue = calculateOverdueCharges({
  principal: 1000.0,
  dueDate: '2026-08-01',
  referenceDate: '2026-08-31', // 30 dias de atraso
  fixedFinePercent: 0.02, // 2% multa = R$ 20.00
  interestMonthlyRate: 0.01, // 1% ao mês por 30 dias = R$ 10.00
});
assert(overdue.fineAmount === 20.0, 'Multa de 2% sobre R$ 1000 deve ser R$ 20.00', overdue);
assert(overdue.interestAmount === 10.0, 'Juros de 1% em 30 dias sobre R$ 1000 deve ser R$ 10.00', overdue);
assert(overdue.totalDue === 1030.0, 'Total devido com encargos deve ser R$ 1030.00', overdue);
assert(overdue.overdueDays === 30, 'Dias em atraso deve ser 30', overdue);

// 4. Rescisão Proporcional (Art. 4º Lei 8.245/91)
const earlyTerm = calculateEarlyTermination({
  monthlyRent: 1200.0,
  totalContractMonths: 12,
  completedMonths: 6, // 6 meses restantes
  deposit: 1200.0,
  penaltyMonths: 1, // 1 aluguel de multa integral = R$ 1200
});
assert(earlyTerm.proportionalPenalty === 600.0, 'Multa proporcional para 6/12 meses deve ser R$ 600.00', earlyTerm);
assert(earlyTerm.balanceToRefund === 600.0, 'Saldo de caução a devolver deve ser R$ 600.00', earlyTerm);

// 5. Liquidação de Caução com Reparos e Atrasos
const depositSettlement = calculateDepositSettlement({
  initialDeposit: 1500.0,
  unpaidInstallmentsTotal: 500.0,
  damagesTotal: 300.0,
  cleaningFee: 150.0,
  otherDebts: 50.0,
});
assert(depositSettlement.totalDeductions === 1000.0, 'Total de deduções deve ser R$ 1000.00', depositSettlement);
assert(depositSettlement.refundAmount === 500.0, 'Saldo a restituir ao locatário deve ser R$ 500.00', depositSettlement);
assert(depositSettlement.remainingDebt === 0, 'Dívida remanescente deve ser 0', depositSettlement);

// 6. Cronograma Mensal e Bissexto
const scheduleMensal = generateContractSchedule({
  startDate: '2026-01-31',
  durationMonths: 3,
  paymentFrequency: 'mensal',
  monthlyValue: 800,
  dueDay: 31,
});
assert(scheduleMensal.totalInstallments === 3, 'Cronograma mensal de 3 meses deve ter 3 parcelas');
assert(scheduleMensal.installments[0].dueDate === '2026-02-28', 'Fevereiro deve ajustar automaticamente para dia 28', scheduleMensal.installments);
assert(scheduleMensal.installments[1].dueDate === '2026-03-31', 'Março deve vencer no dia 31', scheduleMensal.installments);

// 7. Cronograma Semanal
const scheduleSemanal = generateContractSchedule({
  startDate: '2026-08-03', // Segunda-feira
  durationMonths: 1, // ~4 semanas
  paymentFrequency: 'semanal',
  weeklyValue: 200,
  dueDayOfWeek: 1, // Segunda-feira
});
assert(scheduleSemanal.installments.length === 4, '1 mês semanal deve gerar 4 parcelas semanais', scheduleSemanal);
assert(scheduleSemanal.totalAgreedValue === 800, 'Total acordado semanal deve ser R$ 800.00', scheduleSemanal);

// 8. Teste de Consistência no DashboardService
const mockMotos: Moto[] = [
  {
    id: 'm1',
    brand: 'Honda',
    model: 'CG 160 Fan',
    year: 2024,
    plate: 'ABC1D23',
    chassi: '9C2KC1234567890',
    renavam: '12345678901',
    color: 'Vermelha',
    currentKm: 15000,
    purchasePrice: 15000,
    purchaseDate: '2024-01-01',
    status: 'alugada',
    photos: {},
    documents: {},
    kmLogs: [],
  }
];
const mockKitnets: Kitnet[] = [
  {
    id: 'k1',
    name: 'Kitnet Central',
    number: '01',
    address: 'Rua A, 100',
    monthlyRentBase: 800,
    monthlyWaterBase: 50,
    status: 'alugada',
    photos: {},
  }
];
const mockMotoContracts: MotoContract[] = [
  {
    id: 'mc1',
    motoId: 'm1',
    tenantId: 't1',
    status: 'ativo',
    startDate: '2026-08-01',
    endDate: '2028-08-01',
    durationMonths: 24,
    paymentFrequency: 'mensal',
    monthlyValue: 850,
    dueDay: 10,
    totalAgreedValue: 20400,
    deposit: 600,
    depositStatus: 'retida',
    installments: [
      { id: 'i1', number: 1, totalInstallments: 24, dueDate: '2026-08-10', amount: 850, status: 'pago', paidDate: '2026-08-10' },
      { id: 'i2', number: 2, totalInstallments: 24, dueDate: '2026-09-10', amount: 850, status: 'pendente' }
    ],
  }
];
const mockKitnetContracts: KitnetContract[] = [
  {
    id: 'kc1',
    kitnetId: 'k1',
    tenantId: 'tk1',
    status: 'ativo',
    startDate: '2026-08-01',
    endDate: '2027-08-01',
    durationMonths: 12,
    rentValue: 800,
    waterValue: 50,
    deposit: 800,
    depositStatus: 'retida',
    dueDay: 10,
    installments: [
      { id: 'ki1', number: 1, totalInstallments: 12, dueDate: '2026-08-10', amount: 850, status: 'pago', paidDate: '2026-08-10' },
      { id: 'ki2', number: 2, totalInstallments: 12, dueDate: '2026-09-10', amount: 850, status: 'pendente' }
    ],
  }
];
const mockExpenses: Expense[] = [
  { id: 'e1', title: 'Seguro Moto', category: 'seguro', targetType: 'moto', targetId: 'm1', amount: 100, dueDate: '2026-08-15', status: 'pago', recurrence: 'mensal' },
  { id: 'e2', title: 'Conta Água', category: 'agua', targetType: 'kitnet', targetId: 'k1', amount: 50, dueDate: '2026-08-15', status: 'pago', recurrence: 'mensal' },
];

const consolidated = DashboardService.calculateConsolidatedMetrics(
  mockMotos,
  mockKitnets,
  mockMotoContracts,
  mockKitnetContracts,
  mockExpenses,
  '2026-08'
);

assert(consolidated.patrimonioTotalAvaliado === 15000, 'Patrimônio total avaliado deve ser R$ 15.000,00 (capital real em motos da frota)', consolidated.patrimonioTotalAvaliado);
assert(consolidated.faturamentoBrutoMensal === 1700, 'Faturamento bruto mensal deve ser R$ 1.700,00 (850 moto + 850 kitnet)', consolidated.faturamentoBrutoMensal);
assert(consolidated.totalReceitaRecebida === 1700, 'Receita total recebida deve ser R$ 1.700,00', consolidated.totalReceitaRecebida);
assert(consolidated.totalDespesas === 150, 'Total de despesas deve ser R$ 150,00 (100 moto + 50 kitnet)', consolidated.totalDespesas);
assert(consolidated.lucroLiquidoMensal === 1550, 'Lucro líquido mensal deve ser R$ 1.550,00 (1700 - 150)', consolidated.lucroLiquidoMensal);
assert(consolidated.totalCaucoesRetidas === 1400, 'Total de cauções retidas deve ser R$ 1.400,00 (600 + 800)', consolidated.totalCaucoesRetidas);

// --- VISTORIA DA BASE REAL REGISTRADA NO SISTEMA ---
import {
  initialMotos as liveMotos,
  initialKitnets as liveKitnets,
  initialMotoContracts as liveMotoContracts,
  initialKitnetContracts as liveKitnetContracts,
  initialExpenses as liveExpenses
} from '../utils/initialData';

const liveConsolidated = DashboardService.calculateConsolidatedMetrics(
  liveMotos,
  liveKitnets,
  liveMotoContracts,
  liveKitnetContracts,
  liveExpenses
);

// 1. Motos Alugadas e Faturamento
assert(liveConsolidated.motosAlugadas === 2, 'Total de motos alugadas deve ser 2', liveConsolidated.motosAlugadas);
assert(liveConsolidated.faturamentoMensalMotos === 2700, 'Faturamento mensal de motos deve ser R$ 2.700,00 (1250 Fan + 1450 Fazer)', liveConsolidated.faturamentoMensalMotos);

// 2. Kitnets Alugadas e Faturamento
assert(liveConsolidated.kitnetsAlugadas === 2, 'Total de kitnets alugadas deve ser 2', liveConsolidated.kitnetsAlugadas);
assert(liveConsolidated.faturamentoMensalKitnets === 3260, 'Faturamento mensal de kitnets deve ser R$ 3.260,00 (1560 Kitnet 1 + 1700 Kitnet 2)', liveConsolidated.faturamentoMensalKitnets);

// 3. Faturamento Bruto Mensal Geral (Mês)
assert(liveConsolidated.faturamentoBrutoMensal === 5960, 'Faturamento bruto mensal total deve ser R$ 5.960,00 (2700 motos + 3260 kitnets)', liveConsolidated.faturamentoBrutoMensal);

// 4. Faturamento Projetado no Ano (12 meses)
assert(liveConsolidated.receitaAnualProjetada === 71520, 'Faturamento anual projetado deve ser R$ 71.520,00 (5960 * 12)', liveConsolidated.receitaAnualProjetada);

// 5. Total de Contratos Ativos
assert(liveConsolidated.totalContratosAtivos === 4, 'Total de contratos ativos deve ser 4 (2 motos + 2 kitnets)', liveConsolidated.totalContratosAtivos);

// 6. Teste de Estado Zerado (quando todos os bens forem excluídos)
const emptyConsolidated = DashboardService.calculateConsolidatedMetrics([], [], [], [], []);
assert(emptyConsolidated.totalMotos === 0, 'Total de motos sem dados deve ser 0', emptyConsolidated.totalMotos);
assert(emptyConsolidated.totalKitnets === 0, 'Total de kitnets sem dados deve ser 0', emptyConsolidated.totalKitnets);
assert(emptyConsolidated.patrimonioTotalAvaliado === 0, 'Patrimônio avaliado sem dados deve ser R$ 0,00', emptyConsolidated.patrimonioTotalAvaliado);
assert(emptyConsolidated.faturamentoBrutoMensal === 0, 'Faturamento bruto sem dados deve ser R$ 0,00', emptyConsolidated.faturamentoBrutoMensal);
assert(emptyConsolidated.receitaAnualProjetada === 0, 'Faturamento anual sem dados deve ser R$ 0,00', emptyConsolidated.receitaAnualProjetada);
assert(emptyConsolidated.totalAReceber === 0, 'Total a receber sem dados deve ser R$ 0,00', emptyConsolidated.totalAReceber);
assert(emptyConsolidated.totalInadimplenciaGeral === 0, 'Inadimplência sem dados deve ser R$ 0,00', emptyConsolidated.totalInadimplenciaGeral);
assert(emptyConsolidated.totalContratosAtivos === 0, 'Contratos ativos sem dados deve ser 0', emptyConsolidated.totalContratosAtivos);

// 7. Teste de Baixa em Pagamentos Semanais e Mensais (Motos e Kitnets)
const motoContractsWithPending: MotoContract[] = [
  {
    ...mockMotoContracts[0],
    installments: [
      { id: 'i1', number: 1, totalInstallments: 4, dueDate: '2026-09-07', amount: 250, status: 'pendente' },
      { id: 'i2', number: 2, totalInstallments: 4, dueDate: '2026-09-14', amount: 250, status: 'pendente' },
      { id: 'i3', number: 3, totalInstallments: 4, dueDate: '2026-09-21', amount: 250, status: 'pendente' },
      { id: 'i4', number: 4, totalInstallments: 4, dueDate: '2026-09-28', amount: 250, status: 'pendente' },
    ],
  },
];

const kitnetContractsWithPending: KitnetContract[] = [
  {
    ...mockKitnetContracts[0],
    installments: [
      { id: 'ki1', number: 1, totalInstallments: 12, dueDate: '2026-09-10', amount: 850, status: 'pendente' },
    ],
  },
];

const initialCalculated = DashboardService.calculateConsolidatedMetrics(
  mockMotos,
  mockKitnets,
  motoContractsWithPending,
  kitnetContractsWithPending,
  [],
  '2026-08'
);

assert(initialCalculated.receitaMesAtualTotal === 0, 'Antes de dar baixa, receita recebida do mês deve ser R$ 0,00', initialCalculated.receitaMesAtualTotal);
assert(initialCalculated.totalAReceber === 1850, 'Total a receber antes da baixa deve ser R$ 1.850,00 (1000 motos + 850 kitnet)', initialCalculated.totalAReceber);

// Dar baixa na primeira parcela semanal da moto (R$ 250) recebida hoje em agosto
const motoContractsAfter1stPayment: MotoContract[] = [
  {
    ...motoContractsWithPending[0],
    installments: [
      { ...motoContractsWithPending[0].installments[0], status: 'pago', paidDate: '2026-08-31' },
      ...motoContractsWithPending[0].installments.slice(1),
    ],
  },
];

const calculatedAfter1st = DashboardService.calculateConsolidatedMetrics(
  mockMotos,
  mockKitnets,
  motoContractsAfter1stPayment,
  kitnetContractsWithPending,
  [],
  '2026-08'
);

assert(calculatedAfter1st.receitaMesAtualTotal === 250, 'Após dar baixa de R$ 250 na moto, a receita no Dashboard deve subir para R$ 250,00', calculatedAfter1st.receitaMesAtualTotal);
assert(calculatedAfter1st.receitaMesAtualMotos === 250, 'Receita do mês de motos deve ser R$ 250,00', calculatedAfter1st.receitaMesAtualMotos);
assert(calculatedAfter1st.totalAReceber === 1600, 'Total a receber deve diminuir para R$ 1.600,00 (1850 - 250)', calculatedAfter1st.totalAReceber);

// Dar baixa no aluguel mensal da kitnet (R$ 850) recebida hoje em agosto
const kitnetContractsAfterPayment: KitnetContract[] = [
  {
    ...kitnetContractsWithPending[0],
    installments: [
      { ...kitnetContractsWithPending[0].installments[0], status: 'pago', paidDate: '2026-08-31' },
    ],
  },
];

const calculatedAfterBoth = DashboardService.calculateConsolidatedMetrics(
  mockMotos,
  mockKitnets,
  motoContractsAfter1stPayment,
  kitnetContractsAfterPayment,
  [],
  '2026-08'
);

assert(calculatedAfterBoth.receitaMesAtualTotal === 1100, 'Após dar baixa na kitnet (R$ 850) + moto (R$ 250), a receita no Dashboard deve subir para R$ 1.100,00', calculatedAfterBoth.receitaMesAtualTotal);
assert(calculatedAfterBoth.receitaMesAtualKitnets === 850, 'Receita de kitnets no mês deve subir para R$ 850,00', calculatedAfterBoth.receitaMesAtualKitnets);
assert(calculatedAfterBoth.totalAReceber === 750, 'Total a receber deve cair para R$ 750,00 restantes', calculatedAfterBoth.totalAReceber);

// --- TESTE 8: CENÁRIO DO USUÁRIO - KITNET R$ 2.200 + CAUÇÃO R$ 1.400 ---
console.log('\n--- TESTE 8: CENÁRIO REAL - KITNET R$ 2.200 + CAUÇÃO R$ 1.400 ---');
const userSchedule = generateMonthlyPayments('2026-08-31', 12, 2200, 10);
assert(userSchedule.installments.length === 12, 'Cronograma gerou exatamente 12 parcelas');
assert(userSchedule.installments[0].amount === 2200, '1ª Parcela deve ser o valor integral de R$ 2.200,00 (sem fração pro-rata indesejada)', userSchedule.installments[0].amount);
assert(userSchedule.installments.every((i) => i.amount === 2200), 'Todas as 12 parcelas devem ter o valor integral de R$ 2.200,00');
assert(userSchedule.totalAgreedValue === 26400, 'Valor total contratado deve ser R$ 26.400,00 (2200 * 12)', userSchedule.totalAgreedValue);

const userDeposit = 1400;
const firstInstallmentPaid = userSchedule.installments[0].amount;
const totalInitialReceived = safeAdd(firstInstallmentPaid, userDeposit);
assert(totalInitialReceived === 3600, 'Total recebido no cadastro (1º Aluguel R$ 2.200 + Caução R$ 1.400) deve ser exatamente R$ 3.600,00', totalInitialReceived);

console.log(`\n=== RESULTADO DA AUDITORIA: ${passed} PASSOU / ${failed} FALHOU ===`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ TODOS OS CÁLCULOS FORAM RIGOROSAMENTE VALIDADOS E APROVADOS COM SUCESSO!\n');
}
