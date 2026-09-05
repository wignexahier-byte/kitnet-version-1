import React from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  LogOut,
  X,
  Camera,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Moto, MotoContract, MotoTenant } from '../../../types';
import { NumericInput } from '../../NumericInput';
import { generateMotoRentalContractPdfFile } from '../../../utils/pdfGenerator';
import { monthlyToWeekly, weeklyToMonthly } from '../../../domain';

// Modal: Confirmar Exclusão de Moto
interface DeleteMotoConfirmModalProps {
  moto: Moto | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteMotoConfirmModal: React.FC<DeleteMotoConfirmModalProps> = ({
  moto,
  onClose,
  onConfirm,
}) => {
  if (!moto || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-black/80 space-y-4 my-auto animate-modal-enter">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-bold text-white">
            Apagar Moto {moto.brand} {moto.model}?
          </h3>
          <p className="text-xs text-slate-400">
            Placa: <strong className="text-white font-mono">{moto.plate}</strong> • Renavam:{' '}
            <span className="font-mono text-slate-300">{moto.renavam || 'N/A'}</span>
          </p>
          <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-xl text-left text-xs text-rose-300 space-y-1.5">
            <p className="font-semibold text-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Atenção:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-300/90 pl-1">
              <li>Esta ação é permanente e não poderá ser desfeita.</li>
              <li>Contratos, parcelas e históricos vinculados a este veículo serão removidos.</li>
              {moto.status === 'alugada' && (
                <li className="font-bold text-amber-300">
                  Esta moto possui locação ativa! Finalize a locação antes ou confirme a exclusão total.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/[0.10] rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            Confirmar e Apagar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal: Finalizar Locação de Moto
interface TerminateMotoModalProps {
  data: { moto: Moto; contract: MotoContract } | null;
  form: { finalKm: number; notes: string };
  setForm: React.Dispatch<React.SetStateAction<{ finalKm: number; notes: string }>>;
  onClose: () => void;
  onConfirm: () => void;
  formatCurrency: (value: number) => string;
}

export const TerminateMotoModal: React.FC<TerminateMotoModalProps> = ({
  data,
  form,
  setForm,
  onClose,
  onConfirm,
  formatCurrency,
}) => {
  if (!data || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-black/80 space-y-4 my-auto animate-modal-enter">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <h3 className="text-base font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Finalizar Locação / Devolução</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-[#090B10] rounded-xl border border-white/[0.08] space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Moto:</span>
            <span className="font-bold text-white">
              {data.moto.brand} {data.moto.model} ({data.moto.plate})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Contrato:</span>
            <span className="text-slate-200">
              {data.contract.durationMonths} meses • {formatCurrency(data.contract.monthlyValue)}/mês
            </span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              KM Final de Devolução (KM atual: {data.moto.currentKm})
            </label>
            <NumericInput
              mode="integer"
              min={0}
              value={form.finalKm || data.moto.currentKm}
              onChange={(val) => setForm({ ...form, finalKm: val })}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações da Entrega / Devolução
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition-all"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed">
            Ao finalizar, o contrato será marcado como <strong>finalizado</strong> e a moto voltará a ficar com status <strong>Disponível</strong> para novos contratos.
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white border border-white/[0.10] rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Confirmar Finalização
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal: Lightbox de Foto
interface PhotoLightboxModalProps {
  photo: { url: string; title: string } | null;
  onClose: () => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({ photo, onClose }) => {
  if (!photo || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 my-auto animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#0E111A]/90 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{photo.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.10] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-black/70 min-h-[300px] max-h-[75vh] overflow-hidden">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
        <div className="p-4 bg-[#0E111A]/90 border-t border-white/[0.08] flex justify-between items-center text-xs text-slate-400">
          <span>Clique fora para fechar</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.10] rounded-xl transition-all font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal: Sucesso do Cadastro & Gerar Contrato Oficial
interface NewContractSuccessModalProps {
  data: {
    moto: Moto;
    tenant: MotoTenant;
    contract: MotoContract;
  } | null;
  onClose: () => void;
  settings: any;
  formatCurrency: (value: number) => string;
  formatCPF: (cpf: string) => string;
}

export const NewContractSuccessModal: React.FC<NewContractSuccessModalProps> = ({
  data,
  onClose,
  settings,
  formatCurrency,
  formatCPF,
}) => {
  if (!data || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#0B0D13] border border-amber-500/30 rounded-2xl sm:rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-black/90 space-y-5 animate-scaleUp">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/15 rounded-2xl text-amber-400 border border-amber-500/30 shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cadastro Concluído com Sucesso!</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Moto e locatário cadastrados e vinculados no sistema.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Motocicleta:</span>
            <span className="font-semibold text-white">
              {data.moto.brand} {data.moto.model} ({data.moto.plate || 'S/ Placa'})
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Locatário:</span>
            <span className="font-semibold text-amber-400">
              {data.tenant.fullName}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>CPF:</span>
            <span className="font-mono text-white">
              {formatCPF(data.tenant.cpf)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Frequência / Valor:</span>
            <span className="font-semibold text-emerald-400">
              {data.contract.paymentFrequency === 'semanal'
                ? `${formatCurrency(data.contract.weeklyValue || (data.contract.monthlyValue ? monthlyToWeekly(data.contract.monthlyValue) : (data.contract.installments?.[0]?.amount || 0)))} / semana`
                : `${formatCurrency(data.contract.monthlyValue || (data.contract.weeklyValue ? weeklyToMonthly(data.contract.weeklyValue) : (data.contract.installments?.[0]?.amount || 0)))} / mês`}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => {
              generateMotoRentalContractPdfFile({
                moto: data.moto,
                tenant: data.tenant,
                contract: data.contract,
                settings,
                startDate: data.contract.startDate,
                weeklyValue:
                  data.contract.weeklyValue ||
                  (data.contract.monthlyValue ? monthlyToWeekly(data.contract.monthlyValue) : 0),
                dueDayOfWeek:
                  data.contract.dueDayOfWeek !== undefined
                    ? ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][
                        data.contract.dueDayOfWeek
                      ]
                    : 'Segunda-feira',
                dueLimitTime: '18:00',
                deposit: data.contract.deposit || 0,
                insuranceDeductible: data.contract.insuranceDeductible || '0,00',
                contractCity: settings.cityState || 'são jose - SC',
                initialKm:
                  data.moto.delivery?.initialKm ||
                  data.moto.currentKm ||
                  0,
                autoDownload: true,
              });
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Gerar Contrato de Locação (Baixar PDF)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 hover:text-white font-semibold border border-white/[0.10] rounded-xl text-xs transition-all cursor-pointer"
          >
            Fechar e Ver Moto Cadastrada
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
