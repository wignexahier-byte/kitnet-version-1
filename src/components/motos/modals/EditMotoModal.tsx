import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Check, Motorbike, AlertTriangle, User, Calendar, FileSpreadsheet } from 'lucide-react';
import { Moto, MotoStatus } from '../../../types';
import { NewMotoStepVehicle } from './wizard/NewMotoStepVehicle';
import { NewMotoStepTenant } from './wizard/NewMotoStepTenant';
import { NewMotoStepContract } from './wizard/NewMotoStepContract';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export interface EditMotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  motoToEdit: Moto | null;
  form: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    renavam: string;
    chassi: string;
    purchaseDate: string;
    purchasePrice: number;
    currentKm: number;
    status: MotoStatus;
    statusNote?: string;
    frontPhoto: string;
    rearPhoto: string;
    rightSidePhoto: string;
    leftSidePhoto: string;
    dashboardPhoto: string;
    tenantName?: string;
    tenantCpf?: string;
    tenantRg?: string;
    tenantPhone?: string;
    tenantEmail?: string;
    tenantCep?: string;
    tenantStreet?: string;
    tenantNumber?: string;
    tenantNeighborhood?: string;
    tenantCity?: string;
    tenantState?: string;
    tenantComplement?: string;
    tenantProfession?: string;
    tenantPhoto?: string;
    cnhCategory?: string;
    cnhNumber?: string;
    cnhExpiration?: string;
    durationMonths?: number;
    paymentFrequency?: 'mensal' | 'semanal';
    startDate?: string;
    dueDay?: number;
    dueDayOfWeek?: number;
    monthlyValue?: number;
    weeklyValue?: number;
    totalAgreedValue?: number;
    deposit?: number;
    depositStatus?: 'retida' | 'devolvida' | 'a_definir';
    insuranceDeductible?: number | string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleTenantPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maskCPFInput: (v: string) => string;
  maskPhoneInput: (v: string) => string;
  isPlateCorruptedOrInvalid?: (plate: string) => boolean;
}

export const EditMotoModal: React.FC<EditMotoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  motoToEdit,
  form,
  setForm,
  handleTenantPhotoUpload,
  maskCPFInput,
  maskPhoneInput,
  isPlateCorruptedOrInvalid,
}) => {
  const [activeTab, setActiveTab] = useState<'vehicle' | 'tenant' | 'contract'>('vehicle');

  const isAlugada = form.status === 'alugada';

  React.useEffect(() => {
    if (!isAlugada && activeTab !== 'vehicle') {
      setActiveTab('vehicle');
    }
  }, [isAlugada, activeTab]);

  if (!isOpen || !motoToEdit || typeof document === 'undefined') return null;

  const isCorrupted = isPlateCorruptedOrInvalid ? isPlateCorruptedOrInvalid(motoToEdit.plate) : false;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-hidden animate-fadeIn font-sans touch-pan-y w-full max-w-full"
      style={{ overflowX: 'hidden', touchAction: 'pan-y' }}
    >
      <div className="bg-[#0B0D13] border border-white/[0.12] rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto animate-modal-enter min-w-0">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0E111A]/90 backdrop-blur-sm shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-colors ${
                form.status === 'alugada'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : form.status === 'manutencao'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
              }`}
            >
              <Motorbike className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                  Editar: {motoToEdit.brand} {motoToEdit.model}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold uppercase ${
                    isCorrupted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-white/[0.08] text-slate-300 border border-white/[0.10]'
                  }`}
                >
                  {motoToEdit.plate || 'SEM PLACA'}
                </span>
                {isCorrupted && (
                  <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Placa corrompida
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                {isAlugada
                  ? 'Atualize as especificações da moto, condutor ou plano financeiro'
                  : 'Atualize as especificações da moto e status operacional'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.10] transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação (Apenas quando alugada) */}
        {isAlugada && (
          <div className="bg-[#090B10] border-b border-white/[0.08] px-3 sm:px-5 py-2.5 shrink-0 animate-fadeIn">
            <div className="flex p-1 bg-[#0E111A] border border-white/[0.08] rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('vehicle')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'vehicle'
                    ? form.status === 'alugada'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : form.status === 'manutencao'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Motorbike className="w-3.5 h-3.5" />
                <span>1. Veículo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tenant')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'tenant'
                    ? form.status === 'alugada'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : form.status === 'manutencao'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>2. Locatário</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contract')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'contract'
                    ? form.status === 'alugada'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : form.status === 'manutencao'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>3. Contrato</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden w-full max-w-full">
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-w-0"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          >
            {activeTab === 'vehicle' && <NewMotoStepVehicle form={form} setForm={setForm} />}

            {isAlugada && activeTab === 'tenant' && (
              <NewMotoStepTenant
                form={form}
                setForm={setForm}
                handleTenantPhotoUpload={handleTenantPhotoUpload || (() => {})}
                maskCPFInput={maskCPFInput}
                maskPhoneInput={maskPhoneInput}
              />
            )}

            {isAlugada && activeTab === 'contract' && (
              <NewMotoStepContract
                form={form}
                setForm={setForm}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/[0.08] flex items-center justify-between bg-[#0E111A]/95 backdrop-blur-sm shrink-0 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 transition-all cursor-pointer flex items-center gap-2 shadow-lg active:scale-[0.99] ${
                form.status === 'alugada'
                  ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                  : form.status === 'manutencao'
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                  : 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
