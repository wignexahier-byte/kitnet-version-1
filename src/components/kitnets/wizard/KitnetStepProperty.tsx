import React from 'react';
import { Camera, CheckCircle2, Key, Wrench, Sparkles, X, Check } from 'lucide-react';
import { KitnetStatus } from '../../../types';
import { ImageUploadInput } from '../../ImageUploadInput';

interface KitnetStepPropertyProps {
  kitnetData: {
    number: string;
    name: string;
    address: string;
    description: string;
    status: KitnetStatus;
    statusNote?: string;
    photos: Record<string, string>;
  };
  setKitnetData: React.Dispatch<React.SetStateAction<any>>;
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

export const KitnetStepProperty: React.FC<KitnetStepPropertyProps> = ({
  kitnetData,
  setKitnetData,
}) => {
  const currentStatus: KitnetStatus = kitnetData.status || 'disponivel';

  const themeColor: 'sky' | 'emerald' | 'amber' =
    currentStatus === 'alugada' ? 'emerald' : currentStatus === 'reforma' ? 'amber' : 'sky';

  const statusColorClass =
    currentStatus === 'alugada'
      ? 'text-emerald-400'
      : currentStatus === 'reforma'
      ? 'text-amber-400'
      : 'text-sky-400';

  const focusRingClass =
    currentStatus === 'alugada'
      ? 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25'
      : currentStatus === 'reforma'
      ? 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25'
      : 'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25';

  const handleStatusChange = (newStatus: KitnetStatus) => {
    let defaultNote = '';
    if (newStatus === 'disponivel') defaultNote = 'Pronta para locação imediata';
    else if (newStatus === 'reforma') defaultNote = 'Previsão de entrega: 25/06/2024';
    else if (newStatus === 'alugada') defaultNote = 'Contrato ativo de locação';

    setKitnetData((prev: any) => ({
      ...prev,
      status: newStatus,
      statusNote: prev.statusNote || defaultNote,
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
              currentStatus === 'alugada'
                ? 'bg-emerald-500 text-slate-950'
                : currentStatus === 'reforma'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-sky-500 text-slate-950'
            }`}
          >
            1
          </span>
          <span>Dados Principais e Fotos da Kitnet</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Fotos reais dos ambientes
        </span>
      </div>

      {/* STATUS OPERACIONAL DA KITNET - CENTRALIZADO, COMPACTO E COM TEMA DINÂMICO */}
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
            Status Operacional do Imóvel *
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
            {currentStatus === 'reforma' && '• Em reforma / manutenção'}
          </span>
        </div>

        {/* 3 Colunas Lado a Lado (Sempre 3 cols compactas) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* 1. DISPONÍVEL (Azul) */}
          <button
            type="button"
            onClick={() => handleStatusChange('disponivel')}
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
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
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
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
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
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
                value={kitnetData.statusNote ?? ''}
                placeholder={
                  currentStatus === 'disponivel'
                    ? 'Ex: Pronta para locação imediata'
                    : 'Ex: Em reforma / pintura'
                }
                onChange={(e) => setKitnetData({ ...kitnetData, statusNote: e.target.value })}
                className={`w-full bg-[#0E111A] border rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all font-sans ${
                  currentStatus === 'disponivel'
                    ? 'border-sky-500/30 focus:border-sky-400 focus:ring-sky-500/25'
                    : 'border-amber-500/30 focus:border-amber-400 focus:ring-amber-500/25'
                }`}
              />
              {kitnetData.statusNote && (
                <button
                  type="button"
                  onClick={() => setKitnetData({ ...kitnetData, statusNote: '' })}
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
                const isSelected = kitnetData.statusNote === suggestion;
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setKitnetData({ ...kitnetData, statusNote: suggestion })}
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

      {/* Informações Básicas */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Número da Kitnet *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: 01, 102, A-4"
            value={kitnetData.number}
            onChange={(e) => setKitnetData({ ...kitnetData, number: e.target.value })}
            className={`w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all`}
          />
        </div>

        <div className="sm:col-span-8">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nome / Identificação da Unidade *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Kitnet 01 — Térreo Frente"
            value={kitnetData.name}
            onChange={(e) => setKitnetData({ ...kitnetData, name: e.target.value })}
            className={`w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all`}
          />
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Endereço Completo
          </label>
          <input
            type="text"
            placeholder="Rua, número, bairro, cidade..."
            value={kitnetData.address}
            onChange={(e) => setKitnetData({ ...kitnetData, address: e.target.value })}
            className={`w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all`}
          />
        </div>

        <div className="sm:col-span-12">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Descrição do Imóvel (Opcional)
          </label>
          <textarea
            rows={2}
            value={kitnetData.description}
            onChange={(e) => setKitnetData({ ...kitnetData, description: e.target.value })}
            placeholder="Descreva detalhes, mobília, acabamento, regras..."
            className={`w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all`}
          />
        </div>
      </div>

      {/* UPLOAD DE FOTOS REAIS */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-white flex items-center gap-2">
            <Camera className={`w-4 h-4 ${statusColorClass}`} />
            <span>Fotos Reais da Kitnet</span>
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            Tire fotos direto com a câmera do celular ou selecione da sua galeria de arquivos
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <ImageUploadInput
            label="Sala / Quarto"
            value={kitnetData.photos.livingRoom}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(val) =>
              setKitnetData({
                ...kitnetData,
                photos: { ...kitnetData.photos, livingRoom: val },
              })
            }
          />
          <ImageUploadInput
            label="Banheiro"
            value={kitnetData.photos.bathroom}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(val) =>
              setKitnetData({
                ...kitnetData,
                photos: { ...kitnetData.photos, bathroom: val },
              })
            }
          />
          <ImageUploadInput
            label="Cozinha / Pia"
            value={kitnetData.photos.kitchen}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(val) =>
              setKitnetData({
                ...kitnetData,
                photos: { ...kitnetData.photos, kitchen: val },
              })
            }
          />
          <ImageUploadInput
            label="Fachada / Entrada"
            value={kitnetData.photos.outdoor}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(val) =>
              setKitnetData({
                ...kitnetData,
                photos: { ...kitnetData.photos, outdoor: val },
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
