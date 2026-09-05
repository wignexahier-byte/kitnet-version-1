import { jsPDF } from 'jspdf';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  getTodayLocalDateString,
  isInstallmentOverdue,
} from '../formatters';
import { safeAdd, safeSub, getDaysDifference } from '../financialMath';
import { getKitnetMonthlyTotal, getMotoMonthlyTotal } from '../../domain/calculations';
import { Moto, Kitnet, MotoContract, KitnetContract, MotoTenant, KitnetTenant, Expense, SystemSettings } from '../../types';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getFormattedMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const mIndex = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[mIndex] || month} de ${year}`;
}

/**
 * Utilitário profissional de geração de PDF Corporativo / Documento A4
 * Garantia estrita de margens, zero colisão de texto e normalização de tabelas
 */
class ExecutivePdfBuilder {
  public doc: jsPDF;
  public marginX = 14;
  public pageWidth = 210;
  public pageHeight = 297;
  public contentWidth = 182; // 210 - 2 * 14 = 182mm
  public cursorY = 14;
  public title: string;
  public subtitle: string;
  public companyName: string;
  public adminName: string;
  public adminCpf: string;

  constructor(title: string, subtitle: string, settings: SystemSettings) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.title = title;
    this.subtitle = subtitle;
    this.companyName = settings.companyName || 'GESTÃO PATRIMONIAL & LOCAÇÕES';
    this.adminName = settings.adminName || settings.primaryOwnerName || 'Wigne Leal Xavier Macedo';
    this.adminCpf = settings.adminCpf || '155.521.029-59';
  }

  /**
   * Trunca texto caso ultrapasse a largura máxima especificada em mm
   */
  private fitText(text: string, maxWidthMm: number, fontSizePt: number, isBold = false): string {
    const doc = this.doc;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSizePt);
    
    if (doc.getTextWidth(text) <= maxWidthMm) {
      return text;
    }
    
    let trimmed = text;
    while (trimmed.length > 3 && doc.getTextWidth(trimmed + '...') > maxWidthMm) {
      trimmed = trimmed.substring(0, trimmed.length - 1);
    }
    return trimmed + '...';
  }

  public drawHeader(isFirstPage = false) {
    const doc = this.doc;
    const now = new Date();
    const emissionDate = `${formatDate(getTodayLocalDateString())} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    if (isFirstPage) {
      // Linha superior decorativa de destaque
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(this.marginX, this.cursorY, this.contentWidth, 1.2, 'F');
      this.cursorY += 4;

      const maxLeftWidth = 100; // mm

      // Coluna da Esquerda: Empresa e Título do Documento
      const fittedCompany = this.fitText(this.companyName.toUpperCase(), maxLeftWidth, 11, true);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(fittedCompany, this.marginX, this.cursorY + 3.5);

      const fittedTitle = this.fitText(this.title.toUpperCase(), maxLeftWidth, 8.5, true);
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(fittedTitle, this.marginX, this.cursorY + 8.5);

      // Coluna da Direita: Metadados corporativos (alinhados à direita)
      const rightX = this.pageWidth - this.marginX;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Emissão: ${emissionDate}`, rightX, this.cursorY + 2.5, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      const fittedGestor = this.fitText(`Gestor: ${this.adminName}`, 75, 7.5, true);
      doc.text(fittedGestor, rightX, this.cursorY + 6.2, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(148, 163, 184);
      doc.text(`CPF: ${formatCPF(this.adminCpf)} • Documento Auditado`, rightX, this.cursorY + 9.8, { align: 'right' });

      this.cursorY += 13.5;

      // Barra de Subtítulo / Competência
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(this.marginX, this.cursorY, this.contentWidth, 6.8, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const fittedSubtitle = this.fitText(this.subtitle, this.contentWidth - 6, 8, true);
      doc.text(fittedSubtitle, this.marginX + 3, this.cursorY + 4.5);

      this.cursorY += 10.5;
    } else {
      // Cabeçalho de páginas subsequentes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const fittedHeader = this.fitText(`${this.companyName.toUpperCase()} — ${this.title.toUpperCase()}`, 115, 7.5, true);
      doc.text(fittedHeader, this.marginX, 11);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Emissão: ${emissionDate}`, this.pageWidth - this.marginX, 11, { align: 'right' });

      doc.setDrawColor(203, 213, 225);
      doc.line(this.marginX, 13, this.pageWidth - this.marginX, 13);
      this.cursorY = 17;
    }
  }

  public checkPageBreak(requiredHeight: number) {
    if (this.cursorY + requiredHeight > this.pageHeight - 16) {
      this.doc.addPage();
      this.drawHeader(false);
    }
  }

  public drawKpiCards(kpis: { label: string; value: string; detail?: string }[]) {
    const doc = this.doc;
    const count = kpis.length;
    const cardGap = 2.5;
    const cardWidth = (this.contentWidth - (count - 1) * cardGap) / count;
    const cardHeight = 15.5;

    this.checkPageBreak(cardHeight + 4);

    kpis.forEach((kpi, index) => {
      const x = this.marginX + index * (cardWidth + cardGap);
      
      // Card Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, this.cursorY, cardWidth, cardHeight, 1.2, 1.2, 'FD');

      // Label (auto-fit)
      const labelText = this.fitText(kpi.label.toUpperCase(), cardWidth - 4, 5.8, true);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.setTextColor(100, 116, 139);
      doc.text(labelText, x + 2, this.cursorY + 3.8);

      // Value (auto-fit font size if long)
      let valFontSize = 9.2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(valFontSize);
      while (valFontSize > 6.8 && doc.getTextWidth(kpi.value) > cardWidth - 4) {
        valFontSize -= 0.6;
        doc.setFontSize(valFontSize);
      }
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.value, x + 2, this.cursorY + 9.5);

      // Detail (auto-fit)
      if (kpi.detail) {
        const detailText = this.fitText(kpi.detail, cardWidth - 4, 5.6, false);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.6);
        doc.setTextColor(100, 116, 139);
        doc.text(detailText, x + 2, this.cursorY + 13.5);
      }
    });

    this.cursorY += cardHeight + 4.5;
  }

  public drawSectionHeading(text: string) {
    this.checkPageBreak(7.5);
    const doc = this.doc;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    const fittedHeading = this.fitText(text.toUpperCase(), this.contentWidth, 8.2, true);
    doc.text(fittedHeading, this.marginX, this.cursorY + 3.5);
    
    doc.setDrawColor(203, 213, 225);
    doc.line(this.marginX, this.cursorY + 5, this.pageWidth - this.marginX, this.cursorY + 5);
    this.cursorY += 7.5;
  }

  public drawTable(
    headers: { title: string; width: number; align?: 'left' | 'right' | 'center' }[],
    rows: { values: string[]; isTotalRow?: boolean }[]
  ) {
    const doc = this.doc;
    const rowHeight = 5.8;
    const headerHeight = 6.2;

    // Normalização matemática para garantir que a soma das larguras seja SEMPRE 100% igual ao contentWidth (182mm)
    const rawTotalWidth = headers.reduce((acc, h) => acc + h.width, 0);
    const scaleFactor = rawTotalWidth > 0 ? this.contentWidth / rawTotalWidth : 1;
    const normalizedHeaders = headers.map((h) => ({
      ...h,
      width: h.width * scaleFactor,
    }));

    // Renderizar Cabeçalho da Tabela
    const renderHeaderRow = () => {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(203, 213, 225);
      doc.rect(this.marginX, this.cursorY, this.contentWidth, headerHeight, 'FD');

      let currentX = this.marginX;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);

      normalizedHeaders.forEach((h) => {
        const align = h.align || 'left';
        let textX = currentX + 1.5;
        if (align === 'right') textX = currentX + h.width - 1.5;
        if (align === 'center') textX = currentX + h.width / 2;

        const fittedTitle = this.fitText(h.title.toUpperCase(), h.width - 2.5, 6.8, true);
        doc.text(fittedTitle, textX, this.cursorY + 4, { align });
        currentX += h.width;
      });

      this.cursorY += headerHeight;
    };

    this.checkPageBreak(headerHeight + rowHeight);
    renderHeaderRow();

    // Renderizar Linhas de Dados
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(rowHeight);

      if (row.isTotalRow) {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(148, 163, 184);
        doc.rect(this.marginX, this.cursorY, this.contentWidth, rowHeight, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
      } else {
        if (rowIndex % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(this.marginX, this.cursorY, this.contentWidth, rowHeight, 'F');
        }
        doc.setDrawColor(241, 245, 249);
        doc.line(this.marginX, this.cursorY + rowHeight, this.pageWidth - this.marginX, this.cursorY + rowHeight);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);
      }

      let currentX = this.marginX;
      normalizedHeaders.forEach((h, colIndex) => {
        const val = row.values[colIndex] || '';
        const align = h.align || 'left';
        let textX = currentX + 1.5;
        if (align === 'right') textX = currentX + h.width - 1.5;
        if (align === 'center') textX = currentX + h.width / 2;

        const isBold = Boolean(row.isTotalRow);
        const fittedVal = this.fitText(String(val), h.width - 2.5, isBold ? 7 : 6.8, isBold);

        doc.text(fittedVal, textX, this.cursorY + 3.9, { align });
        currentX += h.width;
      });

      this.cursorY += rowHeight;
    });

    this.cursorY += 3.5;
  }

  public finalizeAndSave(fileName: string) {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(6.8);
      this.doc.setTextColor(148, 163, 184);

      // Rodapé institucional
      this.doc.setDrawColor(226, 232, 240);
      this.doc.line(this.marginX, this.pageHeight - 10, this.pageWidth - this.marginX, this.pageHeight - 10);

      this.doc.text(
        `Documento emitido para fins gerenciais e contábeis • ${this.companyName}`,
        this.marginX,
        this.pageHeight - 6.5
      );
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth - this.marginX,
        this.pageHeight - 6.5,
        { align: 'right' }
      );
    }

    this.doc.save(fileName);
  }
}

/**
 * 1. RELATÓRIO MENSAL DE FATURAMENTO & RECEITAS (PDF)
 */
export function generateMonthlyRevenuePdf(options: {
  selectedMonth: string;
  motoContracts: MotoContract[];
  kitnetContracts: KitnetContract[];
  motos: Moto[];
  kitnets: Kitnet[];
  motoTenants: MotoTenant[];
  kitnetTenants: KitnetTenant[];
  settings: SystemSettings;
}) {
  const { selectedMonth, motoContracts, kitnetContracts, motos, kitnets, motoTenants, kitnetTenants, settings } = options;

  const monthLabel = getFormattedMonthLabel(selectedMonth);
  const builder = new ExecutivePdfBuilder(
    'Demonstrativo Mensal de Faturamento & Cobranças',
    `Competência: ${monthLabel} (${selectedMonth})`,
    settings
  );

  builder.drawHeader(true);

  // Cálculos
  let receitaPrevista = 0;
  let receitaRecebida = 0;
  let receitaPendente = 0;
  let receitaAtrasada = 0;
  const tableRows: { values: string[]; isTotalRow?: boolean }[] = [];

  // Motos
  motoContracts.forEach((c) => {
    const moto = motos.find((m) => m.id === c.motoId);
    const tenant = motoTenants.find((t) => t.id === c.tenantId);

    c.installments.forEach((inst) => {
      if (inst.dueDate.startsWith(selectedMonth) || (inst.paidDate && inst.paidDate.startsWith(selectedMonth))) {
        const isOverdue = isInstallmentOverdue(inst);
        receitaPrevista = safeAdd(receitaPrevista, inst.amount);

        if (inst.status === 'pago') {
          receitaRecebida = safeAdd(receitaRecebida, inst.amount);
        } else if (isOverdue) {
          receitaAtrasada = safeAdd(receitaAtrasada, inst.amount);
        } else {
          receitaPendente = safeAdd(receitaPendente, inst.amount);
        }

        const statusLabel = inst.status === 'pago' ? `PAGO (${formatDate(inst.paidDate)})` : isOverdue ? 'EM ATRASO' : 'PENDENTE';

        tableRows.push({
          values: [
            'MOTO',
            moto ? `${moto.brand} ${moto.model} (${moto.plate || 'S/P'})` : 'Moto',
            tenant ? tenant.fullName : 'Locatário',
            `${inst.number}/${c.durationMonths}`,
            formatDate(inst.dueDate),
            formatCurrency(inst.amount),
            statusLabel,
          ],
        });
      }
    });
  });

  // Kitnets
  kitnetContracts.forEach((c) => {
    const kitnet = kitnets.find((k) => k.id === c.kitnetId);
    const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

    c.installments.forEach((inst) => {
      if (inst.dueDate.startsWith(selectedMonth) || (inst.paidDate && inst.paidDate.startsWith(selectedMonth))) {
        const isOverdue = isInstallmentOverdue(inst);
        receitaPrevista = safeAdd(receitaPrevista, inst.amount);

        if (inst.status === 'pago') {
          receitaRecebida = safeAdd(receitaRecebida, inst.amount);
        } else if (isOverdue) {
          receitaAtrasada = safeAdd(receitaAtrasada, inst.amount);
        } else {
          receitaPendente = safeAdd(receitaPendente, inst.amount);
        }

        const statusLabel = inst.status === 'pago' ? `PAGO (${formatDate(inst.paidDate)})` : isOverdue ? 'EM ATRASO' : 'PENDENTE';

        tableRows.push({
          values: [
            'KITNET',
            kitnet ? `${kitnet.name} (${kitnet.number})` : 'Kitnet',
            tenant ? tenant.fullName : 'Locatário',
            `${inst.number}/${c.durationMonths}`,
            formatDate(inst.dueDate),
            formatCurrency(inst.amount),
            statusLabel,
          ],
        });
      }
    });
  });

  // KPIs
  builder.drawKpiCards([
    { label: 'Receita Prevista', value: formatCurrency(receitaPrevista), detail: `${tableRows.length} parcelas programadas` },
    { label: 'Receita Realizada', value: formatCurrency(receitaRecebida), detail: 'Quitado em conta' },
    { label: 'A Receber no Prazo', value: formatCurrency(receitaPendente), detail: 'Aguardando vencimento' },
    { label: 'Inadimplência', value: formatCurrency(receitaAtrasada), detail: 'Parcelas vencidas' },
  ]);

  builder.drawSectionHeading(`Detalhamento de Cobranças — ${monthLabel}`);

  if (tableRows.length === 0) {
    builder.drawTable(
      [{ title: 'Informação', width: builder.contentWidth }],
      [{ values: ['Nenhum lançamento ou parcela encontrada para o mês selecionado.'] }]
    );
  } else {
    // Linha de totais
    tableRows.push({
      isTotalRow: true,
      values: [
        'TOTAL',
        `${tableRows.length} lançamentos`,
        '—',
        '—',
        '—',
        formatCurrency(receitaPrevista),
        `Realizado: ${formatCurrency(receitaRecebida)}`,
      ],
    });

    builder.drawTable(
      [
        { title: 'Segmento', width: 18 },
        { title: 'Ativo / Identificação', width: 42 },
        { title: 'Locatário', width: 40 },
        { title: 'Parc.', width: 16, align: 'center' },
        { title: 'Vencimento', width: 22, align: 'center' },
        { title: 'Valor (R$)', width: 24, align: 'right' },
        { title: 'Situação / Baixa', width: 20, align: 'center' },
      ],
      tableRows
    );
  }

  builder.finalizeAndSave(`relatorio_receitas_${selectedMonth}.pdf`);
}

/**
 * 2. RELATÓRIO DE INADIMPLÊNCIA & COBRANÇA (PDF)
 */
export function generateInadimplenciaPdf(options: {
  motoContracts: MotoContract[];
  kitnetContracts: KitnetContract[];
  motos: Moto[];
  kitnets: Kitnet[];
  motoTenants: MotoTenant[];
  kitnetTenants: KitnetTenant[];
  settings: SystemSettings;
}) {
  const { motoContracts, kitnetContracts, motos, kitnets, motoTenants, kitnetTenants, settings } = options;
  const today = getTodayLocalDateString();

  const builder = new ExecutivePdfBuilder(
    'Relatório de Inadimplência & Cobrança',
    `Posição Consolidada em ${formatDate(today)}`,
    settings
  );

  builder.drawHeader(true);

  const devedores: any[] = [];
  let montanteTotal = 0;

  motoContracts.forEach((c) => {
    const moto = motos.find((m) => m.id === c.motoId);
    const tenant = motoTenants.find((t) => t.id === c.tenantId);

    c.installments
      .filter((i) => isInstallmentOverdue(i))
      .forEach((inst) => {
        const diasAtraso = Math.max(0, getDaysDifference(inst.dueDate, today));
        montanteTotal = safeAdd(montanteTotal, inst.amount);
        devedores.push({
          tipo: 'MOTO',
          ativo: moto ? `${moto.brand} ${moto.model} (${moto.plate || 'S/P'})` : 'Moto',
          cliente: tenant ? tenant.fullName : 'Locatário',
          contato: tenant ? formatPhone(tenant.whatsapp || tenant.phone || '') : '-',
          parcela: `${inst.number}/${c.durationMonths}`,
          vencimento: inst.dueDate,
          valor: inst.amount,
          diasAtraso,
        });
      });
  });

  kitnetContracts.forEach((c) => {
    const kitnet = kitnets.find((k) => k.id === c.kitnetId);
    const tenant = kitnetTenants.find((t) => t.id === c.tenantId);

    c.installments
      .filter((i) => isInstallmentOverdue(i))
      .forEach((inst) => {
        const diasAtraso = Math.max(0, getDaysDifference(inst.dueDate, today));
        montanteTotal = safeAdd(montanteTotal, inst.amount);
        devedores.push({
          tipo: 'KITNET',
          ativo: kitnet ? `${kitnet.name} (${kitnet.number})` : 'Kitnet',
          cliente: tenant ? tenant.fullName : 'Locatário',
          contato: tenant ? formatPhone(tenant.whatsapp || tenant.phone || '') : '-',
          parcela: `${inst.number}/${c.durationMonths}`,
          vencimento: inst.dueDate,
          valor: inst.amount,
          diasAtraso,
        });
      });
  });

  devedores.sort((a, b) => b.diasAtraso - a.diasAtraso);

  // KPIs
  builder.drawKpiCards([
    { label: 'Montante Inadimplente', value: formatCurrency(montanteTotal), detail: 'Débito total em aberto' },
    { label: 'Parcelas em Atraso', value: String(devedores.length), detail: 'Títulos vencidos' },
    {
      label: 'Maior Atraso Registrado',
      value: devedores.length > 0 ? `${devedores[0].diasAtraso} dias` : '0 dias',
      detail: 'Mora acumulada máxima',
    },
    {
      label: 'Status da Carteira',
      value: montanteTotal === 0 ? 'Regular' : 'Cobrança Ativa',
      detail: montanteTotal === 0 ? '100% em dia' : 'Requer notificação',
    },
  ]);

  builder.drawSectionHeading('Listagem Analítica de Devedores e Contratos');

  if (devedores.length === 0) {
    builder.drawTable(
      [{ title: 'Status', width: builder.contentWidth }],
      [{ values: ['Parabéns! Não existem parcelas em atraso no momento. Todos os contratos estão rigorosamente em dia.'] }]
    );
  } else {
    const tableRows: { values: string[]; isTotalRow?: boolean }[] = devedores.map((d) => ({
      values: [
        d.tipo,
        d.cliente,
        d.contato,
        d.ativo,
        d.parcela,
        formatDate(d.vencimento),
        `${d.diasAtraso}d`,
        formatCurrency(d.valor),
      ],
    }));

    tableRows.push({
      isTotalRow: true,
      values: [
        'TOTAL',
        `${devedores.length} títulos`,
        '—',
        '—',
        '—',
        '—',
        '—',
        formatCurrency(montanteTotal),
      ],
    });

    builder.drawTable(
      [
        { title: 'Segmento', width: 16 },
        { title: 'Locatário', width: 38 },
        { title: 'Contato', width: 28 },
        { title: 'Ativo', width: 32 },
        { title: 'Parc.', width: 14, align: 'center' },
        { title: 'Vencimento', width: 18, align: 'center' },
        { title: 'Mora', width: 12, align: 'center' },
        { title: 'Valor Devido', width: 24, align: 'right' },
      ],
      tableRows
    );
  }

  builder.finalizeAndSave(`relatorio_inadimplencia_${today}.pdf`);
}

/**
 * 3. RELATÓRIO DE RENTABILIDADE & RETORNO PATRIMONIAL (ROI) (PDF)
 */
export function generateProfitabilityPdf(options: {
  motos: Moto[];
  motoContracts: MotoContract[];
  kitnets: Kitnet[];
  kitnetContracts: KitnetContract[];
  expenses: Expense[];
  settings: SystemSettings;
}) {
  const { motos, motoContracts, kitnets, kitnetContracts, expenses, settings } = options;
  const today = getTodayLocalDateString();

  const builder = new ExecutivePdfBuilder(
    'Demonstrativo de Rentabilidade & Retorno por Ativo (ROI)',
    `Posição Consolidada em ${formatDate(today)}`,
    settings
  );

  builder.drawHeader(true);

  let totalInvestimento = 0;
  let totalReceitaAcumulada = 0;
  let totalCustosManutencao = 0;
  const tableRows: { values: string[]; isTotalRow?: boolean }[] = [];

  // Motos
  motos.forEach((m) => {
    totalInvestimento = safeAdd(totalInvestimento, m.purchasePrice);
    const contracts = motoContracts.filter((c) => c.motoId === m.id);
    let totalReceived = 0;
    contracts.forEach((c) => {
      totalReceived = safeAdd(
        totalReceived,
        c.installments.filter((i) => i.status === 'pago').reduce((acc, i) => safeAdd(acc, i.amount), 0)
      );
    });

    totalReceitaAcumulada = safeAdd(totalReceitaAcumulada, totalReceived);

    const maintenance = expenses
      .filter((e) => e.targetType === 'moto' && e.targetId === m.id && e.status === 'pago')
      .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

    totalCustosManutencao = safeAdd(totalCustosManutencao, maintenance);

    const lucroLiquido = safeSub(safeSub(totalReceived, m.purchasePrice), maintenance);
    const roi = m.purchasePrice > 0 ? (lucroLiquido / m.purchasePrice) * 100 : 0;

    tableRows.push({
      values: [
        'MOTO',
        `${m.brand} ${m.model} (${m.plate || 'S/P'})`,
        formatCurrency(m.purchasePrice),
        formatCurrency(totalReceived),
        formatCurrency(maintenance),
        formatCurrency(lucroLiquido),
        `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
      ],
    });
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

    totalReceitaAcumulada = safeAdd(totalReceitaAcumulada, totalReceived);

    const maintenance = expenses
      .filter((e) => e.targetType === 'kitnet' && e.targetId === k.id && e.status === 'pago')
      .reduce((acc, e) => safeAdd(acc, e.amount || 0), 0);

    totalCustosManutencao = safeAdd(totalCustosManutencao, maintenance);

    const lucroLiquido = safeSub(totalReceived, maintenance);

    tableRows.push({
      values: [
        'KITNET',
        `${k.name} (${k.number})`,
        '—',
        formatCurrency(totalReceived),
        formatCurrency(maintenance),
        formatCurrency(lucroLiquido),
        'Imóvel',
      ],
    });
  });

  const resultadoLiquidoGeral = safeSub(safeSub(totalReceitaAcumulada, totalInvestimento), totalCustosManutencao);

  // KPIs
  builder.drawKpiCards([
    { label: 'Investimento em Ativos', value: formatCurrency(totalInvestimento), detail: `${motos.length} motos adquiridas` },
    { label: 'Receita Total Realizada', value: formatCurrency(totalReceitaAcumulada), detail: 'Faturamento acumulado' },
    { label: 'Custos de Manutenção', value: formatCurrency(totalCustosManutencao), detail: 'Despesas abatidas' },
    { label: 'Resultado Líquido', value: formatCurrency(resultadoLiquidoGeral), detail: 'Margem total apurada' },
  ]);

  builder.drawSectionHeading('Inventário de Ativos e Indicadores de Retorno Financeiro');

  tableRows.push({
    isTotalRow: true,
    values: [
      'TOTAL',
      `${motos.length + kitnets.length} ativos`,
      formatCurrency(totalInvestimento),
      formatCurrency(totalReceitaAcumulada),
      formatCurrency(totalCustosManutencao),
      formatCurrency(resultadoLiquidoGeral),
      '—',
    ],
  });

  builder.drawTable(
    [
      { title: 'Segmento', width: 16 },
      { title: 'Identificação do Ativo', width: 46 },
      { title: 'Aquisição / Custo', width: 24, align: 'right' },
      { title: 'Receita Realizada', width: 26, align: 'right' },
      { title: 'Manutenções', width: 22, align: 'right' },
      { title: 'Resultado Líquido', width: 26, align: 'right' },
      { title: 'ROI (%)', width: 22, align: 'center' },
    ],
    tableRows
  );

  builder.finalizeAndSave(`relatorio_rentabilidade_roi_${today}.pdf`);
}

/**
 * 4. DEMONSTRATIVO EXECUTIVO CONSOLIDADO / DRE (PDF)
 */
export function generateExecutiveDREPdf(options: {
  motos: Moto[];
  kitnets: Kitnet[];
  motoContracts: MotoContract[];
  kitnetContracts: KitnetContract[];
  expenses: Expense[];
  settings: SystemSettings;
}) {
  const { motos, kitnets, motoContracts, kitnetContracts, expenses, settings } = options;
  const today = getTodayLocalDateString();

  const builder = new ExecutivePdfBuilder(
    'Demonstrativo Financeiro & Relatório Executivo',
    `Auditoria Patrimonial e Fluxo de Caixa — ${formatDate(today)}`,
    settings
  );

  builder.drawHeader(true);

  const totalMotos = motos.length;
  const motosAlugadas = motos.filter((m) => m.status === 'alugada').length;
  const totalKitnets = kitnets.length;
  const kitnetsAlugadas = kitnets.filter((k) => k.status === 'alugada').length;

  let faturamentoMotos = 0;
  let inadimplenciaMotos = 0;
  let parcelasPagasMotos = 0;
  motoContracts.forEach((c) => {
    if (c.status === 'ativo') faturamentoMotos = safeAdd(faturamentoMotos, getMotoMonthlyTotal(c));
    c.installments.forEach((i) => {
      if (i.status === 'pago') parcelasPagasMotos = safeAdd(parcelasPagasMotos, i.amount);
      if (isInstallmentOverdue(i)) inadimplenciaMotos = safeAdd(inadimplenciaMotos, i.amount);
    });
  });

  let faturamentoKitnets = 0;
  let inadimplenciaKitnets = 0;
  let parcelasPagasKitnets = 0;
  kitnetContracts.forEach((c) => {
    if (c.status === 'ativo') {
      faturamentoKitnets = safeAdd(faturamentoKitnets, getKitnetMonthlyTotal(c));
    }
    c.installments.forEach((i) => {
      if (i.status === 'pago') parcelasPagasKitnets = safeAdd(parcelasPagasKitnets, i.amount);
      if (isInstallmentOverdue(i)) inadimplenciaKitnets = safeAdd(inadimplenciaKitnets, i.amount);
    });
  });

  const totalDespesas = expenses.reduce((acc, e) => safeAdd(acc, e.amount), 0);
  const faturamentoTotal = safeAdd(faturamentoMotos, faturamentoKitnets);
  const inadimplenciaTotal = safeAdd(inadimplenciaMotos, inadimplenciaKitnets);
  const totalRecebido = safeAdd(parcelasPagasMotos, parcelasPagasKitnets);
  const resultadoLiquido = safeSub(totalRecebido, totalDespesas);

  // Top KPIs
  builder.drawKpiCards([
    { label: 'Faturamento Mensal', value: formatCurrency(faturamentoTotal), detail: 'Motos + Kitnets ativas' },
    { label: 'Receita Realizada', value: formatCurrency(totalRecebido), detail: 'Total histórico recebido' },
    { label: 'Despesas Pagas', value: formatCurrency(totalDespesas), detail: `${expenses.length} despesas lançadas` },
    { label: 'Inadimplência', value: formatCurrency(inadimplenciaTotal), detail: 'Parcelas em aberto' },
  ]);

  // Section 1: Breakdown by Unit
  builder.drawSectionHeading('1. Resumo por Linha de Negócio');

  const taxaOcupacaoMotos = totalMotos > 0 ? Math.round((motosAlugadas / totalMotos) * 100) : 0;
  const taxaOcupacaoKitnets = totalKitnets > 0 ? Math.round((kitnetsAlugadas / totalKitnets) * 100) : 0;
  const taxaOcupacaoGeral = (totalMotos + totalKitnets) > 0 ? Math.round(((motosAlugadas + kitnetsAlugadas) / (totalMotos + totalKitnets)) * 100) : 0;

  builder.drawTable(
    [
      { title: 'Segmento Operacional', width: 44 },
      { title: 'Ativos', width: 20, align: 'center' },
      { title: 'Ocupação', width: 26, align: 'center' },
      { title: 'Faturamento Mensal', width: 30, align: 'right' },
      { title: 'Inadimplência', width: 30, align: 'right' },
      { title: 'Recebido Acumulado', width: 32, align: 'right' },
    ],
    [
      {
        values: [
          'Locação de Motocicletas',
          `${totalMotos} unidades`,
          `${motosAlugadas}/${totalMotos} (${taxaOcupacaoMotos}%)`,
          formatCurrency(faturamentoMotos),
          formatCurrency(inadimplenciaMotos),
          formatCurrency(parcelasPagasMotos),
        ],
      },
      {
        values: [
          'Kitnets Residenciais',
          `${totalKitnets} unidades`,
          `${kitnetsAlugadas}/${totalKitnets} (${taxaOcupacaoKitnets}%)`,
          formatCurrency(faturamentoKitnets),
          formatCurrency(inadimplenciaKitnets),
          formatCurrency(parcelasPagasKitnets),
        ],
      },
      {
        isTotalRow: true,
        values: [
          'TOTAL CONSOLIDADO',
          `${totalMotos + totalKitnets} ativos`,
          `${motosAlugadas + kitnetsAlugadas}/${totalMotos + totalKitnets} (${taxaOcupacaoGeral}%)`,
          formatCurrency(faturamentoTotal),
          formatCurrency(inadimplenciaTotal),
          formatCurrency(totalRecebido),
        ],
      },
    ]
  );

  // Section 2: DRE Simplificado
  builder.drawSectionHeading('2. Demonstrativo do Resultado do Exercício (DRE)');

  builder.drawTable(
    [
      { title: 'Conta Contábil / Descrição', width: 110 },
      { title: 'Classificação', width: 32, align: 'center' },
      { title: 'Valor Acumulado (R$)', width: 40, align: 'right' },
    ],
    [
      { values: ['(+) Receitas Operacionais de Motocicletas', 'Receita Bruta', formatCurrency(parcelasPagasMotos)] },
      { values: ['(+) Receitas Operacionais de Kitnets e Água', 'Receita Bruta', formatCurrency(parcelasPagasKitnets)] },
      { values: ['(=) RECEITA BRUTA REALIZADA', 'Total Entradas', formatCurrency(totalRecebido)], isTotalRow: true },
      { values: ['(-) Despesas Operacionais e Manutenções', 'Saídas / Custos', `-${formatCurrency(totalDespesas)}`] },
      { values: ['(=) RESULTADO LÍQUIDO DO PERÍODO', 'Lucro Operacional', formatCurrency(resultadoLiquido)], isTotalRow: true },
    ]
  );

  // Section 3: Inventário Completo
  builder.drawSectionHeading('3. Inventário Operacional de Ativos');

  const assetRows = [
    ...motos.map((m) => ({
      values: [
        'MOTO',
        `${m.brand} ${m.model}`,
        m.plate || 'S/ Placa',
        m.status.toUpperCase(),
        formatCurrency(m.purchasePrice),
        `${m.currentKm.toLocaleString('pt-BR')} km`,
      ],
    })),
    ...kitnets.map((k) => ({
      values: [
        'KITNET',
        k.name,
        `Unidade ${k.number}`,
        k.status.toUpperCase(),
        `${formatCurrency(k.monthlyRentBase)}/mês`,
        'Residencial',
      ],
    })),
  ];

  builder.drawTable(
    [
      { title: 'Segmento', width: 16 },
      { title: 'Descrição do Ativo', width: 50 },
      { title: 'Placa / Identificador', width: 30 },
      { title: 'Situação', width: 26, align: 'center' },
      { title: 'Valor de Referência', width: 30, align: 'right' },
      { title: 'Detalhe', width: 30, align: 'center' },
    ],
    assetRows
  );

  builder.finalizeAndSave(`relatorio_executivo_dre_${today}.pdf`);
}
