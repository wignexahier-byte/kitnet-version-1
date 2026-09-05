import React, { useState } from 'react';
import {
  Motorbike,
  CheckCircle2,
  Info,
  FileText,
  Calendar,
  Gauge,
  DollarSign,
  Palette,
  HelpCircle,
  X,
  Shield,
  Tag,
  Camera,
  Layers,
  ChevronDown,
  Sparkles,
  Wrench,
  Key,
  RotateCcw,
  Check,
} from 'lucide-react';
import { MotoStatus } from '../../../../types';
import { NumericInput, CurrencyInput } from '../../../NumericInput';
import { ImageUploadInput } from '../../../ImageUploadInput';
import { validateLicensePlate, maskPlateInput } from '../../../../utils/formatters';

interface NewMotoStepVehicleProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const POPULAR_BRANDS = [
  'Honda',
  'Yamaha',
  'Haojue',
  'Shineray',
  'Suzuki',
  'BMW',
  'Kawasaki',
  'Dafra',
  'Royal Enfield',
  'Triumph',
  'Bajaj',
  'Outra',
];

const PRESET_COLORS = [
  { name: 'Preta', hex: '#18181B', border: '#3F3F46' },
  { name: 'Vermelha', hex: '#DC2626', border: '#EF4444' },
  { name: 'Azul', hex: '#2563EB', border: '#3B82F6' },
  { name: 'Branca', hex: '#F8FAFC', border: '#CBD5E1' },
  { name: 'Prata', hex: '#94A3B8', border: '#CBD5E1' },
  { name: 'Cinza', hex: '#475569', border: '#64748B' },
  { name: 'Amarela', hex: '#EAB308', border: '#FDE047' },
];

const MOTO_STATUS_PRESETS = {
  disponivel: [
    'Revisada e pronta para locação',
    'No pátio para retirada imediata',
    'Revisão geral de 10.000km OK',
    'Higienizada e com tanque cheio',
    'Pronta para novo contrato',
  ],
  manutencao: [
    'Em oficina para revisão preventiva',
    'Troca de óleo, pastilhas e relação',
    'Aguardando peças da concessionária',
    'Revisão periódica agendada',
    'Previsão de entrega: 3 dias',
  ],
  alugada: [
    'Contrato ativo de locação',
    'Locação com opção de compra',
    'Em operação com condutor',
  ],
};

export const NewMotoStepVehicle: React.FC<NewMotoStepVehicleProps> = ({ form, setForm }) => {
  const [showRenavamHelp, setShowRenavamHelp] = useState(false);

  const [selectedBrandOption, setSelectedBrandOption] = useState<string>(() => {
    if (!form.brand) return '';
    if (POPULAR_BRANDS.includes(form.brand)) return form.brand;
    return 'Outra';
  });

  const plateValidation = form.plate ? validateLicensePlate(form.plate) : null;

  const handleBrandSelect = (brandVal: string) => {
    setSelectedBrandOption(brandVal);
    if (brandVal === 'Outra') {
      setForm((prev: any) => ({ ...prev, brand: '' }));
    } else {
      setForm((prev: any) => ({ ...prev, brand: brandVal }));
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setForm((prev: any) => ({
      ...prev,
      year: cleanDigits ? parseInt(cleanDigits, 10) : '',
    }));
  };

  const currentStatus: MotoStatus = form.status || 'alugada';
  const currentNote = form.statusNote !== undefined ? form.statusNote : (form.notes || '');

  const themeColor: 'sky' | 'emerald' | 'amber' =
    currentStatus === 'alugada' ? 'emerald' : currentStatus === 'manutencao' ? 'amber' : 'sky';

  const statusColorClass =
    currentStatus === 'alugada'
      ? 'text-emerald-400'
      : currentStatus === 'manutencao'
      ? 'text-amber-400'
      : 'text-sky-400';

  const statusBgBorderClass =
    currentStatus === 'alugada'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
      : currentStatus === 'manutencao'
      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
      : 'bg-sky-500/10 border-sky-500/20 text-sky-300';

  const focusRingClass =
    currentStatus === 'alugada'
      ? 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25'
      : currentStatus === 'manutencao'
      ? 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25'
      : 'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25';

  const handleStatusChange = (newStatus: MotoStatus) => {
    let defaultNote = '';
    if (newStatus === 'disponivel') defaultNote = 'Revisada e pronta para locação';
    else if (newStatus === 'manutencao') defaultNote = 'Em oficina para revisão preventiva';
    else if (newStatus === 'alugada') defaultNote = form.tenantName ? `Locatário: ${form.tenantName}` : 'Contrato ativo de locação';

    setForm((prev: any) => ({
      ...prev,
      status: newStatus,
      statusNote: prev.statusNote || defaultNote,
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
              currentStatus === 'alugada'
                ? 'bg-emerald-500 text-slate-950'
                : currentStatus === 'manutencao'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-sky-500 text-slate-950'
            }`}
          >
            1
          </span>
          <span>Dados Principais e Fotos da Moto</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Fotos e dados do veículo
        </span>
      </div>

      {/* STATUS OPERACIONAL DA MOTO - CENTRALIZADO, COMPACTO E COM TEMA DINÂMICO */}
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
            Status Operacional do Veículo *
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
            {currentStatus === 'manutencao' && '• Em reforma / manutenção'}
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

          {/* 3. MANUTENÇÃO / REFORMA (Âmbar) */}
          <button
            type="button"
            onClick={() => handleStatusChange('manutencao')}
            className={`py-2.5 px-1.5 sm:px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
              currentStatus === 'manutencao'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-md shadow-amber-500/15 font-bold'
                : 'bg-[#0E111A]/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.20]'
            }`}
          >
            <Wrench className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'manutencao' ? 'text-amber-300' : 'text-slate-500'}`} />
            <span className="text-xs truncate">Reforma</span>
          </button>
        </div>

        {/* CAMPO DA LEGENDA EMBAIXO DA FOTO (EXIBIDO APENAS SE NÃO FOR ALUGADA) */}
        {currentStatus !== 'alugada' && (
          <div className="pt-2 border-t border-white/[0.08] space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className={`w-3 h-3 ${statusColorClass}`} />
                Legenda do card (embaixo da foto):
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={form.statusNote ?? ''}
                placeholder={
                  currentStatus === 'disponivel'
                    ? 'Ex: Revisada e pronta para locação'
                    : 'Ex: Em oficina para revisão preventiva'
                }
                onChange={(e) => setForm({ ...form, statusNote: e.target.value })}
                className={`w-full bg-[#0E111A] border rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-all font-sans ${
                  currentStatus === 'disponivel'
                    ? 'border-sky-500/30 focus:border-sky-400 focus:ring-sky-500/25'
                    : 'border-amber-500/30 focus:border-amber-400 focus:ring-amber-500/25'
                }`}
              />
              {form.statusNote && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, statusNote: '' })}
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
              {MOTO_STATUS_PRESETS[currentStatus].map((suggestion) => {
                const isSelected = form.statusNote === suggestion;
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setForm({ ...form, statusNote: suggestion })}
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

      {/* CARD 1: DADOS ESSENCIAIS (MARCA, MODELO, PLACA, ANO, COR) */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Marca do Fabricante */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Marca do Fabricante *
            </label>
            <div className="relative">
              <select
                value={selectedBrandOption}
                onChange={(e) => handleBrandSelect(e.target.value)}
                className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none ${focusRingClass} transition-all font-sans cursor-pointer appearance-none`}
              >
                <option value="" className="bg-[#0D101C] text-slate-400">
                  Selecione a fabricante...
                </option>
                {POPULAR_BRANDS.map((b) => (
                  <option key={b} value={b} className="bg-[#0D101C] text-white">
                    {b === 'Outra' ? 'Outra fabricante (especificar)...' : b}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedBrandOption === 'Outra' && (
              <div className="mt-2 animate-fadeIn">
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite a fabricante (ex: Kasinski, Bull, Watts)"
                  value={form.brand || ''}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
                />
              </div>
            )}
          </div>

          {/* Modelo da Moto */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Modelo da Moto *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: CG 160 Fan, NMAX 160, Factor 150"
              value={form.model || ''}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Placa do Veículo */}
          <div className="sm:col-span-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Placa do Veículo *
              </label>
              <span className="text-[10px] text-slate-400 font-normal">
                Mercosul / Tradicional
              </span>
            </div>

            <input
              type="text"
              required
              maxLength={8}
              placeholder="BRA2E19 ou ABC-1234"
              value={form.plate || ''}
              onChange={(e) => setForm({ ...form, plate: maskPlateInput(e.target.value) })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white uppercase font-sans font-semibold tracking-wider placeholder:tracking-normal placeholder:normal-case placeholder:font-normal placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all`}
            />

            {form.plate && form.plate.length > 0 && (
              <div className="mt-1.5">
                {plateValidation?.isValid ? (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>
                      Placa válida ({plateValidation.type === 'mercosul' ? 'Mercosul' : 'Tradicional'})
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {form.plate.replace(/[^A-Z0-9]/g, '').length < 7
                        ? `Faltam ${7 - form.plate.replace(/[^A-Z0-9]/g, '').length} dígitos`
                        : 'Formato inválido (use ABC-1234 ou BRA2E19)'}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Ano Modelo */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ano Modelo
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Ex: 2023"
              value={form.year ? String(form.year) : ''}
              onChange={handleYearChange}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />
          </div>

          {/* Cor */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cor Predominante
            </label>
            <input
              type="text"
              placeholder="Ex: Preta, Vermelha"
              value={form.color || ''}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />
          </div>
        </div>

        {/* Chips de Cores Populares */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-slate-400 font-medium mr-1">Sugestões:</span>
            {PRESET_COLORS.map((c) => {
              const isSelected = form.color?.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.name })}
                  className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? `${statusBgBorderClass} font-semibold shadow-sm`
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block shrink-0 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CARD 2: DOCUMENTAÇÃO & AQUISIÇÃO */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
            <FileText className={`w-3.5 h-3.5 ${statusColorClass}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              Documentação & Aquisição
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              Renavam, Chassi (VIN), Quilometragem e valor de compra
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Renavam */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Renavam</label>
              <button
                type="button"
                onClick={() => setShowRenavamHelp(!showRenavamHelp)}
                className={`text-[11px] ${statusColorClass} hover:opacity-80 flex items-center gap-1 transition-colors cursor-pointer`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>O que é?</span>
              </button>
            </div>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 01294857631"
              maxLength={11}
              value={form.renavam || ''}
              onChange={(e) => setForm({ ...form, renavam: e.target.value.replace(/\D/g, '') })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />

            {showRenavamHelp && (
              <div className={`mt-2 p-3 ${statusBgBorderClass} rounded-xl text-xs space-y-1 relative animate-fadeIn`}>
                <button
                  type="button"
                  onClick={() => setShowRenavamHelp(false)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className={`font-bold ${statusColorClass}`}>Código RENAVAM (11 dígitos):</p>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Encontra-se no CRLV Digital ou no documento impresso do veículo no canto superior esquerdo.
                </p>
              </div>
            )}
          </div>

          {/* Chassi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Chassi (VIN)
            </label>
            <input
              type="text"
              placeholder="Ex: 9C2JC4110MR000000"
              maxLength={17}
              value={form.chassi || ''}
              onChange={(e) => setForm({ ...form, chassi: e.target.value.toUpperCase() })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* KM Atual */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quilometragem (KM)
            </label>
            <NumericInput
              mode="integer"
              min={0}
              value={form.currentKm || null}
              placeholder="Ex: 12500"
              onChange={(val) => setForm({ ...form, currentKm: val })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />
          </div>

          {/* Data de Compra */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Aquisição
            </label>
            <input
              type="date"
              value={form.purchaseDate || ''}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none ${focusRingClass} transition-all font-sans [color-scheme:dark]`}
            />
          </div>

          {/* Valor de Compra */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Valor de Compra (R$)
            </label>
            <CurrencyInput
              value={form.purchasePrice || null}
              placeholder="0,00"
              onChange={(val) => setForm({ ...form, purchasePrice: val })}
              className={`h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none ${focusRingClass} transition-all font-sans`}
            />
          </div>
        </div>
      </div>

      {/* CARD 3: VISTORIA FOTOGRÁFICA INICIAL */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Camera className={`w-3.5 h-3.5 ${statusColorClass}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Fotos do Veículo (Vistoria Inicial)
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Ângulos para entrega, laudo e histórico visual
              </p>
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${statusBgBorderClass}`}>
            5 Ângulos
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Adicione fotos para registrar o estado estético da motocicleta:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <ImageUploadInput
            label="Frente"
            value={form.frontPhoto || ''}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(b64) => setForm({ ...form, frontPhoto: b64 })}
          />
          <ImageUploadInput
            label="Traseira"
            value={form.rearPhoto || ''}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(b64) => setForm({ ...form, rearPhoto: b64 })}
          />
          <ImageUploadInput
            label="Lateral Dir."
            value={form.rightSidePhoto || ''}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(b64) => setForm({ ...form, rightSidePhoto: b64 })}
          />
          <ImageUploadInput
            label="Lateral Esq."
            value={form.leftSidePhoto || ''}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(b64) => setForm({ ...form, leftSidePhoto: b64 })}
          />
          <ImageUploadInput
            label="Painel / KM"
            value={form.dashboardPhoto || ''}
            themeColor={themeColor}
            aspectRatio="photo"
            onChange={(b64) => setForm({ ...form, dashboardPhoto: b64 })}
          />
        </div>
      </div>
    </div>
  );
};

