import React, { useRef, useState } from 'react';
import {
  User,
  Briefcase,
  Camera,
  Trash2,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import { Kitnet, KitnetTenant } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface KitnetDetailTenantTabProps {
  kitnet: Kitnet;
  tenant?: KitnetTenant;
  formatCurrency: (value: number) => string;
  formatCPF: (cpf: string) => string;
  formatPhone: (phone: string) => string;
  onOpenClientProfile?: (tenantId: string, type: 'moto' | 'kitnet') => void;
}

export const KitnetDetailTenantTab: React.FC<KitnetDetailTenantTabProps> = ({
  kitnet,
  tenant,
  formatCurrency,
  formatCPF,
  formatPhone,
  onOpenClientProfile,
}) => {
  const { updateKitnetTenant, addTimelineEvent } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreviewModal, setPhotoPreviewModal] = useState<{ url: string; title: string } | null>(null);

  const handleClientPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      updateKitnetTenant(tenant.id, {
        photoUrl: base64Data,
        documents: {
          ...tenant.documents,
          photo: base64Data,
        },
      });
      addTimelineEvent({
        type: 'ocorrencia_cliente',
        title: `Foto do inquilino atualizada`,
        description: `Foto de perfil atualizada para ${tenant.fullName} (Kitnet ${kitnet.name})`,
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
    updateKitnetTenant(tenant.id, {
      photoUrl: undefined,
      documents: {
        ...tenant.documents,
        photo: undefined,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Modal de visualização de foto em alta definição */}
      {photoPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPhotoPreviewModal(null)}
        >
          <div
            className="bg-[#18181B] border border-white/[0.12] rounded-2xl max-w-lg w-full overflow-hidden p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#F5F5F7]">{photoPreviewModal.title}</h4>
              <button
                type="button"
                onClick={() => setPhotoPreviewModal(null)}
                className="text-[#9A9AA2] hover:text-white text-xs px-2 py-1 bg-[#101012] rounded-lg border border-white/[0.08] cursor-pointer"
              >
                Fechar
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-[#101012] border border-white/[0.08]">
              <img
                src={photoPreviewModal.url}
                alt={photoPreviewModal.title}
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {tenant ? (
        <div className="p-4 bg-[#101012] border border-white/[0.08] rounded-xl space-y-4 text-xs">
          {/* Inquilino Profile Header with Photo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#18181B] rounded-xl border border-white/[0.08]">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#101012] border-2 border-[#0EA5E9]/30 shrink-0 shadow-md">
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
                          setPhotoPreviewModal({
                            url: tenant.photoUrl || tenant.documents?.photo || '',
                            title: `Foto do Inquilino: ${tenant.fullName}`,
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#0EA5E9]">
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
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/25 uppercase">
                    {tenant.incomeType}
                  </span>
                </div>
                <p className="text-xs text-[#9A9AA2] mt-0.5 font-mono">
                  CPF: {formatCPF(tenant.cpf)} • RG: {tenant.rg} • {tenant.maritalStatus}
                </p>
                <p className="text-[11px] text-[#0EA5E9] mt-1 font-semibold flex items-center gap-1">
                  <span>Inquilino da Kitnet {kitnet.name}</span>
                </p>
              </div>
            </div>

            {/* Photo Upload Button */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleClientPhotoSelect}
                className="hidden"
                id={`upload-client-photo-kitnet-${tenant.id}`}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="px-3.5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-98"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#9A9AA2]">WhatsApp / Celular:</span>
              <p className="font-medium text-[#F5F5F7]">{formatPhone(tenant.whatsapp || tenant.phone)}</p>
            </div>
            <div>
              <span className="text-[#9A9AA2]">E-mail:</span>
              <p className="font-medium text-[#F5F5F7]">{tenant.email || 'N/A'}</p>
            </div>
          </div>

          {/* Income Analysis Details */}
          <div className="p-3 bg-[#18181B] rounded-xl border border-white/[0.08] space-y-2">
            <div className="flex items-center gap-2 text-[#0EA5E9] font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Análise de Renda — Categoria: {tenant.incomeType.toUpperCase()}</span>
            </div>

            {tenant.incomeType === 'CLT' && tenant.cltDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[#9A9AA2]">Empresa:</span>
                  <p className="font-medium text-[#F5F5F7]">{tenant.cltDetails.company}</p>
                </div>
                <div>
                  <span className="text-[#9A9AA2]">Cargo:</span>
                  <p className="font-medium text-[#F5F5F7]">{tenant.cltDetails.role}</p>
                </div>
                <div>
                  <span className="text-[#9A9AA2]">Salário:</span>
                  <p className="font-semibold text-[#10B981]">
                    {formatCurrency(tenant.cltDetails.salary)}
                  </p>
                </div>
                <div>
                  <span className="text-[#9A9AA2]">Tempo de Casa:</span>
                  <p className="font-medium text-[#F5F5F7]">{tenant.cltDetails.tenureMonths} meses</p>
                </div>
              </div>
            )}

            {tenant.incomeType === 'empresario' && tenant.empresarioDetails && (
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-[#9A9AA2]">Razão Social:</span>
                  <p className="font-medium text-[#F5F5F7]">{tenant.empresarioDetails.company}</p>
                </div>
                <div>
                  <span className="text-[#9A9AA2]">CNPJ:</span>
                  <p className="font-medium text-[#F5F5F7]">{tenant.empresarioDetails.cnpj}</p>
                </div>
                <div>
                  <span className="text-[#9A9AA2]">Tempo de Atividade:</span>
                  <p className="font-medium text-[#F5F5F7]">{tenant.empresarioDetails.activityYears} anos</p>
                </div>
              </div>
            )}

            {onOpenClientProfile && (
              <button
                type="button"
                onClick={() => onOpenClientProfile(tenant.id, 'kitnet')}
                className="mt-3 w-full py-2.5 px-3 bg-[#101012] hover:bg-[#25242C] text-[#8B5CF6] hover:text-[#F5F5F7] rounded-xl border border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <User className="w-4 h-4 text-[#8B5CF6]" />
                <span>Abrir Ficha Cadastral e Score Completo</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#9A9AA2] bg-[#101012] border border-white/[0.08] rounded-xl">
          Nenhum inquilino cadastrado nesta unidade no momento.
        </div>
      )}
    </div>
  );
};
