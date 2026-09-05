import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Download,
  Check,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { KitnetTenant, SystemSettings } from '../../../types';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatCurrencyExtenso,
  formatDurationExtenso,
  formatDateFullPT,
} from '../../../utils/formatters';
import { getKitnetContractRawText } from '../../../utils/pdfGenerator';
import { copyTextToClipboard } from '../../../utils/printHelper';

interface KitnetStepReviewContractProps {
  settings: SystemSettings;
  kitnetData: {
    number: string;
    name: string;
    address: string;
  };
  tenantMode: 'new' | 'existing';
  tenantData: {
    fullName: string;
    cpf: string;
    rg?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  selectedTenantId: string;
  kitnetTenants: KitnetTenant[];
  financials: {
    rentValue: number;
    deposit: number;
    cleaningFee?: number;
  };
  contractTerms: {
    durationOption: number | 'custom';
    customMonths: number;
    startDate: string;
    endDate: string;
  };
  paymentConfig: {
    dueDay: number;
  };
  contractTab: 'preview' | 'text';
  setContractTab: (tab: 'preview' | 'text') => void;
  copiedContract: boolean;
  handleCopyContractText: () => void;
  handlePrintContract: () => void;
  handleGenerateContract: (downloadDirectly?: boolean) => any;
  getContractPayload: () => any;
}

export const KitnetStepReviewContract: React.FC<KitnetStepReviewContractProps> = ({
  settings,
  kitnetData,
  tenantMode,
  tenantData,
  selectedTenantId,
  kitnetTenants,
  financials,
  contractTerms,
  paymentConfig,
  contractTab,
  setContractTab,
  copiedContract,
  handleCopyContractText,
  handlePrintContract,
  handleGenerateContract,
  getContractPayload,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedInternal, setCopiedInternal] = useState(false);

  const effectiveMonths =
    contractTerms.durationOption === 'custom'
      ? Number(contractTerms.customMonths) || 12
      : contractTerms.durationOption;

  const tenantName =
    tenantMode === 'new'
      ? tenantData.fullName || 'Inquilino(a)'
      : kitnetTenants.find((t) => t.id === selectedTenantId)?.fullName || 'Inquilino(a)';

  const tenantCpf =
    tenantMode === 'new'
      ? tenantData.cpf
        ? formatCPF(tenantData.cpf)
        : '000.000.000-00'
      : kitnetTenants.find((t) => t.id === selectedTenantId)?.cpf
      ? formatCPF(kitnetTenants.find((t) => t.id === selectedTenantId)!.cpf)
      : '000.000.000-00';

  const tenantRg =
    tenantMode === 'new'
      ? tenantData.rg
      : kitnetTenants.find((t) => t.id === selectedTenantId)?.rg;

  const tenantPhone =
    tenantMode === 'new'
      ? tenantData.phone || tenantData.whatsapp
      : kitnetTenants.find((t) => t.id === selectedTenantId)?.phone || kitnetTenants.find((t) => t.id === selectedTenantId)?.whatsapp;

  const tenantEmail =
    tenantMode === 'new'
      ? tenantData.email
      : kitnetTenants.find((t) => t.id === selectedTenantId)?.email;

  const locadorName = settings?.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings?.adminCpf || '155.521.029-59';
  const adminPixKey = settings?.adminPixKey || settings?.adminEmail || 'wleal0131@gmail.com';
  const cityState = settings?.cityState || 'Barra Velha – SC';
  const cleaningFee = financials.cleaningFee !== undefined ? financials.cleaningFee : (settings?.cleaningFee ?? 400);
  const cleaningFeeExtenso = formatCurrencyExtenso(cleaningFee);
  const address = kitnetData.address?.trim() || cityState;

  const rawContractText = getKitnetContractRawText(getContractPayload());

  const handleCopy = async () => {
    const success = await copyTextToClipboard(rawContractText);
    if (success) {
      setCopiedInternal(true);
      setTimeout(() => setCopiedInternal(false), 2500);
    } else {
      handleCopyContractText();
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      handleGenerateContract(true);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar contrato PDF da kitnet:', err);
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
          20 Cláusulas Completas
        </span>
      </div>

      {/* RESUMO RÁPIDO DO CONTRATO (3 COLUNAS PADRONIZADAS) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-white/[0.08] text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Locador(a) & Imóvel:</span>
            <strong className="text-white text-sm block truncate font-bold">
              {locadorName}
            </strong>
            <span className="text-slate-300 truncate block text-[11px]">
              {kitnetData.name || `Kitnet ${kitnetData.number}`} • {address}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Locatário(a):</span>
            <strong className="text-white text-sm block truncate font-bold">
              {tenantName}
            </strong>
            <span className="text-slate-300 block text-[11px] font-mono">
              CPF: {tenantCpf}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-medium block">Aluguel & Vigência:</span>
            <strong className="text-emerald-400 text-sm block font-mono font-bold">
              {formatCurrency(financials.rentValue)} / mês
            </strong>
            <span className="text-slate-300 block text-[11px]">
              {effectiveMonths} meses • Vencimento: Dia {paymentConfig.dueDay}
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
            {copiedInternal || copiedContract ? (
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
            onClick={handlePrintContract}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Imprimir contrato completo"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
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
              <span>Minuta Oficial de Locação Residencial Urbana</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Instrumento Particular de Locação Residencial Urbana com 20 Cláusulas de Proteção e Segurança Jurídica
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
                <span className="font-mono text-white">{formatCPF(locadorCpf)}</span>.
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <strong className="text-emerald-400 font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                LOCATÁRIO(A):
              </strong>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">{tenantName}</strong>, inscrito(a) no CPF sob o nº{' '}
                <span className="font-mono text-white">{tenantCpf}</span>
                {tenantRg ? `, portador(a) do RG nº ${tenantRg}` : ''}
                {tenantPhone ? `, telefone: ${tenantPhone}` : ''}
                {tenantEmail ? `, e-mail: ${tenantEmail}` : ''}.
              </p>
            </div>
          </div>

          {/* TODAS AS 20 CLÁUSULAS COMPLETAS */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-300 divide-y divide-white/[0.06]">
            {/* CLÁUSULA 1 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 1 – OBJETO E DESTINAÇÃO RESIDENCIAL
              </h4>
              <p>
                1.1. O presente instrumento tem como objeto a locação do imóvel residencial situado em: <strong className="text-white">{address}</strong> ({kitnetData.name || `Kitnet ${kitnetData.number}`}).
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                1.2. O imóvel destina-se única e exclusivamente para fins de moradia residencial do(a) LOCATÁRIO(A) e seus dependentes imediatos, sendo vedado qualquer uso comercial, industrial ou prestação de serviços no local.
              </p>
            </div>

            {/* CLÁUSULA 2 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 2 – PRAZO E VIGÊNCIA
              </h4>
              <p>
                2.1. O prazo de locação é de <strong className="text-white">{effectiveMonths} meses</strong> ({formatDurationExtenso(effectiveMonths)}), iniciando-se em <strong className="text-white">{formatDate(contractTerms.startDate)}</strong> e com término previsto em <strong className="text-white">{formatDate(contractTerms.endDate)}</strong>, podendo ser prorrogado mediante termo aditivo formal e prévio acordo entre as partes.
              </p>
            </div>

            {/* CLÁUSULA 3 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 3 – VALOR DO ALUGUEL
              </h4>
              <p>
                3.1. O aluguel mensal ajustado é de <strong className="text-emerald-400 font-bold">{formatCurrency(financials.rentValue)}</strong> ({formatCurrencyExtenso(financials.rentValue)}), com vencimento todo dia <strong className="text-white">{paymentConfig.dueDay}</strong> de cada mês subsequente ao vencido.
              </p>
            </div>

            {/* CLÁUSULA 4 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 4 – FORMA DE PAGAMENTO E QUITAÇÃO
              </h4>
              <p>
                4.1. O pagamento deverá ser efetuado impreterivelmente até a data de vencimento via PIX diretamente ao LOCADOR ({locadorName}), CPF {formatCPF(locadorCpf)}, através da chave PIX: <strong className="font-mono text-emerald-400">{adminPixKey}</strong>.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                4.2. O comprovante oficial de transferência bancária servirá como recibo provisório de quitação da respectiva competência.
              </p>
            </div>

            {/* CLÁUSULA 5 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 5 – ATRASO NO PAGAMENTO E ENCARGOS MORATÓRIOS
              </h4>
              <p>
                5.1. Em caso de atraso na quitação do aluguel ou encargos acessórios, incidirá:
              </p>
              <ul className="list-disc list-inside space-y-1 my-1.5 text-slate-200 pl-1">
                <li>Multa moratória de 2% (dois por cento) sobre o valor total do débito em aberto;</li>
                <li>Juros de mora de 1% (um por cento) ao mês, calculados pro rata die;</li>
                <li>Atualização e correção monetária quando cabível.</li>
              </ul>
            </div>

            {/* CLÁUSULA 6 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 6 – INADIMPLÊNCIA, RESCISÃO E DESOCUPAÇÃO
              </h4>
              <p>
                6.1. O atraso no pagamento do aluguel ou de quaisquer encargos superiores a 30 (trinta) dias configurará infração contratual grave, facultando ao LOCADOR a rescisão de pleno direito do contrato.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                6.2. Rescindido o contrato por inadimplência, o LOCATÁRIO será notificado para desocupação voluntária do imóvel no prazo improrrogável de até 30 (trinta) dias, permanecendo devidos todos os aluguéis e encargos até a efetiva entrega das chaves.
              </p>
            </div>

            {/* CLÁUSULA 7 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 7 – DESPESAS E CONSUMO
              </h4>
              <p>
                7.1. São de inteira responsabilidade do LOCATÁRIO as despesas com consumo de água, energia elétrica e eventuais serviços de telecomunicações contratados diretamente.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                7.2. Fica expressamente estabelecido que o IPTU e a taxa de coleta de lixo estão inclusos no aluguel e permanecem sob encargo do LOCADOR.
              </p>
            </div>

            {/* CLÁUSULA 8 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 8 – CAUÇÃO DE GARANTIA E RESTITUIÇÃO
              </h4>
              <p>
                8.1. A título de garantia locatícia, o LOCATÁRIO entrega a quantia de <strong className="text-white">{formatCurrency(financials.deposit)}</strong> ({formatCurrencyExtenso(financials.deposit)}).
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                8.2. A caução poderá ser retida para liquidação de aluguéis em atraso, danos constatados nas instalações, multas ou para quitação da taxa de limpeza final. O saldo remanescente será devolvido ao LOCATÁRIO em até 30 (trinta) dias corridos após a vistoria final e a devolução oficial de todas as chaves.
              </p>
            </div>

            {/* CLÁUSULA 9 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 9 – OBRIGAÇÕES GERAIS DO LOCATÁRIO
              </h4>
              <p>
                9.1. O LOCATÁRIO se obriga a zelar pelo imóvel como se seu próprio fosse, mantê-lo rigorosamente limpo, higienizado e conservado, realizar os pagamentos pontualmente e respeitar integralmente as normas de boa vizinhança e sossego.
              </p>
            </div>

            {/* CLÁUSULA 10 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 10 – DEVOLUÇÃO DO IMÓVEL E TAXA DE LIMPEZA
              </h4>
              <p>
                10.1. O imóvel é entregue perfeitamente limpo, pintado e em condições adequadas de habitabilidade. Ao término da locação, o imóvel deverá ser restituído nas mesmas condições em que foi recebido.
              </p>
              <p className="mt-1 text-slate-400 text-[11.5px]">
                10.2. Caso o imóvel seja entregue sem a devida higienização e limpeza profissional, será cobrada taxa de limpeza no valor de <strong className="text-white">{formatCurrency(cleaningFee)}</strong> ({cleaningFeeExtenso}), a ser descontada da caução ou cobrada do LOCATÁRIO.
              </p>
            </div>

            {/* CLÁUSULA 11 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 11 – OBRAS E MODIFICAÇÕES
              </h4>
              <p>
                11.1. É terminantemente proibida a realização de qualquer obra, reforma, modificação estética ou estrutural sem autorização prévia e por escrito do LOCADOR.
              </p>
            </div>

            {/* CLÁUSULA 12 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 12 – COMPROVAÇÃO DE SERVIÇOS
              </h4>
              <p>
                12.1. Quaisquer reparos ou manutenções devidamente autorizados pelo LOCADOR deverão ser formalmente comprovados por meio de Nota Fiscal idônea (CNPJ).
              </p>
            </div>

            {/* CLÁUSULA 13 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 13 – BENFEITORIAS
              </h4>
              <p>
                13.1. Benfeitorias úteis ou voluntárias realizadas no imóvel, ainda que autorizadas, ficarão incorporadas ao patrimônio do LOCADOR, sem direito a qualquer indenização ou retenção.
              </p>
            </div>

            {/* CLÁUSULA 14 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 14 – VISTORIA
              </h4>
              <p>
                14.1. O LOCADOR reserva-se o direito de, mediante aviso prévio de 48 (quarenta e oito) horas, vistoriar as condições gerais de conservação e higiene do imóvel.
              </p>
            </div>

            {/* CLÁUSULA 15 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 15 – PERTURBAÇÃO DO SOSSEGO E NORMAS DE CONVIVÊNCIA
              </h4>
              <p>
                15.1. É expressamente vedada a perturbação do sossego de vizinhos por meio de som excessivo, algazarra ou desordens, devendo ser rigorosamente respeitada a Lei do Silêncio das 22h às 08h. O desrespeito reiterado facultará a rescisão imediata por quebra de conduta.
              </p>
            </div>

            {/* CLÁUSULA 16 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 16 – SUBLOCAÇÃO E CESSÃO
              </h4>
              <p>
                16.1. É expressamente vedada a sublocação total ou parcial, a cessão a terceiros, a cessão gratuita ou por comodato, sem expresso consentimento do LOCADOR.
              </p>
            </div>

            {/* CLÁUSULA 17 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 17 – NOTIFICAÇÕES E COMUNICAÇÕES
              </h4>
              <p>
                17.1. Todas as notificações, avisos e cobranças poderão ser formalmente encaminhados via e-mail ou mensagens eletrônicas (WhatsApp) nos contatos fornecidos pelas partes.
              </p>
            </div>

            {/* CLÁUSULA 18 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 18 – RESCISÃO ANTECIPADA E AVISO PRÉVIO
              </h4>
              <p>
                18.1. Na hipótese de rescisão por iniciativa do LOCATÁRIO antes do termo final, este deverá comunicar por escrito com aviso prévio mínimo de 30 (trinta) dias, sujeitando-se às multas contratuais proporcionais.
              </p>
            </div>

            {/* CLÁUSULA 19 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 19 – DESOCUPAÇÃO E ENTREGA DAS CHAVES
              </h4>
              <p>
                19.1. A desocupação do imóvel somente se considerará consumada com a realização satisfatória da vistoria final de saída e a entrega presencial de todas as chaves ao LOCADOR.
              </p>
            </div>

            {/* CLÁUSULA 20 */}
            <div className="pt-3">
              <h4 className="font-bold text-emerald-400 uppercase text-xs mb-1">
                CLÁUSULA 20 – FORO DE ELEIÇÃO E DISPOSIÇÕES FINAIS
              </h4>
              <p>
                20.1. As partes elegem o Foro da Comarca de <strong className="text-white">{cityState}</strong> para dirimir quaisquer dúvidas ou litígios oriundos do presente contrato, com expressa renúncia de qualquer outro.
              </p>
            </div>
          </div>

          {/* TERMO DE FECHAMENTO E ASSINATURAS */}
          <div className="pt-6 border-t border-white/[0.12] space-y-6">
            <p className="text-center text-xs text-slate-300 font-medium">
              E, por estarem assim justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor e forma, perante 2 (duas) testemunhas instrumentárias.
            </p>

            <p className="text-center font-bold text-xs text-slate-200">
              {cityState}, {formatDateFullPT(contractTerms.startDate)}.
            </p>

            {/* LINHAS DE ASSINATURA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="text-center border-t border-white/40 pt-2 space-y-0.5">
                <strong className="text-white text-xs block font-bold">{locadorName}</strong>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">LOCADOR(A)</span>
                <span className="text-[10px] text-slate-400 block font-mono">CPF: {formatCPF(locadorCpf)}</span>
              </div>

              <div className="text-center border-t border-white/40 pt-2 space-y-0.5">
                <strong className="text-white text-xs block font-bold">{tenantName}</strong>
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider">LOCATÁRIO(A)</span>
                <span className="text-[10px] text-slate-400 block font-mono">CPF: {tenantCpf}</span>
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
            <span className="text-[11px] font-mono text-emerald-400">20 Cláusulas • UTF-8</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed font-mono select-all">
            {rawContractText}
          </pre>
        </div>
      )}
    </div>
  );
};
