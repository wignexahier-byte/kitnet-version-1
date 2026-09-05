import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  CheckCheck,
  MessageCircle,
} from 'lucide-react';
import { BillingItem } from '../types';
import { SystemSettings, MotoContract, KitnetContract, MotoTenant, KitnetTenant } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  openWhatsAppLink,
  generateMotoWhatsAppMessage,
  generateKitnetWhatsAppMessage,
  getDaysRemainingText,
} from '../../../utils/whatsappGenerator';

interface BatchWhatsAppModalProps {
  batchQueueItems: BillingItem[];
  motoContracts: MotoContract[];
  kitnetContracts: KitnetContract[];
  motoTenants: MotoTenant[];
  kitnetTenants: KitnetTenant[];
  settings: SystemSettings;
  onClose: () => void;
  onPaySingle: (item: BillingItem) => void;
  showToast: (msg: string) => void;
}

export const BatchWhatsAppModal: React.FC<BatchWhatsAppModalProps> = ({
  batchQueueItems,
  motoContracts,
  kitnetContracts,
  motoTenants,
  kitnetTenants,
  settings,
  onClose,
  onPaySingle,
  showToast,
}) => {
  const [batchMode, setBatchMode] = useState<'completa' | 'simples' | 'urgente'>('completa');
  const [sentItemIds, setSentItemIds] = useState<string[]>([]);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  if (typeof document === 'undefined') return null;

  // Helper to generate personalized message for any billing item
  const getItemWhatsAppMessage = (item: BillingItem, mode: 'completa' | 'simples' | 'urgente'): string => {
    const pixKey = settings.adminPixKey || 'wleal0131@gmail.com';
    const pixType = settings.adminPixType ? ` (${settings.adminPixType.toUpperCase()})` : '';
    const adminName = settings.adminName || 'Wigne Leal Xavier Macedo';
    const daysRemaining = getDaysRemainingText(item.dueDate);

    if (mode === 'urgente') {
      return `⚠️ *NOTIFICAÇÃO DE COBRANÇA URGENTE*

Olá, *${item.clientName}*!
Consta em nosso sistema uma pendência no contrato referente a *${item.assetName}* (${item.assetDetails}).

📄 *Parcela:* ${item.installmentNumber}/${item.totalInstallments}
💰 *Valor:* ${formatCurrency(item.amount)}
📅 *Vencimento:* ${formatDate(item.dueDate)} (${daysRemaining})

Favor realizar o pagamento para regularizar sua situação cadastral:
• Chave PIX${pixType}: *${pixKey}*
• Titular: *${adminName}*

Caso o pagamento já tenha sido efetuado, por favor nos envie o comprovante por aqui. Obrigado!`;
    }

    if (item.assetType === 'moto') {
      const contract = item.rawContract as MotoContract;
      const tenant = motoTenants.find((t) => t.id === item.tenantId);
      if (contract && tenant) {
        return generateMotoWhatsAppMessage(
          contract,
          tenant,
          item.rawInstallment,
          settings,
          `${item.assetName} (${item.assetDetails})`,
          mode === 'simples' ? 'simples' : 'completa'
        );
      }
    } else {
      const contract = item.rawContract as KitnetContract;
      const tenant = kitnetTenants.find((t) => t.id === item.tenantId);
      if (contract && tenant) {
        return generateKitnetWhatsAppMessage(
          contract,
          tenant,
          item.rawInstallment,
          settings,
          item.assetName,
          mode === 'simples' ? 'simples' : 'completa'
        );
      }
    }

    // Fallback message
    return `🔔 *LEMBRETE DE PAGAMENTO*

Olá, *${item.clientName}*!
Lembramos do vencimento da sua parcela de *${item.assetName}*.

📄 *Parcela:* ${item.installmentNumber}/${item.totalInstallments}
💰 *Valor:* ${formatCurrency(item.amount)}
📅 *Vencimento:* ${formatDate(item.dueDate)} (${daysRemaining})

💳 *Dados para Pagamento via PIX:*
• Chave PIX${pixType}: *${pixKey}*
• Titular: *${adminName}*

Obrigado pela preferência!`;
  };

  // Dispatch message to WhatsApp and record sent status
  const handleSendItemMessage = (item: BillingItem) => {
    const message = getItemWhatsAppMessage(item, batchMode);
    openWhatsAppLink(item.clientPhone, message);
    if (!sentItemIds.includes(item.id)) {
      setSentItemIds((prev) => [...prev, item.id]);
    }
  };

  // Copy single message to clipboard
  const handleCopyItemMessage = (item: BillingItem) => {
    const message = getItemWhatsAppMessage(item, batchMode);
    navigator.clipboard.writeText(message);
    setCopiedItemId(item.id);
    setTimeout(() => {
      setCopiedItemId(null);
    }, 2000);
    showToast(`Mensagem de ${item.clientName} copiada para a área de transferência!`);
  };

  // Send next pending in queue
  const handleSendNextInQueue = () => {
    const nextPending = batchQueueItems.find((item) => !sentItemIds.includes(item.id));
    if (nextPending) {
      handleSendItemMessage(nextPending);
    } else {
      showToast('Todas as mensagens da fila já foram encaminhadas!');
    }
  };

  // Copy all messages
  const handleCopyAllMessages = () => {
    const allText = batchQueueItems
      .map((item, index) => {
        const msg = getItemWhatsAppMessage(item, batchMode);
        return `========================================\n[${index + 1}/${batchQueueItems.length}] CLIENTE: ${item.clientName} (${item.clientPhone})\n========================================\n${msg}\n\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(allText);
    showToast(`Todas as ${batchQueueItems.length} mensagens foram copiadas!`);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl w-full max-w-2xl min-w-0 overflow-hidden flex flex-col my-auto shadow-2xl animate-modal-enter max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#121214] shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/25 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#F2F1ED] truncate">
                Encaminhar Mensagens no WhatsApp
              </h3>
              <p className="text-[11px] sm:text-xs text-[#9C9CA3] truncate">
                Fila de envio individual e disparo em lote para clientes selecionados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9C9CA3] hover:text-[#F2F1ED] p-1.5 rounded-lg hover:bg-[#2A2A2E] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain modal-scroll-container flex-1 w-full max-w-full"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overflowX: 'hidden' }}
        >
          {/* Queue Status Progress Banner */}
          <div className="bg-[#121214] p-4 rounded-xl border border-[#2A2A2E] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[#9C9CA3] font-semibold block">Progresso do Envio:</span>
                <span className="text-sm font-bold text-[#F2F1ED]">
                  {sentItemIds.filter((id) => batchQueueItems.some((i) => i.id === id)).length} de{' '}
                  {batchQueueItems.length} mensagens encaminhadas
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#9C9CA3] block">Total na Fila:</span>
                <span className="text-sm font-bold text-[#8B5CF6] tabular-nums">
                  {formatCurrency(batchQueueItems.reduce((acc, i) => acc + i.amount, 0))}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#1C1C1F] rounded-full h-2 overflow-hidden border border-[#2A2A2E]">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] rounded-full transition-all duration-300"
                style={{
                  width: `${
                    batchQueueItems.length > 0
                      ? Math.round(
                          (sentItemIds.filter((id) => batchQueueItems.some((i) => i.id === id)).length /
                            batchQueueItems.length) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            {/* Batch Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleSendNextInQueue}
                className="px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#121214] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                Encaminhar Próximo da Fila
              </button>

              <button
                onClick={handleCopyAllMessages}
                className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-[#F2F1ED] border border-[#2A2A2E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#9C9CA3]" />
                Copiar Todas
              </button>
            </div>
          </div>

          {/* Message Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-2 uppercase tracking-wider">
              Modelo da Mensagem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBatchMode('completa')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  batchMode === 'completa'
                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#F2F1ED]'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#9C9CA3] hover:border-[#3F3F46]'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-[#F2F1ED]">
                  {batchMode === 'completa' && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                  Completa
                </div>
                <p className="text-[11px] text-[#9C9CA3] mt-0.5">Extrato, PIX e barra de progresso</p>
              </button>

              <button
                type="button"
                onClick={() => setBatchMode('simples')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  batchMode === 'simples'
                    ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#F2F1ED]'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#9C9CA3] hover:border-[#3F3F46]'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-[#F2F1ED]">
                  {batchMode === 'simples' && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                  Simples
                </div>
                <p className="text-[11px] text-[#9C9CA3] mt-0.5">Lembrete rápido de vencimento</p>
              </button>

              <button
                type="button"
                onClick={() => setBatchMode('urgente')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  batchMode === 'urgente'
                    ? 'bg-[#EF4444]/10 border-[#EF4444] text-[#F2F1ED]'
                    : 'bg-[#121214] border-[#2A2A2E] text-[#9C9CA3] hover:border-[#3F3F46]'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-[#EF4444]">
                  {batchMode === 'urgente' && <Check className="w-3.5 h-3.5 text-[#EF4444]" />}
                  Cobrança Urgente
                </div>
                <p className="text-[11px] text-[#9C9CA3] mt-0.5">Para contratos em atraso</p>
              </button>
            </div>
          </div>

          {/* List of Clients in Queue */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-[#9C9CA3] uppercase tracking-wider flex items-center justify-between">
              <span>Clientes na Fila ({batchQueueItems.length}):</span>
              <span className="text-[11px] text-[#5F5F66] lowercase">Clique em "Enviar" para abrir o WhatsApp</span>
            </span>

            {batchQueueItems.map((item, index) => {
              const isSent = sentItemIds.includes(item.id);
              const isExpanded = expandedPreviewId === item.id;
              const itemMessage = getItemWhatsAppMessage(item, batchMode);

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSent
                      ? 'bg-[#121214]/60 border-[#10B981]/30'
                      : 'bg-[#121214] border-[#2A2A2E] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#1C1C1F] text-[#9C9CA3] text-[10px] font-bold flex items-center justify-center shrink-0 border border-[#2A2A2E] mt-0.5">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#F2F1ED] truncate">{item.clientName}</span>
                          {isSent ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Enviado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#2A2A2E] text-[#9C9CA3]">
                              Pendente
                            </span>
                          )}
                          {item.status === 'atrasado' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444]">
                              {item.daysOverdue}d atraso
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#9C9CA3] mt-0.5 flex-wrap">
                          <span>{item.assetName}</span>
                          <span>•</span>
                          <span>Tel: {item.clientPhone || 'Não cadastrado'}</span>
                          <span>•</span>
                          <span className="font-bold text-[#8B5CF6] tabular-nums">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons per client */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {/* Toggle Preview */}
                      <button
                        type="button"
                        onClick={() => setExpandedPreviewId(isExpanded ? null : item.id)}
                        className="p-2 text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#1C1C1F] rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title="Visualizar texto da mensagem"
                      >
                        <span className="text-[11px] hidden sm:inline">Ver texto</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => handleCopyItemMessage(item)}
                        className="p-2 text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#1C1C1F] rounded-lg transition-colors cursor-pointer"
                        title="Copiar mensagem"
                      >
                        {copiedItemId === item.id ? (
                          <Check className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Quick Pay */}
                      <button
                        type="button"
                        onClick={() => onPaySingle(item)}
                        className="p-2 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors cursor-pointer"
                        title="Dar baixa nesta parcela"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>

                      {/* Send WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleSendItemMessage(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm ${
                          isSent
                            ? 'bg-[#2A2A2E] text-[#10B981] hover:bg-[#3F3F46]'
                            : 'bg-[#22c55e] hover:bg-[#16a34a] text-white'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {isSent ? 'Reenviar' : 'Enviar'}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Preview */}
                  {isExpanded && (
                    <div className="mt-3 p-3 bg-[#1C1C1F] rounded-lg border border-[#2A2A2E] text-xs text-[#9C9CA3] font-mono whitespace-pre-wrap leading-relaxed animate-fadeIn">
                      {itemMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A2A2E] flex items-center justify-between gap-3 bg-[#121214] shrink-0">
          <span className="text-xs text-[#9C9CA3]">
            {sentItemIds.filter((id) => batchQueueItems.some((i) => i.id === id)).length} de{' '}
            {batchQueueItems.length} enviados
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#9C9CA3] hover:text-[#F2F1ED] rounded-xl hover:bg-[#1C1C1F] transition-colors cursor-pointer"
            >
              Concluir / Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
