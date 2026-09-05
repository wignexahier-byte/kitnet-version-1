import { jsPDF } from 'jspdf';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  formatCurrencyExtenso,
  formatDateFullPT,
  getTodayLocalDateString,
} from '../formatters';

export function generateContractPDF(options: {
  title: string;
  ownerName: string;
  ownerCpf: string;
  ownerAddress?: string;
  tenantName: string;
  tenantCpf: string;
  tenantRg?: string;
  tenantAddress?: string;
  assetDescription: string;
  valueMonthly: number;
  deposit: number;
  durationMonths: number;
  dueDay: number;
  startDate: string;
  extraTerms?: string[];
  tenantSignature?: string;
  ownerSignature?: string;
}) {
  const today = formatDate(getTodayLocalDateString());
  const termsHtml = options.extraTerms
    ? options.extraTerms.map((t) => `<li>${t}</li>`).join('')
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b; padding: 30px; }
          h1 { text-align: center; font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
          h2 { font-size: 14px; margin-top: 20px; color: #0f172a; border-left: 3px solid #0f172a; padding-left: 8px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 6px; }
          .signature-box { display: flex; justify-content: space-around; gap: 40px; margin-top: 48px; }
          .sign-line { flex: 1; text-align: center; }
          .line { border-bottom: 1px solid #334155; height: 32px; margin-bottom: 6px; }
          .sig-img { max-height: 52px; margin: 0 auto -6px auto; display: block; }
          .sig-badge { display: inline-block; font-size: 9px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 2px 8px; border-radius: 9999px; border: 1px solid #a7f3d0; margin-bottom: 4px; }
          @media print {
            body { padding: 15mm; }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <h1>${options.title}</h1>
        <p style="text-align: center; color: #64748b; font-size: 11px; margin-top: -6px;">Instrumento Particular de Gestão e Locação Patrimonial</p>
        
        <p><strong>LOCADOR (PROPRIETÁRIO):</strong> ${options.ownerName}, inscrito no CPF sob nº ${formatCPF(options.ownerCpf)}${options.ownerAddress ? `, com domicílio em ${options.ownerAddress}` : ''}.</p>
        <p><strong>LOCATÁRIO:</strong> ${options.tenantName}, inscrito no CPF sob nº ${formatCPF(options.tenantCpf)}${options.tenantRg ? `, RG nº ${options.tenantRg}` : ''}${options.tenantAddress ? `, residente em ${options.tenantAddress}` : ''}.</p>

        <h2>CLÁUSULA 1ª — DO OBJETO E DESTINAÇÃO</h2>
        <p>Constitui objeto do presente instrumento a locação referente ao seguinte ativo: <strong>${options.assetDescription}</strong>.</p>

        <h2>CLÁUSULA 2ª — DO PRAZO E VALORES</h2>
        <p>O presente contrato vigorará pelo prazo de <strong>${options.durationMonths} meses</strong>, a contar de <strong>${formatDate(options.startDate)}</strong>.</p>
        <p>O LOCATÁRIO pagará a quantia mensal de <strong>${formatCurrency(options.valueMonthly)}</strong>, com vencimento todo dia <strong>${options.dueDay}</strong> de cada mês subsequente.</p>
        <p>Fica estipulado o depósito de caução em garantia no valor de <strong>${formatCurrency(options.deposit)}</strong>, pago no ato da assinatura.</p>

        ${options.extraTerms && options.extraTerms.length > 0 ? `
          <h2>CLÁUSULA 3ª — DAS DISPOSIÇÕES ESPECÍFICAS</h2>
          <ul>${termsHtml}</ul>
        ` : ''}

        <p style="margin-top: 24px;">E, por estarem justos e contratados, assinam o presente instrumento para que produza seus efeitos jurídicos e legais.</p>
        <p style="text-align: right; color: #475569; font-size: 12px; margin-top: 20px;">Data de Emissão: ${today}</p>

        <div class="signature-box">
          <div class="sign-line">
            ${options.ownerSignature ? `<img src="${options.ownerSignature}" class="sig-img" alt="Assinatura Locador" />` : ''}
            <div class="line"></div>
            <strong>${options.ownerName}</strong>
            <div style="font-size: 11px; color: #64748b;">LOCADOR / PROPRIETÁRIO</div>
          </div>
          <div class="sign-line">
            ${options.tenantSignature ? `
              <img src="${options.tenantSignature}" class="sig-img" alt="Assinatura Digital" />
              <div><span class="sig-badge">✔ Assinado Digitalmente</span></div>
            ` : ''}
            <div class="line"></div>
            <strong>${options.tenantName}</strong>
            <div style="font-size: 11px; color: #64748b;">LOCATÁRIO</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export function generateReceiptPDF(options: {
  title: string;
  payerName: string;
  payerCpf: string;
  amount: number;
  description: string;
  date: string;
  ownerName: string;
  ownerCpf: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b; padding: 40px; }
          .receipt-box { border: 2px solid #0f172a; padding: 24px; border-radius: 8px; }
          h1 { text-align: center; font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0 0 16px 0; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
          .amount-tag { font-size: 22px; font-weight: 800; color: #059669; text-align: right; margin-bottom: 16px; }
          @media print {
            body { padding: 15mm; }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <h1>${options.title}</h1>
          <div class="amount-tag">VALOR: ${formatCurrency(options.amount)}</div>
          
          <p>Recebemos de <strong>${options.payerName}</strong>, inscrito(a) no CPF nº <strong>${formatCPF(options.payerCpf)}</strong>, a importância supramencionada de <strong>${formatCurrency(options.amount)}</strong>.</p>
          
          <p><strong>Referente a:</strong> ${options.description}</p>
          
          <p>Para maior clareza e firmeza do que aqui consta, firmamos o presente recibo dando plena e geral quitação referente à referida parcela/quantia.</p>

          <p style="margin-top: 36px; text-align: right;">Data: ${formatDate(options.date)}</p>

          <div style="margin-top: 60px; text-align: center; width: 300px; margin-left: auto; margin-right: auto;">
            <div style="border-bottom: 1px solid #334155; height: 30px; margin-bottom: 6px;"></div>
            <strong>${options.ownerName}</strong>
            <div style="font-size: 11px; color: #64748b;">CPF: ${formatCPF(options.ownerCpf)} • Administrador</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export function generateDepositReceiptPDF(options: {
  title?: string;
  payerName: string;
  payerCpf: string;
  payerRg?: string;
  amount: number;
  assetDescription: string;
  date?: string;
  ownerName: string;
  ownerCpf: string;
  cityState?: string;
  autoDownload?: boolean;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 24;

  const todayDate = options.date || getTodayLocalDateString();
  const todayFormatted = formatDateFullPT(todayDate);
  const cityState = options.cityState || 'Barra Velha, Santa Catarina';
  const amountExtenso = formatCurrencyExtenso(options.amount);

  // Header Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, cursorY, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(options.title || 'RECIBO DE CAUÇÃO EM GARANTIA LOCATÍCIA', 105, cursorY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Comprovante Oficial de Depósito de Garantia Contratual', 105, cursorY + 16, { align: 'center' });

  cursorY += 30;

  // Value Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, cursorY, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('VALOR RECEBIDO A TÍTULO DE CAUÇÃO', marginX + 8, cursorY + 7);

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(15);
  doc.text(formatCurrency(options.amount), marginX + 8, cursorY + 16);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`(${amountExtenso})`, marginX + 70, cursorY + 16);

  cursorY += 30;

  // Body text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  const p1 = `Recebi(emos) de ${options.payerName.toUpperCase()}, inscrito(a) no CPF sob nº ${formatCPF(options.payerCpf)}${options.payerRg ? `, RG nº ${options.payerRg}` : ''}, a importância acima discriminada de ${formatCurrency(options.amount)} (${amountExtenso}), entregue a título de DEPÓSITO DE CAUÇÃO EM GARANTIA LOCATÍCIA referente à locação do seguinte bem:`;
  const p1Lines = doc.splitTextToSize(p1, contentWidth);
  doc.text(p1Lines, marginX, cursorY);
  cursorY += p1Lines.length * 5 + 3;

  // Asset description box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginX, cursorY, contentWidth, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`BEM LOCADO: ${options.assetDescription}`, marginX + 6, cursorY + 9);
  cursorY += 20;

  // Terms and conditions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('CONDIÇÕES E FINALIDADE DA CAUÇÃO:', marginX, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const rules = [
    'A quantia recebida fica vinculada exclusivamente à garantia do fiel cumprimento de todas as obrigações estipuladas no Contrato de Locação.',
    'A caução poderá ser utilizada para cobrir eventuais aluguéis ou parcelas em atraso, multas contratuais, taxa de limpeza ou ressarcimento de danos e avarias verificados no bem locado na vistoria de devolução.',
    'Ao término da locação, após a realização da vistoria de saída, entrega das chaves/veículo e quitação de todas as pendências, o saldo remanescente da caução será integralmente restituído ao LOCATÁRIO.',
    'O LOCATÁRIO declara estar ciente e de pleno acordo com os termos deste recibo de garantia.'
  ];

  rules.forEach((rule) => {
    const lines = doc.splitTextToSize(`• ${rule}`, contentWidth - 4);
    doc.text(lines, marginX + 3, cursorY);
    cursorY += lines.length * 4.4 + 2;
  });

  cursorY += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`${cityState}, ${todayFormatted}.`, 105, cursorY, { align: 'center' });

  cursorY += 24;

  // Signature lines
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX + 10, cursorY, marginX + 75, cursorY);
  doc.line(marginX + 95, cursorY, marginX + 160, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(options.ownerName, marginX + 42.5, cursorY + 4.5, { align: 'center' });
  doc.text(options.payerName, marginX + 127.5, cursorY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${formatCPF(options.ownerCpf)} • LOCADOR`, marginX + 42.5, cursorY + 8.5, { align: 'center' });
  doc.text(`CPF: ${formatCPF(options.payerCpf)} • LOCATÁRIO`, marginX + 127.5, cursorY + 8.5, { align: 'center' });

  const fileName = `Recibo_Caucao_${options.payerName.replace(/\s+/g, '_')}.pdf`;
  const dataUri = doc.output('datauristring');

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { dataUri, fileName };
}

export function generateLatePaymentNoticePDF(options: {
  title?: string;
  tenantName: string;
  tenantCpf: string;
  assetDescription: string;
  dueDate: string;
  daysLate: number;
  originalAmount: number;
  fineAmount: number;
  interestAmount: number;
  totalAmount: number;
  pixKey: string;
  ownerName: string;
  ownerCpf: string;
  ownerPhone?: string;
  cityState?: string;
  deadlineHours?: number;
  autoDownload?: boolean;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 22;

  const todayFormatted = formatDateFullPT(getTodayLocalDateString());
  const cityState = options.cityState || 'Barra Velha, Santa Catarina';
  const deadline = options.deadlineHours || 48;

  // Header Box (Warning alert theme)
  doc.setFillColor(185, 28, 28);
  doc.roundedRect(marginX, cursorY, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(options.title || 'NOTIFICAÇÃO EXTRAJUDICIAL DE COBRANÇA E ATRASO', 105, cursorY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(254, 202, 202);
  doc.text('AVISO FORMAL DE INADIMPLEMENTO E CONCESSÃO DE PRAZO PARA REGULARIZAÇÃO', 105, cursorY + 16, { align: 'center' });

  cursorY += 28;

  // Recipient Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, cursorY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('NOTIFICADO(A) / LOCATÁRIO(A):', marginX + 6, cursorY + 6);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${options.tenantName.toUpperCase()} — CPF nº ${formatCPF(options.tenantCpf)}`, marginX + 6, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Referência: ${options.assetDescription}`, marginX + 6, cursorY + 18);

  cursorY += 28;

  // Introduction Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const intro = `Prezado(a) Senhor(a), servimo-nos da presente para NOTIFICÁ-LO(A) formalmente de que consta em nossos registros a pendência financeira referente ao contrato de locação vigente, cujo vencimento transcorreu sem a devida comprovação de quitação.`;
  const introLines = doc.splitTextToSize(intro, contentWidth);
  doc.text(introLines, marginX, cursorY);
  cursorY += introLines.length * 4.6 + 4;

  // Debt Breakdown Table
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginX, cursorY, contentWidth, 34, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DEMONSTRATIVO DO DÉBITO ATUALIZADO:', marginX + 6, cursorY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Data do Vencimento Original: ${formatDate(options.dueDate)} (${options.daysLate} dias de atraso)`, marginX + 6, cursorY + 13);
  doc.text(`• Valor Original da Parcela/Aluguel: ${formatCurrency(options.originalAmount)}`, marginX + 6, cursorY + 18);
  doc.text(`• Multa Contratual por Atraso (2%): ${formatCurrency(options.fineAmount)} | Juros Moratórios (1% a.m.): ${formatCurrency(options.interestAmount)}`, marginX + 6, cursorY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28);
  doc.text(`TOTAL ATUALIZADO PARA QUITAÇÃO: ${formatCurrency(options.totalAmount)}`, marginX + 6, cursorY + 30);

  cursorY += 40;

  // Payment Instruction Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(marginX, cursorY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('DADOS PARA PAGAMENTO IMEDIATO VIA PIX:', marginX + 6, cursorY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87);
  doc.text(`Chave PIX Oficial: ${options.pixKey} • Favorecido: ${options.ownerName} (CPF ${formatCPF(options.ownerCpf)})`, marginX + 6, cursorY + 13.5);

  cursorY += 26;

  // Legal Notice & Deadline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`PRAZO IMPRORROGÁVEL DE REGULARIZAÇÃO: ${deadline} HORAS`, marginX, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const warnLines = [
    `Fica concedido o prazo improrrogável de ${deadline} (quarenta e oito) horas a contar do recebimento desta notificação para a realização da quitação ou envio do respectivo comprovante.`,
    'O não pagamento no prazo concedido configurará mora irreversível, ensejando a rescisão unilateral do contrato com recolhimento imediato do veículo / desocupação do imóvel e adoção das medidas judiciais e de cobrança cabíveis.',
    'Caso o pagamento já tenha sido efetuado no momento do recebimento desta, solicitamos desconsiderar este aviso mediante o envio do comprovante bancário.'
  ];

  warnLines.forEach((w) => {
    const l = doc.splitTextToSize(`• ${w}`, contentWidth - 4);
    doc.text(l, marginX + 3, cursorY);
    cursorY += l.length * 4.2 + 2;
  });

  cursorY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${cityState}, ${todayFormatted}.`, 105, cursorY, { align: 'center' });

  cursorY += 18;

  // Signature line
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX + 50, cursorY, marginX + 120, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(options.ownerName, 105, cursorY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${formatCPF(options.ownerCpf)} • Administrador & Locador${options.ownerPhone ? ` • Tel: ${formatPhone(options.ownerPhone)}` : ''}`, 105, cursorY + 8.5, { align: 'center' });

  const fileName = `Notificacao_Cobranca_${options.tenantName.replace(/\s+/g, '_')}.pdf`;
  const dataUri = doc.output('datauristring');

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { dataUri, fileName };
}

export function generateTerminationAgreementPDF(options: {
  title?: string;
  ownerName: string;
  ownerCpf: string;
  ownerAddress?: string;
  tenantName: string;
  tenantCpf: string;
  tenantRg?: string;
  assetDescription: string;
  contractStartDate: string;
  terminationDate: string;
  reason?: string;
  depositAmount: number;
  cleaningFeeDiscount: number;
  repairsDiscount: number;
  refundAmount: number;
  finalKm?: number;
  cityState?: string;
  autoDownload?: boolean;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 22;

  const todayFormatted = formatDateFullPT(options.terminationDate || getTodayLocalDateString());
  const cityState = options.cityState || 'Barra Velha, Santa Catarina';

  // Header Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, cursorY, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(options.title || 'TERMO DE RESCISÃO E DISTRATO CONTRATUAL', 105, cursorY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Instrumento Particular de Devolução, Encerramento e Quitação Mútua', 105, cursorY + 16, { align: 'center' });

  cursorY += 28;

  // Parties Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, cursorY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('LOCADOR(A):', marginX + 6, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${options.ownerName}, CPF nº ${formatCPF(options.ownerCpf)}`, marginX + 30, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('LOCATÁRIO(A):', marginX + 6, cursorY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(`${options.tenantName}, CPF nº ${formatCPF(options.tenantCpf)}${options.tenantRg ? `, RG ${options.tenantRg}` : ''}`, marginX + 30, cursorY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('OBJETO:', marginX + 6, cursorY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(options.assetDescription, marginX + 30, cursorY + 20);

  cursorY += 30;

  // Clauses
  const clauses = [
    {
      title: 'CLÁUSULA 1ª — DA RESCISÃO CONTRATUAL',
      text: `As partes resolvem, de comum e mútuo acordo, RESCINDIR e dar por encerrado a partir de ${formatDate(options.terminationDate)} o Contrato de Locação iniciado em ${formatDate(options.contractStartDate)}, referente ao objeto supramencionado.`
    },
    {
      title: 'CLÁUSULA 2ª — DA ENTREGA, VISTORIA E DEVOLUÇÃO DO BEM',
      text: `O LOCATÁRIO declara efetuar na presente data a devolução e entrega formal do bem ao LOCADOR${options.finalKm ? ` (Quilometragem final aferida: ${options.finalKm.toLocaleString('pt-BR')} km)` : ' (com a devolução das chaves do imóvel)'}, tendo sido realizada a vistoria final de saída.`
    },
    {
      title: 'CLÁUSULA 3ª — DA APURAÇÃO DE HAVERES E CAUÇÃO',
      text: `Fica apurado o acerto financeiro final com base no caução depositado inicialmente de ${formatCurrency(options.depositAmount)}, deduzindo-se ${options.cleaningFeeDiscount > 0 ? `taxa de limpeza no valor de ${formatCurrency(options.cleaningFeeDiscount)}` : 'taxa de limpeza: R$ 0,00'}${options.repairsDiscount > 0 ? ` e reparos/avarias de ${formatCurrency(options.repairsDiscount)}` : ''}, resultando no saldo a restituir ao LOCATÁRIO no valor líquido de ${formatCurrency(options.refundAmount)}.`
    },
    {
      title: 'CLÁUSULA 4ª — DA QUITAÇÃO PLENA E IRREVOGÁVEL',
      text: 'Com o cumprimento deste instrumento e a liquidação dos valores apurados, as partes outorgam entre si a mais ampla, geral, rasa e irrevogável quitação de todas as obrigações oriundas do contrato ora rescindido, nada mais tendo a reclamar a qualquer título judicial ou extrajudicial.'
    }
  ];

  clauses.forEach((c) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(c.title, marginX, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(c.text, contentWidth);
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * 4.2 + 3;
  });

  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`${cityState}, ${todayFormatted}.`, 105, cursorY, { align: 'center' });

  cursorY += 20;

  // Signatures
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX + 10, cursorY, marginX + 75, cursorY);
  doc.line(marginX + 95, cursorY, marginX + 160, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(options.ownerName, marginX + 42.5, cursorY + 4.5, { align: 'center' });
  doc.text(options.tenantName, marginX + 127.5, cursorY + 4.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${formatCPF(options.ownerCpf)} • LOCADOR`, marginX + 42.5, cursorY + 8.5, { align: 'center' });
  doc.text(`CPF: ${formatCPF(options.tenantCpf)} • LOCATÁRIO`, marginX + 127.5, cursorY + 8.5, { align: 'center' });

  const fileName = `Termo_Distrato_${options.tenantName.replace(/\s+/g, '_')}.pdf`;
  const dataUri = doc.output('datauristring');

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { dataUri, fileName };
}
