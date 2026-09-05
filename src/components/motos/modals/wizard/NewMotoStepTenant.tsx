import React, { useState } from 'react';
import {
  User,
  MapPin,
  Search,
  Loader2,
  Phone,
  Mail,
  Camera,
  Trash2,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { maskCEPInput } from '../../../../utils/formatters';
import { MotoTenant } from '../../../../types';

interface NewMotoStepTenantProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  handleTenantPhotoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maskCPFInput: (v: string) => string;
  maskPhoneInput: (v: string) => string;
  existingTenants?: MotoTenant[];
}

export const NewMotoStepTenant: React.FC<NewMotoStepTenantProps> = ({
  form,
  setForm,
  handleTenantPhotoUpload,
  maskCPFInput,
  maskPhoneInput,
  existingTenants = [],
}) => {
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepMessage, setCepMessage] = useState<string | null>(null);
  const [tenantMode, setTenantMode] = useState<'new' | 'existing'>('new');

  const handleFetchCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setIsSearchingCep(true);
    setCepMessage(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepMessage('CEP não localizado.');
      } else {
        setForm((prev: any) => ({
          ...prev,
          tenantStreet: data.logradouro || prev.tenantStreet || '',
          tenantNeighborhood: data.bairro || prev.tenantNeighborhood || '',
          tenantCity: data.localidade || prev.tenantCity || '',
          tenantState: data.uf || prev.tenantState || '',
          tenantComplement: data.complemento || prev.tenantComplement || '',
        }));
        setCepMessage(`✓ ${data.localidade} - ${data.uf}`);
      }
    } catch {
      setCepMessage('Erro ao consultar CEP.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSelectExistingTenant = (tenantId: string) => {
    const t = existingTenants.find((item) => item.id === tenantId);
    if (!t) return;

    setForm((prev: any) => ({
      ...prev,
      selectedTenantId: t.id,
      tenantName: t.fullName,
      tenantCpf: t.cpf,
      tenantRg: t.rg || '',
      tenantBirthDate: t.birthDate || '',
      tenantPhone: t.phone || t.whatsapp || '',
      tenantEmail: t.email || '',
      tenantProfession: t.profession || '',
      tenantCompany: t.company || '',
      tenantIncome: t.income || 0,
      monthlyIncome: t.income || 0,
      tenantPhoto: t.photoUrl || t.documents?.photo || '',
      cnhCategory: t.cnh?.category || 'A',
      cnhNumber: t.cnh?.number || '',
      cnhExpiration: t.cnh?.expirationDate || '',
      tenantStreet: t.address || '',
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* CABEÇALHO DA ETAPA */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
            2
          </span>
          <span>Dados do Locatário (Condutor)</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Identificação Pessoal & Endereço
        </span>
      </div>

      {/* SELETOR DE MODO: NOVO CONDUTOR vs EXISTENTE */}
      {existingTenants.length > 0 && (
        <div className="p-3.5 bg-[#090B10] border border-white/[0.08] rounded-2xl flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">
              Vincular Condutor:
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTenantMode('new')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tenantMode === 'new'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Novo Condutor
            </button>
            <button
              type="button"
              onClick={() => setTenantMode('existing')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tenantMode === 'existing'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              Condutor Cadastrado
            </button>
          </div>
        </div>
      )}

      {tenantMode === 'existing' && existingTenants.length > 0 && (
        <div className="p-4 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Selecione o Condutor na Lista
          </label>
          <select
            value={form.selectedTenantId || ''}
            onChange={(e) => handleSelectExistingTenant(e.target.value)}
            className="h-11 w-full bg-[#0E111A] border border-white/[0.12] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">Selecione um locatário...</option>
            {existingTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} (CPF: {t.cpf})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CARD 1: DADOS PESSOAIS DO CONDUTOR */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Qualificação do Locatário</p>
            <p className="text-[11px] text-slate-400 truncate">
              Nome, contato, CPF e identificação civil
            </p>
          </div>
        </div>

        {/* Nome Completo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nome Completo do Condutor *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Carlos Eduardo de Souza"
            value={form.tenantName || ''}
            onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
            className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
          />
        </div>

        {/* Telefone e CPF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telefone / WhatsApp *
            </label>
            <input
              type="text"
              required
              placeholder="(11) 99999-9999"
              maxLength={15}
              value={form.tenantPhone || ''}
              onChange={(e) => setForm({ ...form, tenantPhone: maskPhoneInput(e.target.value) })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              CPF do Condutor *
            </label>
            <input
              type="text"
              required
              placeholder="000.000.000-00"
              maxLength={14}
              value={form.tenantCpf || ''}
              onChange={(e) => setForm({ ...form, tenantCpf: maskCPFInput(e.target.value) })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* E-mail e RG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              placeholder="locatario@email.com"
              value={form.tenantEmail || ''}
              onChange={(e) => setForm({ ...form, tenantEmail: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              RG / Órgão Emissor
            </label>
            <input
              type="text"
              placeholder="Ex: 12.345.678-9 SSP/SC"
              value={form.tenantRg || ''}
              onChange={(e) => setForm({ ...form, tenantRg: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Data de Nascimento & Estado Civil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={form.tenantBirthDate || ''}
              onChange={(e) => setForm({ ...form, tenantBirthDate: e.target.value })}
              className="h-11 w-full flex items-center bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 leading-normal [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estado Civil
            </label>
            <select
              value={form.tenantMaritalStatus || 'solteiro'}
              onChange={(e) => setForm({ ...form, tenantMaritalStatus: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] rounded-xl px-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="uniao_estavel">União Estável</option>
              <option value="viuvo">Viúvo(a)</option>
            </select>
          </div>
        </div>

        {/* Foto do Locatário */}
        <div className="pt-2 border-t border-white/[0.06]">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Foto do Condutor (Selfie / Perfil)
          </label>
          <div className="flex items-center gap-4">
            {form.tenantPhoto ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/[0.12] bg-[#0E111A] shrink-0 group">
                <img
                  src={form.tenantPhoto}
                  alt="Foto do condutor"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev: any) => ({ ...prev, tenantPhoto: '' }))}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity cursor-pointer"
                  title="Remover foto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-dashed border-white/[0.12] hover:border-emerald-500/50 bg-[#0E111A] hover:bg-emerald-500/[0.04] text-slate-400 hover:text-emerald-400 transition-all cursor-pointer shrink-0">
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleTenantPhotoUpload ||
                    ((e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm((prev: any) => ({ ...prev, tenantPhoto: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    })
                  }
                />
              </label>
            )}
            <div className="min-w-0 text-xs text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-300">Foto nítida do condutor</p>
              <p className="text-[11px]">Utilizada para identificação visual e segurança na entrega da moto.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: ENDEREÇO RESIDENCIAL */}
      <div className="p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Endereço Residencial do Condutor</p>
            <p className="text-[11px] text-slate-400 truncate">
              Busca automática por CEP e dados completos
            </p>
          </div>
        </div>

        {/* CEP com Busca Automática */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">CEP Residencial</label>
            {cepMessage && (
              <span
                className={`text-[11px] font-medium ${
                  cepMessage.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {cepMessage}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="00000-000"
              maxLength={9}
              value={form.tenantCep || ''}
              onChange={(e) => {
                const masked = maskCEPInput(e.target.value);
                setForm({ ...form, tenantCep: masked });
                if (masked.replace(/\D/g, '').length === 8) {
                  handleFetchCep(masked);
                }
              }}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl pl-3.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => handleFetchCep(form.tenantCep || '')}
              disabled={isSearchingCep}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/[0.04] transition-all cursor-pointer disabled:opacity-50"
              title="Buscar CEP"
            >
              {isSearchingCep ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Logradouro e Número */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Rua / Logradouro
            </label>
            <input
              type="text"
              placeholder="Ex: Av. Central"
              value={form.tenantStreet || ''}
              onChange={(e) => setForm({ ...form, tenantStreet: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Número
            </label>
            <input
              type="text"
              placeholder="Ex: 120"
              value={form.tenantNumber || ''}
              onChange={(e) => setForm({ ...form, tenantNumber: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Bairro, Cidade e UF */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bairro
            </label>
            <input
              type="text"
              placeholder="Bairro"
              value={form.tenantNeighborhood || ''}
              onChange={(e) => setForm({ ...form, tenantNeighborhood: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              placeholder="Cidade"
              value={form.tenantCity || ''}
              onChange={(e) => setForm({ ...form, tenantCity: e.target.value })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              UF
            </label>
            <input
              type="text"
              placeholder="SC"
              maxLength={2}
              value={form.tenantState || ''}
              onChange={(e) => setForm({ ...form, tenantState: e.target.value.toUpperCase() })}
              className="h-11 w-full bg-[#0E111A] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#121622] rounded-xl px-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans uppercase text-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
