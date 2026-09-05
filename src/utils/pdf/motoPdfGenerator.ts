import { jsPDF } from 'jspdf';
import { MotoRentalContractPdfOptions } from './types';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  formatCurrencyExtenso,
  formatDateFullPT,
  addMonthsToDate,
  getTodayLocalDateString,
} from '../formatters';
import { getWeekdayName } from '../contractCalculations';
import { weeklyToMonthly, monthlyToWeekly } from '../../domain';
import { printContractDocument } from '../printHelper';

export function generateMotoRentalContractPdfFile(options: MotoRentalContractPdfOptions) {
  const { moto, tenant, contract, settings } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const locadorName = settings.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings.adminCpf || '155.521.029-59';
  const locadorAddress = settings.adminAddress || settings.cityState || 'Barra Velha - SC';

  const startDate = options.startDate || contract?.startDate || getTodayLocalDateString();
  const startDateFormatted = formatDate(startDate);
  const minMonths = options.minimumMonths || 3;
  const endDateMin = options.endDateMin || addMonthsToDate(startDate, minMonths);
  const endDateMinFormatted = formatDate(endDateMin);

  const isWeekly =
    options.paymentFrequency === 'semanal' ||
    (!options.paymentFrequency && contract?.paymentFrequency === 'semanal' && Boolean(contract?.weeklyValue));

  const monthlyVal =
    options.monthlyValue !== undefined && options.monthlyValue > 0
      ? options.monthlyValue
      : (contract?.monthlyValue ?? (contract?.weeklyValue ? weeklyToMonthly(contract.weeklyValue) : 0));
  const monthlyValExtenso = formatCurrencyExtenso(monthlyVal);

  const weeklyVal =
    options.weeklyValue !== undefined && options.weeklyValue > 0
      ? options.weeklyValue
      : contract?.paymentFrequency === 'semanal' && contract?.weeklyValue
      ? contract.weeklyValue
      : (contract?.weeklyValue ?? (contract?.monthlyValue ? monthlyToWeekly(contract.monthlyValue) : 0));
  const weeklyValExtenso = formatCurrencyExtenso(weeklyVal);

  const dueDay = options.dueDay !== undefined ? options.dueDay : (contract?.dueDay || 10);
  const dueDayOfWeek =
    options.dueDayOfWeek !== undefined
      ? typeof options.dueDayOfWeek === 'number'
        ? getWeekdayName(options.dueDayOfWeek)
        : options.dueDayOfWeek
      : contract?.dueDayOfWeek !== undefined
      ? getWeekdayName(contract.dueDayOfWeek)
      : 'Segunda-feira';

  const dueDayName = dueDayOfWeek || 'Segunda-feira';
  const dueLimitTime = options.dueLimitTime || '18:00';

  const depositVal = options.deposit !== undefined ? options.deposit : (contract?.deposit !== undefined ? contract.deposit : 1500);
  const depositValExtenso = formatCurrencyExtenso(depositVal);

  const insuranceDeductible = options.insuranceDeductible !== undefined && options.insuranceDeductible !== ''
    ? (typeof options.insuranceDeductible === 'number' ? formatCurrency(options.insuranceDeductible).replace('R$', '').trim() : String(options.insuranceDeductible))
    : '1.500,00';

  const contractCity = options.contractCity || settings.cityState || 'são jose - SC';
  const contractDateFormatted = formatDateFullPT(startDate);

  const initialKm = options.initialKm !== undefined
    ? options.initialKm
    : (moto.delivery?.initialKm || moto.currentKm || 0);

  const inspectionDate = options.inspectionDate || startDate;
  const inspectionDateFormatted = formatDate(inspectionDate);
  const inspectionTime = options.inspectionTime || '10:00';

  const marginX = 16;
  const pageWidth = 210;
  const contentWidth = 178;
  const maxY = 276;
  let cursorY = 16;

  function drawHeader(isFirstPage: boolean) {
    if (isFirstPage) {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(marginX, cursorY, contentWidth, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('CONTRATO DE LOCAÇÃO DE MOTOCICLETA', 105, cursorY + 5.5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('COM PRAZO MÍNIMO E RENOVAÇÃO AUTOMÁTICA', 105, cursorY + 10.5, { align: 'center' });
      cursorY += 18;
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('CONTRATO DE LOCAÇÃO DE MOTOCICLETA COM PRAZO MÍNIMO', marginX, 11);
      doc.text(`${moto.brand} ${moto.model} (${moto.plate}) • ${tenant.fullName}`, pageWidth - marginX, 11, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, 13, pageWidth - marginX, 13);
      cursorY = 18;
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

  // Section: CLÁUSULA 1º - IDENTIFICAÇÃO DAS PARTES CONTRATANTES
  const sections: Array<{
    title: string;
    items?: string[];
    paragraphs: string[];
    bullets?: string[];
  }> = [
    {
      title: 'CLÁUSULA 1º - IDENTIFICAÇÃO DAS PARTES CONTRATANTES',
      paragraphs: [
        `1.1. LOCADOR: ${locadorName}, pessoa física inscrita no CPF sob o nº ${formatCPF(locadorCpf)}, residente e domiciliado em ${locadorAddress}, doravante denominado simplesmente LOCADOR.`,
        `1.2. LOCATÁRIO: ${tenant.fullName}, Profissão: ${tenant.profession || 'Autônomo / Entregador'}, portador e inscrito no CPF sob o nº ${formatCPF(tenant.cpf)}, portador da CNH categoria "A" nº ${tenant.cnh?.number || 'Informada no cadastro'}, residente e domiciliado na: ${tenant.address || 'Endereço cadastrado no sistema'}, telefone de contato com WhatsApp: ${formatPhone(tenant.whatsapp || tenant.phone || '') || 'Não informado'}, E-mail: ${tenant.email || 'Não informado'}, doravante denominado simplesmente LOCATÁRIO.`,
        '1.3. As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Locação de Motocicleta, que se regerá pelas cláusulas seguintes e pelas condições descritas neste instrumento.',
        '1.4. Para formalização da locação, o LOCATÁRIO deverá fornecer obrigatoriamente:',
      ],
      bullets: [
        'Documento oficial com foto;',
        'CNH categoria "A" válida;',
        'Comprovante de residência atualizado;',
        'Selfie segurando a CNH;',
        'Telefone celular com WhatsApp ativo.',
      ],
    },
    {
      title: 'CLÁUSULA 2º - DO OBJETO DO CONTRATO',
      paragraphs: [
        '2.1. O objeto deste contrato é a locação da motocicleta de propriedade do LOCADOR, a seguir identificada, a qual será entregue ao LOCATÁRIO em perfeitas condições de uso, funcionamento e segurança:',
      ],
      bullets: [
        `Marca/Modelo: ${moto.brand} ${moto.model}`,
        `Ano de Fabricação/Modelo: ${moto.year}`,
        `Cor Predominante: ${moto.color || 'Preta'}`,
        `Placa: ${moto.plate}`,
        `RENAVAM: ${moto.renavam || 'Conforme documentação'}`,
        `Quilometragem Inicial (Retirada): ${initialKm.toLocaleString('pt-BR')} km`,
      ],
    },
    {
      title: 'CLÁUSULA 2º (CONTINUAÇÃO) - DOCUMENTAÇÃO E ACESSÓRIOS',
      paragraphs: [
        '2.2. A motocicleta acima descrita é entregue com a documentação em dia (CRLV digital ou físico), ferramentas obrigatórias (se houver) e acessórios descritos no Termo de Vistoria (Anexo I), que passa a fazer parte integrante deste instrumento.',
      ],
    },
    {
      title: 'CLÁUSULA 3º - DA UTILIZAÇÃO E DO USO EXCLUSIVO',
      paragraphs: [
        '3.1. A motocicleta destina-se exclusivamente ao uso legal do LOCATÁRIO, sendo permitida a utilização para transporte pessoal ou para fins de trabalho autônomo em plataformas de aplicativo de transporte e entregas (ex: Uber, 99, iFood, etc.).',
        '3.2. O uso da motocicleta é EXCLUSIVO do LOCATÁRIO, sendo expressamente PROIBIDO:',
      ],
      bullets: [
        'a) Sublocar, emprestar, ceder ou transferir a posse da motocicleta a terceiros sob qualquer pretexto, seja de forma gratuita ou onerosa;',
        'b) Conduzir o veículo sob o efeito de álcool, drogas ou qualquer substância que altere a capacidade psicomotora;',
        'c) Utilizar a motocicleta em competições, rachas, manobras perigosas, ou em vias não pavimentadas (off-road) e praias;',
        'd) Transportar carga de peso superior ao limite especificado pelo fabricante da motocicleta.',
      ],
    },
    {
      title: 'CLÁUSULA 3º (CONTINUAÇÃO) - PENALIDADE POR USO INDEVIDO',
      paragraphs: [
        '3.3. O descumprimento de qualquer uma das proibições desta cláusula ensejará a rescisão imediata do contrato por justa causa, com a aplicação das penalidades previstas neste instrumento, além da perda integral da caução.',
      ],
    },
    {
      title: 'CLÁUSULA 4º - DO PRAZO E DA RENOVAÇÃO AUTOMÁTICA',
      paragraphs: [
        `4.1. O presente contrato é firmado pelo prazo mínimo obrigatório de três meses, com início em ${startDateFormatted} e término em ${endDateMinFormatted}.`,
        '4.2. Findo o prazo estipulado no item 4.1, caso o LOCATÁRIO permaneça na posse da motocicleta sem oposição do LOCADOR, o contrato considerar-se-á prorrogado automaticamente por PRAZO INDETERMINADO, mantendo-se vigentes todas as cláusulas, obrigações e penalidades aqui pactuadas.',
        isWeekly
          ? '4.3. No período de prazo indeterminado, a locação passará a ter vigência e renovação estritamente semanal, condicionada ao pagamento antecipado das diárias/semanais.'
          : '4.3. No período de prazo indeterminado, a locação passará a ter vigência e renovação mensal, mantidas as condições e valores pactuados.',
      ],
    },
    {
      title: 'CLÁUSULA 5º - DO VALOR, DA CAUÇÃO E DAS CONDIÇÕES DE PAGAMENTO',
      paragraphs: [
        isWeekly
          ? `5.1. Pela locação da motocicleta descrita na Cláusula 2º, o LOCATÁRIO pagará ao LOCADOR o valor de R$ ${weeklyVal.toFixed(2).replace('.', ',')} (${weeklyValExtenso}) por SEMANA, devendo o pagamento ser realizado de forma ANTECIPADA todo ${dueDayName}, até às ${dueLimitTime} horas.`
          : `5.1. Pela locação da motocicleta descrita na Cláusula 2º, o LOCATÁRIO pagará ao LOCADOR o valor de R$ ${monthlyVal.toFixed(2).replace('.', ',')} (${monthlyValExtenso}) por MÊS, devendo o pagamento ser realizado de forma pontual até o dia ${dueDay} de cada mês.`,
        '5.2. O pagamento deverá ser efetuado exclusivamente via PIX, transferência bancária ou outra modalidade expressamente autorizada pelo LOCADOR. O atraso no pagamento ensejará a rescisão imediata do contrato e a aplicação de multa diária de R$ 10,00 até a efetiva devolução do veículo, sem prejuízo das demais sanções.',
        `5.3. A título de garantia das obrigações assumidas (depósito de segurança), o LOCATÁRIO deposita nas mãos do LOCADOR, neste ato, a quantia em dinheiro de R$ ${depositVal.toFixed(2).replace('.', ',')} (${depositValExtenso}) a título de CAUÇÃO.`,
        '5.4. O valor da caução ficará retido em poder do LOCADOR e será restituído ao LOCATÁRIO no prazo de até 3 (três) dias úteis após a devolução definitiva da motocicleta, desde que o veículo seja entregue nas mesmas condições em que foi retirado, deduzindo-se eventuais valores de multas de trânsito pendentes, avarias, falta de combustível, limpezas ou diárias em atraso.',
        '5.5. Caso o LOCATÁRIO rescinda o presente contrato antes do cumprimento do prazo mínimo obrigatório estabelecido na Cláusula 4.1, perderá o valor da caução a título de multa compensatória por rescisão antecipada, limitada ao valor efetivamente depositado.',
      ],
    },
    {
      title: 'CLÁUSULA 6º - DAS MANUTENÇÕES E CUIDADOS COM A MOTOCICLETA',
      paragraphs: [
        '6.1. As manutenções preventivas decorrentes do desgaste natural pelo uso regular do veículo (tais como substituição de pneus devido ao atingimento do indicador TWI, troca do kit de relação/tração desgastado e reparos mecânicos ou elétricos aos quais o LOCATÁRIO não tenha dado causa) serão de responsabilidade e custeadas integralmente pelo LOCADOR, em oficina por ele credenciada ou indicada.',
        '6.2. É de responsabilidade exclusiva e obrigatória do LOCATÁRIO a verificação diária dos itens básicos de segurança e funcionamento da motocicleta, tais como: calibragem dos pneus, nível do fluido de freio, funcionamento do sistema de iluminação (farol, setas, lanterna) e sinalização sonora (buzina).',
        '6.3. O LOCATÁRIO obriga-se rigorosamente a efetuar a troca do óleo do motor a cada 1.000 (mil) quilômetros rodados, utilizando as especificações exatas recomendadas pelo fabricante. O LOCATÁRIO deverá enviar ao LOCADOR, via WhatsApp, uma foto legível do painel da motocicleta comprovando a quilometragem e a foto da respectiva nota fiscal/recibo do serviço de troca de óleo.',
        '6.4. Os danos causados por negligência, falta de óleo do motor, falta de combustível (que cause a queima da bomba de combustível), mau uso, acidentes, vandalismo ou condução inadequada serão de responsabilidade integral e exclusiva do LOCATÁRIO, incluindo despesas com guincho/reboque, peças e mão de obra profissional para o devido reparo.',
        '6.5. O LOCATÁRIO declara estar ciente de que a motocicleta objeto deste contrato possui sistema de rastreamento veicular ativo durante toda a vigência da locação.',
        '6.6. Em caso de inadimplência, descumprimento contratual, desaparecimento do veículo, suspeita de apropriação indébita ou qualquer situação que coloque em risco o patrimônio do LOCADOR, fica este autorizado a realizar o monitoramento da localização do veículo e, quando tecnicamente possível e seguro, proceder ao bloqueio remoto da motocicleta.',
        '6.7. A perda, extravio, dano ou inutilização da chave principal, chave reserva, controle remoto ou qualquer dispositivo de acionamento da motocicleta será de responsabilidade exclusiva do LOCATÁRIO, que responderá integralmente pelos custos de reposição, codificação, transporte e demais despesas necessárias.',
        '6.8. As despesas com remoção por guincho decorrentes de acidente causado pelo LOCATÁRIO, pane seca, negligência, utilização inadequada ou qualquer evento que não decorra de defeito mecânico natural do veículo serão suportadas integralmente pelo LOCATÁRIO.',
      ],
    },
    {
      title: 'CLÁUSULA 7º - DO SISTEMA DE VISTORIAS (ONLINE E PRESENCIAL)',
      paragraphs: [
        isWeekly
          ? '7.1. VISTORIA ONLINE SEMANAL: Semanalmente, juntamente com o envio do comprovante de pagamento do aluguel, o LOCATÁRIO deverá enviar ao WhatsApp do LOCADOR um vídeo nítido e contínuo mostrando a motocicleta em 360 graus. No vídeo, deve constar obrigatoriamente a traseira com a placa legível, as laterais direita e esquerda e o painel com a quilometragem atual do veículo.'
          : '7.1. VISTORIA ONLINE MENSAL: Mensalmente, juntamente com o envio do comprovante de pagamento do aluguel, o LOCATÁRIO deverá enviar ao WhatsApp do LOCADOR um vídeo nítido e contínuo mostrando a motocicleta em 360 graus. No vídeo, deve constar obrigatoriamente a traseira com a placa legível, as laterais direita e esquerda e o painel com a quilometragem atual do veículo.',
        '7.2. A não apresentação do vídeo de vistoria semanal no prazo estipulado acarretará ao LOCATÁRIO multa contratual de R$20,00 por dia de atraso. Caso o atraso ultrapasse 48 (quarenta e oito) horas, o LOCADOR poderá declarar a rescisão imediata do contrato por justa causa.',
        '7.3. VISTORIA PRESENCIAL MENSAL: O LOCATÁRIO compromete-se a apresentar a motocicleta 1 (uma) vez por mês para vistoria técnica presencial, em dia, hora e endereço previamente indicados pelo LOCADOR dentro do município de atuação da locação.',
        '7.4. A não apresentação da motocicleta para a vistoria presencial mensal agendada ensejará multa contratual de R$20,00 por dia de atraso. O atraso superior a 24 (vinte e quatro) horas autorizará o LOCADOR a rescindir o presente contrato imediatamente.',
      ],
    },
    {
      title: 'CLÁUSULA 8º - DO SEGURO, SINISTROS E ACIDENTES',
      paragraphs: [
        `8.1. A motocicleta conta com seguro/proteção veicular compreensiva contra colisão, incêndio, roubo e furto. Fica estabelecido que o valor da franquia/cota de participação é de R$ ${insuranceDeductible}. Em caso de sinistro que demande o acionamento do seguro, o LOCATÁRIO será o único e integral responsável pelo pagamento desta franquia.`,
        '8.2. DANOS ABAIXO DA FRANQUIA: Em caso de acidente ou colisão onde os danos parciais na motocicleta resultem em valores inferiores ao da franquia estipulada no item 8.1, o LOCATÁRIO arcará integralmente com todos os custos de reparação (peças e mão de obra), devendo os consertos serem realizados obrigatoriamente em oficina indicada pelo LOCADOR.',
        '8.3. O LOCADOR não se obriga a disponibilizar veículo reserva e não se responsabiliza por lucros cessantes do LOCATÁRIO caso este fique impossibilitado de trabalhar devido à indisponibilidade da motocicleta durante o período de reparos na oficina.',
        '8.4. O LOCATÁRIO é integralmente responsável por quaisquer danos materiais, corporais ou morais causados a terceiros, bem como por processos judiciais decorrentes de sua condução.',
        '8.5. Em caso de roubo ou furto, o LOCATÁRIO deverá acionar imediatamente as autoridades policiais via 190, comunicar o LOCADOR imediatamente e lavrar o Boletim de Ocorrência, fornecendo cópia do documento em até 24 (vinte e quatro) horas para os trâmites da seguradora.',
        '8.6. Em caso de perda total da motocicleta decorrente de acidente, colisão, incêndio, roubo ou furto durante a posse do LOCATÁRIO, este será responsável pelo pagamento da franquia contratual e por quaisquer valores, prejuízos, despesas ou diferenças não cobertas pela seguradora ou associação de proteção veicular.',
        '8.7. Em caso de acidente com lesão corporal, invalidez ou morte do LOCATÁRIO, o LOCADOR não responderá por indenizações pessoais, despesas médicas, hospitalares, previdenciárias ou securitárias, cabendo tais responsabilidades exclusivamente às coberturas eventualmente contratadas junto à seguradora, associação de proteção veicular ou terceiros responsáveis pelo evento.',
      ],
    },
    {
      title: 'CLÁUSULA 9º - DAS INFRAÇÕES DE TRÂNSITO E CNH DIGITAL',
      paragraphs: [
        '9.1. O LOCATÁRIO é o único e integral responsável por todas as infrações de trânsito, multas, taxas e pontuações aplicadas à motocicleta durante a vigência deste contrato.',
        '9.2. O LOCATÁRIO compromete-se a aceitar e manter-se indicado como "Condutor Principal" e "Condutor Infrator" no aplicativo CNH DIGITAL do DETRAN logo no ato da retirada do veículo. Caso o LOCATÁRIO desative voluntária ou involuntariamente essa indicação sem autorização, o contrato será rescindido imediatamente por justa causa.',
        '9.3. O LOCATÁRIO autoriza expressamente o LOCADOR a realizar a sua indicação de condutor perante os órgãos de trânsito competentes (DETRAN, PRF, Município), fornecendo assinaturas, documentos e o que mais for necessário, sob pena de incorrer em multa contratual de R$30,00 caso perca o prazo legal de indicação.',
        '9.4. Fica expressamente proibido o deslocamento da motocicleta para fora dos limites do perímetro urbano da Região Metropolitana da locação sem a prévia e expressa autorização por escrito do LOCADOR, sob pena de rescisão contratual imediata e aplicação de multa de R$50,00.',
        '9.5. As multas, infrações e penalidades cometidas durante a vigência da locação permanecerão sob responsabilidade exclusiva do LOCATÁRIO, ainda que a notificação seja emitida ou recebida após o encerramento deste contrato.',
      ],
    },
    {
      title: 'CLÁUSULA 10º - DA INADIMPLÊNCIA, RESCISÃO E APROPRIAÇÃO INDÉBITA',
      paragraphs: [
        `10.1. O atraso no pagamento do aluguel ${isWeekly ? 'semanal' : 'mensal'} por período superior a 48 (quarenta e oito) horas corridas importará na RESCISÃO AUTOMÁTICA do presente contrato por justa causa, independentemente de notificação judicial ou extrajudicial.`,
        '10.2. Ocorrida a rescisão prevista no item 10.1, ou qualquer outra rescisão por descumprimento de cláusula, o LOCATÁRIO fica obrigado a efetuar a devolução imediata da motocicleta no local e horário determinados pelo LOCADOR.',
        '10.3. A não devolução da motocicleta pelo LOCATÁRIO em até 24 (vinte e quatro) horas após a comunicação de rescisão ou término do contrato poderá caracterizar, em tese, o crime de apropriação indébita, previsto no artigo 168 do Código Penal, autorizando o LOCADOR a adotar todas as medidas administrativas, civis e criminais cabíveis, inclusive comunicação às autoridades policiais e utilização dos recursos de rastreamento e bloqueio do veículo.',
      ],
    },
    {
      title: 'CLÁUSULA 11º - DA INEXISTÊNCIA DE VÍNCULO TRABALHISTA E REGRAS GERAIS',
      paragraphs: [
        '11.1. Fica expressamente pactuada a total INEXISTÊNCIA DE VÍNCULO TRABALHISTA ou relação de emprego entre o LOCADOR e o LOCATÁRIO. O LOCATÁRIO declara-se profissional autônomo, não havendo entre as partes qualquer tipo de subordinação, cumprimento de horários, exclusividade ou controle de prestação de serviços.',
        '11.2. O LOCATÁRIO assume a posse autônoma e a responsabilidade civil e criminal exclusiva pela circulação e uso do veículo, isentando o LOCADOR de qualquer solidariedade em acidentes ou eventos danosos, inclusive quanto a lucros cessantes de terceiros.',
        '11.3. As comunicações, avisos e notificações decorrentes deste contrato poderão ser realizados de forma eletrônica, valendo as mensagens enviadas por WhatsApp ou e-mail nos números e endereços indicados na qualificação das partes como prova documental válida.',
      ],
    },
    {
      title: 'CLÁUSULA 12º - DO FORO',
      paragraphs: [
        `12.1. Para dirimir quaisquer controvérsias ou questões decorrentes da aplicação e execução deste contrato, as partes elegem expressamente o foro da Comarca de ${contractCity}, com renúncia expressa a qualquer outro, por mais privilegiado que seja ou venha a ser.`,
      ],
    },
  ];

  sections.forEach((sec) => {
    checkPageBreak(12);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.text(sec.title, marginX, cursorY);
    cursorY += 4.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(51, 65, 85);

    sec.paragraphs.forEach((p) => {
      const lines = doc.splitTextToSize(p, contentWidth);
      checkPageBreak(lines.length * 3.6 + 2);
      doc.text(lines, marginX, cursorY);
      cursorY += lines.length * 3.6 + 1.2;
    });

    if (sec.bullets && sec.bullets.length > 0) {
      sec.bullets.forEach((b) => {
        const bulletLines = doc.splitTextToSize(`• ${b}`, contentWidth - 4);
        checkPageBreak(bulletLines.length * 3.6 + 1.2);
        doc.text(bulletLines, marginX + 3, cursorY);
        cursorY += bulletLines.length * 3.6 + 0.8;
      });
    }

    cursorY += 1.8;
  });

  // Closing paragraph and signatures
  const witnessesCount = options.witnessesCount !== undefined ? options.witnessesCount : 2;
  const neededHeightSignatures = witnessesCount > 0 ? 54 : 38;
  checkPageBreak(neededHeightSignatures);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(51, 65, 85);
  const closingText =
    witnessesCount === 0
      ? 'E, por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, para que produza seus regulares efeitos legais.'
      : witnessesCount === 1
      ? 'E, por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 1 (uma) testemunha abaixo qualificada, para que produza seus regulares efeitos legais.'
      : 'E, por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo qualificadas, para que produza seus efeitos legais.';
  const closingLines = doc.splitTextToSize(closingText, contentWidth);
  doc.text(closingLines, marginX, cursorY);
  cursorY += closingLines.length * 3.6 + 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Local: ${contractCity} , Data: ${contractDateFormatted}`, marginX, cursorY);
  cursorY += 14;

  // Signatures Grid
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX + 8, cursorY, marginX + 78, cursorY);
  doc.line(marginX + 98, cursorY, marginX + 168, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text(locadorName, marginX + 43, cursorY + 3.8, { align: 'center' });
  doc.text(tenant.fullName, marginX + 133, cursorY + 3.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${formatCPF(locadorCpf)} • LOCADOR`, marginX + 43, cursorY + 7.2, { align: 'center' });
  doc.text(`CPF: ${formatCPF(tenant.cpf)} • LOCATÁRIO`, marginX + 133, cursorY + 7.2, { align: 'center' });

  if (witnessesCount > 0) {
    cursorY += 16;
    checkPageBreak(22);

    doc.setDrawColor(148, 163, 184);

    if (witnessesCount === 1) {
      // Single centered witness line
      doc.line(marginX + 49, cursorY, marginX + 129, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const w1NameText = options.witness1Name
        ? `Testemunha: ${options.witness1Name}`
        : 'Testemunha: ____________________________';
      const w1CpfText = options.witness1Cpf
        ? `CPF: ${formatCPF(options.witness1Cpf)}`
        : 'CPF: __________________';
      doc.text(w1NameText, marginX + 89, cursorY + 3.8, { align: 'center' });
      doc.text(w1CpfText, marginX + 89, cursorY + 7.2, { align: 'center' });
    } else {
      // 2 Witnesses side by side
      doc.line(marginX + 8, cursorY, marginX + 78, cursorY);
      doc.line(marginX + 98, cursorY, marginX + 168, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);

      const w1NameText = options.witness1Name
        ? `Testemunha 1: ${options.witness1Name}`
        : 'Testemunha 1: ____________________________';
      const w1CpfText = options.witness1Cpf
        ? `CPF: ${formatCPF(options.witness1Cpf)}`
        : 'CPF: __________________';

      const w2NameText = options.witness2Name
        ? `Testemunha 2: ${options.witness2Name}`
        : 'Testemunha 2: ____________________________';
      const w2CpfText = options.witness2Cpf
        ? `CPF: ${formatCPF(options.witness2Cpf)}`
        : 'CPF: __________________';

      doc.text(w1NameText, marginX + 43, cursorY + 3.8, { align: 'center' });
      doc.text(w2NameText, marginX + 133, cursorY + 3.8, { align: 'center' });
      doc.text(w1CpfText, marginX + 43, cursorY + 7.2, { align: 'center' });
      doc.text(w2CpfText, marginX + 133, cursorY + 7.2, { align: 'center' });
    }
  }

  // -------------------------------------------------------------
  // ANEXO I - TERMO DE VISTORIA E RETIRADA (Always start on new page)
  // -------------------------------------------------------------
  doc.addPage();
  cursorY = 16;

  doc.setFillColor(15, 23, 42);
  doc.rect(marginX, cursorY, contentWidth, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ANEXO I - TERMO DE VISTORIA E RETIRADA', 105, cursorY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('PARTE INTEGRANTE E INDISSOCIÁVEL DO CONTRATO DE LOCAÇÃO', 105, cursorY + 10.5, { align: 'center' });
  cursorY += 18;

  // Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, cursorY, contentWidth, 18, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.text(`Data da Vistoria: ${inspectionDateFormatted}`, marginX + 4, cursorY + 5.5);
  doc.text(`Hora da Retirada: ${inspectionTime}`, marginX + 64, cursorY + 5.5);
  doc.text(`Quilometragem Inicial: ${initialKm.toLocaleString('pt-BR')} km`, marginX + 114, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text(`Veículo: ${moto.brand} ${moto.model} (${moto.year}) • Placa: ${moto.plate} • Renavam: ${moto.renavam || 'N/A'}`, marginX + 4, cursorY + 11);
  doc.text(`Locatário: ${tenant.fullName} • CPF: ${formatCPF(tenant.cpf)}`, marginX + 4, cursorY + 15);

  cursorY += 23;

  // Table: CONDIÇÕES GERAIS DA MOTOCICLETA
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text('ITEM VISTORIADO', marginX + 3, cursorY + 4.2);
  doc.text('ESTADO / CONDIÇÃO', marginX + 58, cursorY + 4.2);
  doc.text('OBSERVAÇÕES', marginX + 116, cursorY + 4.2);
  cursorY += 7;

  const inspectionItems = [
    'Pneu Dianteiro',
    'Pneu Traseiro',
    'Freio Dianteiro (Pastilha/Disco)',
    'Freio Traseiro (Lona/Disco)',
    'Farol Principal e Lanternas',
    'Setas / Piscas (Diant./Tras.)',
    'Buzina e Painel de Instrumentos',
    'Espelhos Retrovisores (D / E)',
    'Assento / Banco e Capa',
    'Pintura, Carenagens e Lataria',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  inspectionItems.forEach((item, idx) => {
    const rowY = cursorY;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, rowY - 1, contentWidth, 5.5, 'F');
    }
    doc.text(item, marginX + 3, rowY + 3);
    doc.text('[ X ] Bom   [  ] Regular   [  ] Ruim', marginX + 58, rowY + 3);
    doc.text('_____________________________', marginX + 116, rowY + 3);
    cursorY += 5.5;
  });

  cursorY += 4;

  // Checklist: NÍVEL DE COMBUSTÍVEL NA RETIRADA
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, cursorY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text('NÍVEL DE COMBUSTÍVEL NA RETIRADA:', marginX + 3, cursorY + 4);
  cursorY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(30, 41, 59);
  doc.text('[  ] Cheio        [  ] 3/4        [  ] 1/2        [  ] 1/4        [  ] Reserva', marginX + 6, cursorY);
  cursorY += 6;

  // Checklist: ACESSÓRIOS ENTREGUES
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, cursorY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text('ACESSÓRIOS ENTREGUES JUNTO COM O VEÍCULO:', marginX + 3, cursorY + 4);
  cursorY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(30, 41, 59);
  doc.text('[  ] Capacete             [  ] Capa de Chuva             [  ] Suporte de Celular', marginX + 6, cursorY);
  cursorY += 5;
  doc.text('[  ] Baú / Bauleto        [  ] Chave Reserva             [  ] Outros: _________________________________', marginX + 6, cursorY);
  cursorY += 7;

  // Box: DESCRIÇÃO DE AVARIAS
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, cursorY, contentWidth, 5.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text('DESCRIÇÃO DETALHADA DE AVARIAS EXISTENTES (Riscos, amassados, peças desgastadas):', marginX + 3, cursorY + 4);
  cursorY += 8;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(marginX, cursorY, contentWidth, 16, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Nenhuma avaria estrutural identificada na vistoria inicial. Veículo entregue revisado, lavado e em perfeitas condições operacionais.', marginX + 3, cursorY + 5);
  cursorY += 19;

  // Video Inspection Note Box
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(marginX, cursorY, contentWidth, 12, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(67, 56, 202);
  doc.text('REGISTRO EM VÍDEO 360°:', marginX + 3, cursorY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(79, 70, 229);
  doc.text('Além deste termo impresso, foi realizado e armazenado um vídeo de vistoria em 360 graus do veículo no ato da entrega, servindo ambos como prova das condições iniciais da motocicleta.', marginX + 3, cursorY + 8.5);
  cursorY += 15;

  // Declaration
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const declarationText = 'O LOCATÁRIO declara que vistoriou a motocicleta, recebeu os acessórios marcados e concorda que o veículo está em perfeitas condições de uso, segurança e funcionamento, obrigando-se a devolvê-lo nas mesmas condições.';
  const declLines = doc.splitTextToSize(declarationText, contentWidth);
  doc.text(declLines, marginX, cursorY);
  cursorY += declLines.length * 3.4 + 9;

  // Signatures on Annex
  doc.setDrawColor(15, 23, 42);
  doc.line(marginX + 8, cursorY, marginX + 78, cursorY);
  doc.line(marginX + 98, cursorY, marginX + 168, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text(locadorName, marginX + 43, cursorY + 3.6, { align: 'center' });
  doc.text(tenant.fullName, marginX + 133, cursorY + 3.6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`CPF: ${formatCPF(locadorCpf)} • LOCADOR`, marginX + 43, cursorY + 7, { align: 'center' });
  doc.text(`CPF: ${formatCPF(tenant.cpf)} • LOCATÁRIO`, marginX + 133, cursorY + 7, { align: 'center' });

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginX, 291, { align: 'right' });
    doc.text(`Contrato de Locação de Motocicleta — ${moto.brand} ${moto.model} (${moto.plate})`, marginX, 291);
  }

  const safeTenantName = (tenant?.fullName || 'Locatario').replace(/\s+/g, '_');
  const safePlate = (moto?.plate || 'SEM_PLACA').replace(/[^A-Za-z0-9]/g, '');
  const fileName = `Contrato_Locacao_Moto_${safeTenantName}_${safePlate}.pdf`;
  const dataUri = doc.output('datauristring');

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { dataUri, fileName };
}

export function getMotoContractRawText(options: MotoRentalContractPdfOptions): string {
  const { moto, tenant, contract, settings } = options;
  const locadorName = settings.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings.adminCpf || '155.521.029-59';
  const locadorAddress = settings.adminAddress || settings.cityState || 'Barra Velha - SC';
  const tenantName = tenant?.fullName || 'Nome do Locatário';
  const tenantCpf = tenant?.cpf || '000.000.000-00';
  const startDate = options.startDate || contract?.startDate || getTodayLocalDateString();
  const startDateFormatted = formatDate(startDate);
  const minMonths = options.minimumMonths || (contract?.durationMonths || 36);
  const isWeekly =
    options.paymentFrequency === 'semanal' ||
    (!options.paymentFrequency && contract?.paymentFrequency === 'semanal');
  const monthlyVal =
    options.monthlyValue !== undefined && options.monthlyValue > 0
      ? options.monthlyValue
      : (contract?.monthlyValue ?? (contract?.weeklyValue ? weeklyToMonthly(contract.weeklyValue) : 0));
  const weeklyVal =
    options.weeklyValue !== undefined && options.weeklyValue > 0
      ? options.weeklyValue
      : (contract?.weeklyValue ?? (monthlyVal ? monthlyToWeekly(monthlyVal) : 0));
  const dueDay = options.dueDay !== undefined ? options.dueDay : (contract?.dueDay || 10);
  const dueDayOfWeek =
    options.dueDayOfWeek !== undefined
      ? typeof options.dueDayOfWeek === 'number'
        ? getWeekdayName(options.dueDayOfWeek)
        : options.dueDayOfWeek
      : 'Segunda-feira';
  const depositVal =
    options.deposit !== undefined ? options.deposit : (contract?.deposit !== undefined ? contract.deposit : 0);
  const insuranceDeductible =
    options.insuranceDeductible !== undefined && options.insuranceDeductible !== ''
      ? (typeof options.insuranceDeductible === 'number' ? formatCurrency(options.insuranceDeductible).replace('R$', '').trim() : String(options.insuranceDeductible))
      : '1.500,00';
  const contractCity = options.contractCity || settings.cityState || 'Barra Velha - SC';
  const totalAgreed = contract?.totalAgreedValue || (isWeekly ? Math.round(minMonths * (52 / 12) * weeklyVal) : monthlyVal * minMonths);
  const initialKm = options.initialKm !== undefined ? options.initialKm : (moto?.currentKm || 0);

  return `CONTRATO DE LOCAÇÃO DE MOTOCICLETA COM OPÇÃO DE COMPRA
INSTRUMENTO PARTICULAR DE LOCAÇÃO DE VEÍCULO AUTOMOTOR E PLANO DE AQUISIÇÃO

IDENTIFICAÇÃO DAS PARTES CONTRATANTES:
LOCADOR: ${locadorName}, portador do CPF sob o nº ${formatCPF(locadorCpf)}, residente e domiciliado em ${locadorAddress}.
LOCATÁRIO: ${tenantName}, portador do CPF sob o nº ${formatCPF(tenantCpf)}, portador da CNH nº ${tenant?.cnh?.number || 'Informada no cadastro'} (Categoria: ${tenant?.cnh?.category || 'A'}), Telefone/WhatsApp: ${formatPhone(tenant?.whatsapp || tenant?.phone || '') || 'Informado'}, Endereço: ${tenant?.address || 'Cadastrado no sistema'}.

CLÁUSULA 1 – DO VEÍCULO (OBJETO DO CONTRATO)
1.1. O presente instrumento tem como objeto a locação da motocicleta de propriedade do LOCADOR, a seguir discriminada:
• Marca/Modelo: ${moto?.brand || 'Honda'} ${moto?.model || 'CG 160 Fan'}
• Ano/Modelo: ${moto?.year || '2024'}
• Cor Predominante: ${moto?.color || 'Preta'}
• Placa: ${moto?.plate || 'SEM_PLACA'}
• RENAVAM: ${moto?.renavam || 'Conforme documentação'}
• Chassi: ${moto?.chassi || 'Conforme documentação'}
• Quilometragem Inicial: ${Number(initialKm).toLocaleString('pt-BR')} km
1.2. O veículo é entregue devidamente vistoriado, em perfeito estado de funcionamento, lataria, pneus e conservação.

CLÁUSULA 2 – DO PRAZO E DA VIGÊNCIA
2.1. A presente locação é celebrada pelo período de ${minMonths} (${formatCurrencyExtenso(minMonths).replace('reais', 'meses')}), com início em ${startDateFormatted}.
2.2. Findo o prazo acordado, mediante quitação de todas as obrigações e parcelas, o LOCATÁRIO adquire a faculdade de exercer a Opção de Compra prevista neste instrumento.

CLÁUSULA 3 – DOS VALORES, PERIODICIDADE E FORMA DE PAGAMENTO
3.1. Pela locação da motocicleta, o LOCATÁRIO pagará ao LOCADOR:
• Periodicidade: ${isWeekly ? 'Semanal' : 'Mensal'}
• Valor da Parcela: ${isWeekly ? `${formatCurrency(weeklyVal)} (${formatCurrencyExtenso(weeklyVal)}) por semana` : `${formatCurrency(monthlyVal)} (${formatCurrencyExtenso(monthlyVal)}) por mês`}
• Vencimento: ${isWeekly ? `Toda ${dueDayOfWeek}, impreterivelmente até às 23h59` : `Todo dia ${dueDay} de cada mês`}
• Valor Total Acordado para Aquisição: ${formatCurrency(totalAgreed)} (${formatCurrencyExtenso(totalAgreed)})
3.2. Os pagamentos serão realizados via transferência bancária ou PIX na chave cadastrada pelo LOCADOR (${settings.adminPixKey || settings.adminEmail || 'Informada na assinatura'}).

CLÁUSULA 4 – DA CAUÇÃO DE GARANTIA
4.1. Como garantia ao cumprimento das obrigações, o LOCATÁRIO entrega a quantia de ${formatCurrency(depositVal)} (${formatCurrencyExtenso(depositVal)}) a título de caução.
4.2. O valor será retido até a vistoria final ou integralização das parcelas, servindo para abatimento de eventuais multas de trânsito, avarias, débitos de diárias ou taxa de despesas.

CLÁUSULA 5 – DO SEGURO E DA FRANQUIA EM CASO DE SINISTRO
5.1. O veículo conta com proteção patrimonial. Em caso de colisão, furto, roubo ou dano indenizável comprovado, o LOCATÁRIO arcará com a franquia estipulada no valor de R$ ${insuranceDeductible}.
5.2. Danos a terceiros ou decorrentes de negligência, embriaguez, dolo ou desrespeito às leis de trânsito não encontram cobertura e correrão integralmente por conta do LOCATÁRIO.

CLÁUSULA 6 – DA MANUTENÇÃO PREVENTIVA E TROCA DE ÓLEO OBRIGATÓRIA
6.1. O LOCATÁRIO se obriga expressamente a realizar a substituição do óleo do motor rigorosamente a cada 1.000 (mil) quilômetros rodados.
6.2. É obrigatória a apresentação do respectivo comprovante de troca de óleo e nota fiscal para manutenção do plano e da garantia operacional da motocicleta.
6.3. Desgastes de peças decorrentes de uso inadequado ou omissão nas trocas de óleo serão custeados exclusivamente pelo LOCATÁRIO.

CLÁUSULA 7 – DAS INFRAÇÕES DE TRÂNSITO E PONTUAÇÃO NA CNH
7.1. O LOCATÁRIO assume total e irrestrita responsabilidade civil e criminal por todas as infrações de trânsito cometidas durante a vigência da posse do veículo.
7.2. O LOCATÁRIO autoriza o LOCADOR a indicá-lo como real condutor infrator perante o órgão de trânsito competente (DETRAN), comprometendo-se a ressarcir de imediato o valor correspondente.

CLÁUSULA 8 – DO USO EXCLUSIVO E DAS VEDAÇÕES
8.1. O veículo destina-se estritamente ao transporte pessoal do LOCATÁRIO ou para serviços de aplicativo/entregas urbanas.
8.2. É terminantemente vedado:
a) Sublocar, emprestar, ceder ou permitir a condução por terceiros sem anuência prévia e formal do LOCADOR;
b) Participar de competições automotivas, rachas, manobras acrobáticas ou pilotagem perigosa;
c) Transportar mercadorias ou substâncias ilícitas, sob pena de rescisão imediata e denúncia às autoridades competentes.

CLÁUSULA 9 – DO RASTREADOR E MONITORAMENTO DE SEGURANÇA
9.1. O veículo é equipado com dispositivo de rastreamento e telemetria 24 horas via satélite. O LOCATÁRIO declara ter plena ciência e autoriza a localização do bem.
9.2. Qualquer tentativa de violação, remoção ou blindagem do sinal do equipamento configurará quebra contratual grave e apropriação indébita.

CLÁUSULA 10 – DO ATRASO NO PAGAMENTO E BLOQUEIO REMOTO
10.1. O atraso no pagamento das parcelas acarretará incidência de multa moratória de 2% (dois por cento) sobre o débito, além de juros de mora de 1% ao mês e correção monetária.
10.2. Constatado atraso superior a 48 (quarenta e oito) horas, o LOCADOR fica expressamente autorizado a acionar o bloqueio remoto preventivo do veículo via rastreador.

CLÁUSULA 11 – DA RESCISÃO CONTRATUAL E RECUPERAÇÃO DO BEM
11.1. O contrato poderá ser rescindido de pleno direito pelo LOCADOR nas seguintes hipóteses:
a) Inadimplemento de parcelas por mais de 7 (sete) dias corridos;
b) Descumprimento das normas de manutenção preventiva ou troca de óleo;
c) Violação de qualquer cláusula deste instrumento.
11.2. Ocorrendo a rescisão, o LOCATÁRIO deverá restituir a motocicleta imediatamente, no prazo máximo de 24 horas, sob pena de caracterização de apropriação indébita (Art. 168 do Código Penal).

CLÁUSULA 12 – DA DEVOLUÇÃO E VISTORIA FINAL DE SAÍDA
12.1. Ao término ou rescisão, a moto será submetida a vistoria técnica e mecânica rigorosa.
12.2. A motocicleta deverá ser devolvida limpa, com pneus em condições seguras e com o mesmo nível de combustível da retirada.

CLÁUSULA 13 – DA OPÇÃO DE COMPRA E TRANSFERÊNCIA DE PROPRIEDADE
13.1. Cumprido integralmente o prazo estipulado de ${minMonths} meses e quitadas todas as parcelas e encargos até atingir o Valor Total Acordado de ${formatCurrency(totalAgreed)}, o LOCATÁRIO adquire o direito à transferência definitiva da propriedade do veículo para seu nome.
13.2. As despesas de transferência perante o DETRAN correrão por conta do adquirente.

CLÁUSULA 14 – DAS DISPOSIÇÕES GERAIS
14.1. A tolerância de qualquer das partes quanto ao descumprimento de prazos ou condições constituirá mera liberalidade, não implicando novação ou renúncia de direitos.

CLÁUSULA 15 – DO FORO
15.1. Para dirimir quaisquer litígios decorrentes da execução deste contrato, as partes elegem o Foro da Comarca de ${contractCity}, com renúncia expressa a qualquer outro.

E, por estarem assim justos e acordados, assinam o presente instrumento em duas vias de igual teor e forma, perante as duas testemunhas abaixo nomeadas.

${contractCity}, ${startDateFormatted}.


______________________________________________________
${locadorName}
LOCADOR (Proprietário) • CPF: ${formatCPF(locadorCpf)}


______________________________________________________
${tenantName}
LOCATÁRIO (Condutor) • CPF: ${formatCPF(tenantCpf)}


TESTEMUNHAS:

1. _________________________________    2. _________________________________
   Nome:                                   Nome:
   CPF:                                    CPF:
`;
}

export function openMotoContractPrintWindow(options: MotoRentalContractPdfOptions) {
  const text = getMotoContractRawText(options);
  printContractDocument('Contrato de Locação de Motocicleta', text);
}
