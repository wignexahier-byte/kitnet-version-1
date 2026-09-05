/**
 * Testes Automatizados de Cronograma de Contratos e Serviços de Vigência
 * 
 * Cobre:
 * 1. Contrato de 6 meses (6 parcelas, vencimentos determinísticos e valor total correto)
 * 2. Contrato de 12 meses (12 parcelas, verificação de transição de ano e termo final)
 * 3. Contrato de 24 meses (24 parcelas, meses de 28/30/31 dias, ano bissexto)
 * 4. Contrato renovado (+12 meses com geração sequencial e totalInstallments atualizado)
 * 5. Contrato estendido com reajuste de valor de aluguel
 * 6. Testes de integridade (leaseService.ensureFullScheduleIntegrity para contratos incompletos)
 * 7. Testes de imunidade a fuso horário / timezone drift
 */

import {
  generateMonthlyPayments,
  generatePaymentSchedule,
  calculateContractEndDate,
  buildValidDateString,
  renewalService,
  reajusteService,
  leaseService,
} from '../services/contractService';
import { KitnetContract, MotoContract } from '../types';

function runTests() {
  console.log('=== INICIANDO BATERIA DE AUDITORIA DE CRONOGRAMAS E CONTRATOS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
      failed++;
    }
  }

  // TESTE 1: Contrato 6 Meses
  console.log('--- TESTE 1: CONTRATO DE 6 MESES ---');
  const contract6m = generateMonthlyPayments('2026-03-01', 6, 1500, 5);
  assert(contract6m.installments.length === 6, 'Quantidade exata de 6 parcelas geradas', {
    length: contract6m.installments.length,
  });
  assert(contract6m.durationMonths === 6, 'Duração do contrato confirmada como 6 meses');
  assert(contract6m.installments[0].dueDate === '2026-03-05', 'Primeira parcela no dia 2026-03-05');
  assert(contract6m.installments[5].dueDate === '2026-08-05', 'Sexta parcela no dia 2026-08-05');
  assert(contract6m.endDate === '2026-09-01', 'Data de término do contrato calculada corretamente (2026-09-01)');
  assert(
    contract6m.installments.every((i) => i.totalInstallments === 6),
    'Todas as parcelas possuem totalInstallments = 6'
  );

  // TESTE 2: Contrato 12 Meses
  console.log('\n--- TESTE 2: CONTRATO DE 12 MESES ---');
  const contract12m = generateMonthlyPayments('2026-01-15', 12, 1650, 15);
  assert(contract12m.installments.length === 12, 'Quantidade exata de 12 parcelas geradas', {
    length: contract12m.installments.length,
  });
  assert(contract12m.durationMonths === 12, 'Duração confirmada como 12 meses');
  assert(contract12m.installments[0].dueDate === '2026-02-15', 'Primeira parcela no mês 2 (dia 15)');
  assert(contract12m.installments[11].dueDate === '2027-01-15', '12ª parcela em 2027-01-15 (transição correta de ano)');
  assert(contract12m.endDate === '2027-01-15', 'Término em 2027-01-15');

  // TESTE 3: Contrato 24 Meses (com vencimento dia 31 - testando meses com 28/30/31 dias)
  console.log('\n--- TESTE 3: CONTRATO DE 24 MESES & DIAS FINAIS DO MÊS ---');
  const contract24m = generateMonthlyPayments('2026-01-01', 24, 2000, 31);
  assert(contract24m.installments.length === 24, 'Quantidade exata de 24 parcelas geradas');
  assert(contract24m.installments[0].dueDate === '2026-01-31', 'Janeiro com 31 dias');
  assert(contract24m.installments[1].dueDate === '2026-02-28', 'Fevereiro sem overflow (dia 28)');
  assert(contract24m.installments[3].dueDate === '2026-04-30', 'Abril sem overflow (dia 30)');
  assert(contract24m.installments[23].dueDate === '2027-12-31', '24ª parcela em 2027-12-31');

  // TESTE 4: Renovação de Contrato (+12 Meses)
  console.log('\n--- TESTE 4: RENOVAÇÃO DE CONTRATO (+12 MESES) ---');
  const mockInitialContract: KitnetContract = {
    id: 'contract-test-1',
    kitnetId: 'kitnet-1',
    tenantId: 'tenant-1',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    durationMonths: 12,
    rentValue: 1500,
    waterValue: 60,
    deposit: 1500,
    depositStatus: 'retida',
    dueDay: 10,
    status: 'ativo',
    installments: contract12m.installments.map((inst) => ({
      id: `mock-inst-${inst.number}`,
      number: inst.number,
      totalInstallments: 12,
      dueDate: inst.dueDate,
      amount: 1560,
      status: inst.number <= 6 ? 'pago' : 'pendente',
    })),
  };

  const renewedContract = renewalService.renewContract(
    mockInitialContract,
    12,
    1600,
    'Renovação formal com reajuste'
  );

  assert(renewedContract.durationMonths === 24, 'Duração atualizada para 24 meses');
  assert(renewedContract.installments.length === 24, 'Cronograma agora tem 24 parcelas completas');
  assert(
    renewedContract.installments.every((i) => i.totalInstallments === 24),
    'Todas as 24 parcelas têm totalInstallments = 24'
  );
  assert(renewedContract.installments[0].status === 'pago', 'Parcela 1 permanece como paga');
  assert(renewedContract.installments[12].number === 13, 'Primeira parcela da renovação é a número 13');
  assert(renewedContract.installments[12].amount === 1660, 'Valor da parcela 13 com novo aluguel (1600 + 60 água)');
  assert(renewedContract.rentAdjustments?.length === 1, 'Registro de reajuste gravado no histórico');

  // TESTE 4B: Renovação com Internet e Outras Taxas (internetValue + otherFees != 0)
  console.log('\n--- TESTE 4B: RENOVAÇÃO COM INTERNET E TAXAS ADICIONAIS ---');
  const mockContractWithFees: KitnetContract = {
    ...mockInitialContract,
    internetValue: 80,
    otherFees: 40,
  };
  const renewedContractWithFees = renewalService.renewContract(
    mockContractWithFees,
    12,
    1600,
    'Renovação com taxas completas'
  );
  // Esperado: 1600 (aluguel) + 60 (água) + 80 (internet) + 40 (outras taxas) = 1780
  assert(
    renewedContractWithFees.installments[12].amount === 1780,
    'Valor da parcela renovada com internet e taxas adicionais (1600 + 60 + 80 + 40 = 1780)'
  );

  // TESTE 5: Reajuste de Aluguel Pontual
  console.log('\n--- TESTE 5: REAJUSTE DE ALUGUEL PONTUAL ---');
  const adjustedContract = reajusteService.adjustRent(
    mockInitialContract,
    1700,
    'Reajuste IGP-M',
    7
  );
  assert(adjustedContract.rentValue === 1700, 'Valor base do contrato atualizado para 1700');
  assert(adjustedContract.installments[0].amount === 1560, 'Parcelas anteriores mantêm valor histórico');
  assert(adjustedContract.installments[6].amount === 1760, 'Parcelas a partir da 7 recebem o novo valor (+200 diff)');

  // TESTE 6: Recuperação de Integridade (ensureFullScheduleIntegrity)
  console.log('\n--- TESTE 6: RECUPERAÇÃO DE CONTRATOS TRUNCADOS (7 -> 12 parcelas) ---');
  const truncatedContract: KitnetContract = {
    ...mockInitialContract,
    installments: mockInitialContract.installments.slice(0, 7), // Apenas 7 parcelas
  };
  const restoredContract = leaseService.ensureFullScheduleIntegrity(truncatedContract);
  assert(
    restoredContract.installments.length === 12,
    'Contrato truncado com 7 parcelas restaurado com precisão para 12 parcelas',
    { restoredLength: restoredContract.installments.length }
  );
  assert(
    restoredContract.installments[11].number === 12,
    '12ª parcela gerada com numeração sequencial correta'
  );

  // TESTE 7: Imunidade a Fuso Horário
  console.log('\n--- TESTE 7: IMUNIDADE A FUSO HORÁRIO (TIMEZONE SAFETY) ---');
  const dateFeb = buildValidDateString(2026, 2, 28);
  assert(dateFeb === '2026-02-28', 'Fevereiro 2026 termina em 28');
  const dateLeap = buildValidDateString(2028, 2, 29);
  assert(dateLeap === '2028-02-29', 'Fevereiro 2028 (bissexto) termina em 29');

  console.log(`\n==================================================`);
  console.log(`RESULTADO DA AUDITORIA: ${passed} PASSOU, ${failed} FALHOU`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
