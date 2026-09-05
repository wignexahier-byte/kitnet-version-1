import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { NumericInput } from '../../NumericInput';

interface KitnetStepContractTermsProps {
  stepNumber?: number;
  contractTerms: {
    signatureDate: string;
    startDate: string;
    durationOption: number | 'custom';
    customMonths: number;
    endDate: string;
  };
  setContractTerms: React.Dispatch<React.SetStateAction<any>>;
}

export const KitnetStepContractTerms: React.FC<KitnetStepContractTermsProps> = ({
  stepNumber = 4,
  contractTerms,
  setContractTerms,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
            {stepNumber}
          </span>
          <span>Vigência e Prazos do Contrato</span>
        </div>
        <span className="text-xs text-slate-400">
          Cálculo automático de datas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Data da Assinatura *
          </label>
          <input
            type="date"
            value={contractTerms.signatureDate}
            onChange={(e) =>
              setContractTerms({
                ...contractTerms,
                signatureDate: e.target.value,
              })
            }
            className="w-full flex items-center bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all leading-normal [color-scheme:dark]"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Data de Início da Locação *
          </label>
          <input
            type="date"
            value={contractTerms.startDate}
            onChange={(e) =>
              setContractTerms({
                ...contractTerms,
                startDate: e.target.value,
              })
            }
            className="w-full flex items-center bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all leading-normal [color-scheme:dark]"
          />
        </div>

        {/* Prazo */}
        <div className="sm:col-span-12">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Duração da Locação *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { val: 6, label: '6 meses' },
              { val: 12, label: '12 meses (Padrão)' },
              { val: 24, label: '24 meses' },
              { val: 'custom', label: 'Personalizado' },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() =>
                  setContractTerms({
                    ...contractTerms,
                    durationOption: opt.val as any,
                  })
                }
                className={`p-2.5 sm:p-3 rounded-xl border text-center flex items-center justify-center transition-all cursor-pointer ${
                  contractTerms.durationOption === opt.val
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-bold ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/15'
                    : 'bg-[#090B10] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.20]'
                }`}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {contractTerms.durationOption === 'custom' && (
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Número de Meses
            </label>
            <NumericInput
              mode="integer"
              min={1}
              max={60}
              value={contractTerms.customMonths}
              onChange={(val) =>
                setContractTerms({
                  ...contractTerms,
                  customMonths: val,
                })
              }
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>
        )}

        {/* Card de Data de Término */}
        <div className="sm:col-span-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0E111A] to-teal-500/10 border border-emerald-500/20 flex items-center justify-between shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Data de Término Calculada
              </div>
              <div className="text-sm sm:text-base font-bold text-white tracking-wide">
                {formatDate(contractTerms.endDate)}
              </div>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            {contractTerms.durationOption === 'custom'
              ? `${contractTerms.customMonths} meses`
              : `${contractTerms.durationOption} meses`}
          </span>
        </div>
      </div>
    </div>
  );
};
