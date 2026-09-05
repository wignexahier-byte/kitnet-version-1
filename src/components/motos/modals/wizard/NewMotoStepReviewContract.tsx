import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Download,
  Check,
  Eye,
  FileCheck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  formatCurrencyExtenso,
  formatDateFullPT,
  getTodayLocalDateString,
} from '../../../../utils/formatters';
import { weeklyToMonthly, monthlyToWeekly } from '../../../../domain';
import {
  generateMotoRentalContractPdfFile,
  getMotoContractRawText,
  openMotoContractPrintWindow,
} from '../../../../utils/pdf/motoPdfGenerator';
import { copyTextToClipboard } from '../../../../utils/printHelper';

interface NewMotoStepReviewContractProps {
  form: any;
  settings: any;
}

export const NewMotoStepReviewContract: React.FC<NewMotoStepReviewContractProps> = ({
  form,
  settings,
}) => {
  const [contractTab, setContractTab] = useState<'preview' | 'text'>('preview');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const locadorName = settings?.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings?.adminCpf || '155.521.029-59';
  const locadorAddress = settings?.adminAddress || settings?.cityState || 'Barra Velha - SC';

  const tenantName = form.tenantName || 'Condutor Não Identificado';
  const tenantCpf = form.tenantCpf || '000.000.000-00';
  const tenantCnh = form.cnhNumber || 'Em emissão / Não informada';
  const tenantCnhCategory = form.cnhCategory || 'A';
  const tenantPhone = form.tenantPhone || '';
  const tenantEmail = form.tenantEmail || 'Não informado';
  const tenantAddress =
    form.tenantStreet && form.tenantCity
      ? `${form.tenantStreet}${form.tenantNumber ? `, nº ${form.tenantNumber}` : ''}${form.tenantNeighborhood ? `, ${form.tenantNeighborhood}` : ''}, ${form.tenantCity} - ${form.tenantState || 'SC'}`
      : form.tenantAddress || 'Endereço cadastrado no sistema';

  const motoBrand = form.brand || 'Honda';
  const motoModel = form.model || 'CG 160 Fan';
  const motoPlate = form.plate || 'SEM PLACA';
  const motoYear = form.year || new Date().getFullYear();
  const motoColor = form.color || 'Preta';
  const motoChassi = form.chassi || 'Conforme documentação';
  const motoRenavam = form.renavam || 'Conforme documentação';
  const motoKm = form.currentKm !== undefined ? form.currentKm : 0;

  const durationMonths = Number(form.durationMonths) || 36;
  const isWeekly = form.paymentFrequency === 'semanal';
  const monthlyValue = form.monthlyValue || (isWeekly && form.weeklyValue ? weeklyToMonthly(form.weeklyValue) : 0);
  const weeklyValue = form.weeklyValue || (monthlyValue > 0 ? monthlyToWeekly(monthlyValue) : 0);
  const depositValue = form.deposit || 0;
  const totalWeeks = Math.round(durationMonths * (52 / 12));
  const fallbackTotal = isWeekly ? weeklyValue * totalWeeks : monthlyValue * durationMonths;
  const totalAgreedValue = (form.totalAgreedValue && form.totalAgreedValue >= 100) ? form.totalAgreedValue : (fallbackTotal || form.totalAgreedValue || 0);
  const insuranceDeductible =
    typeof form.insuranceDeductible === 'number'
      ? formatCurrency(form.insuranceDeductible).replace('R$', '').trim()
      : (form.insuranceDeductible ? String(form.insuranceDeductible) : '1.500,00');

  const startDate = form.startDate || getTodayLocalDateString();
  const startDateFormatted = formatDate(startDate);
  const startDateFull = formatDateFullPT(startDate);
  const cityState = settings?.cityState || 'Barra Velha – SC';

  const dueDay = Number(form.dueDay) || 10;
  const dueDayOfWeekName =
    form.dueDayOfWeek === 0
      ? 'Domingo'
      : form.dueDayOfWeek === 2
      ? 'Terça-feira'
      : form.dueDayOfWeek === 3
      ? 'Quarta-feira'
      : form.dueDayOfWeek === 4
      ? 'Quinta-feira'
      : form.dueDayOfWeek === 5
      ? 'Sexta-feira'
      : form.dueDayOfWeek === 6
      ? 'Sábado'
      : 'Segunda-feira';

  const getPdfOptions = (autoDownload = true) => ({
    moto: {
      id: 'preview',
      brand: motoBrand,
      model: motoModel,
      plate: motoPlate,
      year: Number(motoYear),
      color: motoColor,
      renavam: motoRenavam,
      chassi: motoChassi,
      currentKm: Number(motoKm),
      purchasePrice: Number(form.purchasePrice) || 0,
      purchaseDate: form.purchaseDate || startDate,
      status: 'alugada' as const,
      insuranceDeductible,
      documents: [],
      photos: [],
      kmLogs: [],
    } as any,
    tenant: {
      id: 'preview',
      fullName: tenantName,
      cpf: tenantCpf.replace(/\D/g, ''),
      rg: form.tenantRg || '',
      phone: tenantPhone.replace(/\D/g, ''),
      whatsapp: tenantPhone.replace(/\D/g, ''),
      email: tenantEmail,
      address: tenantAddress,
      profession: form.tenantProfession || form.companyOrActivity || 'Condutor / Entregador',
      company: form.tenantCompany || form.companyOrActivity || 'Autônomo',
      income: Number(form.monthlyIncome) || monthlyValue * 3,
      cnh: {
        number: tenantCnh,
        category: tenantCnhCategory,
        expirationDate: form.cnhExpiration || '',
      },
      birthDate: form.tenantBirthDate || '',
      documents: form.documents || {},
      approvalChecklist: {
        cnhValid: true,
        docsChecked: true,
        addressValidated: true,
        incomeAnalyzed: true,
        depositReceived: true,
        contractSigned: true,
        result: 'aprovado' as const,
      },
    } as any,
    contract: {
      id: 'preview',
      motoId: 'preview',
      tenantId: 'preview',
      durationMonths,
      paymentFrequency: form.paymentFrequency || 'mensal',
      startDate,
      dueDay,
      dueDayOfWeek: Number(form.dueDayOfWeek) || 1,
      monthlyValue,
      weeklyValue,
      deposit: depositValue,
      depositStatus: form.depositStatus || 'retida',
      totalAgreedValue,
      insuranceDeductible,
      status: 'ativo' as const,
      installments: [],
    } as any,
    settings,
    autoDownload,
  });

  const rawContractText = getMotoContractRawText(getPdfOptions(false));

  const handleCopy = async () => {
    const success = await copyTextToClipboard(rawContractText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    openMotoContractPrintWindow(getPdfOptions(false));
  };

  const handleDownloadPdf = () => {
    try {
      setDownloading(true);
      generateMotoRentalContractPdfFile(getPdfOptions(true));
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar PDF da moto:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA - PADRONIZADO */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            7
          </span>
          <span>Minuta do Contrato & Emissão</span>
        </div>
        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          15 Cláusulas Completas
        </span>
      </div>

      {/* RESUMO RÁPIDO DO CONTRATO (3 COLUNAS PADRONIZADAS) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-white/[0.08] text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Locador(a) & Veículo:</span>
            <strong className="text-white text-sm block truncate font-bold">
              {locadorName}
            </strong>
            <span className="text-slate-300 truncate block text-[11px]">
              {motoBrand} {motoModel} ({motoYear}) • <span className="font-mono font-semibold text-emerald-400">{motoPlate}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Locatário(a) / Condutor:</span>
            <strong className="text-white text-sm block truncate font-bold">
              {tenantName}
            </strong>
            <span className="text-slate-300 block text-[11px] font-mono">
              CPF: {formatCPF(tenantCpf)} • CNH: {tenantCnh} ({tenantCnhCategory})
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Valores & Vigência:</span>
            <strong className="text-emerald-400 text-sm block font-mono font-bold">
              {formatCurrency(isWeekly ? weeklyValue : monthlyValue)} / {isWeekly ? 'semana' : 'mês'}
            </strong>
            <span className="text-slate-300 block text-[11px]">
              {durationMonths} meses • Vencimento: {isWeekly ? dueDayOfWeekName : `Dia ${dueDay}`}
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR UNIFICADA (SEM BOTÕES ESPALHADOS) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#090B10] border border-white/[0.08]">
        {/* Toggle de Modo: Minuta Formatada vs Texto Puro */}
        <div className="flex items-center gap-1 p-1 bg-[#0E111A] border border-white/[0.08] rounded-xl">
          <button
            type="button"
            onClick={() => setContractTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              contractTab === 'preview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Minuta Formatada</span>
          </button>

          <button
            type="button"
            onClick={() => setContractTab('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              contractTab === 'text'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto Puro</span>
          </button>
        </div>

        {/* Botões de Ação Direta */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Copiar texto integral do contrato"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Texto Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Imprimir contrato completo"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110 active:scale-95 transition-all cursor-pointer ring-1 ring-emerald-400/40"
            title="Baixar Contrato Oficial em PDF"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>PDF Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar PDF Oficial</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VISUALIZAÇÃO INTEGRAL DO CONTRATO (TODO O CONTRATO POR COMPLETO) */}
      {contractTab === 'preview' ? (
        <div className="p-5 sm:p-8 bg-[#07090E] border border-white/[0.12] rounded-2xl space-y-6 max-h-[58vh] overflow-y-auto font-sans shadow-2xl custom-scrollbar text-slate-200">
          {/* CABEÇALHO FORMAL DO CONTRATO */}
          <div className="text-center pb-5 border-b border-white/[0.12] space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Minuta Oficial de Locação & Aquisição</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              CONTRATO DE LOCAÇÃO DE MOTOCICLETA COM OPÇÃO DE COMPRA
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Instrumento Particular de Locação de Veículo Automotor e Plano Programado com Opção de Transferência Definitiva de Titularidade
            </p>
          </div>

          {/* DADOS DAS PARTES */}
          <div className="p-4 rounded-xl bg-[#0D1019] border border-white/[0.08] space-y-2.5 text-xs">
            <div>
              <strong className="text-emerald-400 font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                LOCADOR (PROPRIETÁRIO):
              </strong>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">{locadorName}</strong>, pessoa física inscrita no CPF sob o nº{' '}
                <span className="font-mono text-white">{formatCPF(locadorCpf)}</span>, residente e domiciliado em{' '}
                <span className="text-slate-200">{locadorAddress}</span>.
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <strong className="text-emerald-400 font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                LOCATÁRIO (CONDUTOR):
              </strong>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">{tenantName}</strong>, inscrito no CPF sob o nº{' '}
                <span className="font-mono text-white">{formatCPF(tenantCpf)}</span>, portador da CNH nº{' '}
                <span className="font-mono text-white">{tenantCnh}</span> (Categoria{' '}
                <span className="text-white font-bold">{tenantCnhCategory}</span>), telefone de contato:{' '}
                <span className="text-white">{formatPhone(tenantPhone) || 'Informado'}</span>, e-mail:{' '}
                <span className="text-white">{tenantEmail}</span>, residente e domiciliado em:{' '}
                <span className="text-slate-200">{tenantAddress}</span>.
              </p>
            </div>
          </div>

          {/* TODAS AS 15 CLÁUSULAS COMPLETAS */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-300 divide-y divide-white/[0.06]">
            {/* CLÁUSULA 1 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 1 – DO VEÍCULO (OBJETO DO CONTRATO)
              </h4>
              <p className="mb-2">
                1.1. O presente instrumento tem como objeto a locação da motocicleta de propriedade do LOCADOR, a seguir discriminada:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg font-mono text-[11px]">
                <div><span className="text-slate-400 block text-[10px]">Marca/Modelo:</span> <strong className="text-white">{motoBrand} {motoModel}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Ano/Modelo:</span> <strong className="text-white">{motoYear}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Cor:</span> <strong className="text-white">{motoColor}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Placa:</span> <strong className="text-emerald-400">{motoPlate}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">RENAVAM:</span> <strong className="text-white">{motoRenavam}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">KM Inicial:</span> <strong className="text-white">{Number(motoKm).toLocaleString('pt-BR')} km</strong></div>
              </div>
              <p className="mt-2 text-slate-400 text-[11.5px]">
                1.2. O veículo é entregue devidamente vistoriado, limpo, com documentação em dia (CRLV) e em perfeitas condições mecânicas, elétricas e de segurança.
              </p>
            </div>

            {/* CLÁUSULA 2 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 2 – DO PRAZO, VIGÊNCIA E INÍCIO DA LOCAÇÃO
              </h4>
              <p>
                2.1. A locação é celebrada pelo período determinado de <strong className="text-white">{durationMonths} meses</strong>, iniciando-se em{' '}
                <strong className="text-white">{startDateFormatted}</strong>.
              </p>
              <p className="mt-1">
                2.2. Findo o prazo ajustado e com a quitação integral de todas as obrigações e parcelas aqui contratadas, o LOCATÁRIO adquire a faculdade de exercer a <strong className="text-emerald-400">Opção de Compra</strong> para a transferência de titularidade definitiva do bem.
              </p>
            </div>

            {/* CLÁUSULA 3 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 3 – DOS VALORES, PERIODICIDADE E CONDIÇÕES DE PAGAMENTO
              </h4>
              <p>
                3.1. Pela locação do veículo, o LOCATÁRIO pagará ao LOCADOR:
              </p>
              <ul className="list-disc list-inside space-y-1 my-1.5 text-slate-200 pl-1">
                <li>
                  Periodicidade:{' '}
                  <strong className="text-white uppercase">{isWeekly ? 'Semanal' : 'Mensal'}</strong>;
                </li>
                <li>
                  Valor da Parcela:{' '}
                  <strong className="text-emerald-400 font-bold">
                    {formatCurrency(isWeekly ? weeklyValue : monthlyValue)}
                  </strong>{' '}
                  ({formatCurrencyExtenso(isWeekly ? weeklyValue : monthlyValue)}) por período;
                </li>
                <li>
                  Vencimento:{' '}
                  <strong className="text-white">
                    {isWeekly ? `Toda ${dueDayOfWeekName}, até às 23h59` : `Todo dia ${dueDay} de cada mês`}
                  </strong>;
                </li>
                <li>
                  Valor Total Acordado para Aquisição Definitiva:{' '}
                  <strong className="text-emerald-400 font-bold">{formatCurrency(totalAgreedValue)}</strong>{' '}
                  ({formatCurrencyExtenso(totalAgreedValue)}).
                </li>
              </ul>
              <p className="text-slate-400 text-[11.5px]">
                3.2. Os pagamentos serão realizados pontualmente via chave PIX cadastrada ({settings?.adminPixKey || settings?.adminEmail || 'Informada pelo locador'}).
              </p>
            </div>

            {/* CLÁUSULA 4 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 4 – DA CAUÇÃO DE GARANTIA E SUA RESTITUIÇÃO
              </h4>
              <p>
                4.1. Como garantia do fiel cumprimento das obrigações e conservação do bem, o LOCATÁRIO entrega a quantia de{' '}
                <strong className="text-white">{formatCurrency(depositValue)}</strong> ({formatCurrencyExtenso(depositValue)}) a título de caução retida.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                4.2. A caução servirá para liquidar eventuais multas de trânsito, avarias mecânicas ou de lataria, diárias em atraso ou taxa de higienização. O saldo remanescente será devolvido após a vistoria final e conferência de débitos junto ao DETRAN.
              </p>
            </div>

            {/* CLÁUSULA 5 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 5 – DO SEGURO, PROTEÇÃO E FRANQUIA EM CASO DE SINISTRO
              </h4>
              <p>
                5.1. A motocicleta conta com proteção patrimonial. Na hipótese de sinistro coberto, furto, roubo ou colisão com perda parcial ou total, o LOCATÁRIO arcará com a franquia contratual estipulada em{' '}
                <strong className="text-white">R$ {insuranceDeductible}</strong>.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                5.2. Danos materiais a terceiros ou decorrentes de dolo, embriaguez, participação em rachas ou imprudência não encontram cobertura e serão cobrados integralmente do LOCATÁRIO.
              </p>
            </div>

            {/* CLÁUSULA 6 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 6 – DA MANUTENÇÃO PREVENTIVA E TROCA DE ÓLEO OBRIGATÓRIA
              </h4>
              <p>
                6.1. O LOCATÁRIO obriga-se formalmente a efetuar a substituição do óleo de motor rigorosamente a cada{' '}
                <strong className="text-white">1.000 (mil) quilômetros rodados</strong>.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                6.2. É obrigatória a apresentação dos comprovantes e notas fiscais de troca de óleo e manutenção para preservação da garantia do motor e continuidade do plano de locação.
              </p>
            </div>

            {/* CLÁUSULA 7 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 7 – DAS INFRAÇÕES DE TRÂNSITO E PONTUAÇÃO NA CNH
              </h4>
              <p>
                7.1. O LOCATÁRIO assume total e exclusiva responsabilidade civil, penal e financeira por todas as infrações de trânsito praticadas durante a posse do veículo.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                7.2. Fica expressamente autorizado o LOCADOR a indicar o LOCATÁRIO como real condutor infrator junto ao DETRAN/órgãos competentes, sendo o valor da multa cobrado de imediato.
              </p>
            </div>

            {/* CLÁUSULA 8 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 8 – DO USO EXCLUSIVO E DAS VEDAÇÕES CONTRATUAIS
              </h4>
              <p>
                8.1. A motocicleta destina-se exclusivamente ao uso legal do LOCATÁRIO (deslocamento pessoal ou transporte por aplicativo/entregas).
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                8.2. É terminantemente proibido: sublocar, emprestar a terceiros, participar de manobras perigosas, circular em praias/vias off-road ou transportar substâncias ilícitas, sob pena de rescisão imediata por justa causa.
              </p>
            </div>

            {/* CLÁUSULA 9 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 9 – DO RASTREADOR E MONITORAMENTO DE SEGURANÇA 24 HORAS
              </h4>
              <p>
                9.1. O veículo é equipado com rastreador via satélite e dispositivo de corte remoto para fins de segurança patrimonial, com o qual o LOCATÁRIO declara total concordância.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                9.2. Qualquer tentativa de violação, adulteração ou bloqueio do rastreador configurará falta grave e quebra contratual imediata.
              </p>
            </div>

            {/* CLÁUSULA 10 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 10 – DO ATRASO NO PAGAMENTO E BLOQUEIO PREVENTIVO
              </h4>
              <p>
                10.1. O atraso no pagamento das parcelas acarretará incidência de multa de 2% (dois por cento), juros moratórios de 1% ao mês e encargos de cobrança.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                10.2. Incorrendo atraso superior a 48 (quarenta e oito) horas sem prévia anuência por escrito, o LOCADOR fica autorizado a acionar o bloqueio remoto preventivo do veículo via rastreador.
              </p>
            </div>

            {/* CLÁUSULA 11 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 11 – DA RESCISÃO CONTRATUAL E RECUPERAÇÃO DO BEM
              </h4>
              <p>
                11.1. O contrato poderá ser rescindido de pleno direito em caso de inadimplemento de parcelas superior a 7 dias ou descumprimento das cláusulas deste instrumento.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                11.2. Rescindido o contrato, o LOCATÁRIO deverá restituir a motocicleta no prazo improrrogável de até 24 horas, sob pena de caracterização de crime de Apropriação Indébita (Art. 168 do Código Penal Brasileiro).
              </p>
            </div>

            {/* CLÁUSULA 12 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 12 – DA DEVOLUÇÃO E VISTORIA FINAL DE SAÍDA
              </h4>
              <p>
                12.1. Ao término ou rescisão, o veículo será submetido a rigorosa vistoria de saída.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                12.2. A motocicleta deve ser devolvida limpa, com tanque no mesmo nível da retirada e sem avarias estruturais ou mecânicas decorrentes de mau uso.
              </p>
            </div>

            {/* CLÁUSULA 13 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 13 – DA OPÇÃO DE COMPRA E TRANSFERÊNCIA DE PROPRIEDADE
              </h4>
              <p>
                13.1. Cumprido integralmente o prazo estipulado de <strong className="text-white">{durationMonths} meses</strong> e quitadas pontualmente todas as parcelas e encargos até totalizar o Valor Total Acordado de <strong className="text-emerald-400 font-bold">{formatCurrency(totalAgreedValue)}</strong>, o LOCATÁRIO adquire o direito irrevogável de transferir a motocicleta para sua propriedade definitiva.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                13.2. As custas cartorárias e taxas de transferência perante o DETRAN correrão por conta do adquirente.
              </p>
            </div>

            {/* CLÁUSULA 14 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 14 – DAS DISPOSIÇÕES GERAIS E COMUNICAÇÕES
              </h4>
              <p>
                14.1. Notificações e cobranças poderão ser remetidas por mensagens eletrônicas (WhatsApp) e e-mail informados no cadastro. A eventual tolerância a atrasos não constitui renúncia de direitos nem novação contratual.
              </p>
            </div>

            {/* CLÁUSULA 15 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 15 – DO FORO DE ELEIÇÃO
              </h4>
              <p>
                15.1. Para dirimir quaisquer litígios oriundos do presente contrato, as partes elegem expressamente o Foro da Comarca de <strong className="text-white">{cityState}</strong>, renunciando a qualquer outro por mais privilegiado que seja.
              </p>
            </div>
          </div>

          {/* TERMO DE FECHAMENTO E ASSINATURAS */}
          <div className="pt-6 border-t border-white/[0.12] space-y-6">
            <p className="text-center text-xs text-slate-300 font-medium">
              E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor e forma, perante as duas testemunhas abaixo qualificadas.
            </p>

            <p className="text-center font-bold text-xs text-slate-200">
              {cityState}, {startDateFull}.
            </p>

            {/* LINHAS DE ASSINATURA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="text-center border-t border-white/40 pt-2 space-y-0.5">
                <strong className="text-white text-xs block font-bold">{locadorName}</strong>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">LOCADOR (PROPRIETÁRIO)</span>
                <span className="text-[10px] text-slate-400 block font-mono">CPF: {formatCPF(locadorCpf)}</span>
              </div>

              <div className="text-center border-t border-white/40 pt-2 space-y-0.5">
                <strong className="text-white text-xs block font-bold">{tenantName}</strong>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">LOCATÁRIO (CONDUTOR)</span>
                <span className="text-[10px] text-slate-400 block font-mono">CPF: {formatCPF(tenantCpf)}</span>
              </div>
            </div>

            {/* TESTEMUNHAS */}
            <div className="pt-4 border-t border-white/[0.06]">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold mb-3 text-center">
                TESTEMUNHAS INSTRUMENTÁRIAS:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-300">
                <div className="border-t border-white/20 pt-2">
                  <p>1. Nome: _____________________________________</p>
                  <p className="mt-1">CPF: ________________________________________</p>
                </div>
                <div className="border-t border-white/20 pt-2">
                  <p>2. Nome: _____________________________________</p>
                  <p className="mt-1">CPF: ________________________________________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 bg-[#07090E] border border-white/[0.12] rounded-2xl max-h-[58vh] overflow-y-auto font-mono text-xs text-slate-300 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-3 border-b border-white/[0.08]">
            <span>Texto completo em formato puro para cópia ou envio:</span>
            <span className="text-[11px] font-mono text-emerald-400">15 Cláusulas • UTF-8</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed font-mono select-all">
            {rawContractText}
          </pre>
        </div>
      )}
    </div>
  );
};
