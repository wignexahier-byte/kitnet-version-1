import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit, X, User, DollarSign, Camera, CheckCircle2, Key, Wrench, Sparkles, Check } from 'lucide-react';
import { Kitnet, KitnetContract, KitnetTenant, KitnetStatus } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { ImageUploadInput } from '../../ImageUploadInput';
import { CurrencyInput } from '../../NumericInput';

interface EditKitnetModalProps {
  kitnetToEdit: Kitnet | null;
  kitnetContracts: KitnetContract[];
  kitnetTenants: KitnetTenant[];
  onClose: () => void;
  onSave: (kitnetId: string, updatedData: any) => void;
}

const KITNET_STATUS_PRESETS = {
  disponivel: [
    'Pronta para locação imediata',
    'Mobiliada e pronta para morar',
    'Chaves disponíveis para visitação',
    'Excelente ventilação e iluminação',
    'Recém-pintada e higienizada',
  ],
  reforma: [
    'Previsão de entrega: 25/06/2024',
    'Pintura geral e reparos hidráulicos',
    'Instalação de mobília planejada',
    'Reforma elétrica e acabamentos',
    'Previsão de conclusão: 15 dias',
  ],
  alugada: [
    'Contrato ativo de locação',
    'Locação residencial em dia',
    'Inquilino residente',
  ],
};

export const EditKitnetModal: React.FC<EditKitnetModalProps> = ({
  kitnetToEdit,
  kitnetContracts,
  kitnetTenants,
  onClose,
  onSave,
}) => {
  const [editForm, setEditForm] = useState({
    name: kitnetToEdit?.name || '',
    number: kitnetToEdit?.number || '',
    address: kitnetToEdit?.address || '',
    description: kitnetToEdit?.description || '',
    monthlyRentBase: kitnetToEdit?.monthlyRentBase || 0,
    monthlyWaterBase: kitnetToEdit?.monthlyWaterBase || 0,
    monthlyInternetBase: kitnetToEdit?.monthlyInternetBase || 0,
    otherFeesBase: kitnetToEdit?.otherFeesBase || 0,
    depositBase: kitnetToEdit?.depositBase !== undefined ? kitnetToEdit.depositBase : (kitnetToEdit?.monthlyRentBase || 0),
    cleaningFeeBase: kitnetToEdit?.cleaningFeeBase !== undefined ? kitnetToEdit.cleaningFeeBase : 400,
    status: (kitnetToEdit?.status || 'disponivel') as KitnetStatus,
    statusNote: kitnetToEdit?.statusNote || '',
    notes: kitnetToEdit?.notes || '',
    livingRoomPhoto: kitnetToEdit?.photos?.livingRoom || '',
    bedroomPhoto: kitnetToEdit?.photos?.bedroom || '',
    bathroomPhoto: kitnetToEdit?.photos?.bathroom || '',
    kitchenPhoto: kitnetToEdit?.photos?.kitchen || '',
    outdoorPhoto: kitnetToEdit?.photos?.outdoor || '',
    installationsPhoto: kitnetToEdit?.photos?.installations || '',
  });

  React.useEffect(() => {
    if (kitnetToEdit) {
      setEditForm({
        name: kitnetToEdit.name || '',
        number: kitnetToEdit.number || '',
        address: kitnetToEdit.address || '',
        description: kitnetToEdit.description || '',
        monthlyRentBase: kitnetToEdit.monthlyRentBase || 0,
        monthlyWaterBase: kitnetToEdit.monthlyWaterBase || 0,
        monthlyInternetBase: kitnetToEdit.monthlyInternetBase || 0,
        otherFeesBase: kitnetToEdit.otherFeesBase || 0,
        depositBase: kitnetToEdit.depositBase !== undefined ? kitnetToEdit.depositBase : (kitnetToEdit.monthlyRentBase || 0),
        cleaningFeeBase: kitnetToEdit.cleaningFeeBase !== undefined ? kitnetToEdit.cleaningFeeBase : 400,
        status: (kitnetToEdit.status || 'disponivel') as KitnetStatus,
        statusNote: kitnetToEdit.statusNote || '',
        notes: kitnetToEdit.notes || '',
        livingRoomPhoto: kitnetToEdit.photos?.livingRoom || '',
        bedroomPhoto: kitnetToEdit.photos?.bedroom || '',
        bathroomPhoto: kitnetToEdit.photos?.bathroom || '',
        kitchenPhoto: kitnetToEdit.photos?.kitchen || '',
        outdoorPhoto: kitnetToEdit.photos?.outdoor || '',
        installationsPhoto: kitnetToEdit.photos?.installations || '',
      });
    }
  }, [kitnetToEdit]);

  if (!kitnetToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(kitnetToEdit.id, {
      name: editForm.name,
      number: editForm.number,
      address: editForm.address,
      description: editForm.description,
      monthlyRentBase: Number(editForm.monthlyRentBase),
      monthlyWaterBase: Number(editForm.monthlyWaterBase),
      monthlyInternetBase: Number(editForm.monthlyInternetBase),
      otherFeesBase: Number(editForm.otherFeesBase),
      depositBase: Number(editForm.depositBase),
      cleaningFeeBase: Number(editForm.cleaningFeeBase !== undefined ? editForm.cleaningFeeBase : 400),
      status: editForm.status,
      statusNote: editForm.statusNote?.trim() || undefined,
      notes: editForm.notes,
      photos: {
        ...kitnetToEdit.photos,
        livingRoom: editForm.livingRoomPhoto,
        bedroom: editForm.bedroomPhoto,
        bathroom: editForm.bathroomPhoto,
        kitchen: editForm.kitchenPhoto,
        outdoor: editForm.outdoorPhoto,
        installations: editForm.installationsPhoto,
      },
    });
  };

  const currentStatus: KitnetStatus = editForm.status || 'disponivel';

  const handleStatusChange = (newStatus: KitnetStatus) => {
    let defaultNote = '';
    if (newStatus === 'disponivel') defaultNote = 'Pronta para locação imediata';
    else if (newStatus === 'reforma') defaultNote = 'Previsão de entrega: 25/06/2024';
    else if (newStatus === 'alugada') defaultNote = 'Contrato ativo de locação';

    setEditForm((prev) => ({
      ...prev,
      status: newStatus,
      statusNote: prev.statusNote || defaultNote,
    }));
  };

  const activeContract = kitnetContracts.find((c) => c.kitnetId === kitnetToEdit.id && c.status === 'ativo');
  const tenant = kitnetTenants.find((t) => t.id === activeContract?.tenantId);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-white/[0.12] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] my-auto animate-modal-enter">
        {/* Header Fixo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0E111A] shrink-0">
          <h3 className="text-base font-bold text-white flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border transition-colors ${
                currentStatus === 'alugada'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : currentStatus === 'reforma'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              }`}
            >
              <Edit className="w-4 h-4" />
            </div>
            <span>Editar Kitnet: {kitnetToEdit.name}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-10 space-y-4 text-xs modal-scroll-container">
            {activeContract && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white block">{tenant?.fullName || 'Inquilino Vinculado'}</strong>
                    <span className="text-[11px] text-slate-400">
                      Contrato ativo • Vencimento todo dia {activeContract?.dueDay} • Aluguel atual: {formatCurrency(activeContract?.rentValue || 0)}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0">
                  Ocupada
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-8">
                <label className="block text-slate-300 font-semibold mb-1.5">Nome / Identificação *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-sm"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-slate-300 font-semibold mb-1.5">Número da Unidade *</label>
                <input
                  type="text"
                  required
                  value={editForm.number}
                  onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                  className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-sm font-mono"
                />
              </div>
            </div>

            {/* STATUS OPERACIONAL DA UNIDADE - CENTRALIZADO, COMPACTO E COM TEMA DINÂMICO */}
            <div
              className={`border rounded-2xl p-3 sm:p-3.5 space-y-2.5 transition-all duration-300 ${
                currentStatus === 'disponivel'
                  ? 'bg-[#031d2e]/60 border-sky-500/40 shadow-sm shadow-sky-500/10'
                  : currentStatus === 'alugada'
                  ? 'bg-[#04261b]/60 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-[#281604]/60 border-amber-500/40 shadow-sm shadow-amber-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200">
                  Status Operacional da Unidade *
                </label>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    currentStatus === 'disponivel'
                      ? 'text-sky-400'
                      : currentStatus === 'alugada'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {currentStatus === 'disponivel' && '• Pronta para locação'}
                  {currentStatus === 'alugada' && '• Com inquilino ativo'}
                  {currentStatus === 'reforma' && '• Em reforma / reparos'}
                </span>
              </div>

              {/* 3 Colunas Lado a Lado (Sempre 3 cols compactas) */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* 1. DISPONÍVEL (Azul) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange('disponivel')}
                  className={`py-2 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    currentStatus === 'disponivel'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-500/30 shadow-md shadow-sky-500/15 font-bold'
                      : 'bg-[#0E111A]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.20]'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'disponivel' ? 'text-sky-300' : 'text-slate-500'}`} />
                  <span className="text-xs truncate">Disponível</span>
                </button>

                {/* 2. ALUGADA (Verde) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange('alugada')}
                  className={`py-2 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    currentStatus === 'alugada'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/15 font-bold'
                      : 'bg-[#0E111A]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.20]'
                  }`}
                >
                  <Key className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'alugada' ? 'text-emerald-300' : 'text-slate-500'}`} />
                  <span className="text-xs truncate">Alugada</span>
                </button>

                {/* 3. REFORMA / MANUTENÇÃO (Âmbar) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange('reforma')}
                  className={`py-2 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    currentStatus === 'reforma'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-md shadow-amber-500/15 font-bold'
                      : 'bg-[#0E111A]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.20]'
                  }`}
                >
                  <Wrench className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'reforma' ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="text-xs truncate">Reforma</span>
                </button>
              </div>

              {/* CAMPO DA LEGENDA EMBAIXO DA FOTO (EXIBIDO APENAS SE NÃO FOR ALUGADA) */}
              {currentStatus !== 'alugada' && (
                <div className="pt-2 border-t border-white/[0.08] space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Sparkles className={`w-3 h-3 ${currentStatus === 'disponivel' ? 'text-sky-400' : 'text-amber-400'}`} />
                      Legenda do card (embaixo da foto):
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.statusNote ?? ''}
                      placeholder={
                        currentStatus === 'disponivel'
                          ? 'Ex: Pronta para locação imediata'
                          : 'Ex: Em reforma / reparos'
                      }
                      onChange={(e) => setEditForm({ ...editForm, statusNote: e.target.value })}
                      className={`w-full bg-[#0E111A] border rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all font-sans ${
                        currentStatus === 'disponivel'
                          ? 'border-sky-500/30 focus:border-sky-400 focus:ring-sky-500/25'
                          : 'border-amber-500/30 focus:border-amber-400 focus:ring-amber-500/25'
                      }`}
                    />
                    {editForm.statusNote && (
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, statusNote: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Limpar texto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sugestões Rápidas em Chips Compactos */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">Sugestões:</span>
                    {KITNET_STATUS_PRESETS[currentStatus].map((suggestion) => {
                      const isSelected = editForm.statusNote === suggestion;
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, statusNote: suggestion })}
                          className={`text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? currentStatus === 'disponivel'
                                ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold shadow-sm'
                                : 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-sm'
                              : 'bg-[#0E111A] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.16]'
                          }`}
                        >
                          {suggestion}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Endereço Completo</label>
              <input
                type="text"
                required
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Descrição / Características dos Ambientes</label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Ex: Suíte mobiliada com ar-condicionado, armários planejados e cooktop"
                className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-sm"
              />
            </div>

            {/* Estrutura Financeira Base */}
            <div className="p-4 bg-[#0E111A] border border-white/[0.08] rounded-2xl space-y-3">
              <span className="text-sky-400 font-bold text-xs flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Configuração Financeira da Unidade</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[11px]">Aluguel Base (R$) *</label>
                  <CurrencyInput
                    value={editForm.monthlyRentBase}
                    onChange={(val) => setEditForm({ ...editForm, monthlyRentBase: val })}
                    className="w-full bg-[#090B10] border border-white/[0.12] rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[11px]">Taxa de Água (R$)</label>
                  <CurrencyInput
                    value={editForm.monthlyWaterBase}
                    onChange={(val) => setEditForm({ ...editForm, monthlyWaterBase: val })}
                    className="w-full bg-[#090B10] border border-white/[0.12] rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[11px]">Internet Wi-Fi (R$)</label>
                  <CurrencyInput
                    value={editForm.monthlyInternetBase}
                    onChange={(val) => setEditForm({ ...editForm, monthlyInternetBase: val })}
                    className="w-full bg-[#090B10] border border-white/[0.12] rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[11px]">Outras Taxas / Cond. (R$)</label>
                  <CurrencyInput
                    value={editForm.otherFeesBase}
                    onChange={(val) => setEditForm({ ...editForm, otherFeesBase: val })}
                    className="w-full bg-[#090B10] border border-white/[0.12] rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[11px]">Caução Padrão (R$)</label>
                  <CurrencyInput
                    value={editForm.depositBase}
                    onChange={(val) => setEditForm({ ...editForm, depositBase: val })}
                    className="w-full bg-[#090B10] border border-white/[0.12] rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-[11px]">Taxa Limpeza Rescisão (R$)</label>
                  <CurrencyInput
                    value={editForm.cleaningFeeBase !== undefined ? editForm.cleaningFeeBase : 400}
                    onChange={(val) => setEditForm({ ...editForm, cleaningFeeBase: val })}
                    className="w-full bg-[#090B10] border border-white/[0.12] rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Observações Internas / Regras de Convivência</label>
              <textarea
                rows={2}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Regras de silêncio, política de pets, voltagem 220v..."
                className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121520] rounded-xl px-3.5 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all text-xs"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
              <label className="block text-white font-bold text-xs flex items-center justify-between">
                <span className={`flex items-center gap-1.5 ${
                  editForm.status === 'alugada'
                    ? 'text-emerald-400'
                    : editForm.status === 'reforma'
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}>
                  <Camera className="w-4 h-4" />
                  <span>Galeria de Fotos dos Ambientes</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Upload ou Câmera</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <ImageUploadInput
                  label="Sala / Estar"
                  value={editForm.livingRoomPhoto}
                  aspectRatio="photo"
                  themeColor={editForm.status === 'alugada' ? 'emerald' : editForm.status === 'reforma' ? 'amber' : 'sky'}
                  onChange={(val) => setEditForm({ ...editForm, livingRoomPhoto: val })}
                />
                <ImageUploadInput
                  label="Dormitório"
                  value={editForm.bedroomPhoto}
                  aspectRatio="photo"
                  themeColor={editForm.status === 'alugada' ? 'emerald' : editForm.status === 'reforma' ? 'amber' : 'sky'}
                  onChange={(val) => setEditForm({ ...editForm, bedroomPhoto: val })}
                />
                <ImageUploadInput
                  label="Banheiro"
                  value={editForm.bathroomPhoto}
                  aspectRatio="photo"
                  themeColor={editForm.status === 'alugada' ? 'emerald' : editForm.status === 'reforma' ? 'amber' : 'sky'}
                  onChange={(val) => setEditForm({ ...editForm, bathroomPhoto: val })}
                />
                <ImageUploadInput
                  label="Cozinha"
                  value={editForm.kitchenPhoto}
                  aspectRatio="photo"
                  themeColor={editForm.status === 'alugada' ? 'emerald' : editForm.status === 'reforma' ? 'amber' : 'sky'}
                  onChange={(val) => setEditForm({ ...editForm, kitchenPhoto: val })}
                />
                <ImageUploadInput
                  label="Área Ext. / Varanda"
                  value={editForm.outdoorPhoto}
                  aspectRatio="photo"
                  themeColor={editForm.status === 'alugada' ? 'emerald' : editForm.status === 'reforma' ? 'amber' : 'sky'}
                  onChange={(val) => setEditForm({ ...editForm, outdoorPhoto: val })}
                />
                <ImageUploadInput
                  label="Instalações / Luz"
                  value={editForm.installationsPhoto}
                  aspectRatio="photo"
                  themeColor={editForm.status === 'alugada' ? 'emerald' : editForm.status === 'reforma' ? 'amber' : 'sky'}
                  onChange={(val) => setEditForm({ ...editForm, installationsPhoto: val })}
                />
              </div>
            </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="flex justify-end gap-2.5 px-5 py-4 border-t border-white/[0.08] bg-[#0E111A] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white font-semibold rounded-xl border border-white/[0.10] active:scale-95 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
