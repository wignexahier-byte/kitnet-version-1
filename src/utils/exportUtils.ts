import { formatCurrency, formatDate, getTodayLocalDateString, isInstallmentOverdue } from './formatters';
import { Moto, Kitnet, MotoContract, KitnetContract, MotoTenant, KitnetTenant, Expense } from '../types';
import { safeAdd, safeSub, roundCurrency, getDaysDifference } from './financialMath';

function downloadCSVFile(filename: string, rows: (string | number)[][]) {
  const csvContent =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""';
            const str = String(cell);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(';')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Relatório Mensal de Receitas & Cobranças
 * Filtra estritamente pelo mês selecionado (competência) ou histórico consolidado.
 */
export function exportMonthlyRevenueExcel(
  monthYear: string,
  motoContracts: MotoContract[],
  kitnetContracts: KitnetContract[],
  motos: Moto[],
  kitnets: Kitnet[],
  motoTenants: MotoTenant[],
  kitnetTenants: KitnetTenant[]
) {
  const isAll = !monthYear || monthYear === 'all';
  const today = getTodayLocalDateString();

  const rows: (string | number)[][] = [
    ['RELATÓRIO DE RECEITAS & COBRANÇAS — ERP GESTÃO PATRIMONIAL'],
    ['Competência:', isAll ? 'Todo o Período' : monthYear],
    ['Data de Extração:', formatDate(today)],
    [],
    [
      'TIPO',
      'ATIVO / BEM',
      'CLIENTE / LOCATÁRIO',
      'PARCELA',
      'VENCIMENTO',
      'VALOR (R$)',
      'STATUS',
      'DATA PAGAMENTO',
      'FORMA DE PAGAMENTO'
    ]
  ];

  let totalPrevisto = 0;
  let totalRecebido = 0;
  let totalAtrasado = 0;
  let totalPendente = 0;

  // Motos
  motoContracts.forEach((c) => {
    const moto = motos.find((m) => m.id === c.motoId);
    const tenant = motoTenants.find((t) => t.id === c.tenantId);

    // Caução no mês de início
    if (c.deposit && c.deposit > 0 && c.depositStatus !== 'devolvida') {
      const matchDepositMonth = isAll || (c.startDate && c.startDate.startsWith(monthYear));
      if (matchDepositMonth) {
        totalPrevisto = safeAdd(totalPrevisto, c.deposit);
        totalRecebido = safeAdd(totalRecebido, c.deposit);
        rows.push([
          'Motos',
          moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Moto',
          tenant ? tenant.fullName : 'Locatário',
          'Caução de Entrada',
          c.startDate ? formatDate(c.startDate) : '-',
          c.deposit.toFixed(2),
          'PAGO (CAUÇÃO)',
          c.startDate ? formatDate(c.startDate) : '-',
          'PIX / Depósito'
        ]);
      }
    }

    c.installments.forEach((inst) => {
      const matchMonth = isAll || inst.dueDate.startsWith(monthYear) || (inst.paidDate && inst.paidDate.startsWith(monthYear));
      if (!matchMonth) return;

      const isOverdue = isInstallmentOverdue(inst);
      const displayStatus = inst.status === 'pago' ? 'PAGO' : isOverdue ? 'ATRASADO' : 'PENDENTE';

      totalPrevisto = safeAdd(totalPrevisto, inst.amount);
      if (inst.status === 'pago') {
        totalRecebido = safeAdd(totalRecebido, inst.amount);
      } else if (isOverdue) {
        totalAtrasado = safeAdd(totalAtrasado, inst.amount);
      } else {
        totalPendente = safeAdd(totalPendente, inst.amount);
      }

      rows.push([
        'Motos',
        moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Moto',
        tenant ? tenant.fullName : 'Locatário',
        `${inst.number}/${c.durationMonths}`,
        formatDate(inst.dueDate),
        inst.amount.toFixed(2),
        displayStatus,
        inst.paidDate ? formatDate(inst.paidDate) : '-',
        inst.paymentMethod || '-'
      ]);
    });
  });

  // Kitnets
  kitnetContracts.forEach((c) => {
    const kitnet = kitnets.find((k) => k.id === c.kitnetId);
    const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

    // Caução no mês de início
    if (c.deposit && c.deposit > 0 && (c as any).depositStatus !== 'devolvida') {
      const matchDepositMonth = isAll || (c.startDate && c.startDate.startsWith(monthYear));
      if (matchDepositMonth) {
        totalPrevisto = safeAdd(totalPrevisto, c.deposit);
        totalRecebido = safeAdd(totalRecebido, c.deposit);
        rows.push([
          'Kitnets',
          kitnet ? `${kitnet.name} (Unidade ${kitnet.number})` : 'Kitnet',
          tenant ? tenant.fullName : 'Locatário',
          'Caução de Entrada',
          c.startDate ? formatDate(c.startDate) : '-',
          c.deposit.toFixed(2),
          'PAGO (CAUÇÃO)',
          c.startDate ? formatDate(c.startDate) : '-',
          'PIX / Depósito'
        ]);
      }
    }

    c.installments.forEach((inst) => {
      const matchMonth = isAll || inst.dueDate.startsWith(monthYear) || (inst.paidDate && inst.paidDate.startsWith(monthYear));
      if (!matchMonth) return;

      const isOverdue = isInstallmentOverdue(inst);
      const displayStatus = inst.status === 'pago' ? 'PAGO' : isOverdue ? 'ATRASADO' : 'PENDENTE';

      totalPrevisto = safeAdd(totalPrevisto, inst.amount);
      if (inst.status === 'pago') {
        totalRecebido = safeAdd(totalRecebido, inst.amount);
      } else if (isOverdue) {
        totalAtrasado = safeAdd(totalAtrasado, inst.amount);
      } else {
        totalPendente = safeAdd(totalPendente, inst.amount);
      }

      rows.push([
        'Kitnets',
        kitnet ? `${kitnet.name} (Unidade ${kitnet.number})` : 'Kitnet',
        tenant ? tenant.fullName : 'Locatário',
        `${inst.number}/${c.durationMonths}`,
        formatDate(inst.dueDate),
        inst.amount.toFixed(2),
        displayStatus,
        inst.paidDate ? formatDate(inst.paidDate) : '-',
        inst.paymentMethod || '-'
      ]);
    });
  });

  // Linhas de Fechamento e Totais
  rows.push([]);
  rows.push(['RESUMO FINANCEIRO DA COMPETÊNCIA']);
  rows.push(['Total Previsto Bruto (R$)', totalPrevisto.toFixed(2)]);
  rows.push(['Total Efetivamente Recebido (R$)', totalRecebido.toFixed(2)]);
  rows.push(['Total Pendente / A Vencer (R$)', totalPendente.toFixed(2)]);
  rows.push(['Total Inadimplente / Em Atraso (R$)', totalAtrasado.toFixed(2)]);

  downloadCSVFile(`relatorio_receitas_${isAll ? 'consolidado' : monthYear.replace('/', '_')}`, rows);
}

/**
 * 2. Relatório de Despesas & Contas
 */
export function exportExpensesExcel(expenses: Expense[], monthYear?: string) {
  const isAll = !monthYear || monthYear === 'all';
  const filtered = isAll
    ? expenses
    : expenses.filter((e) => {
        const d = e.dueDate || e.date || e.paidDate || '';
        return d.startsWith(monthYear);
      });

  const rows: (string | number)[][] = [
    ['RELATÓRIO DE DESPESAS OPERACIONAIS E CONTAS A PAGAR'],
    ['Competência:', isAll ? 'Todas as Despesas' : monthYear],
    ['Data de Emissão:', formatDate(getTodayLocalDateString())],
    [],
    [
      'TÍTULO / DESCRIÇÃO',
      'CATEGORIA',
      'DESTINO / ATIVO',
      'VALOR (R$)',
      'VENCIMENTO',
      'STATUS',
      'DATA PAGAMENTO',
      'RECORRÊNCIA',
      'OBSERVAÇÕES'
    ]
  ];

  let totalGeral = 0;
  let totalPago = 0;
  let totalPendente = 0;

  filtered.forEach((e) => {
    totalGeral = safeAdd(totalGeral, e.amount);
    if (e.status === 'pago') {
      totalPago = safeAdd(totalPago, e.amount);
    } else {
      totalPendente = safeAdd(totalPendente, e.amount);
    }

    rows.push([
      e.title,
      e.category.toUpperCase(),
      e.targetType.toUpperCase(),
      e.amount.toFixed(2),
      formatDate(e.dueDate),
      e.status.toUpperCase(),
      e.paidDate ? formatDate(e.paidDate) : '-',
      e.recurrence,
      e.notes || '-'
    ]);
  });

  rows.push([]);
  rows.push(['RESUMO DE DESPESAS']);
  rows.push(['Total de Despesas do Período (R$)', totalGeral.toFixed(2)]);
  rows.push(['Total Liquidado / Pago (R$)', totalPago.toFixed(2)]);
  rows.push(['Total Em Aberto / A Pagar (R$)', totalPendente.toFixed(2)]);

  downloadCSVFile(`relatorio_despesas_${isAll ? 'completo' : monthYear.replace('/', '_')}`, rows);
}

/**
 * 3. Relatório de Inadimplência
 */
export function exportInadimplenciaExcel(
  motoContracts: MotoContract[],
  kitnetContracts: KitnetContract[],
  motos: Moto[],
  kitnets: Kitnet[],
  motoTenants: MotoTenant[],
  kitnetTenants: KitnetTenant[]
) {
  const today = getTodayLocalDateString();
  const rows: (string | number)[][] = [
    ['RELATÓRIO EXECUTIVO DE INADIMPLÊNCIA & COBRANÇA'],
    ['Data Base de Apuração:', formatDate(today)],
    [],
    [
      'TIPO',
      'CLIENTE / LOCATÁRIO',
      'WHATSAPP / CONTATO',
      'ATIVO / BEM',
      'PARCELA',
      'VALOR EM ATRASO (R$)',
      'VENCIMENTO',
      'DIAS DE ATRASO'
    ]
  ];

  let totalEmAtraso = 0;
  let qtdContratosInadimplentes = 0;

  motoContracts.forEach((c) => {
    const moto = motos.find((m) => m.id === c.motoId);
    const tenant = motoTenants.find((t) => t.id === c.tenantId);
    const overdue = c.installments.filter((i) => isInstallmentOverdue(i));

    if (overdue.length > 0) qtdContratosInadimplentes++;

    overdue.forEach((inst) => {
      const diffDays = Math.max(0, getDaysDifference(inst.dueDate, today));
      totalEmAtraso = safeAdd(totalEmAtraso, inst.amount);

      rows.push([
        'Moto',
        tenant ? tenant.fullName : 'Locatário',
        tenant ? tenant.whatsapp || tenant.phone : '-',
        moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Moto',
        `${inst.number}/${c.durationMonths}`,
        inst.amount.toFixed(2),
        formatDate(inst.dueDate),
        `${diffDays} dias`
      ]);
    });
  });

  kitnetContracts.forEach((c) => {
    const kitnet = kitnets.find((k) => k.id === c.kitnetId);
    const tenant = kitnetTenants.find((t) => t.id === c.tenantId);
    const overdue = c.installments.filter((i) => isInstallmentOverdue(i));

    if (overdue.length > 0) qtdContratosInadimplentes++;

    overdue.forEach((inst) => {
      const diffDays = Math.max(0, getDaysDifference(inst.dueDate, today));
      totalEmAtraso = safeAdd(totalEmAtraso, inst.amount);

      rows.push([
        'Kitnet',
        tenant ? tenant.fullName : 'Locatário',
        tenant ? tenant.whatsapp || tenant.phone : '-',
        kitnet ? `${kitnet.name} (Unidade ${kitnet.number})` : 'Kitnet',
        `${inst.number}/${c.durationMonths}`,
        inst.amount.toFixed(2),
        formatDate(inst.dueDate),
        `${diffDays} dias`
      ]);
    });
  });

  rows.push([]);
  rows.push(['RESUMO DE INADIMPLÊNCIA']);
  rows.push(['Total de Contratos com Atraso:', qtdContratosInadimplentes]);
  rows.push(['Montante Total em Atraso (R$):', totalEmAtraso.toFixed(2)]);

  downloadCSVFile(`relatorio_inadimplencia_${today}`, rows);
}

/**
 * 4. Demonstrativo de Rentabilidade & ROI por Ativo
 */
export function exportProfitabilityExcel(
  motos: Moto[],
  motoContracts: MotoContract[],
  kitnets: Kitnet[],
  kitnetContracts: KitnetContract[],
  expenses: Expense[]
) {
  const rows: (string | number)[][] = [
    ['DEMONSTRATIVO DE RENTABILIDADE PATRIMONIAL POR ATIVO (ROI)'],
    ['Data de Emissão:', formatDate(getTodayLocalDateString())],
    [],
    [
      'TIPO',
      'ATIVO / IDENTIFICAÇÃO',
      'VALOR DE AQUISIÇÃO (R$)',
      'RECEITA TOTAL REALIZADA (R$)',
      'CUSTOS DE MANUTENÇÃO (R$)',
      'RESULTADO LÍQUIDO (R$)',
      'STATUS ATUAL',
      'RETORNO (ROI %)'
    ]
  ];

  let totalInvestido = 0;
  let totalReceitaGeral = 0;
  let totalCustosGeral = 0;
  let totalLucroGeral = 0;

  // Motos
  motos.forEach((m) => {
    const contracts = motoContracts.filter((c) => c.motoId === m.id);
    let totalReceived = 0;
    contracts.forEach((c) => {
      totalReceived = safeAdd(
        totalReceived,
        c.installments.filter((i) => i.status === 'pago').reduce((acc, i) => safeAdd(acc, i.amount), 0)
      );
    });

    const maintenanceCosts = expenses
      .filter((e) => e.targetType === 'moto' && e.targetId === m.id && e.status === 'pago')
      .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

    const netProfit = safeSub(safeSub(totalReceived, m.purchasePrice), maintenanceCosts);
    const roi = m.purchasePrice > 0 ? ((netProfit / m.purchasePrice) * 100).toFixed(1) : '0';

    totalInvestido = safeAdd(totalInvestido, m.purchasePrice);
    totalReceitaGeral = safeAdd(totalReceitaGeral, totalReceived);
    totalCustosGeral = safeAdd(totalCustosGeral, maintenanceCosts);
    totalLucroGeral = safeAdd(totalLucroGeral, netProfit);

    rows.push([
      'Motocicleta',
      `${m.brand} ${m.model} [${m.plate}]`,
      m.purchasePrice.toFixed(2),
      totalReceived.toFixed(2),
      maintenanceCosts.toFixed(2),
      netProfit.toFixed(2),
      m.status.toUpperCase(),
      `${roi}%`
    ]);
  });

  // Kitnets
  kitnets.forEach((k) => {
    const contracts = kitnetContracts.filter((c) => c.kitnetId === k.id);
    let totalReceived = 0;
    contracts.forEach((c) => {
      totalReceived = safeAdd(
        totalReceived,
        c.installments.filter((i) => i.status === 'pago').reduce((acc, i) => safeAdd(acc, i.amount), 0)
      );
    });

    const maintenanceCosts = expenses
      .filter((e) => e.targetType === 'kitnet' && e.targetId === k.id && e.status === 'pago')
      .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

    const netProfit = safeSub(totalReceived, maintenanceCosts);

    totalReceitaGeral = safeAdd(totalReceitaGeral, totalReceived);
    totalCustosGeral = safeAdd(totalCustosGeral, maintenanceCosts);
    totalLucroGeral = safeAdd(totalLucroGeral, netProfit);

    rows.push([
      'Kitnet Residencial',
      `${k.name} - Unidade ${k.number}`,
      '0.00',
      totalReceived.toFixed(2),
      maintenanceCosts.toFixed(2),
      netProfit.toFixed(2),
      k.status.toUpperCase(),
      'N/A'
    ]);
  });

  rows.push([]);
  rows.push(['CONSOLIDAÇÃO GERAL DOS ATIVOS']);
  rows.push(['Total Investido em Frotas (R$)', totalInvestido.toFixed(2)]);
  rows.push(['Receita Bruta Histórica Recebida (R$)', totalReceitaGeral.toFixed(2)]);
  rows.push(['Despesas & Manutenções Deduzidas (R$)', totalCustosGeral.toFixed(2)]);
  rows.push(['Lucro Líquido Realizado (R$)', totalLucroGeral.toFixed(2)]);

  downloadCSVFile('relatorio_rentabilidade_ativos', rows);
}
