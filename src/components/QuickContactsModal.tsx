import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Phone,
  MessageCircle,
  Users,
  Search,
  Motorbike,
  Home,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { filterOverdueInstallments, getTodayLocalDateString, sumInstallmentAmounts } from '../domain';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface QuickContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickContactsModal: React.FC<QuickContactsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    motoTenants,
    motoContracts,
    motos,
    kitnetTenants,
    kitnetContracts,
    kitnets,
  } = useApp();

  useBodyScrollLock(isOpen);

  const [filterType, setFilterType] = useState<'todos' | 'motos' | 'kitnets' | 'atrasados'>('todos');
  const [search, setSearch] = useState('');

  const contactsList = useMemo(() => {
    const list: Array<{
      id: string;
      fullName: string;
      phone: string;
      type: 'moto' | 'kitnet';
      assetName: string;
      status: 'em_dia' | 'atrasado' | 'sem_contrato';
      overdueAmount: number;
      contractId?: string;
    }> = [];

    // Process moto tenants
    motoTenants.forEach((t) => {
      const activeContract = motoContracts.find(
        (c) => c.tenantId === t.id && c.status === 'ativo'
      );
      const moto = activeContract ? motos.find((m) => m.id === activeContract.motoId) : null;

      let status: 'em_dia' | 'atrasado' | 'sem_contrato' = activeContract ? 'em_dia' : 'sem_contrato';
      let overdueAmount = 0;

      if (activeContract) {
        const today = getTodayLocalDateString();
        const overdue = filterOverdueInstallments(activeContract.installments, today);
        if (overdue.length > 0) {
          status = 'atrasado';
          overdueAmount = sumInstallmentAmounts(overdue);
        }
      }

      list.push({
        id: `moto-t-${t.id}`,
        fullName: t.fullName,
        phone: t.phone,
        type: 'moto',
        assetName: moto ? `${moto.brand} ${moto.model} (${moto.plate || 's/ placa'})` : 'Nenhuma moto ativa',
        status,
        overdueAmount,
        contractId: activeContract?.id,
      });
    });

    // Process kitnet tenants
    kitnetTenants.forEach((t) => {
      const activeContract = kitnetContracts.find(
        (c) => c.tenantId === t.id && c.status === 'ativo'
      );
      const kitnet = activeContract ? kitnets.find((k) => k.id === activeContract.kitnetId) : null;

      let status: 'em_dia' | 'atrasado' | 'sem_contrato' = activeContract ? 'em_dia' : 'sem_contrato';
      let overdueAmount = 0;

      if (activeContract) {
        const today = getTodayLocalDateString();
        const overdue = filterOverdueInstallments(activeContract.installments, today);
        if (overdue.length > 0) {
          status = 'atrasado';
          overdueAmount = sumInstallmentAmounts(overdue);
        }
      }

      list.push({
        id: `kitnet-t-${t.id}`,
        fullName: t.fullName,
        phone: t.phone,
        type: 'kitnet',
        assetName: kitnet ? `${kitnet.name} (Unid ${kitnet.number})` : 'Nenhuma kitnet ativa',
        status,
        overdueAmount,
        contractId: activeContract?.id,
      });
    });

    return list;
  }, [motoTenants, motoContracts, motos, kitnetTenants, kitnetContracts, kitnets]);

  const filteredContacts = useMemo(() => {
    return contactsList.filter((c) => {
      // Type filter
      if (filterType === 'motos' && c.type !== 'moto') return false;
      if (filterType === 'kitnets' && c.type !== 'kitnet') return false;
      if (filterType === 'atrasados' && c.status !== 'atrasado') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.assetName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contactsList, filterType, search]);

  const handleWhatsApp = (phone: string, name: string, overdueAmount: number) => {
    const rawNumber = phone.replace(/\D/g, '');
    const formattedPhone = rawNumber.length <= 11 ? `55${rawNumber}` : rawNumber;
    
    let text = `Olá, ${name}! Tudo bem? Entrando em contato sobre a locação.`;
    if (overdueAmount > 0) {
      text = `Olá, ${name}! Tudo bem? Consta em aberto uma pendência de ${formatCurrency(overdueAmount)}. Segue o código PIX para acerto. Qualquer dúvida estamos à disposição!`;
    }

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col my-auto min-w-0 animate-modal-enter">
        {/* Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-[#2A2A2E] bg-[#121214] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[#F2F1ED] flex items-center gap-2 truncate">
                Central Rápida de Contatos
              </h3>
              <p className="text-[11px] sm:text-xs text-[#9C9CA3] truncate">
                Lista de locatários com discagem e WhatsApp direto
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#2A2A2E] transition-colors cursor-pointer border border-transparent hover:border-[#2A2A2E] shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-3 sm:p-4 border-b border-[#2A2A2E] bg-[#121214] space-y-3 shrink-0 overflow-x-hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9C9CA3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contato por nome, telefone ou moto/kitnet..."
              className="w-full pl-9 pr-4 py-2 bg-[#1C1C1F] rounded-xl border border-[#2A2A2E] text-xs font-medium text-[#F2F1ED] placeholder-[#9C9CA3] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                id: 'todos',
                label: 'Todos',
                count: contactsList.length,
                icon: <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />,
                activeClass: 'bg-violet-500/20 text-violet-200 border-violet-500/50 shadow-xs font-bold',
                activeBadgeClass: 'bg-violet-500/30 text-violet-100 border border-violet-500/30',
              },
              {
                id: 'motos',
                label: 'Motos',
                count: contactsList.filter((c) => c.type === 'moto').length,
                icon: <Motorbike className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
                activeClass: 'bg-orange-500/20 text-orange-200 border-orange-500/50 shadow-xs font-bold',
                activeBadgeClass: 'bg-orange-500/30 text-orange-100 border border-orange-500/30',
              },
              {
                id: 'kitnets',
                label: 'Kitnets',
                count: contactsList.filter((c) => c.type === 'kitnet').length,
                icon: <Home className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
                activeClass: 'bg-sky-500/20 text-sky-200 border-sky-500/50 shadow-xs font-bold',
                activeBadgeClass: 'bg-sky-500/30 text-sky-100 border border-sky-500/30',
              },
              {
                id: 'atrasados',
                label: 'Atrasados',
                count: contactsList.filter((c) => c.status === 'atrasado').length,
                icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
                activeClass: 'bg-rose-500/20 text-rose-200 border border-rose-500/50 shadow-xs font-bold',
                activeBadgeClass: 'bg-rose-500/30 text-rose-100 border border-rose-500/30',
              },
            ].map((tab) => {
              const isSelected = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id as any)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border select-none active:scale-95 ${
                    isSelected
                      ? tab.activeClass
                      : 'bg-[#151518] hover:bg-[#1E1E24] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                  }`}
                >
                  {tab.icon}
                  <span className="shrink-0">{tab.label}</span>
                  <span
                    className={`text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold inline-flex items-center justify-center shrink-0 leading-none tabular-nums ${
                      isSelected
                        ? tab.activeBadgeClass
                        : 'bg-white/[0.08] text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contacts List */}
        <div 
          className="p-3 sm:p-4 overflow-y-auto overflow-x-hidden modal-scroll-container overscroll-contain space-y-2 flex-1 w-full max-w-full"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overflowX: 'hidden' }}
        >
          {filteredContacts.length === 0 ? (
            <div className="text-center py-10 text-[#9C9CA3] text-xs sm:text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#8B5CF6]" />
              <p>Nenhum contato encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 rounded-xl border border-[#2A2A2E] bg-[#121214] hover:border-[#8B5CF6]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      contact.type === 'moto'
                        ? 'bg-[#E07A3F]/10 text-[#E07A3F] border border-[#E07A3F]/20'
                        : 'bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20'
                    }`}
                  >
                    {contact.type === 'moto' ? <Motorbike className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-[#F2F1ED]">
                        {contact.fullName}
                      </span>
                      {contact.status === 'atrasado' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-semibold border border-[#EF4444]/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Atrasado ({formatCurrency(contact.overdueAmount)})
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] font-semibold border border-[#10B981]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Em dia
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#9C9CA3] mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#F2F1ED]">{contact.phone}</span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">{contact.assetName}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons - Standardized h-9 and centered */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, '')}`}
                    className="h-9 px-3 rounded-xl bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-slate-200 hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 select-none"
                    title="Ligar"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ligar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(contact.phone, contact.fullName, contact.overdueAmount)}
                    className="h-9 px-3.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] hover:text-white transition-all duration-150 inline-flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer active:scale-95 select-none"
                    title="Conversar no WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#121214] border-t border-[#2A2A2E] text-center text-xs text-[#9C9CA3] shrink-0">
          Mostrando {filteredContacts.length} de {contactsList.length} clientes cadastrados
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
