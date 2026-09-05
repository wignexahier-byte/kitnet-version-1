import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Layers,
  ClipboardCheck,
  History,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Bike,
  Building2,
  Plus,
  Trash2,
  Calendar,
  Key,
  Droplet,
  Zap,
  Gauge,
  Fuel,
  Printer,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Moto, MotoDelivery, Kitnet, KitnetInspection } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDate, getTodayLocalDateString } from '../../utils/formatters';
import { NumericInput } from '../NumericInput';
import { ImageUploadInput } from '../ImageUploadInput';

export interface CentralVistoriasModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: 'moto' | 'kitnet';
  moto?: Moto;
  kitnet?: Kitnet;
  initialTab?: 'registrar' | 'historico' | 'comparador';
}

type VistoriaTab = 'registrar' | 'historico' | 'comparador';
type ItemEvaluation = 'otimo' | 'bom' | 'regular' | 'reparar';

// Standard technical items for Moto
const MOTO_CHECKLIST_ITEMS = [
  { id: 'pneus', label: 'Pneus e Rodas', desc: 'Calibragem, sulcos, aro e alinhamento' },
  { id: 'freios', label: 'Sistema de Freios', desc: 'Pastilhas, discos, fluido e resposta' },
  { id: 'iluminacao', label: 'Faróis & Elétrica', desc: 'Farol alto/baixo, piscas, lanterna e buzina' },
  { id: 'retrovisores', label: 'Retrovisores & Guidão', desc: 'Espelhos, manoplas, manetes e alinhamento' },
  { id: 'carenagem', label: 'Carenagem & Pintura', desc: 'Arranhões, trincas, adesivos e tanque' },
  { id: 'motor', label: 'Motor & Escapamento', desc: 'Nível de óleo, ausência de vazamentos e ruído' },
  { id: 'documentos', label: 'Chaves & CRLV', desc: 'Chave principal, reserva e documento em dia' },
];

// Standard items for Kitnet
const KITNET_CHECKLIST_ITEMS = [
  { id: 'pintura', label: 'Pintura, Paredes & Teto', desc: 'Sem manchas, furos, mofo ou umidade' },
  { id: 'eletrica', label: 'Instalação Elétrica', desc: 'Tomadas funcionando, disjuntores e lâmpadas' },
  { id: 'hidraulica', label: 'Instalação Hidráulica', desc: 'Torneiras, pia, descarga e chuveiro sem vazamento' },
  { id: 'portasJanelas', label: 'Portas, Janelas & Vidros', desc: 'Fechaduras, trincos, vidros íntegros e chaves' },
  { id: 'pisos', label: 'Pisos & Revestimentos', desc: 'Cerâmicas limpas, sem trincas ou peças soltas' },
  { id: 'banheiro', label: 'Banheiro & Louças', desc: 'Vaso com assento, pia, ralo limpo e box' },
  { id: 'cozinha', label: 'Cozinha & Mobília', desc: 'Bancada, pia com sifão e armários em ordem' },
];

export const CentralVistoriasModal: React.FC<CentralVistoriasModalProps> = ({
  isOpen,
  onClose,
  assetType,
  moto,
  kitnet,
  initialTab,
}) => {
  const {
    settings,
    updateKitnet,
    recordKitnetInspection,
    updateMoto,
    recordMotoDelivery,
    addKmLog,
    addTimelineEvent,
  } = useApp();

  const isMoto = assetType === 'moto';
  const hasExistingInspection = isMoto
    ? Boolean(moto?.delivery || moto?.returnInspection)
    : Boolean(kitnet?.entryInspection || kitnet?.exitInspection);

  const [activeTab, setActiveTab] = useState<VistoriaTab>(
    initialTab || (hasExistingInspection ? 'historico' : 'registrar')
  );

  // Form State: General
  const [inspectionType, setInspectionType] = useState<'entrada' | 'periodica' | 'saida'>('entrada');
  const [date, setDate] = useState<string>(getTodayLocalDateString());
  const [inspectorName, setInspectorName] = useState<string>(settings.adminName || 'Vistoriador Responsável');
  const [generalNotes, setGeneralNotes] = useState<string>(
    isMoto
      ? 'Veículo vistoriado e entregue em perfeitas condições de uso, mecânica em dia e documentação conferida.'
      : 'Imóvel residencial entregue limpo, com pintura nova, instalações elétricas e hidráulicas testadas.'
  );
  const [confirmedByClient, setConfirmedByClient] = useState<boolean>(true);

  // Moto specific state
  const [motoKm, setMotoKm] = useState<number>(moto?.currentKm || 0);
  const [motoFuel, setMotoFuel] = useState<string>('cheio');

  // Kitnet specific state
  const [kitnetKeysCount, setKitnetKeysCount] = useState<number>(2);
  const [kitnetWaterReading, setKitnetWaterReading] = useState<string>('');
  const [kitnetEnergyReading, setKitnetEnergyReading] = useState<string>('');

  // Checklist state: key -> evaluation
  const [itemsEvaluation, setItemsEvaluation] = useState<Record<string, ItemEvaluation>>(() => {
    const initial: Record<string, ItemEvaluation> = {};
    const items = isMoto ? MOTO_CHECKLIST_ITEMS : KITNET_CHECKLIST_ITEMS;
    items.forEach((it) => {
      initial[it.id] = 'otimo';
    });
    return initial;
  });

  // Photos state
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');

  // Comparator state
  const [compareSliderPos, setCompareSliderPos] = useState<number>(50);
  const [compareMode, setCompareMode] = useState<'lado_a_lado' | 'slider'>('lado_a_lado');

  // Success message state
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen || (!moto && !kitnet) || typeof document === 'undefined') return null;

  const assetTitle = isMoto
    ? `${moto?.brand} ${moto?.model} (${moto?.plate})`
    : `${kitnet?.name} - Nº ${kitnet?.number}`;

  const handleItemEvalChange = (id: string, value: ItemEvaluation) => {
    setItemsEvaluation((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddPhoto = (url: string) => {
    if (!url) return;
    setPhotos((prev) => [...prev, url]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isMoto && moto) {
      const photosArray = photos.length > 0 ? photos : Object.values(moto.photos).filter(p => typeof p === 'string') as string[];

      if (inspectionType === 'entrada') {
        const deliveryData: MotoDelivery = {
          date,
          initialKm: motoKm,
          photos: photosArray,
          stateNotes: generalNotes,
          clientConfirmed: confirmedByClient,
        };
        recordMotoDelivery(moto.id, deliveryData);
      } else if (inspectionType === 'saida') {
        updateMoto(moto.id, {
          currentKm: motoKm,
          returnInspection: {
            date,
            finalKm: motoKm,
            photos: photosArray,
            stateNotes: generalNotes,
          },
        });
        addKmLog(moto.id, motoKm, 'KM registrado na vistoria de devolução');
        addTimelineEvent({
          type: 'vistoria',
          title: `Vistoria de Devolução: ${moto.brand} ${moto.model}`,
          description: `Devolvida com ${motoKm.toLocaleString('pt-BR')} km. ${generalNotes}`,
          entityType: 'moto',
          entityId: moto.id,
        });
      } else {
        // Periodica
        updateMoto(moto.id, { currentKm: motoKm });
        addKmLog(moto.id, motoKm, `Vistoria Periódica: ${generalNotes}`);
        addTimelineEvent({
          type: 'vistoria',
          title: `Vistoria Periódica: ${moto.brand} ${moto.model}`,
          description: `Aferição de ${motoKm.toLocaleString('pt-BR')} km. Itens revisados.`,
          entityType: 'moto',
          entityId: moto.id,
        });
      }

      setSaveSuccessMsg('Laudo de Vistoria da moto registrado com sucesso!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        setActiveTab('historico');
      }, 1200);
    } else if (!isMoto && kitnet) {
      const photosArray = photos.length > 0 ? photos : (kitnet.photos.delivery || []);

      const itemsStateMapped: KitnetInspection['itemsState'] = {
        pintura: itemsEvaluation['pintura'] || 'otimo',
        eletrica: itemsEvaluation['eletrica'] || 'otimo',
        hidraulica: itemsEvaluation['hidraulica'] || 'otimo',
        portasJanelas: itemsEvaluation['portasJanelas'] || 'otimo',
        banheiro: itemsEvaluation['banheiro'] || 'otimo',
        cozinha: itemsEvaluation['cozinha'] || 'otimo',
      };

      const inspectionObj: KitnetInspection = {
        date,
        photos: photosArray,
        stateNotes: `${generalNotes} | Chaves: ${kitnetKeysCount}${kitnetWaterReading ? ` | Hidrômetro: ${kitnetWaterReading}` : ''}${kitnetEnergyReading ? ` | Energia: ${kitnetEnergyReading}` : ''}`,
        itemsState: itemsStateMapped,
        adminSignature: inspectorName,
      };

      if (inspectionType === 'saida') {
        updateKitnet(kitnet.id, {
          exitInspection: inspectionObj,
        });
        addTimelineEvent({
          type: 'vistoria',
          title: `Vistoria de Saída: ${kitnet.name}`,
          description: `Laudo de devolução concluído. ${generalNotes}`,
          entityType: 'kitnet',
          entityId: kitnet.id,
        });
      } else {
        recordKitnetInspection(kitnet.id, inspectionObj);
      }

      setSaveSuccessMsg('Laudo de Vistoria da kitnet registrado com sucesso!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        setActiveTab('historico');
      }, 1200);
    }
  };

  // Preparation for comparator
  const beforePhoto = isMoto
    ? moto?.delivery?.photos?.[0] || moto?.photos?.front || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80'
    : kitnet?.entryInspection?.photos?.[0] || kitnet?.photos?.livingRoom || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80';

  const afterPhoto = isMoto
    ? moto?.returnInspection?.photos?.[0] || moto?.photos?.dashboard || moto?.delivery?.photos?.[0] || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80'
    : kitnet?.exitInspection?.photos?.[0] || kitnet?.photos?.kitchen || kitnet?.entryInspection?.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';

  const beforeDate = isMoto ? moto?.delivery?.date : kitnet?.entryInspection?.date;
  const afterDate = isMoto ? moto?.returnInspection?.date : kitnet?.exitInspection?.date;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#0D0E15] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/90 overflow-hidden my-auto animate-modal-enter">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] p-4 sm:p-5 gap-3 shrink-0 bg-[#11131F]/90">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isMoto
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              }`}
            >
              {isMoto ? <Bike className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                  {isMoto ? 'Vistoria de Moto' : 'Vistoria de Kitnet'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Padronizada
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                {assetTitle}
              </h2>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 bg-[#090A10] p-1 rounded-xl border border-white/[0.08] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('registrar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'registrar'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Registrar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'historico'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Laudos</span>
              {(isMoto ? (moto?.delivery ? 1 : 0) + (moto?.returnInspection ? 1 : 0) : (kitnet?.entryInspection ? 1 : 0) + (kitnet?.exitInspection ? 1 : 0)) > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center">
                  {isMoto ? (moto?.delivery ? 1 : 0) + (moto?.returnInspection ? 1 : 0) : (kitnet?.entryInspection ? 1 : 0) + (kitnet?.exitInspection ? 1 : 0)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparador')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'comparador'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Comparar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors ml-1 cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback notification toast */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 px-4 py-2.5 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 modal-scroll-container">
          {/* TAB 1: REGISTRAR NOVA VISTORIA */}
          {activeTab === 'registrar' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type selector pill group */}
              <div className="bg-[#121422] p-3 rounded-2xl border border-white/[0.08] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tipo de Vistoria a Registrar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectionType('entrada');
                      setGeneralNotes(
                        isMoto
                          ? 'Veículo vistoriado e entregue em perfeitas condições de uso, mecânica em dia e documentação conferida.'
                          : 'Imóvel residencial entregue limpo, com pintura nova, instalações elétricas e hidráulicas testadas.'
                      );
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      inspectionType === 'entrada'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-[#090A10] border-white/[0.08] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">{isMoto ? 'Entrega / Entrada' : 'Entrada (Check-in)'}</span>
                    <span className="text-[10px] opacity-75">{isMoto ? 'Início do Contrato' : 'Novo Inquilino'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInspectionType('periodica');
                      setGeneralNotes(
                        isMoto
                          ? 'Vistoria periódica de rotina. Nível de óleo, freios e pneus inspecionados.'
                          : 'Vistoria preventiva periódica de conservação das instalações e estrutura.'
                      );
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      inspectionType === 'periodica'
                        ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500/40 shadow-sm'
                        : 'bg-[#090A10] border-white/[0.08] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">Periódica</span>
                    <span className="text-[10px] opacity-75">Acompanhamento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInspectionType('saida');
                      setGeneralNotes(
                        isMoto
                          ? 'Vistoria de devolução final do veículo. Odômetro e estado de conservação conferidos na devolução das chaves.'
                          : 'Vistoria final de entrega de chaves (Check-out). Vistorias de pintura, louças e contas de consumo apuradas.'
                      );
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      inspectionType === 'saida'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                        : 'bg-[#090A10] border-white/[0.08] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">{isMoto ? 'Devolução / Saída' : 'Saída (Check-out)'}</span>
                    <span className="text-[10px] opacity-75">Encerramento</span>
                  </button>
                </div>
              </div>

              {/* Specific Asset Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    Data da Vistoria *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#090B10] border border-white/[0.12] focus:bg-[#0E111A] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500 [color-scheme:dark]"
                  />
                </div>

                {isMoto ? (
                  <>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        Quilometragem (KM) *
                      </label>
                      <NumericInput
                        mode="integer"
                        min={0}
                        value={motoKm}
                        onChange={(val) => setMotoKm(val)}
                        className="w-full bg-[#090B10] border border-white/[0.12] focus:bg-[#0E111A] rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        Nível de Combustível
                      </label>
                      <select
                        value={motoFuel}
                        onChange={(e) => setMotoFuel(e.target.value)}
                        className="w-full bg-[#090B10] border border-white/[0.12] focus:bg-[#0E111A] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="reserva">Reserva (Quase Vazio)</option>
                        <option value="1/4">1/4 Tanque</option>
                        <option value="1/2">1/2 Tanque (Meio)</option>
                        <option value="3/4">3/4 Tanque</option>
                        <option value="cheio">Tanque Cheio (100%)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-sky-400" />
                        Chaves Entregues
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={kitnetKeysCount}
                        onChange={(e) => setKitnetKeysCount(Number(e.target.value))}
                        className="w-full bg-[#090B10] border border-white/[0.12] focus:bg-[#0E111A] rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                        Hidrômetro / Água (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 00142 m³"
                        value={kitnetWaterReading}
                        onChange={(e) => setKitnetWaterReading(e.target.value)}
                        className="w-full bg-[#090B10] border border-white/[0.12] focus:bg-[#0E111A] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Checklist Section */}
              <div className="bg-[#121422] p-4 rounded-2xl border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    Checklist de Itens Inspecionados
                  </h3>
                  <span className="text-[11px] text-slate-400">Avalie cada componente</span>
                </div>

                <div className="space-y-2.5">
                  {(isMoto ? MOTO_CHECKLIST_ITEMS : KITNET_CHECKLIST_ITEMS).map((item) => {
                    const currentVal = itemsEvaluation[item.id] || 'otimo';
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 bg-[#0A0C14] rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200">{item.label}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{item.desc}</p>
                        </div>

                        {/* Status button pills */}
                        <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleItemEvalChange(item.id, 'otimo')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              currentVal === 'otimo'
                                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Ótimo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemEvalChange(item.id, 'bom')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              currentVal === 'bom'
                                ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Bom
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemEvalChange(item.id, 'regular')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              currentVal === 'regular'
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Regular
                          </button>
                          <button
                            type="button"
                            onClick={() => handleItemEvalChange(item.id, 'reparar')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              currentVal === 'reparar'
                                ? 'bg-rose-500 text-white font-black shadow-sm'
                                : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Avaria
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Notes */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Parecer Técnico Geral / Avarias Identificadas
                </label>
                <textarea
                  rows={3}
                  required
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Descreva observações gerais, pequenos riscos, detalhes conferidos ou avarias..."
                  className="w-full bg-[#090B10] border border-white/[0.12] focus:bg-[#0E111A] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Photo Registration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-xs font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-violet-400" />
                    Fotos da Vistoria ({photos.length} adicionada{photos.length !== 1 ? 's' : ''})
                  </label>
                  <span className="text-[11px] text-slate-400">Envie fotos de cada ângulo</span>
                </div>

                {/* Upload helper */}
                <div className="bg-[#121422] p-3 rounded-2xl border border-white/[0.08] space-y-3">
                  <ImageUploadInput
                    label="Tirar Foto com Câmera ou Enviar Arquivo"
                    onChange={(base64) => handleAddPhoto(base64)}
                    aspectRatio="video"
                    themeColor={isMoto ? 'amber' : 'sky'}
                  />

                  {/* Registered photos gallery */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.1] group bg-black"
                        >
                          <img
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-lg hover:bg-red-500 transition-colors opacity-90 group-hover:opacity-100 cursor-pointer"
                            title="Remover foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation check */}
              <div className="p-3 bg-[#121422] rounded-xl border border-white/[0.08] flex items-center gap-3">
                <input
                  type="checkbox"
                  id="confirm-vistoria-check"
                  checked={confirmedByClient}
                  onChange={(e) => setConfirmedByClient(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
                />
                <label
                  htmlFor="confirm-vistoria-check"
                  className="text-xs text-slate-300 cursor-pointer select-none"
                >
                  Declaro que a vistoria foi executada de forma fidedigna e as condições descritas
                  foram conferidas pelo locador/vistoriador.
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-300 hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                    isMoto
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                      : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Laudo de Vistoria</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HISTÓRICO DE LAUDOS REGISTRADOS */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              {/* If no inspections recorded */}
              {!hasExistingInspection && (
                <div className="py-12 px-4 text-center bg-[#10121C] rounded-2xl border border-dashed border-white/[0.1] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
                    <ClipboardCheck className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Nenhuma vistoria registrada</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Ainda não há laudos de entrada ou devolução salvos para este ativo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('registrar')}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-violet-600/25 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Primeira Vistoria</span>
                  </button>
                </div>
              )}

              {/* Kitnet Entry Inspection Card */}
              {!isMoto && kitnet?.entryInspection && (
                <div className="p-4 sm:p-5 bg-[#121422] rounded-2xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
                        Vistoria de Entrada (Check-in)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDate(kitnet.entryInspection.date)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 border border-white/[0.08] transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-violet-400" />
                      <span>Imprimir Laudo</span>
                    </button>
                  </div>

                  {/* Items summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(kitnet.entryInspection.itemsState).map(([item, state]) => (
                      <div
                        key={item}
                        className="p-2 bg-[#0A0C14] rounded-xl border border-white/[0.06] flex items-center justify-between"
                      >
                        <span className="capitalize text-slate-300 text-[11px]">{item}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            state === 'otimo' || state === 'bom'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {state}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 bg-[#0A0C14] p-3 rounded-xl border border-white/[0.06]">
                    "{kitnet.entryInspection.stateNotes}"
                  </p>

                  {/* Photos */}
                  {kitnet.entryInspection.photos && kitnet.entryInspection.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Fotos Registradas:</span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {kitnet.entryInspection.photos.map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            alt="Foto laudo"
                            className="aspect-video rounded-lg object-cover border border-white/[0.1]"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Kitnet Exit Inspection Card */}
              {!isMoto && kitnet?.exitInspection && (
                <div className="p-4 sm:p-5 bg-[#121422] rounded-2xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
                        Vistoria de Saída (Check-out)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDate(kitnet.exitInspection.date)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 border border-white/[0.08] transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Imprimir Laudo</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#0A0C14] p-3 rounded-xl border border-white/[0.06]">
                    "{kitnet.exitInspection.stateNotes}"
                  </p>
                </div>
              )}

              {/* Moto Delivery Inspection Card */}
              {isMoto && moto?.delivery && (
                <div className="p-4 sm:p-5 bg-[#121422] rounded-2xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase">
                        Entrega Oficial / Vistoria Inicial
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDate(moto.delivery.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-xs font-mono font-bold text-white">
                        KM {moto.delivery.initialKm.toLocaleString('pt-BR')}
                      </span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 border border-white/[0.08] transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Imprimir</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#0A0C14] p-3 rounded-xl border border-white/[0.06]">
                    "{moto.delivery.stateNotes}"
                  </p>

                  {/* Photos */}
                  {moto.delivery.photos && moto.delivery.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Fotos Registradas na Entrega:</span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {moto.delivery.photos.map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            alt="Foto entrega"
                            className="aspect-video rounded-lg object-cover border border-white/[0.1]"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Moto Return Inspection Card */}
              {isMoto && moto?.returnInspection && (
                <div className="p-4 sm:p-5 bg-[#121422] rounded-2xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase">
                        Vistoria de Devolução / Saída
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatDate(moto.returnInspection.date)}
                      </span>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-xs font-mono font-bold text-white">
                      KM Final: {moto.returnInspection.finalKm.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#0A0C14] p-3 rounded-xl border border-white/[0.06]">
                    "{moto.returnInspection.stateNotes}"
                  </p>
                </div>
              )}

              {/* Quick action to register another inspection */}
              {hasExistingInspection && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('registrar')}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-violet-600/25 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Nova Vistoria</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPARADOR VISUAL */}
          {activeTab === 'comparador' && (
            <div className="space-y-4">
              {/* Mobile View Mode Switcher */}
              <div className="flex bg-[#121422] p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCompareMode('lado_a_lado')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    compareMode === 'lado_a_lado'
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lado a Lado
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode('slider')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    compareMode === 'slider'
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Slider Interativo
                </button>
              </div>

              {/* Comparison display */}
              {compareMode === 'lado_a_lado' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BEFORE */}
                  <div className="bg-[#121422] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-3 bg-[#181A2A] border-b border-white/[0.08] flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        1. ANTES (Entrada / Início)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {beforeDate ? formatDate(beforeDate) : 'Data Inicial'}
                      </span>
                    </div>
                    <div className="h-60 bg-[#090A10] relative overflow-hidden flex items-center justify-center">
                      <img
                        src={beforePhoto}
                        alt="Vistoria Entrada"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white border border-white/[0.1] font-mono">
                        {isMoto ? `KM Inicial: ${moto?.delivery?.initialKm || moto?.currentKm} km` : 'Vistoria Inicial'}
                      </div>
                    </div>
                    <div className="p-3 text-xs text-slate-400">
                      <strong className="text-white">Laudo de Entrada:</strong>{' '}
                      {isMoto
                        ? moto?.delivery?.stateNotes || 'Veículo entregue revisado, com 2 chaves e manual.'
                        : kitnet?.entryInspection?.stateNotes || 'Imóvel com pintura nova e instalações testadas.'}
                    </div>
                  </div>

                  {/* AFTER */}
                  <div className="bg-[#121422] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-3 bg-[#181A2A] border-b border-white/[0.08] flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        2. DEPOIS (Devolução / Atual)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {afterDate ? formatDate(afterDate) : 'Estado Atual'}
                      </span>
                    </div>
                    <div className="h-60 bg-[#090A10] relative overflow-hidden flex items-center justify-center">
                      <img
                        src={afterPhoto}
                        alt="Vistoria Saída"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white border border-white/[0.1] font-mono">
                        {isMoto
                          ? `KM Atual: ${moto?.currentKm} km (+${(moto?.currentKm || 0) - (moto?.delivery?.initialKm || 0)} km)`
                          : 'Vistoria Atual'}
                      </div>
                    </div>
                    <div className="p-3 text-xs text-slate-400">
                      <strong className="text-white">Laudo Posterior:</strong>{' '}
                      {isMoto
                        ? moto?.returnInspection?.stateNotes || 'Veículo em uso regular com revisões periódicas.'
                        : kitnet?.exitInspection?.stateNotes || 'Vistoria periódica de conservação do imóvel.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-72 sm:h-80 bg-[#090A10] rounded-2xl border border-white/[0.08] relative overflow-hidden select-none">
                    <img
                      src={afterPhoto}
                      alt="Depois"
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Clipped Image (BEFORE) */}
                    <div
                      className="absolute inset-0 overflow-hidden border-r-2 border-violet-500 shadow-2xl"
                      style={{ width: `${compareSliderPos}%` }}
                    >
                      <img
                        src={beforePhoto}
                        alt="Antes"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: '100%', minWidth: '100%' }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md shadow-md">
                        ANTES
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 bg-[#181A2A] text-white border border-white/[0.1] text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                      DEPOIS
                    </div>

                    {/* Slider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-violet-500 flex items-center justify-center pointer-events-none"
                      style={{ left: `${compareSliderPos}%` }}
                    >
                      <div className="w-7 h-7 bg-violet-500 rounded-full text-white flex items-center justify-center shadow-lg font-bold text-xs">
                        ⇄
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-bold">Antes</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={compareSliderPos}
                      onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                      className="flex-1 accent-violet-500 cursor-pointer h-2 bg-[#121422] rounded-lg"
                    />
                    <span className="text-xs text-slate-400 font-bold">Depois</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between gap-3 bg-[#11131F]/90 shrink-0 text-xs text-slate-400">
          <span>Laudos padronizados e sincronizados no histórico da auditoria</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold transition-all cursor-pointer border border-white/[0.08]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
