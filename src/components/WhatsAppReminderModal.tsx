import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Copy,
  Check,
  Send,
  Eye,
  FileText,
  ClipboardList,
  AlertTriangle,
  Motorbike,
  Home,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  generateMotoWhatsAppMessage,
  generateKitnetWhatsAppMessage,
  openWhatsAppLink,
} from '../utils/whatsappGenerator';
import { formatCurrency, formatDate, isInstallmentOverdue } from '../utils/formatters';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId?: string;
  installmentId?: string;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  contractId,
  installmentId,
}) => {
  const {
    motoContracts,
    kitnetContracts,
    motoTenants,
    kitnetTenants,
    motos,
    kitnets,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'completa' | 'simples'>('completa');
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>('');
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useBodyScrollLock(isOpen);

  // Initialize selected contract & installment
  useEffect(() => {
    if (!isOpen) return;

    let targetContractId = contractId;
    if (!targetContractId) {
      // Find first contract with overdue or pending installment
      const motoWithOverdue = motoContracts.find((c) =>
        c.installments.some((i) => isInstallmentOverdue(i))
      );
      const kitnetWithOverdue = kitnetContracts.find((c) =>
        c.installments.some((i) => isInstallmentOverdue(i))
      );

      targetContractId =
        motoWithOverdue?.id ||
        kitnetWithOverdue?.id ||
        motoContracts[0]?.id ||
        kitnetContracts[0]?.id ||
        '';
    }

    setSelectedContractId(targetContractId);

    // Pick active installment
    const mContract = motoContracts.find((c) => c.id === targetContractId);
    const kContract = kitnetContracts.find((c) => c.id === targetContractId);
    const currentContract = mContract || kContract;

    if (currentContract) {
      if (installmentId) {
        setSelectedInstallmentId(installmentId);
      } else {
        const activeInst =
          currentContract.installments.find((i) => isInstallmentOverdue(i)) ||
          currentContract.installments.find((i) => i.status === 'pendente') ||
          currentContract.installments[0];
        setSelectedInstallmentId(activeInst?.id || '');
      }
    }
  }, [isOpen, contractId, installmentId, motoContracts, kitnetContracts]);

  // Determine current active objects
  const isMoto = motoContracts.some((c) => c.id === selectedContractId);
  const motoContract = isMoto ? motoContracts.find((c) => c.id === selectedContractId) : undefined;
  const kitnetContract = !isMoto ? kitnetContracts.find((c) => c.id === selectedContractId) : undefined;

  const currentContract = motoContract || kitnetContract;

  const tenant = useMemo(() => {
    if (motoContract) {
      return motoTenants.find((t) => t.id === motoContract.tenantId);
    }
    if (kitnetContract) {
      return kitnetTenants.find((t) => t.id === kitnetContract.tenantId);
    }
    return undefined;
  }, [motoContract, kitnetContract, motoTenants, kitnetTenants]);

  const assetDescription = useMemo(() => {
    if (motoContract) {
      const m = motos.find((item) => item.id === motoContract.motoId);
      return m ? `${m.brand} ${m.model} (${m.plate})` : 'Motocicleta';
    }
    if (kitnetContract) {
      const k = kitnets.find((item) => item.id === kitnetContract.kitnetId);
      return k ? `${k.name} (Nº ${k.number})` : 'Kitnet Residencial';
    }
    return '';
  }, [motoContract, kitnetContract, motos, kitnets]);

  const activeInstallment = useMemo(() => {
    if (!currentContract) return undefined;
    if (selectedInstallmentId) {
      const found = currentContract.installments.find((i) => i.id === selectedInstallmentId);
      if (found) return found;
    }
    return (
      currentContract.installments.find((i) => isInstallmentOverdue(i)) ||
      currentContract.installments.find((i) => i.status === 'pendente') ||
      currentContract.installments[0]
    );
  }, [currentContract, selectedInstallmentId]);

  // Generate / Regenerate Message on tab or selection change
  useEffect(() => {
    if (!currentContract || !tenant || !activeInstallment) {
      setEditableMessage('');
      return;
    }

    if (motoContract) {
      const msg = generateMotoWhatsAppMessage(
        motoContract,
        tenant as any,
        activeInstallment,
        settings,
        assetDescription,
        activeTab
      );
      setEditableMessage(msg);
    } else if (kitnetContract) {
      const msg = generateKitnetWhatsAppMessage(
        kitnetContract,
        tenant as any,
        activeInstallment,
        settings,
        assetDescription,
        activeTab
      );
      setEditableMessage(msg);
    }
  }, [
    activeTab,
    selectedContractId,
    selectedInstallmentId,
    motoContract,
    kitnetContract,
    tenant,
    activeInstallment,
    settings,
    assetDescription,
  ]);

  if (!isOpen) return null;

  const tenantName = tenant?.fullName || 'Cliente';
  const tenantPhone = tenant?.whatsapp || tenant?.phone || '';
  const hasValidPhone = Boolean(tenantPhone && tenantPhone.replace(/\D/g, '').length >= 10);

  const handleCopy = async () => {
    if (!editableMessage) return;
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!hasValidPhone) return;
    openWhatsAppLink(tenantPhone, editableMessage);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#141418] border border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-modal-enter">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#101012] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/25 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F5F5F7] flex items-center gap-2">
                <span>Visualizar Mensagem</span>
              </h2>
              <p className="text-xs text-[#9A9AA2] font-medium">
                Cliente: <strong className="text-[#F5F5F7]">{tenantName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-4 flex-1 modal-scroll-container"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {/* Controls: Contract Selector & Installment Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9A9AA2] uppercase tracking-wider mb-1">
                Contrato / Ativo:
              </label>
              <select
                value={selectedContractId}
                onChange={(e) => {
                  setSelectedContractId(e.target.value);
                  setSelectedInstallmentId('');
                }}
                className="w-full bg-[#101012] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#8B5CF6] transition-all"
              >
                <optgroup label="Motos">
                  {motoContracts.map((c) => {
                    const t = motoTenants.find((item) => item.id === c.tenantId);
                    const m = motos.find((item) => item.id === c.motoId);
                    return (
                      <option key={c.id} value={c.id}>
                        {t?.fullName || 'Locatário'} — {m?.brand} {m?.model} ({m?.plate})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Kitnets">
                  {kitnetContracts.map((c) => {
                    const t = kitnetTenants.find((item) => item.id === c.tenantId);
                    const k = kitnets.find((item) => item.id === c.kitnetId);
                    return (
                      <option key={c.id} value={c.id}>
                        {t?.fullName || 'Locatário'} — {k?.name} (Nº {k?.number})
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            {currentContract && (
              <div>
                <label className="block text-[11px] font-semibold text-[#9A9AA2] uppercase tracking-wider mb-1">
                  Parcela de Referência:
                </label>
                <select
                  value={activeInstallment?.id || ''}
                  onChange={(e) => setSelectedInstallmentId(e.target.value)}
                  className="w-full bg-[#101012] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#8B5CF6] transition-all"
                >
                  {currentContract.installments.map((inst) => {
                    const statusLabel =
                      inst.status === 'pago'
                        ? 'Quitado'
                        : isInstallmentOverdue(inst)
                        ? 'Atrasado'
                        : 'Pendente';
                    return (
                      <option key={inst.id} value={inst.id}>
                        {isMoto ? `Parcela ${inst.number}` : `Mês ${inst.number}`} ({formatCurrency(inst.amount)}) — {statusLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Quick Context Summary Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#101012] border border-white/[0.08] text-xs">
            <div className="flex items-center gap-2">
              {isMoto ? (
                <div className="p-1 rounded-lg bg-[#E07A3F]/10 text-[#E07A3F]">
                  <Motorbike className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="p-1 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9]">
                  <Home className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-[#9A9AA2] font-medium truncate max-w-[220px] sm:max-w-xs">
                {assetDescription}
              </span>
            </div>

            {activeInstallment && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#9A9AA2]">Vencimento:</span>
                <span className="font-bold text-[#F5F5F7]">{formatDate(activeInstallment.dueDate)}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    activeInstallment.status === 'pago'
                      ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      : isInstallmentOverdue(activeInstallment)
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30'
                  }`}
                >
                  {activeInstallment.status === 'pago'
                    ? 'Pago'
                    : isInstallmentOverdue(activeInstallment)
                    ? 'Atrasado'
                    : 'Pendente'}
                </span>
              </div>
            )}
          </div>

          {/* Tabs Switcher: Completa vs Simples */}
          <div className="flex items-center gap-1.5 p-1 bg-[#101012] rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab('completa')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'completa'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Completa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('simples')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'simples'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Simples</span>
            </button>
          </div>

          {/* Preview Card with Highlighted Border & Editable Textarea */}
          <div className="space-y-1.5">
            <div className="rounded-xl border border-white/[0.08] focus-within:border-[#8B5CF6] bg-[#101012] p-3.5 transition-colors">
              <textarea
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                rows={10}
                className="w-full bg-transparent text-xs font-mono text-[#F5F5F7] leading-relaxed resize-none focus:outline-none selection:bg-[#8B5CF6] selection:text-white"
                placeholder="Aguardando carregamento da mensagem..."
              />
            </div>
            <p className="text-[11px] text-[#9A9AA2]/60 flex items-center gap-1.5 px-1">
              <span>Você pode editar a mensagem antes de enviar</span>
            </p>
          </div>

          {/* Warning if no phone registered */}
          {!hasValidPhone && (
            <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-start gap-2.5 text-xs text-[#8B5CF6]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cadastre o telefone do cliente para enviar pelo WhatsApp</p>
                <p className="text-[11px] text-[#9A9AA2] mt-0.5">
                  O cliente <strong>{tenantName}</strong> não possui número de celular cadastrado ou o formato está incompleto.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: 3 Buttons */}
        <div className="p-4 border-t border-white/[0.08] bg-[#101012] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {/* Copiar Texto */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#25242C] border border-white/[0.08] text-[#F5F5F7] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Copiar texto formatado para a área de transferência"
            >
              {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#8B5CF6]" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            {/* Abrir no WhatsApp */}
            <button
              id="btn-whatsapp-open"
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={!hasValidPhone}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                hasValidPhone
                  ? 'bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer shadow-md'
                  : 'bg-[#10B981]/20 text-[#9A9AA2]/40 cursor-not-allowed opacity-50'
              }`}
              title={
                hasValidPhone
                  ? `Abrir conversa com ${tenantPhone}`
                  : 'Telefone do cliente não cadastrado'
              }
            >
              <Send className="w-4 h-4" />
              <span>Abrir no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

