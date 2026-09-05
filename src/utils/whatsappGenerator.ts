import { MotoContract, KitnetContract, MotoTenant, KitnetTenant, Installment, SystemSettings } from '../types';
import { formatCurrency, formatDate, isInstallmentOverdue } from './formatters';

export function getDaysRemainingText(dueDateStr: string): string {
  if (!dueDateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = dueDateStr.split('-').map(Number);
  const due = new Date(y, (m || 1) - 1, d || 1);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'hoje';
  } else if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `atrasado há ${absDays} ${absDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return `em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  }
}

export function getNumberEmoji(n: number): string {
  const numberEmojis: { [key: number]: string } = {
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣',
    10: '🔟',
  };
  return numberEmojis[n] || `[${n}]`;
}

export function renderBlockProgressBar(percent: number, totalBlocks: number = 10): string {
  const filled = Math.min(totalBlocks, Math.max(0, Math.round((percent / 100) * totalBlocks)));
  const empty = totalBlocks - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

function getPaymentOptionsText(settings: SystemSettings): string {
  const pixKey = settings.adminPixKey || 'wleal0131@gmail.com';
  const pixType = settings.adminPixType ? ` (${settings.adminPixType.toUpperCase()})` : '';
  const adminName = settings.adminName || 'Wigne Leal Xavier Macedo';

  let text = `• Chave PIX${pixType}: *${pixKey}*\n• Titular: *${adminName}*`;
  if (settings.adminBankName) {
    text += `\n• Banco: *${settings.adminBankName}*`;
    if (settings.adminAgency && settings.adminAccount) {
      text += ` (Ag: ${settings.adminAgency} / Conta: ${settings.adminAccount})`;
    }
  }
  return text;
}

export function generateMotoWhatsAppMessage(
  contract: MotoContract,
  tenant: MotoTenant,
  currentInstallment: Installment,
  settings: SystemSettings,
  motoDescription: string,
  mode: 'completa' | 'simples' = 'completa'
): string {
  const totalCount = contract.durationMonths || contract.installments.length;
  const paidCount = contract.installments.filter((i) => i.status === 'pago').length;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round((paidCount / totalCount) * 100)) : 0;
  const daysRemaining = getDaysRemainingText(currentInstallment.dueDate);
  const formattedAmount = formatCurrency(currentInstallment.amount).replace('R$', '').trim();

  if (mode === 'simples') {
    return `🔔 *Lembrete:* Parcela ${currentInstallment.number}/${totalCount} da moto ${motoDescription} vence em ${formatDate(currentInstallment.dueDate)} (${daysRemaining}).
💰 Valor: R$ ${formattedAmount}`;
  }

  // Completa
  const progressBar = renderBlockProgressBar(progressPercent, 10);

  // Status das parcelas
  const installmentsList = contract.installments
    .map((inst) => {
      const emoji = getNumberEmoji(inst.number);
      const val = formatCurrency(inst.amount);
      if (inst.status === 'pago') {
        const paidStr = inst.paidDate ? ` (Pago em ${formatDate(inst.paidDate)})` : ' (Pago)';
        return `${emoji} ✅ Parcela ${inst.number}: ${val}${paidStr}`;
      } else if (isInstallmentOverdue(inst)) {
        return `${emoji} ⚠️ Parcela ${inst.number}: ${val} (Atrasada - Venc: ${formatDate(inst.dueDate)})`;
      } else {
        const isCurrent = inst.id === currentInstallment.id;
        return `${emoji} 🕐 Parcela ${inst.number}: ${val} (Venc: ${formatDate(inst.dueDate)})${isCurrent ? ' 👈' : ''}`;
      }
    })
    .join('\n');

  const paymentOptions = getPaymentOptionsText(settings);

  return `🔔 *LEMBRETE DE PAGAMENTO*

💰 *Valor:* R$ ${formattedAmount}
📄 *Parcela ${currentInstallment.number}/${totalCount}*
📅 *Vencimento:* ${formatDate(currentInstallment.dueDate)} (${daysRemaining})

📊 *Progresso:* ${progressBar} ${progressPercent}%

📋 *STATUS DAS PARCELAS:*
${installmentsList}

💡 *Opções de Pagamento:*
${paymentOptions}`;
}

export function generateKitnetWhatsAppMessage(
  contract: KitnetContract,
  tenant: KitnetTenant,
  currentInstallment: Installment,
  settings: SystemSettings,
  unitName: string,
  mode: 'completa' | 'simples' = 'completa'
): string {
  const daysRemaining = getDaysRemainingText(currentInstallment.dueDate);
  const totalAmount = currentInstallment.amount;
  const formattedTotal = formatCurrency(totalAmount).replace('R$', '').trim();
  const formattedRent = formatCurrency(contract.rentValue).replace('R$', '').trim();
  const formattedWater = formatCurrency(contract.waterValue).replace('R$', '').trim();

  if (mode === 'simples') {
    return `🔔 *Lembrete:* Aluguel da kitnet ${unitName} vence em ${formatDate(currentInstallment.dueDate)} (${daysRemaining}).
💰 Valor: R$ ${formattedTotal}`;
  }

  // Completa
  const paymentOptions = getPaymentOptionsText(settings);

  // Histórico dos últimos 3 meses ou parcelas até o momento
  const sortedInst = [...contract.installments].sort((a, b) => a.number - b.number);
  const currentIdx = sortedInst.findIndex((i) => i.id === currentInstallment.id);
  const startIdx = Math.max(0, currentIdx >= 0 ? currentIdx - 2 : 0);
  const relevantInstallments = sortedInst.slice(startIdx, (currentIdx >= 0 ? currentIdx + 1 : sortedInst.length));

  const historyList = relevantInstallments
    .map((inst) => {
      const emoji = getNumberEmoji(inst.number);
      const val = formatCurrency(inst.amount);
      if (inst.status === 'pago') {
        const paidStr = inst.paidDate ? ` (Pago em ${formatDate(inst.paidDate)})` : ' (Pago)';
        return `${emoji} ✅ Mês ${inst.number}: ${val}${paidStr}`;
      } else if (isInstallmentOverdue(inst)) {
        return `${emoji} ⚠️ Mês ${inst.number}: ${val} (Atrasado - Venc: ${formatDate(inst.dueDate)})`;
      } else {
        const isCurrent = inst.id === currentInstallment.id;
        return `${emoji} 🕐 Mês ${inst.number}: ${val} (Venc: ${formatDate(inst.dueDate)})${isCurrent ? ' 👈' : ''}`;
      }
    })
    .join('\n');

  let waterLine = '';
  if (contract.waterValue > 0) {
    waterLine = `\n💧 *Taxa de água:* R$ ${formattedWater}`;
  }

  return `🔔 *LEMBRETE DE ALUGUEL*

🏠 *Kitnet:* ${unitName}
💰 *Valor do aluguel:* R$ ${formattedRent}${waterLine}
📅 *Vencimento:* ${formatDate(currentInstallment.dueDate)} (${daysRemaining})

📋 *ÚLTIMOS PAGAMENTOS:*
${historyList}

💡 *Opções de Pagamento:*
${paymentOptions}`;
}

export function generateWhatsAppMessage(
  contract: MotoContract,
  tenant: MotoTenant,
  currentInstallment: Installment,
  settings: SystemSettings,
  motoDescription: string
): string {
  return generateMotoWhatsAppMessage(contract, tenant, currentInstallment, settings, motoDescription, 'completa');
}

export function openWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${internationalPhone}&text=${encoded}`;
  
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

