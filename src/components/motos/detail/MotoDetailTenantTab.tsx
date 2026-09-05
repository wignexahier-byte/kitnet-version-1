import React, { useRef, useState } from 'react';
import { Moto, MotoTenant } from '../../../types';
import { User, ZoomIn, Trash2, Camera, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface MotoDetailTenantTabProps {
  moto: Moto;
  tenant?: MotoTenant;
  formatCurrency: (value: number) => string;
  formatCPF: (cpf: string) => string;
  formatPhone: (phone: string) => string;
  getCNHStatus: (expirationDate: string) => { label: string; badgeClass: string };
  setSelectedPhotoPreview: (data: { url: string; title: string }) => void;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
}

export const MotoDetailTenantTab: React.FC<MotoDetailTenantTabProps> = ({
  moto,
  tenant,
  formatCurrency,
  formatCPF,
  formatPhone,
  getCNHStatus,
  setSelectedPhotoPreview,
  onOpenClientProfile,
}) => {
  const { updateMotoTenant, addTimelineEvent } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleClientPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      updateMotoTenant(tenant.id, {
        photoUrl: base64Data,
        documents: {
          ...tenant.documents,
          photo: base64Data,
        },
      });
      addTimelineEvent({
        type: 'ocorrencia_cliente',
        title: `Foto do locatário atualizada`,
        description: `Foto de perfil atualizada para ${tenant.fullName} (Moto ${moto.plate})`,
        entityType: 'cliente',
        entityId: tenant.id,
      });
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      alert('Erro ao carregar imagem. Tente outro arquivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveClientPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tenant) return;
    updateMotoTenant(tenant.id, {
      photoUrl: undefined,
      documents: {
        ...tenant.documents,
        photo: undefined,
      },
    });
  };

  if (!tenant) {
    return (
      <div className="py-8 text-center text-xs text-[#9A9AA2] bg-[#101012] border border-white/[0.08] rounded-xl">
        Nenhum locatário associado a esta moto no momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-[#101012] border border-white/[0.08] rounded-xl space-y-4">
        {/* Header with Tenant Photo Card & Quick Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#18181B] rounded-xl border border-white/[0.08]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#101012] border-2 border-[#E07A3F]/30 shrink-0 shadow-md">
              {tenant.photoUrl || tenant.documents?.photo ? (
                <>
                  <img
                    src={tenant.photoUrl || tenant.documents?.photo}
                    alt={tenant.fullName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoPreview({
                          url: tenant.photoUrl || tenant.documents?.photo || '',
                          title: `Foto do Locatário: ${tenant.fullName}`,
                        })
                      }
                      className="p-1 bg-black/70 hover:bg-black text-white rounded-md cursor-pointer transition-colors"
                      title="Ampliar foto"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveClientPhoto}
                      className="p-1 bg-[#EF4444] hover:bg-[#EF4444]/80 text-white rounded-md cursor-pointer transition-colors"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#E07A3F]">
                  <User className="w-7 h-7" />
                  <span className="text-[9px] text-[#9A9AA2] mt-0.5 font-bold">Sem Foto</span>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#F5F5F7] tracking-tight truncate">
                  {tenant.fullName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    tenant.approvalChecklist.result === 'aprovado'
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25'
                      : 'bg-[#E07A3F]/10 text-[#E07A3F] border border-[#E07A3F]/25'
                  }`}
                >
                  {tenant.approvalChecklist.result === 'aprovado' ? 'Cadastro Aprovado' : 'Em Análise'}
                </span>
              </div>
              <p className="text-xs text-[#9A9AA2] mt-0.5 font-mono">
                CPF: {formatCPF(tenant.cpf)} • RG: {tenant.rg}
              </p>
              <p className="text-[11px] text-[#E07A3F] mt-1 font-semibold flex items-center gap-1">
                <span>Locatário da Moto {moto.brand} {moto.model} ({moto.plate})</span>
              </p>
            </div>
          </div>

          {/* Photo Upload Controls */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleClientPhotoSelect}
              className="hidden"
              id={`upload-client-photo-moto-${tenant.id}`}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm shadow-amber-500/20 active:scale-98"
            >
              {isUploadingPhoto ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando Foto...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>{tenant.photoUrl || tenant.documents?.photo ? 'Alterar Foto' : 'Upar Foto do Cliente'}</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-[#9A9AA2] hidden sm:block">JPG, PNG ou foto da câmera</span>
          </div>
        </div>

        {tenant.cnh && (
          <div className="p-3 bg-[#18181B] rounded-xl border border-white/[0.08] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-medium text-[#9A9AA2]">
                Carteira Nacional de Habilitação (CNH)
              </span>
              <p className="text-xs font-medium text-[#F5F5F7] mt-0.5">
                Nº {tenant.cnh.number} • Categoria: {tenant.cnh.category}
              </p>
            </div>
            <div className="shrink-0">
              {(() => {
                const cnh = getCNHStatus(tenant.cnh.expirationDate);
                return (
                  <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold border shrink-0 ${cnh.badgeClass}`}>
                    {cnh.label}
                  </span>
                );
              })()}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#9A9AA2]">Telefone / WhatsApp:</span>
            <p className="font-medium text-[#F5F5F7]">{formatPhone(tenant.phone)}</p>
          </div>
          <div>
            <span className="text-[#9A9AA2]">E-mail:</span>
            <p className="font-medium text-[#F5F5F7]">{tenant.email || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[#9A9AA2]">Profissão / Empresa:</span>
            <p className="font-medium text-[#F5F5F7]">{tenant.profession} ({tenant.company})</p>
          </div>
          <div>
            <span className="text-[#9A9AA2]">Renda Mensal Declarada:</span>
            <p className="font-medium text-[#10B981]">{formatCurrency(tenant.income)}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#9A9AA2] mb-2">
            Ficha de Aprovação Cadastral
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { label: 'CNH Válida', ok: tenant.approvalChecklist.cnhValid },
              { label: 'Documentos Conferidos', ok: tenant.approvalChecklist.docsChecked },
              { label: 'Endereço Validado', ok: tenant.approvalChecklist.addressValidated },
              { label: 'Renda Analisada', ok: tenant.approvalChecklist.incomeAnalyzed },
              { label: 'Caução Recebida', ok: tenant.approvalChecklist.depositReceived },
              { label: 'Contrato Assinado', ok: tenant.approvalChecklist.contractSigned },
            ].map((chk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 p-2 bg-[#18181B] rounded-lg border border-white/[0.08]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[11px] text-[#9A9AA2]">{chk.label}</span>
              </div>
            ))}
          </div>

          {onOpenClientProfile && (
            <button
              type="button"
              onClick={() => onOpenClientProfile(tenant.id, 'moto')}
              className="mt-3 w-full py-2.5 px-3 bg-[#18181B] hover:bg-[#25242C] text-amber-400 hover:text-white rounded-xl border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Abrir Ficha Cadastral e Score Completo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
