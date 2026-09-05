import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileCheck2, X, Check, Camera } from 'lucide-react';
import { Moto, MotoDelivery } from '../../../types';
import { NumericInput } from '../../NumericInput';
import { ImageUploadInput } from '../../ImageUploadInput';
import { getTodayLocalDateString } from '../../../utils/formatters';

interface MotoDeliveryModalProps {
  isOpen: boolean;
  moto: Moto | null;
  onClose: () => void;
  onConfirm: (motoId: string, delivery: MotoDelivery) => void;
}

export const MotoDeliveryModal: React.FC<MotoDeliveryModalProps> = ({
  isOpen,
  moto,
  onClose,
  onConfirm,
}) => {
  const [initialKm, setInitialKm] = useState<number>(moto?.delivery?.initialKm || moto?.currentKm || 0);
  const [date, setDate] = useState<string>(moto?.delivery?.date || getTodayLocalDateString());
  const [stateNotes, setStateNotes] = useState<string>(
    moto?.delivery?.stateNotes ||
      'Veículo entregue em perfeito estado de conservação, pintura e funcionamento mecânico, com tanque cheio e documentação CRLV.'
  );
  const [frontPhoto, setFrontPhoto] = useState<string>(moto?.delivery?.photos[0] || moto?.photos.front || '');
  const [rearPhoto, setRearPhoto] = useState<string>(moto?.delivery?.photos[1] || moto?.photos.rear || '');
  const [dashboardPhoto, setDashboardPhoto] = useState<string>(moto?.delivery?.photos[2] || moto?.photos.dashboard || '');
  const [clientConfirmed, setClientConfirmed] = useState<boolean>(moto?.delivery?.clientConfirmed ?? true);

  if (!isOpen || !moto || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const photos = [frontPhoto, rearPhoto, dashboardPhoto].filter(Boolean);
    const deliveryData: MotoDelivery = {
      date,
      initialKm,
      photos,
      stateNotes,
      clientConfirmed,
    };
    onConfirm(moto.id, deliveryData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden my-auto animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] p-4 sm:p-5 shrink-0 bg-[#0E111A]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Vistoria de Entrega / Termo Inicial</h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 text-xs modal-scroll-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  KM Oficial de Saída / Entrega *
                </label>
                <NumericInput
                  mode="integer"
                  min={0}
                  value={initialKm}
                  onChange={(val) => setInitialKm(val)}
                  className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Data da Entrega *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full flex items-center bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all leading-normal [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Laudo do Estado Geral do Veículo
              </label>
              <textarea
                rows={3}
                value={stateNotes}
                onChange={(e) => setStateNotes(e.target.value)}
                className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all"
              />
            </div>

            {/* Fotos de Vistoria Inicial */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Fotos do Momento da Entrega
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <ImageUploadInput
                  label="Frente"
                  value={frontPhoto}
                  themeColor="amber"
                  onChange={(b64) => setFrontPhoto(b64)}
                />
                <ImageUploadInput
                  label="Traseira"
                  value={rearPhoto}
                  themeColor="amber"
                  onChange={(b64) => setRearPhoto(b64)}
                />
                <ImageUploadInput
                  label="Painel / KM"
                  value={dashboardPhoto}
                  themeColor="amber"
                  onChange={(b64) => setDashboardPhoto(b64)}
                />
              </div>
            </div>

            {/* Checkbox de Confirmação */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5">
              <input
                type="checkbox"
                id="clientConfirmedCheck"
                checked={clientConfirmed}
                onChange={(e) => setClientConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-white/[0.2] bg-[#090B10] cursor-pointer"
              />
              <label htmlFor="clientConfirmedCheck" className="text-xs text-amber-200 cursor-pointer font-medium">
                Locatário conferiu e deu ciência no estado de entrega do veículo.
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] p-4 bg-[#0E111A]/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/[0.10] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Vistoria de Entrega</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
