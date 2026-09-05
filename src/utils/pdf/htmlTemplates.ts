import { DocumentData } from './types';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
  formatCurrencyExtenso,
  formatDateFullPT,
  formatDurationExtenso,
  addMonthsToDate,
  getTodayLocalDateString,
} from '../formatters';
import { safeLocalStorage } from '../storage';
import { getWeekdayName } from '../contractCalculations';
import {
  weeklyToMonthly,
  monthlyToWeekly,
  calculateOverdueCharges,
  calculateDepositSettlement,
  roundCurrency,
  safeAdd,
  safeMul,
} from '../../domain';

// Helper to generate a deterministic visual authenticity hash for documents
function generateDocHash(inputStr: string): string {
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    hash = (hash << 5) - hash + inputStr.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `DOC-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
}

export function generateDocumentHtml(data: DocumentData): string {
  const {
    type,
    moto,
    motoContract,
    motoTenant,
    kitnet,
    kitnetContract,
    kitnetTenant,
    settings,
    isMonochrome = false,
  } = data;

  const todayStr = data.customDate || getTodayLocalDateString();
  const todayFormatted = formatDate(todayStr);
  const todayFullPT = formatDateFullPT(todayStr);

  const locadorName = settings.adminName || 'Wigne Leal Xavier Macedo';
  const locadorCpf = settings.adminCpf || '155.521.029-59';
  const locadorAddress = settings.adminAddress || settings.cityState || 'Barra Velha – Santa Catarina';
  const locadorPix = settings.adminPixKey || settings.adminEmail || 'wleal0131@gmail.com';
  const cityState = settings.cityState || 'Barra Velha – SC';

  // Determine if this document is for a Motorcycle or a Kitnet
  let isMotoAsset = false;
  if (
    type === 'contrato_locacao_moto_completo' ||
    type === 'contrato_moto' ||
    type === 'termo_entrega_moto' ||
    type === 'termo_quitacao'
  ) {
    isMotoAsset = true;
  } else if (type === 'contrato_kitnet' || type === 'termo_vistoria_kitnet') {
    isMotoAsset = false;
  } else if (data.clientType === 'kitnet') {
    isMotoAsset = false;
  } else if (data.clientType === 'moto') {
    isMotoAsset = true;
  } else if (data.assetDescription && (data.assetDescription.toLowerCase().includes('kitnet') || data.assetDescription.toLowerCase().includes('imóvel') || data.assetDescription.toLowerCase().includes('residencial'))) {
    isMotoAsset = false;
  } else if (data.assetDescription && (data.assetDescription.toLowerCase().includes('moto') || data.assetDescription.toLowerCase().includes('placa') || data.assetDescription.toLowerCase().includes('honda') || data.assetDescription.toLowerCase().includes('yamaha'))) {
    isMotoAsset = true;
  } else if (kitnet && !moto) {
    isMotoAsset = false;
  } else if (moto && !kitnet) {
    isMotoAsset = true;
  } else if (data.title && (data.title.includes('MOTO') || data.title.includes('VEÍCULO') || data.title.includes('MOTOCICLETA'))) {
    isMotoAsset = true;
  } else {
    isMotoAsset = false;
  }

  // Retrieve stored signature if not explicitly passed
  let tenantSig = data.tenantSignature;
  if (!tenantSig && typeof window !== 'undefined') {
    if (isMotoAsset) {
      if (moto?.id) {
        tenantSig = safeLocalStorage.getItem(`signature_moto_${moto.id}`) ||
                    (moto.plate && safeLocalStorage.getItem(`signature_moto_${moto.plate}`)) ||
                    undefined;
      }
      if (!tenantSig && motoTenant?.id) {
        tenantSig = safeLocalStorage.getItem(`signature_locatario_${motoTenant.id}`) || undefined;
      }
    } else {
      if (kitnetTenant?.id) {
        tenantSig = safeLocalStorage.getItem(`signature_locatario_${kitnetTenant.id}`) || undefined;
      }
    }
  }

  const ownerSig = data.ownerSignature;

  // Derive common parameters based on actual target asset/tenant
  const activeTenantName =
    data.customTenantName ||
    (isMotoAsset ? motoTenant?.fullName : kitnetTenant?.fullName) ||
    kitnetTenant?.fullName ||
    motoTenant?.fullName ||
    'Nome do Locatário';

  const activeTenantCpf =
    data.customTenantCpf ||
    (isMotoAsset ? motoTenant?.cpf : kitnetTenant?.cpf) ||
    kitnetTenant?.cpf ||
    motoTenant?.cpf ||
    '000.000.000-00';

  const activeTenantPhone =
    data.customTenantPhone ||
    (isMotoAsset ? (motoTenant?.whatsapp || motoTenant?.phone) : (kitnetTenant?.whatsapp || kitnetTenant?.phone)) ||
    (kitnetTenant?.whatsapp || kitnetTenant?.phone) ||
    (motoTenant?.whatsapp || motoTenant?.phone) ||
    '';

  const activeTenantAddress =
    data.customTenantAddress ||
    (isMotoAsset ? motoTenant?.address : kitnetTenant?.address) ||
    kitnetTenant?.address ||
    motoTenant?.address ||
    'Endereço cadastrado';

  const activeTenantRg =
    (isMotoAsset ? motoTenant?.rg : kitnetTenant?.rg) ||
    kitnetTenant?.rg ||
    motoTenant?.rg;

  // Asset description & icons
  const assetIcon = isMotoAsset ? '🏍️' : '🏠';
  const assetCategoryLabel = isMotoAsset ? 'Objeto: Motocicleta' : 'Objeto: Imóvel Residencial';

  const assetName = data.assetLabel || (
    isMotoAsset
      ? (moto ? `${moto.brand} ${moto.model} (${moto.plate})` : 'Motocicleta Cadastrada')
      : (kitnet ? `${kitnet.name} (Nº ${kitnet.number})` : 'Kitnet Residencial')
  );

  const assetSubDetail = data.assetDescription || (
    isMotoAsset
      ? (moto ? `Placa: ${moto.plate} • Ano: ${moto.year || '2024'}` : 'Veículo para Locação / Trabalho')
      : (kitnet ? `Unidade ${kitnet.number || '01'} • ${kitnet.address || 'Residencial'}` : 'Destinação Residencial')
  );

  const depositVal =
    data.customDeposit !== undefined && data.customDeposit > 0
      ? data.customDeposit
      : (isMotoAsset ? (motoContract?.deposit ?? 0) : (kitnetContract?.deposit ?? 0));
  const depositExtenso = formatCurrencyExtenso(depositVal);

  const durationVal =
    data.durationMonths !== undefined && data.durationMonths > 0
      ? data.durationMonths
      : (isMotoAsset ? (motoContract?.durationMonths || 36) : (kitnetContract?.durationMonths || 12));
  const durationText = formatDurationExtenso(durationVal);

  const docHash = generateDocHash(`${data.title}-${activeTenantCpf}-${todayStr}`);

  // Theme palettes
  const colors = isMonochrome
    ? {
        primary: '#111827',
        primaryBg: '#ffffff',
        accentBg: '#ffffff',
        accentBorder: '#374151',
        textPrimary: '#000000',
        textSecondary: '#374151',
        textMuted: '#6b7280',
        badgeBg: '#ffffff',
        badgeBorder: '#000000',
        badgeText: '#000000',
        cardBg: '#ffffff',
        cardBorder: '#9ca3af',
        highlightGreen: '#000000',
      }
    : {
        primary: '#0f172a',
        primaryBg: '#0f172a',
        accentBg: '#f8fafc',
        accentBorder: '#e2e8f0',
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#64748b',
        badgeBg: '#f1f5f9',
        badgeBorder: '#cbd5e1',
        badgeText: '#0f172a',
        cardBg: '#f8fafc',
        cardBorder: '#e2e8f0',
        highlightGreen: '#059669',
      };

  // Base CSS container and responsive embedded styles
  const embeddedDocumentStyles = `
    <style>
      * { box-sizing: border-box; }
      .doc-root-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 11.5px;
        line-height: 1.5;
        color: ${colors.textPrimary};
        background: #ffffff;
        padding: 20px 24px;
        max-width: 820px;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
        overflow-x: hidden;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      .doc-exec-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 16px;
        width: 100%;
        box-sizing: border-box;
      }
      .doc-parties-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        width: 100%;
      }
      .doc-signatures-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 20px;
        width: 100%;
      }
      .doc-witnesses-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        width: 100%;
      }
      .doc-checklist-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .doc-checklist-2col {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .doc-balance-4col {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      .doc-balance-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      @media screen and (max-width: 640px) {
        .doc-root-container {
          padding: 12px 14px !important;
          font-size: 11px !important;
        }
        .doc-exec-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 6px !important;
        }
        .doc-parties-grid {
          grid-template-columns: 1fr !important;
        }
        .doc-party-locador {
          border-right: none !important;
          border-bottom: 1px solid ${colors.cardBorder} !important;
        }
        .doc-signatures-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .doc-witnesses-grid {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }
        .doc-checklist-3col {
          grid-template-columns: 1fr !important;
          gap: 6px !important;
        }
        .doc-checklist-2col {
          grid-template-columns: 1fr !important;
          gap: 6px !important;
        }
        .doc-balance-4col {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }
        .doc-balance-3col {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }
      }
      @media print {
        .doc-root-container {
          padding: 0 !important;
          max-width: 100% !important;
        }
        .doc-exec-grid {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        .doc-parties-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .doc-signatures-grid {
          grid-template-columns: 1fr 1fr !important;
        }
        .doc-witnesses-grid {
          grid-template-columns: 1fr 1fr !important;
        }
      }
    </style>
  `;

  // Header component
  const headerHtml = `
    <div style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 12px; margin-bottom: 16px; width: 100%; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px; color: ${colors.textMuted}; text-transform: uppercase;">
            Gestão Patrimonial • Locações & Mobilidade
          </div>
          <h1 style="margin: 3px 0 0 0; font-size: 15px; font-weight: 900; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.25; word-break: break-word;">
            ${data.title}
          </h1>
          <p style="margin: 3px 0 0 0; font-size: 9.5px; color: ${colors.textMuted}; font-weight: 500;">
            Instrumento Jurídico de Locação • Conformidade com Lei nº 8.245/91 e Código Civil Brasileiro
          </p>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <span style="display: inline-block; font-size: 8.5px; font-weight: 700; color: ${colors.badgeText}; background: ${colors.badgeBg}; border: 1px solid ${colors.badgeBorder}; padding: 3px 7px; border-radius: 4px; font-family: monospace; white-space: nowrap;">
            AUTENTICIDADE: ${docHash}
          </span>
          <div style="font-size: 9px; color: ${colors.textMuted}; margin-top: 4px; white-space: nowrap;">
            Emissão: <strong>${todayFormatted}</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  // Top 4-card Executive Summary Grid (Refined, perfectly wrapping, zero overflow)
  const executiveSummaryGrid = `
    <div class="doc-exec-grid">
      <!-- Card 1: Locatário -->
      <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 10px; box-sizing: border-box; min-width: 0; overflow: hidden;">
        <div style="font-size: 8px; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          👤 Locatário
        </div>
        <div style="font-size: 10.5px; font-weight: 800; color: ${colors.textPrimary}; margin-top: 2px; line-height: 1.25; word-break: break-word; overflow: hidden;" title="${activeTenantName}">
          ${activeTenantName}
        </div>
        <div style="font-size: 8.5px; font-family: monospace; color: ${colors.textSecondary}; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          CPF: ${formatCPF(activeTenantCpf)}
        </div>
      </div>

      <!-- Card 2: Imóvel ou Moto (CORRECT DYNAMIC ICON & TEXT) -->
      <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 10px; box-sizing: border-box; min-width: 0; overflow: hidden;">
        <div style="font-size: 8px; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${assetIcon} ${assetCategoryLabel}
        </div>
        <div style="font-size: 10.5px; font-weight: 800; color: ${colors.textPrimary}; margin-top: 2px; line-height: 1.25; word-break: break-word; overflow: hidden;" title="${assetName}">
          ${assetName}
        </div>
        <div style="font-size: 8.5px; color: ${colors.textSecondary}; margin-top: 2px; line-height: 1.2; word-break: break-word; overflow: hidden;">
          ${assetSubDetail}
        </div>
      </div>

      <!-- Card 3: Caução em Garantia (High Contrast, Zero Line-Break Overflow) -->
      <div style="background: ${colors.cardBg}; border: ${isMonochrome ? `1px solid ${colors.cardBorder}` : '1.5px solid #10b981'}; border-radius: 6px; padding: 8px 10px; box-sizing: border-box; min-width: 0; overflow: hidden;">
        <div style="font-size: 8px; font-weight: 700; color: ${isMonochrome ? colors.textMuted : '#059669'}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          🛡️ Valor da Caução
        </div>
        <div style="font-size: 11.5px; font-weight: 900; color: ${colors.highlightGreen}; margin-top: 2px; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${formatCurrency(depositVal)}
        </div>
        <div style="font-size: 8px; color: ${isMonochrome ? colors.textMuted : '#047857'}; margin-top: 2px; white-space: nowrap;">
          Garantia Integral
        </div>
      </div>

      <!-- Card 4: Prazo e Vigência -->
      <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 10px; box-sizing: border-box; min-width: 0; overflow: hidden;">
        <div style="font-size: 8px; font-weight: 700; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          📅 Prazo do Contrato
        </div>
        <div style="font-size: 10.5px; font-weight: 800; color: ${colors.textPrimary}; margin-top: 2px; white-space: nowrap;">
          ${durationVal} Meses
        </div>
        <div style="font-size: 8.5px; color: ${colors.textSecondary}; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          Início: ${formatDate(data.customStartDate || (isMotoAsset ? motoContract?.startDate : kitnetContract?.startDate) || todayStr)}
        </div>
      </div>
    </div>
  `;

  // Bilateral Parties Qualification Block (Organização limpa, sem estourar margem)
  const bilateralPartiesBlock = `
    <div style="border: 1px solid ${colors.cardBorder}; border-radius: 6px; overflow: hidden; margin-bottom: 16px; box-sizing: border-box; width: 100%;">
      <div style="background: ${isMonochrome ? '#ffffff' : '#f1f5f9'}; border-bottom: 1px solid ${colors.cardBorder}; padding: 5px 12px; font-size: 9px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 0.5px;">
        QUALIFICAÇÃO DAS PARTES CONTRATANTES
      </div>
      <div class="doc-parties-grid">
        <!-- Locador -->
        <div class="doc-party-locador" style="padding: 8px 12px; border-right: 1px solid ${colors.cardBorder}; background: ${colors.cardBg}; min-width: 0; box-sizing: border-box;">
          <div style="font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 3px;">
            LOCADOR (PROPRIETÁRIO):
          </div>
          <div style="font-size: 10px; line-height: 1.45; color: ${colors.textSecondary}; word-break: break-word;">
            <strong>${locadorName}</strong><br />
            CPF: <span style="font-family: monospace;">${formatCPF(locadorCpf)}</span><br />
            Endereço: ${locadorAddress}<br />
            Chave PIX: <span style="font-family: monospace; color: ${colors.primary}; font-weight: 600;">${locadorPix}</span>
          </div>
        </div>
        <!-- Locatário -->
        <div style="padding: 8px 12px; background: ${colors.cardBg}; min-width: 0; box-sizing: border-box;">
          <div style="font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 3px;">
            LOCATÁRIO (${isMotoAsset ? 'CONDUTOR/COMPRADOR' : 'INQUILINO'}):
          </div>
          <div style="font-size: 10px; line-height: 1.45; color: ${colors.textSecondary}; word-break: break-word;">
            <strong>${activeTenantName}</strong><br />
            CPF: <span style="font-family: monospace;">${formatCPF(activeTenantCpf)}</span>
            ${(isMotoAsset ? motoTenant?.rg : kitnetTenant?.rg) ? ` | RG: ${isMotoAsset ? motoTenant?.rg : kitnetTenant?.rg}` : ''}<br />
            ${isMotoAsset && motoTenant?.cnh?.number ? `CNH Cat. ${motoTenant.cnh.category || 'A'} nº ${motoTenant.cnh.number}<br />` : ''}
            Telefone / WhatsApp: ${formatPhone(activeTenantPhone) || 'Informado no cadastro'}<br />
            Endereço: ${activeTenantAddress}
          </div>
        </div>
      </div>
    </div>
  `;

  // Cartorial Signature Block with configurable witnesses (0, 1, or 2) + Digital Seal
  const witnessesCount = data.witnessesCount !== undefined ? data.witnessesCount : 2;
  const w1Name = data.witness1Name || '';
  const w1Cpf = data.witness1Cpf ? formatCPF(data.witness1Cpf) : '';
  const w2Name = data.witness2Name || '';
  const w2Cpf = data.witness2Cpf ? formatCPF(data.witness2Cpf) : '';

  const closingAgreementText =
    witnessesCount === 0
      ? 'E por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, para que produza seus regulares efeitos legais.'
      : witnessesCount === 1
      ? 'E por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 1 (uma) testemunha abaixo qualificada.'
      : 'E por estarem assim justas e contratadas, as partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo qualificadas.';

  const witnessesHtml =
    witnessesCount === 0
      ? ''
      : witnessesCount === 1
      ? `
        <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; box-sizing: border-box; width: 100%; overflow: hidden;">
          <div style="font-size: 8.5px; font-weight: 800; color: ${colors.textMuted}; text-transform: uppercase; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;">
            TESTEMUNHA INSTRUMENTÁRIA (ART. 784, III DO CPC):
          </div>
          <div style="max-width: 320px; margin: 0 auto; min-width: 0; overflow: hidden; box-sizing: border-box; text-align: center;">
            <div style="border-bottom: 1px solid #94a3b8; height: 16px; margin-bottom: 4px; width: 100%;"></div>
            <div style="font-size: 9px; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 2px;">
              ${w1Name ? `Testemunha: <strong>${w1Name}</strong>` : 'Testemunha: ____________________________________'}
            </div>
            <div style="font-size: 8.5px; color: ${colors.textMuted};">
              ${w1Cpf ? `CPF: <strong>${w1Cpf}</strong>` : 'CPF: ______________________'}
            </div>
          </div>
        </div>
      `
      : `
        <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; box-sizing: border-box; width: 100%; overflow: hidden;">
          <div style="font-size: 8.5px; font-weight: 800; color: ${colors.textMuted}; text-transform: uppercase; margin-bottom: 10px; text-align: center; letter-spacing: 0.5px;">
            TESTEMUNHAS INSTRUMENTÁRIAS (ART. 784, III DO CPC):
          </div>
          <div class="doc-witnesses-grid">
            <div style="min-width: 0; overflow: hidden; box-sizing: border-box;">
              <div style="border-bottom: 1px solid #94a3b8; height: 16px; margin-bottom: 4px; width: 100%;"></div>
              <div style="display: flex; align-items: baseline; gap: 4px; font-size: 9px; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 3px; width: 100%; min-width: 0;">
                <span style="white-space: nowrap; flex-shrink: 0;">1) Nome:</span>
                <span style="flex: 1; border-bottom: ${w1Name ? 'none' : '1px dotted #94a3b8'}; min-width: 10px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${w1Name ? `<strong>${w1Name}</strong>` : ''}
                </span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 4px; font-size: 8.5px; color: ${colors.textMuted}; width: 100%; min-width: 0;">
                <span style="white-space: nowrap; flex-shrink: 0;">CPF:</span>
                <span style="flex: 1; border-bottom: ${w1Cpf ? 'none' : '1px dotted #94a3b8'}; min-width: 10px; display: inline-block;">
                  ${w1Cpf ? `<strong>${w1Cpf}</strong>` : ''}
                </span>
              </div>
            </div>
            <div style="min-width: 0; overflow: hidden; box-sizing: border-box;">
              <div style="border-bottom: 1px solid #94a3b8; height: 16px; margin-bottom: 4px; width: 100%;"></div>
              <div style="display: flex; align-items: baseline; gap: 4px; font-size: 9px; color: ${colors.textSecondary}; font-weight: 600; margin-bottom: 3px; width: 100%; min-width: 0;">
                <span style="white-space: nowrap; flex-shrink: 0;">2) Nome:</span>
                <span style="flex: 1; border-bottom: ${w2Name ? 'none' : '1px dotted #94a3b8'}; min-width: 10px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${w2Name ? `<strong>${w2Name}</strong>` : ''}
                </span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 4px; font-size: 8.5px; color: ${colors.textMuted}; width: 100%; min-width: 0;">
                <span style="white-space: nowrap; flex-shrink: 0;">CPF:</span>
                <span style="flex: 1; border-bottom: ${w2Cpf ? 'none' : '1px dotted #94a3b8'}; min-width: 10px; display: inline-block;">
                  ${w2Cpf ? `<strong>${w2Cpf}</strong>` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

  const cartorialSignaturesBlock = `
    <div style="margin-top: 24px; border-top: 1px solid ${colors.cardBorder}; padding-top: 16px; page-break-inside: avoid; width: 100%; box-sizing: border-box;">
      <div style="text-align: center; margin-bottom: 18px;">
        <p style="font-size: 10px; color: ${colors.textSecondary}; margin: 0;">
          ${closingAgreementText}
        </p>
        <p style="font-size: 10px; font-weight: 700; color: ${colors.primary}; margin: 3px 0 0 0;">
          ${cityState}, ${todayFullPT}.
        </p>
      </div>

      <!-- Main Parties Signatures -->
      <div class="doc-signatures-grid" style="margin-bottom: 16px;">
        <!-- Locador -->
        <div style="text-align: center; min-width: 0; box-sizing: border-box;">
          ${ownerSig ? `<img src="${ownerSig}" alt="Assinatura Locador" style="max-height: 40px; margin: 0 auto -4px auto; display: block;" />` : '<div style="height: 30px;"></div>'}
          <div style="border-bottom: 1.5px solid ${colors.primary}; margin-bottom: 4px; width: 100%;"></div>
          <strong style="font-size: 10.5px; color: ${colors.primary}; display: block; word-break: break-word;">${locadorName}</strong>
          <span style="font-size: 9px; color: ${colors.textMuted}; display: block;">CPF: ${formatCPF(locadorCpf)} • LOCADOR</span>
        </div>

        <!-- Locatário -->
        <div style="text-align: center; min-width: 0; box-sizing: border-box;">
          ${tenantSig ? `
            <div style="text-align: center; margin-bottom: 2px;">
              <img src="${tenantSig}" alt="Assinatura Digital" style="max-height: 40px; margin: 0 auto -4px auto; display: block;" />
              <span style="display: inline-block; font-size: 7.5px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 1px 6px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                ✔ Assinado Digitalmente
              </span>
            </div>
          ` : '<div style="height: 30px;"></div>'}
          <div style="border-bottom: 1.5px solid ${colors.primary}; margin-bottom: 4px; width: 100%;"></div>
          <strong style="font-size: 10.5px; color: ${colors.primary}; display: block; word-break: break-word;">${activeTenantName}</strong>
          <span style="font-size: 9px; color: ${colors.textMuted}; display: block;">CPF: ${formatCPF(activeTenantCpf)} • LOCATÁRIO</span>
        </div>
      </div>

      <!-- Witnesses Block -->
      ${witnessesHtml}

      <!-- Institutional Security Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid ${colors.cardBorder}; padding-top: 6px; font-size: 7.5px; color: ${colors.textMuted}; width: 100%; box-sizing: border-box;">
        <div>
          Registro de Gestão Patrimonial • Documento com validade jurídica plena (Lei 8.245/91 & CC/02).
        </div>
        <div style="font-family: monospace; white-space: nowrap;">
          Hash: ${docHash} • Página 1 de 1
        </div>
      </div>
    </div>
  `;

  // Base CSS container
  const baseContainerStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 11.5px;
    line-height: 1.5;
    color: ${colors.textPrimary};
    background: #ffffff;
    padding: 20px 24px;
    max-width: 820px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    overflow-x: hidden;
  `;

  // 1. Contrato de Locação de Moto (Modelo Oficial Completo - Todas as 12 Cláusulas + Anexo I)
  if (type === 'contrato_locacao_moto_completo') {
    const startDate = data.customStartDate || motoContract?.startDate || getTodayLocalDateString();
    const startDateFormatted = formatDate(startDate);
    const endDateMin = addMonthsToDate(startDate, 3);
    const endDateMinFormatted = formatDate(endDateMin);

    const isWeekly =
      data.customPaymentFrequency === 'semanal' ||
      (!data.customPaymentFrequency &&
        (motoContract?.paymentFrequency === 'semanal' || (Boolean(data.customWeeklyValue) && !data.customMonthlyValue && !motoContract?.monthlyValue)));

    const monthlyVal =
      data.customMonthlyValue !== undefined && data.customMonthlyValue > 0
        ? data.customMonthlyValue
        : data.customAmount !== undefined && data.customAmount > 0 && !isWeekly
        ? data.customAmount
        : (motoContract?.monthlyValue ?? (motoContract?.weeklyValue ? weeklyToMonthly(motoContract.weeklyValue) : 0));
    const monthlyValExtenso = formatCurrencyExtenso(monthlyVal);

    const weeklyVal =
      data.customWeeklyValue !== undefined && data.customWeeklyValue > 0
        ? data.customWeeklyValue
        : (motoContract?.weeklyValue ?? (motoContract?.monthlyValue ? monthlyToWeekly(motoContract.monthlyValue) : 0));
    const weeklyValExtenso = formatCurrencyExtenso(weeklyVal);

    const dueDay = data.customDueDay !== undefined ? data.customDueDay : (motoContract?.dueDay || 10);
    const dueDayName = data.customDueDayOfWeek || (motoContract?.dueDayOfWeek !== undefined ? getWeekdayName(motoContract.dueDayOfWeek) : 'Segunda-feira');
    const dueLimitTime = data.customDueLimitTime || '18:00';
    const initialKm = data.customInitialKm !== undefined ? data.customInitialKm : (moto?.delivery?.initialKm || moto?.currentKm || 0);
    const insuranceDeductible = data.customInsuranceDeductible || '1.500,00';
    const contractCity = data.customContractCity || settings.cityState || 'Barra Velha, Santa Catarina';

    const sectionTitleStyle = `font-size: 10.5px; font-weight: 800; color: ${colors.primary}; margin: 14px 0 4px 0; text-transform: uppercase; border-bottom: 1px solid ${colors.cardBorder}; padding-bottom: 2px;`;
    const pStyle = `margin: 0 0 6px 0; font-size: 10.5px; text-align: justify; line-height: 1.55; color: ${colors.textPrimary};`;
    const bulletStyle = `margin: 0 0 4px 12px; font-size: 10px; color: ${colors.textSecondary}; line-height: 1.45;`;

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <!-- CLÁUSULA 1º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 1º — IDENTIFICAÇÃO DAS PARTES CONTRATANTES
        </h3>
        <p style="${pStyle}">
          <strong>1.1. LOCADOR:</strong> <strong>${locadorName}</strong>, inscrito no CPF nº <strong>${formatCPF(locadorCpf)}</strong>, residente e domiciliado na ${locadorAddress}.
        </p>
        <p style="${pStyle}">
          <strong>1.2. LOCATÁRIO:</strong> <strong>${activeTenantName}</strong>, inscrito no CPF nº <strong>${formatCPF(activeTenantCpf)}</strong>${motoTenant?.rg ? `, portador do RG nº ${motoTenant.rg}` : ''}${motoTenant?.cnh?.number ? `, titular da CNH Cat. ${motoTenant.cnh.category || 'A'} nº ${motoTenant.cnh.number}` : ''}, residente e domiciliado na ${activeTenantAddress || 'Endereço cadastrado'}.
        </p>
        <p style="${pStyle}">
          <strong>1.3.</strong> As partes acima qualificadas têm, entre si, justo e acordado o presente Contrato de Locação de Motocicleta, regido pelas cláusulas seguintes e pelas disposições legais aplicáveis.
        </p>
        <p style="${pStyle}">
          <strong>1.4. DOCUMENTOS OBRIGATÓRIOS:</strong> O LOCATÁRIO apresentou e foram devidamente conferidos no ato da contratação os seguintes documentos obrigatórios:
        </p>
        <div style="margin-bottom: 8px;">
          <div style="${bulletStyle}">• CNH válida com categoria 'A' definitiva ou provisória regular;</div>
          <div style="${bulletStyle}">• Comprovante de residência atualizado em nome próprio ou acompanhado de declaração;</div>
          <div style="${bulletStyle}">• Documento de identificação oficial com foto e cadastro no aplicativo CNH Digital.</div>
        </div>

        <!-- CLÁUSULA 2º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 2º — DO OBJETO DO CONTRATO, DOCUMENTAÇÃO E ACESSÓRIOS
        </h3>
        <p style="${pStyle}">
          <strong>2.1.</strong> O objeto deste contrato é a locação da motocicleta de propriedade do LOCADOR, a seguir identificada, entregue ao LOCATÁRIO em perfeitas condições de uso, funcionamento e segurança:
        </p>
        <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 12px; margin: 6px 0 8px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; line-height: 1.45;">
            <div><strong>Marca/Modelo:</strong> ${moto?.brand || 'Honda'} ${moto?.model || 'Fan'}</div>
            <div><strong>Ano Fabricação/Modelo:</strong> ${moto?.year || '2024'}</div>
            <div><strong>Cor Predominante:</strong> ${moto?.color || 'Preta'}</div>
            <div><strong>Placa do Veículo:</strong> <span style="font-family: monospace; font-weight: 700;">${moto?.plate || 'BRA-2E19'}</span></div>
            <div><strong>RENAVAM:</strong> <span style="font-family: monospace;">${moto?.renavam || 'Conforme documentação'}</span></div>
            <div><strong>Quilometragem Inicial:</strong> <strong>${initialKm.toLocaleString('pt-BR')} km</strong></div>
          </div>
        </div>
        <p style="${pStyle}">
          <strong>2.2.</strong> A motocicleta é entregue com documentação rigorosamente em dia (CRLV digital/físico), ferramentas obrigatórias e acessórios descritos no <strong>Termo de Vistoria (Anexo I)</strong>, que passa a fazer parte integrante deste instrumento.
        </p>

        <!-- CLÁUSULA 3º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 3º — DA UTILIZAÇÃO E DO USO EXCLUSIVO
        </h3>
        <p style="${pStyle}">
          <strong>3.1.</strong> A motocicleta destina-se exclusivamente ao uso legal do LOCATÁRIO, sendo permitida a utilização para transporte pessoal ou para fins de trabalho autônomo em plataformas de aplicativo de transporte e entregas (ex: Uber, 99, iFood, etc.).
        </p>
        <p style="${pStyle}">
          <strong>3.2.</strong> O uso da motocicleta é <strong>ESTRITAMENTE EXCLUSIVO</strong> do LOCATÁRIO, sendo expressamente <strong>PROIBIDO</strong>:
        </p>
        <div style="margin-bottom: 6px;">
          <div style="${bulletStyle}">a) Sublocar, emprestar, ceder ou transferir a posse da motocicleta a terceiros sob qualquer pretexto, seja de forma gratuita ou onerosa;</div>
          <div style="${bulletStyle}">b) Conduzir o veículo sob o efeito de álcool, drogas ou qualquer substância que altere a capacidade psicomotora;</div>
          <div style="${bulletStyle}">c) Utilizar a motocicleta em competições, rachas, manobras perigosas, ou em vias não pavimentadas (off-road) e praias;</div>
          <div style="${bulletStyle}">d) Transportar carga de peso superior ao limite especificado pelo fabricante da motocicleta.</div>
        </div>
        <p style="${pStyle}">
          <strong>3.3. PENALIDADE POR USO INDEVIDO:</strong> O descumprimento de qualquer uma das proibições desta cláusula ensejará a rescisão imediata do contrato por justa causa, com a aplicação das penalidades previstas neste instrumento, além da perda integral da caução.
        </p>

        <!-- CLÁUSULA 4º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 4º — DO PRAZO E DA RENOVAÇÃO AUTOMÁTICA
        </h3>
        <p style="${pStyle}">
          <strong>4.1.</strong> O presente contrato é firmado pelo <strong>prazo mínimo obrigatório de 3 (três) meses</strong>, com início em <strong>${startDateFormatted}</strong> e término em <strong>${endDateMinFormatted}</strong>.
        </p>
        <p style="${pStyle}">
          <strong>4.2.</strong> Findo o prazo estipulado no item 4.1, caso o LOCATÁRIO permaneça na posse da motocicleta sem oposição do LOCADOR, o contrato considerar-se-á prorrogado automaticamente por <strong>PRAZO INDETERMINADO</strong>, mantendo-se vigentes todas as cláusulas e penalidades pactuadas.
        </p>
        <p style="${pStyle}">
          ${
            isWeekly
              ? '<strong>4.3.</strong> No período de prazo indeterminado, a locação passará a ter vigência e renovação estritamente semanal, condicionada ao pagamento antecipado das diárias/semanais.'
              : '<strong>4.3.</strong> No período de prazo indeterminado, a locação passará a ter vigência e renovação mensal, mantidas as condições e valores pactuados.'
          }
        </p>

        <!-- CLÁUSULA 5º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 5º — DO VALOR, DA CAUÇÃO E DAS CONDIÇÕES DE PAGAMENTO
        </h3>
        <p style="${pStyle}">
          ${
            isWeekly
              ? `<strong>5.1.</strong> Pela locação da motocicleta, o LOCATÁRIO pagará ao LOCADOR o valor semanal de <strong>${formatCurrency(weeklyVal)} (${weeklyValExtenso})</strong> por SEMANA, devendo o pagamento ser realizado de forma ANTECIPADA toda <strong>${dueDayName} até às ${dueLimitTime} horas</strong>.`
              : `<strong>5.1.</strong> Pela locação da motocicleta, o LOCATÁRIO pagará ao LOCADOR o valor mensal de <strong>${formatCurrency(monthlyVal)} (${monthlyValExtenso})</strong> por MÊS, devendo o pagamento ser realizado de forma pontual até o <strong>dia ${dueDay} de cada mês</strong>.`
          }
        </p>
        <p style="${pStyle}">
          <strong>5.2.</strong> O pagamento deverá ser efetuado exclusivamente via PIX (chave: <strong>${locadorPix}</strong>) ou transferência autorizada. O atraso no pagamento ensejará a rescisão imediata do contrato e a aplicação de multa diária de <strong>R$ 10,00</strong> até a efetiva devolução do veículo, sem prejuízo das demais sanções.
        </p>
        <p style="${pStyle}">
          <strong>5.3.</strong> A título de garantia das obrigações assumidas (depósito de segurança), o LOCATÁRIO deposita neste ato a quantia de <strong>${formatCurrency(depositVal)} (${depositExtenso})</strong> a título de <strong>CAUÇÃO</strong>.
        </p>
        <p style="${pStyle}">
          <strong>5.4.</strong> O valor da caução ficará retido em poder do LOCADOR e será restituído ao LOCATÁRIO no prazo de <strong>até 3 (três) dias úteis</strong> após a devolução definitiva da motocicleta, deduzindo-se eventuais multas de trânsito pendentes, avarias, falta de combustível, limpezas ou diárias em atraso.
        </p>
        <p style="${pStyle}">
          <strong>5.5.</strong> Caso o LOCATÁRIO rescinda o contrato antes do cumprimento do prazo mínimo obrigatório estabelecido na Cláusula 4.1, perderá o valor da caução a título de multa compensatória por rescisão antecipada.
        </p>

        <!-- CLÁUSULA 6º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 6º — DAS MANUTENÇÕES E CUIDADOS COM A MOTOCICLETA
        </h3>
        <p style="${pStyle}">
          <strong>6.1.</strong> As manutenções preventivas decorrentes do desgaste natural pelo uso regular do veículo (substituição de pneus pelo indicador TWI, troca do kit de relação desgastado e reparos mecânicos sem culpa do locatário) serão de responsabilidade e custeadas integralmente pelo <strong>LOCADOR</strong> em oficina credenciada.
        </p>
        <p style="${pStyle}">
          <strong>6.2.</strong> É de responsabilidade obrigatória do LOCATÁRIO a verificação diária dos itens básicos de segurança: calibragem dos pneus, fluido de freio, sistema de iluminação (farol, setas, lanterna) e sinalização sonora (buzina).
        </p>
        <p style="${pStyle}">
          <strong>6.3. TROCA DE ÓLEO OBRIGATÓRIA:</strong> O LOCATÁRIO obriga-se rigorosamente a efetuar a troca do óleo do motor a cada <strong>1.000 (mil) quilômetros rodados</strong> nas especificações do fabricante, enviando via WhatsApp foto legível do painel com o KM e foto do recibo/nota do serviço.
        </p>
        <p style="${pStyle}">
          <strong>6.4.</strong> Danos causados por negligência, falta de óleo, falta de combustível (queima de bomba), mau uso, acidentes ou condução inadequada serão de responsabilidade integral do LOCATÁRIO, incluindo guincho e peças.
        </p>
        <p style="${pStyle}">
          <strong>6.5. RASTREAMENTO E BLOQUEIO REMOTO:</strong> O LOCATÁRIO declara estar ciente de que a motocicleta possui sistema de rastreamento veicular ativo durante toda a vigência. Em caso de inadimplência, descumprimento ou suspeita de apropriação indébita, fica o LOCADOR autorizado a monitorar e realizar o bloqueio remoto do veículo.
        </p>
        <p style="${pStyle}">
          <strong>6.6.</strong> Perda ou dano na chave principal ou dispositivo de acionamento será de responsabilidade do LOCATÁRIO, que responderá pelos custos de reposição e codificação.
        </p>
        <p style="${pStyle}">
          <strong>6.7.</strong> Despesas com remoção por guincho decorrentes de acidente causado pelo LOCATÁRIO, pane seca ou negligência correrão por conta deste.
        </p>

        <!-- CLÁUSULA 7º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 7º — DO SISTEMA DE VISTORIAS (ONLINE E PRESENCIAL)
        </h3>
        <p style="${pStyle}">
          ${
            isWeekly
              ? '<strong>7.1. VISTORIA ONLINE SEMANAL:</strong> Semanalmente, junto ao envio do comprovante de pagamento, o LOCATÁRIO deverá enviar via WhatsApp vídeo contínuo em 360 graus mostrando a traseira com a placa legível, laterais e o painel com a quilometragem atual.'
              : '<strong>7.1. VISTORIA ONLINE MENSAL:</strong> Mensalmente, junto ao envio do comprovante de pagamento, o LOCATÁRIO deverá enviar via WhatsApp vídeo contínuo em 360 graus mostrando a traseira com a placa legível, laterais e o painel com a quilometragem atual.'
          }
        </p>
        <p style="${pStyle}">
          <strong>7.2.</strong> A não apresentação do vídeo semanal acarretará multa de <strong>R$ 20,00 por dia de atraso</strong>. Atraso superior a 48h autoriza a rescisão imediata por justa causa.
        </p>
        <p style="${pStyle}">
          <strong>7.3. VISTORIA PRESENCIAL MENSAL:</strong> O LOCATÁRIO compromete-se a apresentar a motocicleta 1 (uma) vez por mês para vistoria técnica presencial no município da locação.
        </p>
        <p style="${pStyle}">
          <strong>7.4.</strong> A não apresentação presencial agendada ensejará multa de <strong>R$ 20,00 por dia</strong>, autorizando a rescisão imediata após 24h de atraso.
        </p>

        <!-- CLÁUSULA 8º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 8º — DO SEGURO, SINISTROS E ACIDENTES
        </h3>
        <p style="${pStyle}">
          <strong>8.1.</strong> A motocicleta conta com seguro/proteção veicular contra colisão, incêndio, roubo e furto, com franquia fixada em <strong>R$ ${insuranceDeductible}</strong>. Em caso de sinistro com acionamento do seguro, o LOCATÁRIO arcará integralmente com o pagamento da franquia.
        </p>
        <p style="${pStyle}">
          <strong>8.2. DANOS ABAIXO DA FRANQUIA:</strong> Em acidentes com danos inferiores ao valor da franquia, o LOCATÁRIO arcará integralmente com os custos de reparação em oficina indicada pelo LOCADOR.
        </p>
        <p style="${pStyle}">
          <strong>8.3.</strong> O LOCADOR não disponibiliza veículo reserva e não responde por lucros cessantes durante o período de reparos na oficina.
        </p>
        <p style="${pStyle}">
          <strong>8.4.</strong> O LOCATÁRIO é integralmente responsável por danos causados a terceiros e processos decorrentes de sua condução.
        </p>
        <p style="${pStyle}">
          <strong>8.5.</strong> Em caso de roubo ou furto, o LOCATÁRIO deverá acionar a polícia via 190 imediatamente, avisar o LOCADOR e lavrar o Boletim de Ocorrência em até 24 horas.
        </p>
        <p style="${pStyle}">
          <strong>8.6.</strong> Em perda total ou lesões a terceiros, o LOCATÁRIO responde pelas franquias e diferenças não cobertas pela seguradora.
        </p>

        <!-- CLÁUSULA 9º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 9º — DAS INFRAÇÕES DE TRÂNSITO E CNH DIGITAL
        </h3>
        <p style="${pStyle}">
          <strong>9.1.</strong> O LOCATÁRIO é o único responsável por todas as infrações, multas e pontuações aplicadas à motocicleta durante a vigência da locação.
        </p>
        <p style="${pStyle}">
          <strong>9.2.</strong> O LOCATÁRIO compromete-se a aceitar a indicação de <strong>Condutor Principal / Infrator no aplicativo CNH DIGITAL</strong> no ato da retirada. Desativar essa indicação enseja rescisão imediata.
        </p>
        <p style="${pStyle}">
          <strong>9.3.</strong> O LOCATÁRIO autoriza o LOCADOR a indicar o condutor perante os órgãos de trânsito competentes (DETRAN, PRF, Município), sob pena de multa de R$ 30,00 em caso de perda de prazo.
        </p>
        <p style="${pStyle}">
          <strong>9.4. PERÍMETRO URBANO:</strong> É expressamente proibido o deslocamento para fora dos limites da Região Metropolitana da locação sem prévia autorização por escrito do LOCADOR, sob pena de rescisão e multa de R$ 50,00.
        </p>
        <p style="${pStyle}">
          <strong>9.5.</strong> As multas cometidas durante a locação permanecerão sob responsabilidade do LOCATÁRIO mesmo após o encerramento do contrato.
        </p>

        <!-- CLÁUSULA 10º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 10º — DA INADIMPLÊNCIA, RESCISÃO E APROPRIAÇÃO INDÉBITA
        </h3>
        <p style="${pStyle}">
          <strong>10.1.</strong> O atraso no pagamento ${isWeekly ? 'semanal' : 'mensal'} superior a 48 (quarenta e oito) horas importará na <strong>RESCISÃO AUTOMÁTICA</strong> por justa causa.
        </p>
        <p style="${pStyle}">
          <strong>10.2.</strong> Rescindido o contrato, o LOCATÁRIO obriga-se à devolução imediata do veículo.
        </p>
        <p style="${pStyle}">
          <strong>10.3. CRIME DE APROPRIAÇÃO INDÉBITA:</strong> A não devolução do veículo em até 24 (vinte e quatro) horas após a comunicação de rescisão caracterizará o crime de <strong>apropriação indébita (Art. 168 do Código Penal)</strong>, autorizando comunicação policial imediata, busca e apreensão e bloqueio via rastreador.
        </p>

        <!-- CLÁUSULA 11º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 11º — DA INEXISTÊNCIA DE VÍNCULO TRABALHISTA E REGRAS GERAIS
        </h3>
        <p style="${pStyle}">
          <strong>11.1.</strong> Fica expressamente pactuada a total <strong>INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO</strong> ou subordinação entre LOCADOR e LOCATÁRIO. O LOCATÁRIO é profissional autônomo com liberdade total de horários e rotas.
        </p>
        <p style="${pStyle}">
          <strong>11.2.</strong> Comunicações via WhatsApp ou e-mail nos endereços indicados na qualificação são válidas para todos os efeitos legais.
        </p>

        <!-- CLÁUSULA 12º -->
        <h3 style="${sectionTitleStyle}">
          CLÁUSULA 12º — DO FORO
        </h3>
        <p style="${pStyle}">
          <strong>12.1.</strong> Para dirimir quaisquer controvérsias decorrentes deste contrato, as partes elegem expressamente o foro da Comarca de <strong>${contractCity}</strong>, com renúncia expressa a qualquer outro.
        </p>

        <!-- Assinaturas do Contrato Principal -->
        ${cartorialSignaturesBlock}

        <!-- ============================================================= -->
        <!-- ANEXO I — TERMO DE VISTORIA E RETIRADA COMPLETO -->
        <!-- ============================================================= -->
        <div style="margin-top: 32px; border-top: 2px dashed ${colors.primary}; padding-top: 24px; page-break-before: always; width: 100%; box-sizing: border-box;">
          <!-- Anexo Header -->
          <div style="background: ${colors.primary}; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-align: center; margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">
              ANEXO I — TERMO DE VISTORIA E RETIRADA DA MOTOCICLETA
            </div>
            <div style="font-size: 8.5px; opacity: 0.9; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px;">
              PARTE INTEGRANTE E INDISSOCIÁVEL DO CONTRATO DE LOCAÇÃO
            </div>
          </div>

          <!-- Metadata Box -->
          <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; font-size: 9.5px; line-height: 1.5;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 6px;">
              <div><strong>Data da Vistoria:</strong> ${todayFormatted}</div>
              <div><strong>Hora da Retirada:</strong> ${data.customDueLimitTime || '10:00'}</div>
              <div><strong>Quilometragem Inicial:</strong> <strong>${initialKm.toLocaleString('pt-BR')} km</strong></div>
            </div>
            <div style="border-top: 1px solid ${colors.cardBorder}; padding-top: 6px; color: ${colors.textSecondary};">
              <strong>Veículo:</strong> ${moto?.brand || 'Honda'} ${moto?.model || 'Fan'} (${moto?.year || '2024'}) • <strong>Placa:</strong> ${moto?.plate || 'BRA-2E19'} • <strong>Locatário:</strong> ${activeTenantName} (${formatCPF(activeTenantCpf)})
            </div>
          </div>

          <!-- Tabela de 10 Itens Vistoriados -->
          <div style="border: 1px solid ${colors.cardBorder}; border-radius: 6px; overflow: hidden; margin-bottom: 14px;">
            <div style="background: ${isMonochrome ? '#f4f4f5' : '#f1f5f9'}; border-bottom: 1px solid ${colors.cardBorder}; padding: 6px 12px; display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase;">
              <div>Item Vistoriado</div>
              <div>Estado / Condição</div>
              <div>Observações</div>
            </div>
            ${[
              '1. Pneu Dianteiro (Borracha / TWI)',
              '2. Pneu Traseiro (Borracha / TWI)',
              '3. Freio Dianteiro (Pastilha / Disco)',
              '4. Freio Traseiro (Lona / Disco)',
              '5. Farol Principal, Lanterna e Luz de Freio',
              '6. Setas / Piscas (Dianteiros e Traseiros)',
              '7. Buzina e Painel de Instrumentos',
              '8. Espelhos Retrovisores (Direito e Esquerdo)',
              '9. Assento / Banco e Capa de Proteção',
              '10. Pintura, Carenagens, Tanque e Lataria',
            ]
              .map(
                (item, idx) => `
              <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; padding: 5px 12px; font-size: 9px; border-bottom: ${idx < 9 ? `1px solid ${colors.cardBorder}` : 'none'}; background: ${idx % 2 === 1 ? (isMonochrome ? '#fafafa' : '#f8fafc') : '#ffffff'}; align-items: center;">
                <div style="font-weight: 600; color: ${colors.textPrimary};">${item}</div>
                <div style="font-family: monospace; font-size: 8.5px; color: ${colors.textSecondary};">[ X ] Bom &nbsp; [ &nbsp; ] Reg &nbsp; [ &nbsp; ] Ruim</div>
                <div style="border-bottom: 1px dotted #cbd5e1; height: 12px;"></div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Nível de Combustível -->
          <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px;">
            <div style="font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 4px;">
              ⛽ NÍVEL DE COMBUSTÍVEL NA RETIRADA:
            </div>
            <div style="font-size: 9px; font-family: monospace; color: ${colors.textSecondary};">
              [ &nbsp; ] Cheio &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] 3/4 &nbsp;&nbsp;&nbsp;&nbsp; [ X ] 1/2 &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] 1/4 &nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] Reserva
            </div>
          </div>

          <!-- Acessórios Entregues -->
          <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px;">
            <div style="font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 4px;">
              📦 ACESSÓRIOS ENTREGUES JUNTO COM O VEÍCULO:
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; font-size: 9px; color: ${colors.textSecondary};">
              <div>[ X ] Capacete</div>
              <div>[ X ] Suporte de Celular</div>
              <div>[ X ] Chave Reserva</div>
              <div>[ &nbsp; ] Capa de Chuva</div>
              <div>[ &nbsp; ] Baú / Bauleto</div>
              <div>[ &nbsp; ] Outros Acessórios</div>
            </div>
          </div>

          <!-- Avarias Existentes e Vídeo 360° -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
            <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 12px;">
              <div style="font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 3px;">
                🔍 AVARIAS PRÉ-EXISTENTES REGISTRADAS:
              </div>
              <div style="font-size: 8.5px; color: ${colors.textSecondary}; border-bottom: 1px dotted #cbd5e1; height: 16px; margin-bottom: 4px;"></div>
              <div style="font-size: 8.5px; color: ${colors.textSecondary}; border-bottom: 1px dotted #cbd5e1; height: 16px;"></div>
            </div>
            <div style="background: ${colors.cardBg}; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 8px 12px;">
              <div style="font-size: 8.5px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 3px;">
                📹 REGISTRO EM VÍDEO 360° NA RETIRADA:
              </div>
              <div style="font-size: 8.5px; color: ${colors.textSecondary};">
                Vídeo gravado e arquivado no ato da entrega comprovando o estado geral da lataria, motor, pneus e quilometragem.
              </div>
            </div>
          </div>

          <!-- Declaração do Locatário e Assinaturas no Anexo I -->
          <div style="background: #f8fafc; border: 1px solid ${colors.cardBorder}; border-radius: 6px; padding: 10px 12px; margin-bottom: 16px; font-size: 9px; line-height: 1.45; color: ${colors.textSecondary};">
            <strong>DECLARAÇÃO DO LOCATÁRIO:</strong> Declaro que verifiquei minuciosamente a motocicleta e seus itens de segurança, atestando que se encontram no estado registrado neste Termo e que recebi a documentação de rodagem, chaves e acessórios acima descritos.
          </div>

          <div class="doc-signatures-grid" style="margin-top: 16px;">
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid ${colors.primary}; height: 24px; margin-bottom: 4px;"></div>
              <strong style="font-size: 9.5px; color: ${colors.primary};">${locadorName}</strong>
              <span style="font-size: 8.5px; color: ${colors.textMuted}; display: block;">LOCADOR • VISTORIA APROVADA</span>
            </div>
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid ${colors.primary}; height: 24px; margin-bottom: 4px;"></div>
              <strong style="font-size: 9.5px; color: ${colors.primary};">${activeTenantName}</strong>
              <span style="font-size: 8.5px; color: ${colors.textMuted}; display: block;">LOCATÁRIO • RECEBIMENTO DO VEÍCULO</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Contrato de Locação c/ Promessa de Compra (Motos) - Compatibilidade
  if (type === 'contrato_moto') {
    const monthlyVal = data.customAmount > 0 ? data.customAmount : (motoContract?.monthlyValue ?? 0);
    const monthlyValExtenso = formatCurrencyExtenso(monthlyVal);
    const startDateFormatted = formatDate(data.customStartDate || motoContract?.startDate || todayStr);
    const totalContractVal = motoContract?.totalAgreedValue || (monthlyVal * durationVal);

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <h3 style="font-size: 11px; font-weight: 800; color: ${colors.primary}; margin: 12px 0 4px 0; text-transform: uppercase;">
          CLÁUSULA 1ª — DO OBJETO E DESTINAÇÃO COMERCIAL
        </h3>
        <p style="margin: 0 0 8px 0;">
          O presente contrato regula a locação comercial com compromisso irrevogável de transferência definitiva de propriedade do veículo: <strong>${assetName}</strong>, ${assetSubDetail}.
        </p>

        <h3 style="font-size: 11px; font-weight: 800; color: ${colors.primary}; margin: 12px 0 4px 0; text-transform: uppercase;">
          CLÁUSULA 2ª — DO VALOR, PLANO DE PARCELAMENTO E PAGAMENTO
        </h3>
        <p style="margin: 0 0 8px 0;">
          O LOCATÁRIO obriga-se ao pagamento de <strong>${durationVal} parcelas</strong> no valor individual de <strong>${formatCurrency(monthlyVal)} (${monthlyValExtenso})</strong>, totalizando o montante de <strong>${formatCurrency(totalContractVal)}</strong>, com início em <strong>${startDateFormatted}</strong> via PIX <strong>${locadorPix}</strong>.
        </p>

        <h3 style="font-size: 11px; font-weight: 800; color: ${colors.primary}; margin: 12px 0 4px 0; text-transform: uppercase;">
          CLÁUSULA 3ª — DA PROMESSA DE COMPRA E TRANSFERÊNCIA NO DETRAN
        </h3>
        <p style="margin: 0 0 8px 0;">
          Após a quitação integral de todas as ${durationVal} parcelas avençadas e eventuais encargos, o LOCADOR outorgará a respectiva Autorização para Transferência de Propriedade do Veículo (ATPV-e) em favor do COMPRADOR, correndo as taxas de transferência por conta deste.
        </p>

        <h3 style="font-size: 11px; font-weight: 800; color: ${colors.primary}; margin: 12px 0 4px 0; text-transform: uppercase;">
          CLÁUSULA 4ª — DA CAUÇÃO E CONSERVAÇÃO DO VEÍCULO
        </h3>
        <p style="margin: 0 0 8px 0;">
          A caução prestada no valor de <strong>${formatCurrency(depositVal)} (${depositExtenso})</strong> permanecerá retida até a quitação final. As manutenções preventivas, troca de óleo a cada 1.000 km e conservação são de responsabilidade exclusiva do COMPRADOR.
        </p>

        <h3 style="font-size: 11px; font-weight: 800; color: ${colors.primary}; margin: 12px 0 4px 0; text-transform: uppercase;">
          CLÁUSULA 5ª — DA RESCISÃO POR INADIMPLEMENTO E REINTEGRAÇÃO DE POSSE
        </h3>
        <p style="margin: 0 0 8px 0;">
          O atraso no pagamento superior a 15 (quinze) dias facultará ao LOCADOR rescindir o contrato de pleno direito, com a imediata restituição e recolhimento do veículo, perdendo o LOCATÁRIO os valores pagos a título de aluguel/uso.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 3. Contrato de Locação de Kitnet Residencial (Completo com 19 Cláusulas)
  if (type === 'contrato_kitnet') {
    const rentVal = data.customAmount > 0 ? data.customAmount : (kitnetContract?.rentValue ?? 0);
    const dueDay = kitnetContract?.dueDay || 10;
    const rentExtenso = formatCurrencyExtenso(rentVal);
    const startDateFormatted = formatDateFullPT(data.customStartDate || kitnetContract?.startDate || todayStr);
    const cleaningFee =
      data.customCleaningFee !== undefined
        ? data.customCleaningFee
        : kitnetContract?.cleaningFee !== undefined
        ? kitnetContract.cleaningFee
        : kitnet?.cleaningFeeBase !== undefined
        ? kitnet.cleaningFeeBase
        : (settings.cleaningFee ?? 0);
    const cleaningFeeExtenso = formatCurrencyExtenso(cleaningFee);

    const sectionTitleStyle = `font-size: 10px; font-weight: 800; color: ${colors.primary}; margin: 12px 0 3px 0; text-transform: uppercase;`;
    const pStyle = `margin: 0 0 5px 0; font-size: 10px; text-align: justify; line-height: 1.5; color: ${colors.textPrimary};`;

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <h3 style="${sectionTitleStyle}">CLÁUSULA 1ª — DO OBJETO E DESTINAÇÃO DO IMÓVEL</h3>
        <p style="${pStyle}">
          Constitui objeto do presente contrato a locação para fins <strong>ESTRITAMENTE RESIDENCIAIS UNIFAMILIARES</strong> da unidade imobiliária identificada como: <strong>${kitnet?.name || 'Kitnet'} (Nº ${kitnet?.number || '01'})</strong>, situada na <strong>${kitnet?.address?.trim() || settings.adminAddress || 'Endereço Cadastrado'}</strong>, entregue em perfeitas condições de habitabilidade, higiene e funcionamento de suas instalações hidráulicas e elétricas.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 2ª — DO PRAZO DE VIGÊNCIA</h3>
        <p style="${pStyle}">
          A locação é celebrada pelo prazo determinado de <strong>${durationText}</strong>, iniciando-se em <strong>${startDateFormatted}</strong>, findo o qual o LOCATÁRIO obriga-se a desocupar e restituir o imóvel inteiramente livre de pessoas e coisas, nas mesmas condições em que o recebeu.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 3ª — DO VALOR DO ALUGUEL E FORMA DE PAGAMENTO</h3>
        <p style="${pStyle}">
          O valor mensal da locação é fixado em <strong>${formatCurrency(rentVal)} (${rentExtenso})</strong>, devendo ser pago <strong>MENSAL E PONTUALMENTE até o dia ${dueDay} de cada mês</strong> subsequente ao vencido, mediante transferência via PIX para a chave: <strong>${locadorPix}</strong> em favor do LOCADOR.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 4ª — DOS ENCARGOS, CONSUMO DE ÁGUA E ENERGIA ELÉTRICA</h3>
        <p style="${pStyle}">
          O IPTU e a taxa de lixo correm por conta do LOCADOR. As despesas de consumo individual de energia elétrica e abastecimento de água são de responsabilidade do LOCATÁRIO, que deverá efetuar os pagamentos diretamente aos órgãos concessionários ou reembolsar o LOCADOR nos termos acordados.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 5ª — DA GARANTIA LOCATÍCIA (CAUÇÃO)</h3>
        <p style="${pStyle}">
          A título de garantia locatícia nos termos do art. 37, I da Lei 8.245/91, o LOCATÁRIO deposita nas mãos do LOCADOR a quantia de <strong>${formatCurrency(depositVal)} (${depositExtenso})</strong> a título de <strong>CAUÇÃO EM DINHEIRO</strong>. A caução permanecerá retida até a rescisão e entrega definitiva das chaves, servindo para quitar eventuais aluguéis pendentes, reparos de avarias e taxa de limpeza.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 6ª — DA TAXA DE LIMPEZA E PINTURA</h3>
        <p style="${pStyle}">
          O imóvel é entregue higienizado e pintado. Na devolução, caso o imóvel não seja restituído nas mesmas condições de limpeza profissional e pintura, será descontada da caução a quantia de <strong>${formatCurrency(cleaningFee)} (${cleaningFeeExtenso})</strong> a título de taxa de higienização e reparos básicos.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 7ª — DA CONSERVAÇÃO E BENFEITORIAS</h3>
        <p style="${pStyle}">
          O LOCATÁRIO obriga-se a manter o imóvel em perfeito estado. Nenhuma modificação, reforma ou benfeitoria (útil ou voluptuária) poderá ser realizada sem a prévia autorização expressa por escrito do LOCADOR, passando as eventuais benfeitorias a integrar o imóvel sem direito a indenização ou retenção.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 8ª — DAS REGRAS DE CONVIVÊNCIA E SOSSEGO</h3>
        <p style="${pStyle}">
          O LOCATÁRIO obriga-se a respeitar o sossego dos vizinhos e normas condominiais/locatícias, sendo terminantemente proibido som em volume excessivo, algazarras, aglomerações e atividades ilícitas no local.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 9ª — DA VEDAÇÃO DE SUBLOCAÇÃO</h3>
        <p style="${pStyle}">
          É expressamente vedado ao LOCATÁRIO sublocar, ceder, emprestar ou transferir o imóvel, no todo ou em parte, a terceiros, sob pena de rescisão contratual imediata por justa causa e incidência da multa penal.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 10ª — DA MULTA RESCISÓRIA POR DESOCUPAÇÃO ANTECIPADA</h3>
        <p style="${pStyle}">
          Caso o LOCATÁRIO decida desocupar o imóvel antes do término do prazo determinado, incidirá multa penal equivalente ao valor de 1 (um) mês de aluguel, retida prioritariamente da caução prestada.
        </p>

        <h3 style="${sectionTitleStyle}">CLÁUSULA 11ª — DO FORO</h3>
        <p style="${pStyle}">
          Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem expressamente o foro da Comarca do imóvel, com renúncia expressa a qualquer outro.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 4. Termo de Entrega & Vistoria da Moto
  if (type === 'termo_entrega_moto') {
    const initialKm = data.customInitialKm !== undefined ? data.customInitialKm : (moto?.delivery?.initialKm || moto?.currentKm || 0);

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <div style="background: ${colors.cardBg}; border: 1.5px solid ${colors.cardBorder}; border-radius: 8px; padding: 14px; margin: 16px 0; box-sizing: border-box; width: 100%;">
          <div style="font-size: 10px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 8px;">
            CHECKLIST DE INSPEÇÃO FÍSICA E MECÂNICA NA ENTREGA
          </div>
          <div class="doc-checklist-3col">
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Hodômetro / KM Inicial:</strong><br />
              <span style="font-size: 12.5px; font-family: monospace; font-weight: 800; color: ${colors.primary};">${initialKm.toLocaleString('pt-BR')} KM</span>
            </div>
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Pneus / Relação:</strong><br />
              <span style="color: #059669; font-weight: 700;">✔ Pneus Novos & Kit Revisado</span>
            </div>
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Itens Entregues:</strong><br />
              <span>✔ Chave original + CRLV Digital</span>
            </div>
          </div>
        </div>

        <p style="margin: 0 0 8px 0;">
          O(A) CONDUTOR(A) <strong>${activeTenantName}</strong> declara ter vistoriado pessoalmente a motocicleta <strong>${assetName}</strong>, testado faróis, piscas, freios dianteiro/traseiro, nível de óleo do motor e integridade da carenagem, recebendo o veículo em perfeito estado de funcionamento e conservação.
        </p>
        <p style="margin: 0 0 8px 0;">
          O condutor compromete-se a manter a guarda zelosa do veículo, respeitar os limites de velocidade, não praticar manobras perigosas e realizar as revisões e trocas de óleo preventivas pontualmente.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 5. Laudo de Vistoria de Kitnet
  if (type === 'termo_vistoria_kitnet') {
    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <div style="background: ${colors.cardBg}; border: 1.5px solid ${colors.cardBorder}; border-radius: 8px; padding: 14px; margin: 16px 0; box-sizing: border-box; width: 100%;">
          <div style="font-size: 10px; font-weight: 800; color: ${colors.primary}; text-transform: uppercase; margin-bottom: 8px;">
            LAUDO DE VISTORIA RESIDENCIAL DE ENTRADA DO IMÓVEL
          </div>
          <div class="doc-checklist-2col">
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Pintura & Paredes:</strong><br />
              <span style="color: #059669; font-weight: 700;">✔ Pintura Nova / Sem avarias</span>
            </div>
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Instalações Hidráulicas:</strong><br />
              <span style="color: #059669; font-weight: 700;">✔ Torneiras, pia e chuveiro testados</span>
            </div>
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Instalações Elétricas:</strong><br />
              <span style="color: #059669; font-weight: 700;">✔ Tomadas, interruptores e lâmpadas ok</span>
            </div>
            <div style="background: #ffffff; border: 1px solid ${colors.cardBorder}; padding: 8px; border-radius: 4px; min-width: 0; box-sizing: border-box;">
              <strong>Fechaduras & Chaves:</strong><br />
              <span style="color: #059669; font-weight: 700;">✔ Chaves entregues e portas íntegras</span>
            </div>
          </div>
        </div>

        <p style="margin: 0 0 8px 0;">
          O(A) LOCATÁRIO(A) <strong>${activeTenantName}</strong> confirma ter vistoriado o imóvel <strong>${assetName}</strong>, recebendo-o limpo e em perfeito estado de conservação, obrigando-se a devolvê-lo nas mesmíssimas condições no término do contrato.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 6. Recibo de Parcela / Mensalidade
  if (type === 'recibo_pagamento' && data.title.includes('PARCELA')) {
    const paidVal = data.customAmount > 0
      ? data.customAmount
      : (motoContract?.monthlyValue || kitnetContract?.rentValue || 0);
    const paidValExtenso = formatCurrencyExtenso(paidVal);

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <div style="background: ${colors.cardBg}; border: 1.5px solid ${colors.cardBorder}; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; box-sizing: border-box; width: 100%;">
          <span style="font-size: 9.5px; font-weight: 800; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.8px;">
            VALOR PAGO E QUITADO
          </span>
          <div style="font-size: 24px; font-weight: 900; color: ${colors.highlightGreen}; margin: 4px 0; font-family: monospace; white-space: nowrap;">
            ${formatCurrency(paidVal)}
          </div>
          <div style="font-size: 10px; color: ${colors.textSecondary}; font-weight: 600;">
            (${paidValExtenso})
          </div>
        </div>

        <p style="font-size: 11.5px; line-height: 1.55; margin-bottom: 10px;">
          Recebemos de <strong>${activeTenantName}</strong>, portador(a) do CPF sob nº <strong>${formatCPF(activeTenantCpf)}</strong>, o valor de <strong>${formatCurrency(paidVal)} (${paidValExtenso})</strong> referente ao pagamento da parcela da locação do ativo: <strong>${assetName}</strong>.
        </p>
        <p style="font-size: 11.5px; line-height: 1.55; margin-bottom: 10px;">
          Por ser verdade e para que produza os regulares efeitos de direito, firmamos o presente recibo dando plena e geral quitação da respectiva parcela.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 7. Notificação Extrajudicial de Cobrança / Atraso
  if (type === 'notificacao_cobranca' || data.title.includes('COBRANÇA') || data.title.includes('NOTIFICAÇÃO')) {
    const origVal = data.customAmount > 0
      ? data.customAmount
      : (motoContract?.monthlyValue || kitnetContract?.rentValue || 0);
    const daysLate = data.customDaysLate || 0;
    const charges = calculateOverdueCharges({
      principal: origVal,
      dueDate: todayStr,
      referenceDate: todayStr,
      fixedFinePercent: 0.02,
      interestMonthlyRate: 0.01,
      gracePeriodDays: 0,
    });
    const fine = daysLate > 0 && origVal > 0 ? roundCurrency(origVal * 0.02) : charges.fineAmount;
    const dailyInterestRate = 0.01 / 30;
    const interest = daysLate > 0 && origVal > 0 ? roundCurrency(safeMul(origVal, dailyInterestRate * daysLate)) : charges.interestAmount;
    const total = safeAdd(safeAdd(origVal, fine), interest);

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 8px; padding: 14px; margin: 16px 0; box-sizing: border-box; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #fde68a; padding-bottom: 8px; margin-bottom: 8px; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 10.5px; font-weight: 800; color: #b45309; text-transform: uppercase;">
              DEMONSTRATIVO DE DÉBITO EM ABERTO (${daysLate} DIAS DE ATRASO)
            </span>
            <span style="font-size: 14px; font-weight: 900; color: #b45309; font-family: monospace; white-space: nowrap;">
              TOTAL: ${formatCurrency(total)}
            </span>
          </div>
          <div class="doc-balance-3col">
            <div style="min-width: 0;">
              <span style="color: #78350f; font-size: 9.5px;">Valor Principal:</span><br />
              <strong>${formatCurrency(origVal)}</strong>
            </div>
            <div style="min-width: 0;">
              <span style="color: #78350f; font-size: 9.5px;">Multa Contratual (2%):</span><br />
              <strong>${formatCurrency(fine)}</strong>
            </div>
            <div style="min-width: 0;">
              <span style="color: #78350f; font-size: 9.5px;">Juros Pro-Rata (1% a.m.):</span><br />
              <strong>${formatCurrency(interest)}</strong>
            </div>
          </div>
        </div>

        <p style="margin: 0 0 10px 0;">
          Fica o(a) LOCATÁRIO(A) formalmente NOTIFICADO(A) a realizar a regularização do débito acima discriminado no prazo improrrogável de <strong>48 (quarenta e oito) horas</strong> a contar do recebimento deste instrumento.
        </p>
        <p style="margin: 0 0 10px 0;">
          O pagamento deverá ser efetuado exclusivamente via Chave PIX: <strong>${locadorPix}</strong>, com envio imediato do comprovante de transferência para baixa da pendência.
        </p>
        <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 10px;">
          O não atendimento no prazo estipulado ensejará a imediata rescisão contratual, aplicação das penalidades cabíveis e adoção das medidas judiciais de reintegração de posse e cobrança.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 8. Termo de Distrato / Rescisão e Devolução de Caução
  if (type === 'termo_encerramento' || type === 'termo_rescisao' || data.title.includes('DISTRATO') || data.title.includes('RESCISÃO')) {
    const depositReceived = depositVal;
    const cleaningFee =
      data.customCleaningFee !== undefined
        ? data.customCleaningFee
        : kitnetContract?.cleaningFee !== undefined
        ? kitnetContract.cleaningFee
        : kitnet?.cleaningFeeBase !== undefined
        ? kitnet.cleaningFeeBase
        : (settings.cleaningFee ?? 0);
    const repairs = data.customRepairs || 0;
    const settlement = calculateDepositSettlement({
      initialDeposit: depositReceived,
      cleaningFee,
      damagesTotal: repairs,
    });
    const netRefund = data.customRefundAmount !== undefined && data.customRefundAmount > 0
      ? data.customRefundAmount
      : settlement.refundAmount;

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <div style="background: ${colors.cardBg}; border: 1.5px solid ${colors.cardBorder}; border-radius: 8px; padding: 14px; margin: 16px 0; box-sizing: border-box; width: 100%;">
          <div style="font-size: 10px; font-weight: 800; color: ${colors.textMuted}; text-transform: uppercase; margin-bottom: 8px;">
            BALANÇO FINANCEIRO DE ENCERRAMENTO & RESTITUIÇÃO DE CAUÇÃO
          </div>
          <div class="doc-balance-4col" style="border-bottom: 1px solid ${colors.cardBorder}; padding-bottom: 10px; margin-bottom: 10px;">
            <div style="min-width: 0;">
              <span style="color: ${colors.textMuted}; font-size: 9.5px;">Caução Depositada:</span><br />
              <strong>${formatCurrency(depositReceived)}</strong>
            </div>
            <div style="min-width: 0;">
              <span style="color: #ef4444; font-size: 9.5px;">(-) Taxa de Limpeza:</span><br />
              <strong style="color: #ef4444;">${formatCurrency(cleaningFee)}</strong>
            </div>
            <div style="min-width: 0;">
              <span style="color: #ef4444; font-size: 9.5px;">(-) Avarias/Reparos:</span><br />
              <strong style="color: #ef4444;">${formatCurrency(repairs)}</strong>
            </div>
            <div style="min-width: 0;">
              <span style="color: #059669; font-size: 9.5px;">(=) Saldo a Restituir:</span><br />
              <strong style="color: #059669; font-size: 12.5px;">${formatCurrency(netRefund)}</strong>
            </div>
          </div>
          <div style="font-size: 10px; color: ${colors.textSecondary};">
            Valor a restituir por extenso: <strong>${formatCurrencyExtenso(netRefund)}</strong>
          </div>
        </div>

        <p style="margin: 0 0 8px 0;">
          As partes declaram formalmente EXTINTO E RESCINDIDO o Contrato de Locação referente ao ativo <strong>${assetName}</strong>, com a respectiva entrega das chaves e devolução da posse ao LOCADOR em <strong>${todayFormatted}</strong>.
        </p>
        <p style="margin: 0 0 8px 0;">
          Com o pagamento e quitação do saldo apurado acima, as partes outorgam-se mútua, plena, rasa, geral e irrevogável quitação, para nada mais reclamar a qualquer título.
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 9. Termo de Quitação Integral e Transferência (DETRAN)
  if (type === 'declaracao_quitacao' || type === 'termo_quitacao' || data.title.includes('QUITAÇÃO')) {
    const totalVal = data.customAmount > 0 ? data.customAmount : (motoContract?.totalAgreedValue ?? 0);

    return `
      <div class="doc-root-container" style="${baseContainerStyle}">
        ${embeddedDocumentStyles}
        ${headerHtml}
        ${executiveSummaryGrid}
        ${bilateralPartiesBlock}

        <div style="background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; box-sizing: border-box; width: 100%;">
          <div style="font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px;">
            VALOR TOTAL CONTRATUAL INTEGRALMENTE QUITADO
          </div>
          <div style="font-size: 24px; font-weight: 900; color: #059669; font-family: monospace; margin: 4px 0; white-space: nowrap;">
            ${formatCurrency(totalVal)}
          </div>
          <div style="font-size: 10px; color: #047857; font-weight: 600;">
            (${formatCurrencyExtenso(totalVal)})
          </div>
        </div>

        <p style="margin: 0 0 10px 0;">
          O LOCADOR declara para todos os efeitos legais que o(a) LOCATÁRIO(A) <strong>${activeTenantName}</strong>, inscrito no CPF nº <strong>${formatCPF(activeTenantCpf)}</strong>, quitou 100% de todas as parcelas e obrigações acordadas relativas ao bem <strong>${assetName}</strong>.
        </p>
        <p style="margin: 0 0 10px 0;">
          ${isMotoAsset 
            ? 'Fica expressamente AUTORIZADA a imediata transferência definitiva de propriedade do veículo junto ao DETRAN/Órgãos de Trânsito competentes para o nome do comprador/beneficiário, correndo as taxas de transferência por conta deste.' 
            : 'Fica conferida ampla e geral quitação de todos os aluguéis e encargos locatícios da respectiva unidade.'}
        </p>

        ${cartorialSignaturesBlock}
      </div>
    `;
  }

  // 10. Recibo de Caução Locatícia (Garantia Padrão)
  return `
    <div class="doc-root-container" style="${baseContainerStyle}">
      ${embeddedDocumentStyles}
      ${headerHtml}
      ${executiveSummaryGrid}
      ${bilateralPartiesBlock}

      <div style="background: ${colors.cardBg}; border: 1.5px solid ${colors.cardBorder}; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; box-sizing: border-box; width: 100%;">
        <span style="font-size: 9.5px; font-weight: 800; color: ${colors.textMuted}; text-transform: uppercase; letter-spacing: 0.8px;">
          VALOR DEPOSITADO EM GARANTIA LOCATÍCIA
        </span>
        <div style="font-size: 24px; font-weight: 900; color: ${colors.highlightGreen}; margin: 4px 0; font-family: monospace; white-space: nowrap;">
          ${formatCurrency(depositVal)}
        </div>
        <div style="font-size: 10px; color: ${colors.textSecondary}; font-weight: 600;">
          (${depositExtenso})
        </div>
      </div>

      <p style="font-size: 11.5px; line-height: 1.55; margin-bottom: 10px;">
        Declaramos ter recebido de <strong>${activeTenantName}</strong>, inscrito(a) no CPF sob nº <strong>${formatCPF(activeTenantCpf)}</strong>, a importância de <strong>${formatCurrency(depositVal)} (${depositExtenso})</strong>, entregue a título de DEPÓSITO DE CAUÇÃO EM GARANTIA LOCATÍCIA referente à locação do seguinte bem: <strong>${assetName}</strong>.
      </p>

      <p style="font-size: 11.5px; line-height: 1.55; margin-bottom: 10px;">
        A quantia fica vinculada ao fiel cumprimento das cláusulas contratuais, destinando-se a cobrir eventuais avarias, reparos, taxa de limpeza ou inadimplementos apurados no encerramento, sendo o saldo restituído ao LOCATÁRIO após vistoria final nos termos da lei.
      </p>

      ${cartorialSignaturesBlock}
    </div>
  `;
}

