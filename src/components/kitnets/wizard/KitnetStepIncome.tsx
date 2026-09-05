import React from 'react';
import { FileText, CreditCard, Building, Home, Trash2, Upload } from 'lucide-react';
import { IncomeType } from '../../../types';
import { CurrencyInput } from '../../NumericInput';

interface KitnetStepIncomeProps {
  stepNumber?: number;
  incomeType: IncomeType;
  setIncomeType: (type: IncomeType) => void;
  incomeDetails: {
    companyOrActivity: string;
    roleOrProfession: string;
    monthlyIncome: number;
    cnpj: string;
  };
  setIncomeDetails: React.Dispatch<React.SetStateAction<any>>;
  documentsFiles: {
    photo?: string;
    proofOfIncome?: string;
    bankStatement?: string;
    socialContract?: string;
    proofOfAddress?: string;
  };
  handleDocUpload: (key: string, file: File) => void;
  handleRemoveDoc: (key: string) => void;
}

export const KitnetStepIncome: React.FC<KitnetStepIncomeProps> = ({
  stepNumber = 3,
  incomeType,
  setIncomeType,
  incomeDetails,
  setIncomeDetails,
  documentsFiles,
  handleDocUpload,
  handleRemoveDoc,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
            {stepNumber}
          </span>
          <span>Renda & Documentos do Inquilino</span>
        </div>
        <span className="text-xs text-slate-400">
          Upload e segurança cadastral
        </span>
      </div>

      {/* Tipo de Renda */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Tipo de Renda *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { type: 'CLT', label: 'CLT (Carteira Assinada)' },
            { type: 'autonomo', label: 'Autônomo / PJ' },
            { type: 'empresario', label: 'Empresário / Sócio' },
            { type: 'aposentado', label: 'Aposentado' },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setIncomeType(item.type as IncomeType)}
              className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                incomeType === item.type
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 font-bold ring-2 ring-emerald-500/25 shadow-md shadow-emerald-500/15'
                  : 'bg-[#090B10] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.20]'
              }`}
            >
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-5 rounded-2xl bg-[#090B10] border border-white/[0.08]">
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {incomeType === 'CLT'
              ? 'Empresa / Empregador'
              : incomeType === 'empresario'
              ? 'Razão Social / CNPJ'
              : 'Atividade / Ramo'}
          </label>
          <input
            type="text"
            placeholder="Nome da empresa ou atividade"
            value={incomeDetails.companyOrActivity}
            onChange={(e) =>
              setIncomeDetails({
                ...incomeDetails,
                companyOrActivity: e.target.value,
              })
            }
            className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0B0D13] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
          />
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Renda Mensal Declarada (R$)
          </label>
          <CurrencyInput
            value={incomeDetails.monthlyIncome}
            onChange={(val) =>
              setIncomeDetails({
                ...incomeDetails,
                monthlyIncome: val,
              })
            }
            className="w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0B0D13] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all font-mono"
          />
        </div>
      </div>

      {/* Uploads de Documentos */}
      <div className="space-y-3.5">
        <label className="block text-xs font-semibold text-slate-300">
          Upload de Documentos (Opcional)
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            { key: 'proofOfIncome', label: 'Holerite / Comprovante de Renda', icon: FileText },
            { key: 'bankStatement', label: 'Extrato Bancário', icon: CreditCard },
            { key: 'socialContract', label: 'Contrato Social / MEI', icon: Building },
            { key: 'proofOfAddress', label: 'Comprovante de Residência', icon: Home },
          ].map((docItem) => {
            const DocIcon = docItem.icon;
            const fileName = (documentsFiles as any)[docItem.key];
            const docInputId = `doc-upload-${docItem.key}`;

            return (
              <div
                key={docItem.key}
                className="p-4 rounded-2xl bg-[#090B10] border border-white/[0.08] flex items-center justify-between gap-3.5 hover:border-white/[0.16] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <DocIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">
                      {docItem.label}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {fileName ? `Anexo: ${fileName}` : 'Nenhum arquivo'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {fileName ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(docItem.key)}
                      className="p-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 transition-colors cursor-pointer"
                      title="Remover Anexo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <label
                      htmlFor={docInputId}
                      className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-xs text-slate-200 hover:text-white font-semibold flex items-center gap-1.5 transition-all border border-white/[0.10]"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Anexar</span>
                    </label>
                  )}
                </div>

                <input
                  id={docInputId}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleDocUpload(docItem.key, file);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
