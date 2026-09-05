import React, { useState, useMemo } from 'react';
import { Check, CheckCheck, CheckSquare, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { TabType } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { BillingItem } from './cobrancas/types';
import { useBillingItems } from './cobrancas/useBillingItems';
import { BillingHeaderKPIs } from './cobrancas/BillingHeaderKPIs';
import { BillingFilters } from './cobrancas/BillingFilters';
import { BillingCardItem } from './cobrancas/BillingCardItem';
import { BillingFloatingActionBar } from './cobrancas/BillingFloatingActionBar';
import { SinglePaymentModal } from './cobrancas/modals/SinglePaymentModal';
import { BatchPaymentModal } from './cobrancas/modals/BatchPaymentModal';
import { BatchWhatsAppModal } from './cobrancas/modals/BatchWhatsAppModal';

interface CentralDeCobrancasViewProps {
  onOpenWhatsApp: (contractId: string, installmentId?: string) => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
  onNavigateTab?: (tab: TabType) => void;
}

export const CentralDeCobrancasView: React.FC<CentralDeCobrancasViewProps> = ({
  onOpenWhatsApp,
  onOpenClientProfile,
  onNavigateTab,
}) => {
  const {
    motos,
    kitnets,
    motoContracts,
    kitnetContracts,
    motoTenants,
    kitnetTenants,
    payMotoInstallment,
    payKitnetInstallment,
    settings,
  } = useApp();

  const [filterType, setFilterType] = useState<'todos' | 'moto' | 'kitnet'>('todos');
  const [activeCategory, setActiveCategory] = useState<
    'todos' | 'atrasado' | 'vencendo_hoje' | 'proximos_7_dias' | 'em_dia'
  >('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection states
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);

  // Modals state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [itemToConfirmPay, setItemToConfirmPay] = useState<BillingItem | null>(null);
  const [itemsToBatchPay, setItemsToBatchPay] = useState<BillingItem[] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useBodyScrollLock(batchModalOpen || !!itemToConfirmPay || !!itemsToBatchPay);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const {
    allBillingItems,
    filteredItems,
    atrasados,
    vencendoHoje,
    proximos7Dias,
    emDia,
    totalAtrasadoAmount,
    totalHojeAmount,
    total7DiasAmount,
  } = useBillingItems({
    motos,
    kitnets,
    motoContracts,
    kitnetContracts,
    motoTenants,
    kitnetTenants,
    filterType,
    activeCategory,
    searchQuery,
  });

  // Selected items
  const selectedItems = useMemo(() => {
    return allBillingItems.filter((item) => selectedForBatch.includes(item.id));
  }, [allBillingItems, selectedForBatch]);

  const selectedItemsTotalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.amount, 0);
  }, [selectedItems]);

  // Batch queue items for WhatsApp
  const batchQueueItems = useMemo(() => {
    if (selectedForBatch.length > 0) return selectedItems;
    if (filteredItems.length > 0) return filteredItems;
    return [...atrasados, ...vencendoHoje];
  }, [selectedForBatch, selectedItems, filteredItems, atrasados, vencendoHoje]);

  // Billable items in current filtered list (atrasados, vencendo hoje, proximos 7 dias)
  const billableFilteredItems = useMemo(() => {
    return filteredItems.filter((i) => i.status !== 'em_dia');
  }, [filteredItems]);

  const handleToggleSelect = (itemId: string) => {
    const item = allBillingItems.find((i) => i.id === itemId);
    if (item && item.status === 'em_dia') return; // Cannot select items that are in day

    setSelectedForBatch((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAllFiltered = () => {
    const billableIds = billableFilteredItems.map((i) => i.id);
    if (billableIds.length === 0) return;

    const areAllSelected =
      billableIds.length > 0 && billableIds.every((id) => selectedForBatch.includes(id));

    if (areAllSelected) {
      setSelectedForBatch((prev) => prev.filter((id) => !billableIds.includes(id)));
    } else {
      setSelectedForBatch((prev) => Array.from(new Set([...prev, ...billableIds])));
    }
  };

  const isAllFilteredSelected =
    billableFilteredItems.length > 0 &&
    billableFilteredItems.every((item) => selectedForBatch.includes(item.id));

  // Payment Handlers
  const handleExecuteSinglePayment = (
    item: BillingItem,
    method: 'pix' | 'dinheiro' | 'transferencia' | 'cartao',
    notes: string
  ) => {
    const note = notes.trim()
      ? `Baixa via Central (${method.toUpperCase()}): ${notes.trim()}`
      : `Baixa rápida realizada via Central de Cobranças (${method.toUpperCase()})`;

    if (item.assetType === 'moto') {
      payMotoInstallment(item.contractId, item.installmentId, note);
    } else {
      payKitnetInstallment(item.contractId, item.installmentId, note);
    }

    setSelectedForBatch((prev) => prev.filter((id) => id !== item.id));
    setItemToConfirmPay(null);
    showToast(
      `Pagamento da parcela de ${item.clientName} (${formatCurrency(item.amount)}) confirmado com sucesso!`
    );
  };

  const handleExecuteBatchPayment = (items: BillingItem[]) => {
    items.forEach((item) => {
      const note = `Baixa em lote via Central de Cobranças (PIX)`;
      if (item.assetType === 'moto') {
        payMotoInstallment(item.contractId, item.installmentId, note);
      } else {
        payKitnetInstallment(item.contractId, item.installmentId, note);
      }
    });

    const count = items.length;
    const totalVal = items.reduce((acc, i) => acc + i.amount, 0);
    setSelectedForBatch([]);
    setItemsToBatchPay(null);
    showToast(`Baixa em lote concluída: ${count} parcelas quitadas (${formatCurrency(totalVal)})!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[120] bg-[#1C1C1F] border border-[#10B981]/50 text-[#F2F1ED] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="p-1 rounded-full bg-[#10B981]/20 text-[#10B981]">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & KPI Metrics */}
      <BillingHeaderKPIs
        onNavigateTab={onNavigateTab}
        selectedForBatchCount={selectedForBatch.length}
        onOpenBatchModal={() => setBatchModalOpen(true)}
        onSelectAllOverdueAndOpenModal={() => {
          const defaultBatch = [...atrasados, ...vencendoHoje].map((i) => i.id);
          if (defaultBatch.length > 0) {
            setSelectedForBatch(defaultBatch);
          }
          setBatchModalOpen(true);
        }}
        atrasados={atrasados}
        vencendoHoje={vencendoHoje}
        proximos7Dias={proximos7Dias}
        emDia={emDia}
        totalAtrasadoAmount={totalAtrasadoAmount}
        totalHojeAmount={totalHojeAmount}
        total7DiasAmount={total7DiasAmount}
        activeCategory={activeCategory}
        onToggleCategory={(cat) => setActiveCategory(activeCategory === cat ? 'todos' : cat)}
      />

      {/* Filter and Search Bar */}
      <BillingFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        motosCount={allBillingItems.filter((i) => i.assetType === 'moto').length}
        kitnetsCount={allBillingItems.filter((i) => i.assetType === 'kitnet').length}
        atrasadosCount={atrasados.length}
        vencendoHojeCount={vencendoHoje.length}
        proximos7DiasCount={proximos7Dias.length}
        emDiaCount={emDia.length}
        totalCount={allBillingItems.length}
      />

      {/* Billing Items List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#9C9CA3] uppercase tracking-wider">
              Mostrando {filteredItems.length} parcelas
            </span>
            {selectedForBatch.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[11px] font-bold border border-[#8B5CF6]/30">
                {selectedForBatch.length} selecionadas ({formatCurrency(selectedItemsTotalAmount)})
              </span>
            )}
          </div>

          {billableFilteredItems.length > 0 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] font-bold transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-[#8B5CF6]/10"
              >
                {isAllFilteredSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    Desmarcar cobráveis ({billableFilteredItems.length})
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    Selecionar cobráveis ({billableFilteredItems.length})
                  </>
                )}
              </button>

              {selectedForBatch.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedForBatch([])}
                  className="text-xs text-[#9C9CA3] hover:text-[#F2F1ED] transition-colors cursor-pointer"
                >
                  Limpar seleção
                </button>
              )}
            </div>
          ) : selectedForBatch.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelectedForBatch([])}
              className="text-xs text-[#9C9CA3] hover:text-[#F2F1ED] transition-colors cursor-pointer"
            >
              Limpar seleção
            </button>
          ) : (
            <span className="text-xs text-[#9A9AA2]/60 italic">
              Nenhuma pendência para cobrança
            </span>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-[#141418] border border-white/[0.06] rounded-xl p-12 text-center">
            <CheckCheck className="w-12 h-12 text-[#10B981] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#F5F5F7]">Nenhuma parcela pendente encontrada</h3>
            <p className="text-xs text-[#9A9AA2] max-w-md mx-auto mt-1">
              Todos os contratos correspondentes aos filtros selecionados estão quitados ou em dia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => (
              <BillingCardItem
                key={item.id}
                item={item}
                isSelected={selectedForBatch.includes(item.id)}
                onToggleSelect={handleToggleSelect}
                onOpenWhatsApp={onOpenWhatsApp}
                onOpenSinglePay={(it) => setItemToConfirmPay(it)}
                onOpenClientProfile={onOpenClientProfile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <BillingFloatingActionBar
        selectedItems={selectedItems}
        onOpenBatchModal={() => setBatchModalOpen(true)}
        onOpenBatchPayModal={() => setItemsToBatchPay(selectedItems)}
        onClearSelection={() => setSelectedForBatch([])}
      />

      {/* Modal 1: Single Payment Modal */}
      {itemToConfirmPay && (
        <SinglePaymentModal
          item={itemToConfirmPay}
          onClose={() => setItemToConfirmPay(null)}
          onConfirm={handleExecuteSinglePayment}
        />
      )}

      {/* Modal 2: Batch Payment Modal */}
      {itemsToBatchPay && (
        <BatchPaymentModal
          items={itemsToBatchPay}
          onClose={() => setItemsToBatchPay(null)}
          onConfirm={handleExecuteBatchPayment}
        />
      )}

      {/* Modal 3: Batch WhatsApp Modal */}
      {batchModalOpen && (
        <BatchWhatsAppModal
          batchQueueItems={batchQueueItems}
          motoContracts={motoContracts}
          kitnetContracts={kitnetContracts}
          motoTenants={motoTenants}
          kitnetTenants={kitnetTenants}
          settings={settings}
          onClose={() => setBatchModalOpen(false)}
          onPaySingle={(item) => setItemToConfirmPay(item)}
          showToast={showToast}
        />
      )}
    </div>
  );
};
