import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Gauge, X, Plus, Calendar, Camera, Check } from 'lucide-react';
import { Moto } from '../../../types';
import { NumericInput } from '../../NumericInput';
import { ImageUploadInput } from '../../ImageUploadInput';
import { getTodayLocalDateString } from '../../../utils/formatters';

interface MotoNewKmModalProps {
  isOpen: boolean;
  moto: Moto | null;
  onClose: () => void;
  onConfirm: (motoId: string, km: number, notes?: string, photoUrl?: string) => void;
}

export const MotoNewKmModal: React.FC<MotoNewKmModalProps> = ({
  isOpen,
  moto,
  onClose,
  onConfirm,
}) => {
  const [km, setKm] = useState<number>(moto?.currentKm || 0);
  const [date, setDate] = useState<string>(getTodayLocalDateString());
  const [notes, setNotes] = useState<string>('Leitura periódica / medição de rotina');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  if (!isOpen || !moto || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (km < 0) {
      alert('Quilometragem inválida!');
      return;
    }
    onConfirm(moto.id, km, notes, photoUrl);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl shadow-black/80 space-y-4 my-auto animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nova Leitura de KM</h3>
              <p className="text-xs text-slate-400">
                {moto.brand} {moto.model} ({moto.plate})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informação Atual */}
        <div className="p-3.5 bg-[#090B10] rounded-xl border border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-slate-400">Quilometragem Atual do Sistema:</span>
          <span className="font-bold text-white font-mono text-sm">
            {moto.currentKm.toLocaleString('pt-BR')} km
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Nova Quilometragem (KM) *
            </label>
            <NumericInput
              mode="integer"
              min={0}
              value={km}
              onChange={(val) => setKm(val)}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all"
            />
            {km < moto.currentKm && (
              <p className="text-[11px] text-amber-400 mt-1">
                Atenção: O KM informado ({km}) é menor que o KM registrado anteriormente ({moto.currentKm}).
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Data da Leitura</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full flex items-center bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all leading-normal [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Observação / Motivo</label>
            <input
              type="text"
              placeholder="Ex: Medição semanal, troca de óleo, vistoria de rotina"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Foto do Painel (Opcional)</label>
            <ImageUploadInput
              label="Foto do Painel"
              value={photoUrl}
              themeColor="amber"
              onChange={(b64) => setPhotoUrl(b64)}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/[0.10] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Leitura</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
