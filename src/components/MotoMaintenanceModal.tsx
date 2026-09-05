import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Wrench,
  CheckCircle2,
  Calendar,
  DollarSign,
  Gauge,
  User,
  FileText,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MaintenanceType, Moto } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getTodayLocalDateString } from '../domain';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { CurrencyInput, NumericInput } from './NumericInput';

interface MotoMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  moto: Moto;
}

const MAINTENANCE_TYPES: { id: MaintenanceType; label: string; intervalKm?: number; defaultDesc: string }[] = [
  { id: 'troca_oleo', label: 'Troca de Óleo', intervalKm: 1500, defaultDesc: 'Troca de óleo do motor 10W30 / 20W50' },
  { id: 'pneu_dianteiro', label: 'Pneu Dianteiro', intervalKm: 15000, defaultDesc: 'Substituição do pneu dianteiro' },
  { id: 'pneu_traseiro', label: 'Pneu Traseiro', intervalKm: 10000, defaultDesc: 'Substituição do pneu traseiro' },
  { id: 'relacao_kit', label: 'Kit Relação (Corrente/Coroa/Pinhão)', intervalKm: 12000, defaultDesc: 'Troca do kit relação completo' },
  { id: 'freio_pastilha', label: 'Freios (Pastilhas / Lonas)', intervalKm: 8000, defaultDesc: 'Troca de pastilhas de freio dianteiras/traseiras' },
  { id: 'revisao_geral', label: 'Revisão Geral Preventiva', intervalKm: 10000, defaultDesc: 'Revisão periódica preventiva completa' },
  { id: 'bateria', label: 'Bateria', intervalKm: 25000, defaultDesc: 'Substituição de bateria selada' },
  { id: 'cabos_velas', label: 'Cabos & Velas', intervalKm: 12000, defaultDesc: 'Troca de vela de ignição e cabo' },
  { id: 'eletrica', label: 'Parte Elétrica / Lâmpadas', intervalKm: 0, defaultDesc: 'Reparo elétrico / lâmpada' },
  { id: 'outro', label: 'Outro Reparo / Peça', intervalKm: 0, defaultDesc: 'Manutenção técnica realizada' },
];

export const MotoMaintenanceModal: React.FC<MotoMaintenanceModalProps> = ({
  isOpen,
  onClose,
  moto,
}) => {
  const { addMotoMaintenance, isReadOnlyMode } = useApp();

  useBodyScrollLock(isOpen);

  const [type, setType] = useState<MaintenanceType>('troca_oleo');
  const [km, setKm] = useState<number>(moto.currentKm || 0);
  const [date, setDate] = useState<string>(getTodayLocalDateString());
  const [cost, setCost] = useState<number>(55);
  const [description, setDescription] = useState<string>(MAINTENANCE_TYPES[0].defaultDesc);
  const [performedBy, setPerformedBy] = useState<string>('Oficina Mecânica Especializada');
  const [nextDueKm, setNextDueKm] = useState<number>(
    (moto.currentKm || 0) + (MAINTENANCE_TYPES[0].intervalKm || 1500)
  );
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTypeChange = (newType: MaintenanceType) => {
    setType(newType);
    const config = MAINTENANCE_TYPES.find((t) => t.id === newType);
    if (config) {
      setDescription(config.defaultDesc);
      if (config.intervalKm && config.intervalKm > 0) {
        setNextDueKm(km + config.intervalKm);
      }
      if (newType === 'troca_oleo') setCost(55);
      else if (newType === 'pneu_traseiro') setCost(220);
      else if (newType === 'pneu_dianteiro') setCost(190);
      else if (newType === 'relacao_kit') setCost(160);
      else if (newType === 'freio_pastilha') setCost(85);
      else if (newType === 'revisao_geral') setCost(350);
      else setCost(100);
    }
  };

  const handleKmChange = (newKm: number) => {
    setKm(newKm);
    const config = MAINTENANCE_TYPES.find((t) => t.id === type);
    if (config?.intervalKm) {
      setNextDueKm(newKm + config.intervalKm);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnlyMode) return;

    addMotoMaintenance(moto.id, {
      date,
      km,
      type,
      description,
      cost,
      performedBy,
      nextDueKm: nextDueKm > 0 ? nextDueKm : undefined,
      notes: notes.trim() || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2A2A2E] bg-[#121214] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/25 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#F2F1ED]">
                Registrar Manutenção Técnica
              </h3>
              <p className="text-xs text-[#9C9CA3] truncate max-w-[260px] sm:max-w-xs">
                {moto.brand} {moto.model} • Placa: {moto.plate || 'S/ Placa'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#2A2A2E] transition-colors cursor-pointer border border-transparent hover:border-[#2A2A2E]"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto modal-scroll-container overscroll-contain flex-1">
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Manutenção registrada com sucesso! Despesa e histórico atualizados.</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Tipo de Serviço / Peça
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as MaintenanceType)}
              disabled={isReadOnlyMode}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-bold text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none"
            >
              {MAINTENANCE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} {t.intervalKm ? `(Revisão a cada ~${t.intervalKm.toLocaleString('pt-BR')} km)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
                KM Atual da Moto
              </label>
              <NumericInput
                mode="integer"
                min={0}
                value={km}
                onChange={(val) => handleKmChange(val)}
                disabled={isReadOnlyMode}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-bold text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
                Data do Serviço
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isReadOnlyMode}
                className="w-full flex items-center px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-bold text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none leading-normal [color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
                Custo Total (R$)
              </label>
              <CurrencyInput
                value={cost}
                onChange={(val) => setCost(val)}
                disabled={isReadOnlyMode}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-bold text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
                Próxima Troca (KM)
              </label>
              <NumericInput
                mode="integer"
                min={0}
                value={nextDueKm}
                onChange={(val) => setNextDueKm(val)}
                disabled={isReadOnlyMode}
                placeholder="Ex: 34500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-bold text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Descrição do Serviço / Marca da Peça
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnlyMode}
              placeholder="Ex: Óleo Mobil 10W30 + Filtro de combustível"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-medium text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Oficina / Mecânico Responsável
            </label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              disabled={isReadOnlyMode}
              placeholder="Ex: Oficina Central Motos / Mecânico Carlos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs font-medium text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9C9CA3] mb-1.5">
              Observações Adicionais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isReadOnlyMode}
              rows={2}
              placeholder="Ex: Nota fiscal nº 44102. Próxima troca recomendada com 1.500km ou 90 dias."
              className="w-full px-3.5 py-2 rounded-xl border border-[#2A2A2E] bg-[#121214] text-xs text-[#F2F1ED] focus:border-[#8B5CF6] focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2A2A2E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2A2A2E] text-xs font-semibold text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#121214] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isReadOnlyMode}
              className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-[#121214] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Registro Técnico
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
