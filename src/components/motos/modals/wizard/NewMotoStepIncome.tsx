import React from 'react';
import {
  FileCheck,
  CreditCard,
  Briefcase,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  DollarSign,
  Building2,
  Calendar,
} from 'lucide-react';
import { getCNHStatus } from '../../../../utils/formatters';
import { CurrencyInput } from '../../../NumericInput';

interface NewMotoStepIncomeProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleDocUpload?: (key: string, file: File) => void;
  handleRemoveDoc?: (key: string) => void;
  handleTenantPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NewMotoStepIncome: React.FC<NewMotoStepIncomeProps> = ({
  form,
  setForm,
}) => {
  const cnhStatus = form.cnhExpiration ? getCNHStatus(form.cnhExpiration) : null;

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Se for imagem, converter para base64 para preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({
          ...prev,
          documents: {
            ...(prev.documents || {}),
            [key]: reader.result as string,
          },
          [key]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev: any) => ({
        ...prev,
        documents: {
          ...(prev.documents || {}),
          [key]: file.name,
        },
      }));
    }
  };

  const handleRemoveFile = (key: string) => {
    setForm((prev: any) => {
      const updatedDocs = { ...(prev.documents || {}) };
      delete updatedDocs[key];
      const updated = { ...prev, documents: updatedDocs };
      if (updated[key]) delete updated[key];
      return updated;
    });
  };

  const INCOME_TYPES = [
    { value: 'app', label: 'Entregador de App (iFood / Rappi)', desc: 'Ganhos por corrida e repasse' },
    { value: 'clt', label: 'CLT (Carteira Assinada)', desc: 'Holerite ou contracheque' },
    { value: 'autonomo', label: 'Autônomo / Prestador', desc: 'Extrato bancário ou DECORE' },
    { value: 'mei', label: 'MEI / PJ', desc: 'Comprovante MEI e faturamento' },
    { value: 'outro', label: 'Outro', desc: 'Outras fontes de receita' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            3
          </span>
          <span>CNH, Renda & Documentação</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Habilitação e Análise Cadastral
        </span>
      </div>

      {/* CARD 1: CNH DO CONDUTOR */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Carteira Nacional de Habilitação (CNH)</p>
              <p className="text-[11px] text-slate-400">Verificação obrigatória para condução de motocicletas</p>
            </div>
          </div>

          {cnhStatus && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                cnhStatus.status === 'valida'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : cnhStatus.status === 'vencendo'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {cnhStatus.status === 'valida' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {cnhStatus.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Categoria CNH */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Categoria CNH *
            </label>
            <select
              value={form.cnhCategory || 'A'}
              onChange={(e) => setForm({ ...form, cnhCategory: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans cursor-pointer"
            >
              <option value="A">Categoria A (Exclusiva para Motos)</option>
              <option value="AB">Categoria AB (Carro e Moto)</option>
              <option value="AC">Categoria AC</option>
              <option value="AD">Categoria AD</option>
              <option value="AE">Categoria AE</option>
            </select>
          </div>

          {/* Número do Registro da CNH */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nº do Registro da CNH *
            </label>
            <input
              type="text"
              required
              placeholder="00000000000"
              maxLength={11}
              value={form.cnhNumber || ''}
              onChange={(e) =>
                setForm({ ...form, cnhNumber: e.target.value.replace(/\D/g, '') })
              }
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          {/* Data de Validade da CNH */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Validade da CNH *
            </label>
            <input
              type="date"
              required
              value={form.cnhExpiration || ''}
              onChange={(e) => setForm({ ...form, cnhExpiration: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: RENDA & ATIVIDADE PROFISSIONAL */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Comprovação de Renda & Atividade</p>
            <p className="text-[11px] text-slate-400">Origem de receita do locatário para garantia de solvência</p>
          </div>
        </div>

        {/* Tipo de Renda / Ocupação */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Tipo de Atividade / Renda
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {INCOME_TYPES.map((t) => {
              const isSelected = (form.incomeType || 'app') === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, incomeType: t.value })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white ring-1 ring-emerald-500/30'
                      : 'bg-[#0E111A] border-white/[0.08] text-slate-300 hover:border-white/[0.18]'
                  }`}
                >
                  <p className="text-xs font-bold">{t.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Empresa / Plataforma */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Empresa / Aplicativos de Entrega
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: iFood, Rappi, Loggi, Zé Delivery..."
                value={form.companyOrActivity || form.tenantCompany || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    companyOrActivity: e.target.value,
                    tenantCompany: e.target.value,
                  })
                }
                className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl pl-10 pr-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Renda Mensal Declarada */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Renda Mensal Média Comprovada (R$)
            </label>
            <CurrencyInput
              value={form.monthlyIncome || form.tenantIncome || 0}
              onChange={(val) =>
                setForm({ ...form, monthlyIncome: val, tenantIncome: val })
              }
              placeholder="R$ 0,00"
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>
        </div>
      </div>

      {/* CARD 3: ANEXOS & DOCUMENTOS DIGITAIS */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Anexos & Documentos do Condutor</p>
            <p className="text-[11px] text-slate-400">Arquivos anexados ao cadastro e prontos para consulta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Documento 1: Foto da CNH */}
          <div className="p-3.5 rounded-xl bg-[#0E111A] border border-white/[0.08] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">CNH (Frente / Verso)</span>
                {form.cnhPhoto || form.documents?.cnh ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Anexado
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Opcional</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Foto nítida da habilitação física ou print da CNH Digital</p>
            </div>

            {form.cnhPhoto || form.documents?.cnh ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-emerald-300 font-medium truncate">Documento pronto</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('cnh')}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 border border-white/[0.10] cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anexar CNH</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload('cnh', e)}
                />
              </label>
            )}
          </div>

          {/* Documento 2: Comprovante de Residência */}
          <div className="p-3.5 rounded-xl bg-[#0E111A] border border-white/[0.08] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Comprovante Residência</span>
                {form.proofOfAddress || form.documents?.proofOfAddress ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Anexado
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Opcional</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Conta de luz, água ou fatura recente em nome do condutor</p>
            </div>

            {form.proofOfAddress || form.documents?.proofOfAddress ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-emerald-300 font-medium truncate">Comprovante OK</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('proofOfAddress')}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 border border-white/[0.10] cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anexar Residência</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload('proofOfAddress', e)}
                />
              </label>
            )}
          </div>

          {/* Documento 3: Extrato / Comprovante de Renda */}
          <div className="p-3.5 rounded-xl bg-[#0E111A] border border-white/[0.08] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">Extrato de Ganhos / Renda</span>
                {form.proofOfIncome || form.documents?.proofOfIncome ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Anexado
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Opcional</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Print do extrato dos apps de entrega ou holerite</p>
            </div>

            {form.proofOfIncome || form.documents?.proofOfIncome ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-emerald-300 font-medium truncate">Renda anexada</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile('proofOfIncome')}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 border border-white/[0.10] cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anexar Extrato</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload('proofOfIncome', e)}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
