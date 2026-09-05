import React, { useState } from 'react';
import { User, CheckCircle2, Save, QrCode, Building, Phone, Mail, MapPin, DollarSign, UserCheck, Copy, Check } from 'lucide-react';
import { SystemSettings } from '../../types';

interface SettingsLocadorSectionProps {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const SettingsLocadorSection: React.FC<SettingsLocadorSectionProps> = ({
  settings,
  updateSettings,
}) => {
  const [adminForm, setAdminForm] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  const handleCopyPix = () => {
    if (!adminForm.adminPixKey) return;
    navigator.clipboard.writeText(adminForm.adminPixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const formattedCityState =
      adminForm.adminCity && adminForm.adminState
        ? `${adminForm.adminCity}, ${adminForm.adminState}`
        : adminForm.cityState || 'Barra Velha, Santa Catarina';

    const updated = {
      ...adminForm,
      cityState: formattedCityState,
    };
    updateSettings(updated);
    setAdminForm(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSaving(false);
    }, 2500);
  };

  return (
    <div className="rounded-2xl bg-[#11141e]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl shadow-black/30 space-y-5 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Dados do Locador & PIX
            </h3>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full shadow-xs">
          Contratos & Recibos
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Preenchimento automático utilizado em contratos, laudos de vistoria e cobranças via PIX e WhatsApp.
      </p>

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
        {/* Nome do Locador */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Nome Completo do Locador / Proprietário
          </label>
          <input
            type="text"
            required
            value={adminForm.adminName}
            onChange={(e) => setAdminForm({ ...adminForm, adminName: e.target.value })}
            className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 font-semibold outline-hidden transition-all placeholder:text-slate-600"
            placeholder="Wigne Leal Xavier Macedo"
          />
        </div>

        {/* CPF e Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              CPF do Locador
            </label>
            <input
              type="text"
              required
              value={adminForm.adminCpf}
              onChange={(e) => setAdminForm({ ...adminForm, adminCpf: e.target.value })}
              className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden transition-all font-mono placeholder:text-slate-600"
              placeholder="155.521.029-59"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Telefone / WhatsApp Oficial
            </label>
            <input
              type="text"
              required
              value={adminForm.adminPhone}
              onChange={(e) => setAdminForm({ ...adminForm, adminPhone: e.target.value })}
              className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden transition-all font-mono placeholder:text-slate-600"
              placeholder="(47) 99123-4567"
            />
          </div>
        </div>

        {/* E-mail e Chave PIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              E-mail Oficial
            </label>
            <input
              type="email"
              required
              value={adminForm.adminEmail}
              onChange={(e) => setAdminForm({ ...adminForm, adminEmail: e.target.value })}
              className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden transition-all font-mono placeholder:text-slate-600"
              placeholder="wleal0131@gmail.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                Chave PIX para Recebimentos
              </label>
              {adminForm.adminPixKey && (
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedPix ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={adminForm.adminPixKey}
                onChange={(e) => setAdminForm({ ...adminForm, adminPixKey: e.target.value })}
                className="w-full bg-[#0b0d14] border border-emerald-500/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-emerald-300 font-mono font-bold outline-hidden transition-all placeholder:text-slate-600"
                placeholder="wleal0131@gmail.com"
              />
            </div>
          </div>
        </div>

        {/* Cidade, Estado, CEP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              Cidade
            </label>
            <input
              type="text"
              required
              value={adminForm.adminCity || 'Barra Velha'}
              onChange={(e) => setAdminForm({ ...adminForm, adminCity: e.target.value })}
              className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden transition-all placeholder:text-slate-600"
              placeholder="Barra Velha"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              Estado
            </label>
            <input
              type="text"
              required
              value={adminForm.adminState || 'Santa Catarina'}
              onChange={(e) => setAdminForm({ ...adminForm, adminState: e.target.value })}
              className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden transition-all placeholder:text-slate-600"
              placeholder="Santa Catarina"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              CEP
            </label>
            <input
              type="text"
              required
              value={adminForm.adminCep || '88390-000'}
              onChange={(e) => setAdminForm({ ...adminForm, adminCep: e.target.value })}
              className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono outline-hidden transition-all placeholder:text-slate-600"
              placeholder="88390-000"
            />
          </div>
        </div>

        {/* Endereço Completo */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Endereço Completo do Imóvel / Sede
          </label>
          <input
            type="text"
            required
            value={adminForm.adminAddress}
            onChange={(e) => setAdminForm({ ...adminForm, adminAddress: e.target.value })}
            className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden transition-all placeholder:text-slate-600"
            placeholder="Rua André Avelino Schmitt, 647, Itajubá, Barra Velha, Santa Catarina - CEP 88390-000"
          />
        </div>

        {/* Representante Legal */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            Representante Legal
          </label>
          <input
            type="text"
            value={adminForm.representativeName || 'Wigne Leal Xavier Macedo'}
            onChange={(e) => setAdminForm({ ...adminForm, representativeName: e.target.value })}
            className="w-full bg-[#0b0d14] border border-white/[0.08] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-slate-100 outline-hidden placeholder:text-slate-600"
            placeholder="Nome do representante legal"
          />
        </div>

        {/* Feedback de sucesso */}
        {savedSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-2.5 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Dados de {adminForm.adminName} atualizados e salvos com sucesso!</span>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 cursor-pointer transition-all shadow-lg shadow-violet-600/25 disabled:opacity-75"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Dados do Locador'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

