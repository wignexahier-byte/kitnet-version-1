import React from 'react';
import { User, Camera, Upload, Trash2 } from 'lucide-react';
import { KitnetTenant } from '../../../types';
import { formatCPF, formatPhone } from '../../../utils/formatters';

interface KitnetStepTenantProps {
  stepNumber?: number;
  tenantMode: 'new' | 'existing';
  setTenantMode: (mode: 'new' | 'existing') => void;
  selectedTenantId: string;
  setSelectedTenantId: (id: string) => void;
  kitnetTenants: KitnetTenant[];
  tenantData: {
    fullName: string;
    cpf: string;
    rg: string;
    birthDate: string;
    phone: string;
    whatsapp: string;
    email: string;
    photoUrl: string;
    maritalStatus: 'solteiro' | 'casado' | 'uniao_estavel' | 'divorciado' | 'viuvo';
    profession: string;
  };
  setTenantData: React.Dispatch<React.SetStateAction<any>>;
  handleTenantPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemovePhoto: () => void;
}

export const KitnetStepTenant: React.FC<KitnetStepTenantProps> = ({
  stepNumber = 2,
  tenantMode,
  setTenantMode,
  selectedTenantId,
  setSelectedTenantId,
  kitnetTenants,
  tenantData,
  setTenantData,
  handleTenantPhotoUpload,
  onRemovePhoto,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5 text-white font-bold text-sm sm:text-base">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
            {stepNumber}
          </span>
          <span>Qualificação do Inquilino</span>
        </div>
        <span className="text-xs text-slate-400">
          Dados pessoais para o contrato
        </span>
      </div>

      {/* Mode Toggle */}
      <div className="flex p-1 bg-[#090B10] border border-white/[0.08] rounded-xl max-w-sm">
        <button
          type="button"
          onClick={() => setTenantMode('new')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tenantMode === 'new'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          + Novo Inquilino
        </button>
        <button
          type="button"
          onClick={() => setTenantMode('existing')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tenantMode === 'existing'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Selecionar Cadastrado
        </button>
      </div>

      {tenantMode === 'existing' ? (
        <div className="space-y-3 p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl">
          <label className="block text-xs font-semibold text-slate-300">
            Selecione o Inquilino *
          </label>
          {kitnetTenants.length > 0 ? (
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full bg-[#0E111A] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            >
              <option value="">-- Escolha um inquilino --</option>
              {kitnetTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} • CPF: {formatCPF(t.cpf)} • {t.phone}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-5 rounded-xl bg-[#0E111A] text-slate-400 text-xs text-center border border-white/[0.08]">
              Nenhum inquilino cadastrado previamente. Clique na aba "+ Novo Inquilino" acima.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Foto do Inquilino */}
          <div className="sm:col-span-12 p-4 sm:p-5 bg-[#090B10] border border-white/[0.08] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              {tenantData.photoUrl ? (
                <img
                  src={tenantData.photoUrl}
                  alt="Foto do Inquilino"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0E111A] border border-white/[0.10] flex flex-col items-center justify-center text-slate-400 gap-1 shadow-inner">
                  <User className="w-7 h-7 text-emerald-400/80" />
                  <span className="text-[10px] text-slate-500">Sem foto</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-white">Foto de Perfil do Inquilino</span>
                <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Opcional
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tire uma foto ou selecione da galeria para identificação na ficha e no contrato.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <label
                  className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                  title="Tirar foto com a câmera"
                  aria-label="Tirar foto com a câmera"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleTenantPhotoUpload}
                    className="hidden"
                  />
                </label>

                <label
                  className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-slate-200 border border-white/[0.10] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  title="Escolher foto da galeria"
                  aria-label="Escolher foto da galeria"
                >
                  <Upload className="w-4 h-4 text-slate-300" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTenantPhotoUpload}
                    className="hidden"
                  />
                </label>

                {tenantData.photoUrl && (
                  <button
                    type="button"
                    onClick={onRemovePhoto}
                    className="w-9 h-9 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-rose-500/20"
                    title="Remover foto"
                    aria-label="Remover foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva"
              value={tenantData.fullName}
              onChange={(e) => setTenantData({ ...tenantData, fullName: e.target.value })}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              CPF *
            </label>
            <input
              type="text"
              required
              placeholder="000.000.000-00"
              value={tenantData.cpf}
              onChange={(e) =>
                setTenantData({ ...tenantData, cpf: formatCPF(e.target.value) })
              }
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              RG / Doc Identidade
            </label>
            <input
              type="text"
              placeholder="Número do RG"
              value={tenantData.rg}
              onChange={(e) => setTenantData({ ...tenantData, rg: e.target.value })}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={tenantData.birthDate}
              onChange={(e) => setTenantData({ ...tenantData, birthDate: e.target.value })}
              className="w-full flex items-center bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all leading-normal [color-scheme:dark]"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estado Civil
            </label>
            <select
              value={tenantData.maritalStatus}
              onChange={(e) =>
                setTenantData({
                  ...tenantData,
                  maritalStatus: e.target.value as any,
                })
              }
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            >
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="uniao_estavel">União Estável</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telefone Principal
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={tenantData.phone}
              onChange={(e) =>
                setTenantData({ ...tenantData, phone: formatPhone(e.target.value) })
              }
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              WhatsApp para Cobrança
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={tenantData.whatsapp}
              onChange={(e) =>
                setTenantData({ ...tenantData, whatsapp: formatPhone(e.target.value) })
              }
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={tenantData.email}
              onChange={(e) => setTenantData({ ...tenantData, email: e.target.value })}
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>

          <div className="sm:col-span-12">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Profissão / Ocupação
            </label>
            <input
              type="text"
              placeholder="Ex: Comerciante, Analista, Motorista..."
              value={tenantData.profession}
              onChange={(e) =>
                setTenantData({ ...tenantData, profession: e.target.value })
              }
              className="w-full bg-[#090B10] border border-white/[0.12] hover:border-white/[0.20] focus:bg-[#0E111A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
