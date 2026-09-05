import { jsPDF } from 'jspdf';
import { Kitnet, KitnetContract, KitnetTenant, SystemSettings } from '../../types';
import {
  formatCurrency,
  formatCPF,
  formatCurrencyExtenso,
  formatDateFullPT,
  formatDurationExtenso,
} from '../formatters';
import { printContractDocument } from '../printHelper';

export function generateKitnetRentalContractPdfFile(options: {
  kitnet: Kitnet;
  tenant: KitnetTenant;
  contract: KitnetContract;
  settings: SystemSettings;
  autoDownload?: boolean;
  witnessesCount?: number;
  witness1Name?: string;
  witness1Cpf?: string;
  witness2Name?: string;
  witness2Cpf?: string;
}) {
  const {
    kitnet,
    tenant,
    contract,
    settings,
    autoDownload = true,
    witnessesCount = 2,
    witness1Name,
    witness1Cpf,
    witness2Name,
    witness2Cpf,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const rentVal = contract.rentValue;
  const depositVal = contract.deposit;
  const dueDay = contract.dueDay;
  const durationMonths = contract.durationMonths;
  const startDateFormatted = formatDateFullPT(contract.startDate);
  const signatureDateFormatted = formatDateFullPT(contract.signatureDate || contract.startDate);
  const durationText = formatDurationExtenso(durationMonths);
  const rentExtenso = formatCurrencyExtenso(rentVal);
  const depositExtenso = formatCurrencyExtenso(depositVal);

  const locadorName = settings.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings.adminCpf || '155.521.029-59';
  const adminPixKey = settings.adminPixKey || settings.adminEmail || 'wleal0131@gmail.com';
  const cityState = settings.cityState || 'Barra Velha – SC';
  const cleaningFee =
    contract.cleaningFee !== undefined
      ? contract.cleaningFee
      : kitnet.cleaningFeeBase !== undefined
      ? kitnet.cleaningFeeBase
      : (settings.cleaningFee ?? 0);
  const cleaningFeeExtenso = formatCurrencyExtenso(cleaningFee);
  const address = kitnet.address?.trim() || settings.cityState || 'Barra Velha - SC';

  const marginX = 18;
  const pageWidth = 210;
  const contentWidth = 174;
  const maxY = 275;
  let cursorY = 18;

  function drawHeader(isFirstPage: boolean) {
    if (isFirstPage) {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(marginX, cursorY, contentWidth, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL', 105, cursorY + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('INSTRUMENTO PARTICULAR DE LOCAÇÃO URBANA', 105, cursorY + 11, { align: 'center' });
      cursorY += 19;
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL', marginX, 12);
      doc.text(`${kitnet.name || 'Kitnet'} • ${tenant.fullName}`, pageWidth - marginX, 12, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, 14, pageWidth - marginX, 14);
      cursorY = 20;
    }
  }

  function checkPageBreak(neededHeight: number) {
    if (cursorY + neededHeight > maxY) {
      doc.addPage();
      drawHeader(false);
    }
  }

  // Draw Page 1 header
  drawHeader(true);

  // Parties Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, cursorY, contentWidth, 27, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LOCADOR:', marginX + 4, cursorY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${locadorName}, CPF nº ${formatCPF(locadorCpf)}`, marginX + 26, cursorY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('LOCATÁRIO(A):', marginX + 4, cursorY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${tenant.fullName}  |  CPF: ${formatCPF(tenant.cpf)}  |  RG: ${tenant.rg || 'Não informado'}`, marginX + 26, cursorY + 11);
  doc.text(`Tel/WhatsApp: ${tenant.whatsapp || tenant.phone || 'Não informado'}  |  E-mail: ${tenant.email || 'Não informado'}`, marginX + 26, cursorY + 16);

  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('As partes acima identificadas firmam o presente contrato de locação residencial, regido pelas cláusulas abaixo:', marginX + 4, cursorY + 23);

  cursorY += 32;

  const clauses: { title: string; paragraphs: string[]; bullets?: string[] }[] = [
    {
      title: 'CLÁUSULA 1 – OBJETO',
      paragraphs: [`Locação do imóvel situado na: ${address}${kitnet.description ? ` (${kitnet.description})` : ''}.`],
    },
    {
      title: 'CLÁUSULA 2 – PRAZO',
      paragraphs: [`O prazo da locação é de ${durationText}, iniciando-se em ${startDateFormatted}, podendo ser prorrogado mediante acordo entre as partes.`],
    },
    {
      title: 'CLÁUSULA 3 – VALOR DO ALUGUEL',
      paragraphs: [`O aluguel mensal será de ${formatCurrency(rentVal)} (${rentExtenso}), com vencimento todo dia ${dueDay} de cada mês.`],
    },
    {
      title: 'CLÁUSULA 4 – FORMA DE PAGAMENTO',
      paragraphs: [
        `O pagamento será realizado via PIX diretamente ao LOCADOR, Sr. ${locadorName}, CPF nº ${formatCPF(locadorCpf)}, utilizando a chave PIX vinculada ao e-mail ${adminPixKey}, ou outra informada formalmente ao LOCATÁRIO.`,
        `O pagamento efetuado na referida chave PIX será considerado plenamente válido e quitativo.`,
      ],
    },
    {
      title: 'CLÁUSULA 5 – ATRASO NO PAGAMENTO',
      paragraphs: ['Em caso de atraso:'],
      bullets: [
        'Multa de 2% sobre o valor devido;',
        'Juros de 1% ao mês;',
        'Correção monetária quando aplicável.',
      ],
    },
    {
      title: 'CLÁUSULA 6 – INADIMPLÊNCIA, RESCISÃO E DESOCUPAÇÃO DO IMÓVEL',
      paragraphs: [
        'O não pagamento do aluguel na data de vencimento acarretará multa, juros e encargos previstos neste contrato.',
        'O atraso superior a 30 (trinta) dias no pagamento será considerado inadimplemento contratual grave, facultando ao LOCADOR a rescisão do contrato.',
        'Rescindido o contrato por inadimplência, o LOCATÁRIO será notificado para desocupação voluntária do imóvel no prazo de até 30 (trinta) dias. Durante este período, permanecem devidos todos os valores em aberto.',
        'O não cumprimento da desocupação autoriza medidas judiciais cabíveis, incluindo ação de despejo.',
      ],
    },
    {
      title: 'CLÁUSULA 7 – DESPESAS',
      paragraphs: [
        'São de responsabilidade do LOCATÁRIO:',
      ],
      bullets: [
        'Aluguel mensal;',
        'Água;',
        'Energia elétrica;',
        'Demais despesas do imóvel.',
      ],
    },
    {
      title: 'CLÁUSULA 7 (CONTINUAÇÃO) – IPTU E TAXA DE LIXO',
      paragraphs: [
        'Fica estabelecido que as despesas referentes ao IPTU (Imposto Predial e Territorial Urbano) e à Taxa de Lixo / Coleta de Resíduos permanecerão de responsabilidade do LOCADOR, estando já inclusas no valor do aluguel, não sendo cobradas adicionalmente do LOCATÁRIO durante a vigência deste contrato.',
      ],
    },
    {
      title: 'CLÁUSULA 8 – CAUÇÃO',
      paragraphs: [
        `O LOCATÁRIO entrega caução de ${formatCurrency(depositVal)} (${depositExtenso}).`,
        'A caução poderá ser utilizada para:',
      ],
      bullets: [
        'Débitos de aluguel;',
        'Danos ao imóvel;',
        'Multas contratuais;',
        'Taxa de limpeza prevista neste contrato.',
      ],
    },
    {
      title: 'CLÁUSULA 8 (CONTINUAÇÃO) – RESTITUIÇÃO DA CAUÇÃO',
      paragraphs: [
        'Saldo remanescente será devolvido em até 30 (trinta) dias após vistoria final e entrega das chaves.',
      ],
    },
    {
      title: 'CLÁUSULA 9 – OBRIGAÇÕES DO LOCATÁRIO',
      paragraphs: [],
      bullets: [
        'Zelar pelo imóvel;',
        'Manter conservação e limpeza;',
        'Pagar em dia;',
        'Usar exclusivamente para moradia.',
      ],
    },
    {
      title: 'CLÁUSULA 10 – DEVOLUÇÃO DO IMÓVEL',
      paragraphs: [
        'O imóvel está sendo entregue ao LOCATÁRIO limpo, higienizado, organizado, conservado, em perfeitas condições de uso e habitabilidade, com suas instalações elétricas, hidráulicas, portas, janelas, fechaduras e demais itens em pleno funcionamento, conforme vistoria inicial.',
        'O LOCATÁRIO declara ter recebido o imóvel em boas condições e compromete-se a mantê-lo devidamente conservado durante toda a vigência da locação.',
        'Ao término do contrato, o imóvel deverá ser devolvido nas mesmas condições em que foi recebido, ressalvados apenas os desgastes naturais decorrentes do uso normal.',
        'Caso sejam constatados danos, falta de conservação, sujeira excessiva, resíduos, lixo, móveis ou objetos deixados no imóvel, o LOCATÁRIO será responsável pelos custos necessários para restabelecer o imóvel às condições originais de entrega.',
        `Caso o imóvel não seja devolvido limpo, higienizado e em condições adequadas de ocupação, será cobrada uma taxa de limpeza no valor de ${formatCurrency(cleaningFee)} (${cleaningFeeExtenso}), podendo o valor ser descontado da caução.`,
        'A vistoria de saída será realizada pelo LOCADOR ou seu REPRESENTANTE, servindo como base para apuração de eventuais débitos, danos ou custos de limpeza.',
      ],
    },
    {
      title: 'CLÁUSULA 11 – OBRAS E MODIFICAÇÕES',
      paragraphs: [
        'Ficam proibidas obras, reformas ou modificações sem autorização prévia e por escrito do LOCADOR ou de seu REPRESENTANTE.',
      ],
    },
    {
      title: 'CLÁUSULA 12 – COMPROVAÇÃO DE SERVIÇOS',
      paragraphs: [
        'Obras ou serviços autorizados deverão ser comprovados mediante apresentação de nota fiscal válida (CNPJ), quando solicitado.',
      ],
    },
    {
      title: 'CLÁUSULA 13 – BENFEITORIAS',
      paragraphs: [],
      bullets: [
        'Não serão indenizadas;',
        'Não serão reembolsadas;',
        'Permanecerão incorporadas ao imóvel.',
      ],
    },
    {
      title: 'CLÁUSULA 14 – RESCISÃO ANTECIPADA',
      paragraphs: [
        `Em caso de rescisão antecipada por iniciativa do LOCATÁRIO, será devida multa correspondente a 1 (um) aluguel vigente, no valor de ${formatCurrency(rentVal)} (${rentExtenso}), podendo ser reduzida proporcionalmente ao período já cumprido, conforme legislação aplicável.`,
      ],
    },
    {
      title: 'CLÁUSULA 15 – PROIBIÇÕES',
      paragraphs: ['É proibido:'],
      bullets: [
        'Sublocar o imóvel;',
        'Transferir o contrato sem autorização;',
        'Utilizar o imóvel para atividades comerciais ou profissionais.',
      ],
    },
    {
      title: 'CLÁUSULA 15.1 – PROIBIÇÃO DE USO COMERCIAL',
      paragraphs: [
        'O imóvel destina-se exclusivamente à moradia residencial.',
        'É expressamente proibido utilizar o imóvel para fins comerciais, empresariais, industriais ou profissionais, incluindo:',
      ],
      bullets: [
        'Abertura de empresa no endereço;',
        'Atendimento ao público;',
        'Depósito de mercadorias;',
        'Qualquer atividade com finalidade de lucro.',
      ],
    },
    {
      title: 'CLÁUSULA 16 – VISTORIA',
      paragraphs: [
        'O LOCADOR ou seu REPRESENTANTE poderá realizar vistorias no imóvel mediante aviso prévio ao LOCATÁRIO, em horário razoável.',
      ],
    },
    {
      title: 'CLÁUSULA 16.1 – TERMO DE VISTORIA E REGISTRO FOTOGRÁFICO',
      paragraphs: [
        'O LOCATÁRIO declara receber o imóvel conforme Termo de Vistoria Inicial, contendo descrição das condições do imóvel e registros fotográficos, que fazem parte integrante deste contrato. O LOCATÁRIO compromete-se a devolver o imóvel nas mesmas condições registradas na vistoria inicial, salvo desgaste natural pelo uso.',
      ],
    },
    {
      title: 'CLÁUSULA 16.2 – RESPONSABILIDADE POR DANOS',
      paragraphs: [
        'O LOCATÁRIO será responsável por quaisquer danos causados ao imóvel, suas instalações, equipamentos, móveis ou acessórios, quando decorrentes de mau uso, negligência, imprudência, descuido ou por atos praticados por seus familiares, visitantes ou pessoas autorizadas.',
      ],
    },
    {
      title: 'CLÁUSULA 16.3 – ENTREGA DAS CHAVES',
      paragraphs: [
        'A entrega das chaves somente será considerada concluída após a realização da vistoria final, quitação de todos os débitos existentes e entrega do imóvel conforme as condições previstas neste contrato.',
      ],
    },
    {
      title: 'CLÁUSULA 17 – ADMINISTRAÇÃO',
      paragraphs: [
        `O LOCADOR, Sr. ${locadorName}, CPF nº ${formatCPF(locadorCpf)}, e-mail ${adminPixKey}, administra diretamente o imóvel, com poderes para:`,
      ],
      bullets: [
        'Administrar o imóvel;',
        'Receber aluguéis e caução;',
        'Emitir recibos;',
        'Cobrar débitos;',
        'Autorizar serviços;',
        'Realizar vistorias;',
        'Firmar e administrar contratos.',
      ],
    },
    {
      title: 'CLÁUSULA 18 – CONTAS DE CONSUMO',
      paragraphs: [
        'O LOCATÁRIO deverá providenciar a transferência das contas de água e energia elétrica para seu nome no prazo máximo de 10 (dez) dias após a assinatura deste contrato, responsabilizando-se integralmente pelos consumos a partir da data de início da locação.',
      ],
    },
    {
      title: 'CLÁUSULA 19 – REAJUSTE',
      paragraphs: [
        'O aluguel será reajustado anualmente pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo) ou por outro índice oficial que venha a substituí-lo.',
      ],
    },
    {
      title: 'CLÁUSULA 20 – FORO',
      paragraphs: [
        `Fica eleito o foro da Comarca de ${cityState} para dirimir quaisquer controvérsias oriundas deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.`,
      ],
    },
  ];

  clauses.forEach((clause) => {
    checkPageBreak(12);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(clause.title, marginX, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    clause.paragraphs.forEach((p) => {
      const lines = doc.splitTextToSize(p, contentWidth);
      checkPageBreak(lines.length * 3.8 + 2);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 3.8 + 1.5;
    });

    if (clause.bullets && clause.bullets.length > 0) {
      clause.bullets.forEach((b) => {
        const bulletLines = doc.splitTextToSize(`• ${b}`, contentWidth - 4);
        checkPageBreak(bulletLines.length * 3.8 + 1.5);
        doc.text(bulletLines, marginX + 3, cursorY);
        cursorY += bulletLines.length * 3.8 + 1;
      });
    }

    cursorY += 2;
  });

  // Signatures Section
  const neededHeightSignatures = witnessesCount > 0 ? 52 : 36;
  checkPageBreak(neededHeightSignatures);

  cursorY += 6;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ASSINATURAS', 105, cursorY, { align: 'center' });
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${cityState}, ${signatureDateFormatted}.`, 105, cursorY, { align: 'center' });
  cursorY += 16;

  // Signature Lines
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX + 10, cursorY, marginX + 75, cursorY);
  doc.line(marginX + 99, cursorY, marginX + 164, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(locadorName, marginX + 42.5, cursorY + 4, { align: 'center' });
  doc.text(tenant.fullName, marginX + 131.5, cursorY + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${formatCPF(locadorCpf)} • LOCADOR(A)`, marginX + 42.5, cursorY + 7.5, { align: 'center' });
  doc.text(`CPF: ${formatCPF(tenant.cpf)} • LOCATÁRIO(A)`, marginX + 131.5, cursorY + 7.5, { align: 'center' });

  if (witnessesCount > 0) {
    cursorY += 16;
    checkPageBreak(22);

    doc.setDrawColor(148, 163, 184);

    if (witnessesCount === 1) {
      doc.line(marginX + 47, cursorY, marginX + 127, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const w1NameText = witness1Name
        ? `Testemunha: ${witness1Name}`
        : 'Testemunha: ____________________________';
      const w1CpfText = witness1Cpf
        ? `CPF: ${formatCPF(witness1Cpf)}`
        : 'CPF: __________________';
      doc.text(w1NameText, marginX + 87, cursorY + 3.8, { align: 'center' });
      doc.text(w1CpfText, marginX + 87, cursorY + 7.2, { align: 'center' });
    } else {
      doc.line(marginX + 10, cursorY, marginX + 75, cursorY);
      doc.line(marginX + 99, cursorY, marginX + 164, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);

      const w1NameText = witness1Name
        ? `Testemunha 1: ${witness1Name}`
        : 'Testemunha 1: ____________________________';
      const w1CpfText = witness1Cpf
        ? `CPF: ${formatCPF(witness1Cpf)}`
        : 'CPF: __________________';

      const w2NameText = witness2Name
        ? `Testemunha 2: ${witness2Name}`
        : 'Testemunha 2: ____________________________';
      const w2CpfText = witness2Cpf
        ? `CPF: ${formatCPF(witness2Cpf)}`
        : 'CPF: __________________';

      doc.text(w1NameText, marginX + 42.5, cursorY + 3.8, { align: 'center' });
      doc.text(w2NameText, marginX + 131.5, cursorY + 3.8, { align: 'center' });
      doc.text(w1CpfText, marginX + 42.5, cursorY + 7.2, { align: 'center' });
      doc.text(w2CpfText, marginX + 131.5, cursorY + 7.2, { align: 'center' });
    }
  }

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, 290, { align: 'right' });
    doc.text(`Contrato de Locação Residencial — ${cityState}`, marginX, 290);
  }

  const safeTenantName = (tenant?.fullName || 'Inquilino').replace(/\s+/g, '_');
  const safeNumber = kitnet?.number || '01';
  const fileName = `Contrato_Locacao_${safeTenantName}_${safeNumber}.pdf`;
  const dataUri = doc.output('datauristring');

  if (autoDownload) {
    doc.save(fileName);
  }

  return { dataUri, fileName };
}

export const generateKitnetContractPdfFile = generateKitnetRentalContractPdfFile;

export function getKitnetContractRawText(options: {
  kitnet: Kitnet;
  tenant: KitnetTenant;
  contract: KitnetContract;
  settings: SystemSettings;
}): string {
  const { kitnet, tenant, contract, settings } = options;
  const rentVal = contract?.rentValue || 0;
  const depositVal = contract?.deposit || 0;
  const dueDay = contract?.dueDay || 10;
  const durationMonths = contract?.durationMonths || 12;
  const startDateFormatted = formatDateFullPT(contract?.startDate);
  const signatureDateFormatted = formatDateFullPT(contract?.signatureDate || contract?.startDate);
  const durationText = formatDurationExtenso(durationMonths);
  const rentExtenso = formatCurrencyExtenso(rentVal);
  const depositExtenso = formatCurrencyExtenso(depositVal);
  const locadorName = settings.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings.adminCpf || '155.521.029-59';
  const adminPixKey = settings.adminPixKey || settings.adminEmail || 'wleal0131@gmail.com';
  const cityState = settings.cityState || 'Barra Velha – SC';
  const cleaningFee =
    contract?.cleaningFee !== undefined
      ? contract.cleaningFee
      : kitnet?.cleaningFeeBase !== undefined
      ? kitnet.cleaningFeeBase
      : (settings.cleaningFee ?? 400);
  const cleaningFeeExtenso = formatCurrencyExtenso(cleaningFee);
  const address = kitnet?.address?.trim() || settings.cityState || 'Barra Velha - SC';
  const tenantName = tenant?.fullName || 'Nome do Locatário';
  const tenantCpf = tenant?.cpf || '000.000.000-00';

  return `CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL
INSTRUMENTO PARTICULAR DE LOCAÇÃO URBANA

IDENTIFICAÇÃO DAS PARTES CONTRATANTES:
LOCADOR: ${locadorName}, inscrito no CPF sob o nº ${formatCPF(locadorCpf)}.
LOCATÁRIO(A): ${tenantName}, inscrito(a) no CPF sob o nº ${formatCPF(tenantCpf)}, RG: ${tenant?.rg || 'Não informado'}, Tel/WhatsApp: ${tenant?.whatsapp || tenant?.phone || 'Não informado'}, E-mail: ${tenant?.email || 'Não informado'}.

CLÁUSULA 1 – OBJETO E DESTINAÇÃO RESIDENCIAL
1.1. O presente instrumento tem como objeto a locação do imóvel residencial situado em: ${address}${kitnet?.description ? ` (${kitnet.description})` : ''}.
1.2. O imóvel destina-se única e exclusivamente para fins de moradia residencial do(a) LOCATÁRIO(A) e seus dependentes imediatos, sendo vedado qualquer uso comercial, industrial ou prestação de serviços no local.

CLÁUSULA 2 – PRAZO E VIGÊNCIA
2.1. O prazo de locação é de ${durationText}, iniciando-se em ${startDateFormatted}, podendo ser prorrogado mediante termo aditivo formal e prévio acordo entre as partes.

CLÁUSULA 3 – VALOR DO ALUGUEL
3.1. O aluguel mensal ajustado é de ${formatCurrency(rentVal)} (${rentExtenso}), com vencimento todo dia ${dueDay} de cada mês subsequente ao vencido.

CLÁUSULA 4 – FORMA DE PAGAMENTO E QUITAÇÃO
4.1. O pagamento deverá ser efetuado impreterivelmente até a data de vencimento via PIX diretamente ao LOCADOR (${locadorName}), CPF ${formatCPF(locadorCpf)}, através da chave PIX: ${adminPixKey}.
4.2. O comprovante oficial de transferência bancária servirá como recibo provisório de quitação.

CLÁUSULA 5 – ATRASO NO PAGAMENTO E ENCARGOS MORATÓRIOS
5.1. Em caso de atraso na quitação do aluguel ou encargos acessórios, incidirá:
• Multa moratória de 2% (dois por cento) sobre o valor total do débito em aberto;
• Juros de mora de 1% (um por cento) ao mês, calculados pro rata die;
• Atualização e correção monetária quando cabível.

CLÁUSULA 6 – INADIMPLÊNCIA, RESCISÃO E DESOCUPAÇÃO
6.1. O atraso no pagamento do aluguel ou de quaisquer encargos superiores a 30 (trinta) dias configurará infração contratual grave, facultando ao LOCADOR a rescisão de pleno direito do contrato.
6.2. Rescindido o contrato por inadimplência, o LOCATÁRIO será notificado para desocupação voluntária do imóvel no prazo improrrogável de até 30 (trinta) dias, permanecendo devidos todos os aluguéis e encargos até a efetiva entrega das chaves.

CLÁUSULA 7 – DESPESAS E CONSUMO
7.1. São de inteira responsabilidade do LOCATÁRIO as despesas com consumo de água, energia elétrica e eventuais serviços contratados diretamente.
7.2. Fica expressamente estabelecido que o IPTU e a taxa de coleta de lixo estão inclusos no aluguel e permanecem sob encargo do LOCADOR.

CLÁUSULA 8 – CAUÇÃO DE GARANTIA E RESTITUIÇÃO
8.1. A título de garantia locatícia, o LOCATÁRIO entrega a quantia de ${formatCurrency(depositVal)} (${depositExtenso}).
8.2. A caução poderá ser retida para liquidação de aluguéis em atraso, danos constatados nas instalações, multas ou para quitação da taxa de limpeza final.
8.3. O saldo remanescente será devolvido ao LOCATÁRIO em até 30 (trinta) dias corridos após a vistoria final e a devolução oficial de todas as chaves.

CLÁUSULA 9 – OBRIGAÇÕES GERAIS DO LOCATÁRIO
9.1. O LOCATÁRIO se obriga a:
• Zelar pelo imóvel como se seu próprio fosse;
• Manter o imóvel rigorosamente limpo, higienizado e conservado;
• Realizar os pagamentos pontualmente nas datas de vencimento;
• Respeitar integralmente as normas de boa vizinhança e sossego.

CLÁUSULA 10 – DEVOLUÇÃO DO IMÓVEL E TAXA DE LIMPEZA
10.1. O imóvel é entregue perfeitamente limpo, pintado e em condições adequadas de habitabilidade.
10.2. Ao término ou rescisão da locação, o imóvel deverá ser restituído nas mesmas condições de conservação e limpeza em que foi recebido.
10.3. Caso o imóvel seja entregue sem a devida higienização e limpeza profissional, será cobrada taxa de limpeza no valor de ${formatCurrency(cleaningFee)} (${cleaningFeeExtenso}), a ser descontada da caução ou cobrada diretamente do LOCATÁRIO.

CLÁUSULA 11 – OBRAS E MODIFICAÇÕES
11.1. É terminantemente proibida a realização de qualquer obra, reforma, modificação estética ou estrutural sem autorização prévia e por escrito do LOCADOR.

CLÁUSULA 12 – COMPROVAÇÃO DE SERVIÇOS
12.1. Quaisquer reparos ou manutenções devidamente autorizados pelo LOCADOR deverão ser formalmente comprovados por meio de Nota Fiscal idônea (CNPJ).

CLÁUSULA 13 – BENFEITORIAS
13.1. Benfeitorias úteis ou voluntárias realizadas no imóvel, ainda que autorizadas, ficarão incorporadas ao patrimônio do LOCADOR, sem direito a qualquer indenização ou retenção.

CLÁUSULA 14 – VISTORIA
14.1. O LOCADOR reserva-se o direito de, mediante aviso prévio de 48 (quarenta e oito) horas, vistoriar as condições gerais de conservação e higiene do imóvel.

CLÁUSULA 15 – PERTURBAÇÃO DO SOSSEGO E NORMAS DE CONVIVÊNCIA
15.1. É expressamente vedada a perturbação do sossego de vizinhos por meio de som excessivo, algazarra ou desordens, devendo ser rigorosamente respeitada a Lei do Silêncio das 22h às 08h.
15.2. O desrespeito reiterado facultará a rescisão imediata por quebra de conduta.

CLÁUSULA 16 – SUBLOCAÇÃO E CESSÃO
16.1. É expressamente vedada a sublocação total ou parcial, a cessão a terceiros, a cessão gratuita ou por comodato, sem expresso consentimento do LOCADOR.

CLÁUSULA 17 – NOTIFICAÇÕES E COMUNICAÇÕES
17.1. Todas as notificações, avisos e cobranças poderão ser formalmente encaminhados via e-mail ou mensagens eletrônicas (WhatsApp) nos contatos fornecidos pelas partes.

CLÁUSULA 18 – RESCISÃO ANTECIPADA E AVISO PRÉVIO
18.1. Na hipótese de rescisão por iniciativa do LOCATÁRIO antes do termo final, este deverá comunicar por escrito com aviso prévio mínimo de 30 (trinta) dias, sujeitando-se às multas contratuais proporcionais.

CLÁUSULA 19 – DESOCUPAÇÃO E ENTREGA DAS CHAVES
19.1. A desocupação do imóvel somente se considerará consumada com a realização satisfatória da vistoria final de saída e a entrega presencial de todas as chaves ao LOCADOR.

CLÁUSULA 20 – FORO DE ELEIÇÃO E DISPOSIÇÕES FINAIS
20.1. As partes elegem o Foro da Comarca de ${cityState} para dirimir quaisquer dúvidas ou litígios oriundos do presente contrato, com expressa renúncia de qualquer outro.

E, por estarem assim justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor e forma, perante 2 (duas) testemunhas instrumentárias.

${cityState}, ${signatureDateFormatted}.


______________________________________________________
${locadorName}
LOCADOR • CPF: ${formatCPF(locadorCpf)}


______________________________________________________
${tenantName}
LOCATÁRIO(A) • CPF: ${formatCPF(tenantCpf)}


TESTEMUNHAS:

1. _________________________________    2. _________________________________
   Nome:                                   Nome:
   CPF:                                    CPF:
`;
}

export function openKitnetContractPrintWindow(options: {
  kitnet: Kitnet;
  tenant: KitnetTenant;
  contract: KitnetContract;
  settings: SystemSettings;
}) {
  const text = getKitnetContractRawText(options);
  printContractDocument('Contrato de Locação Residencial', text);
}

