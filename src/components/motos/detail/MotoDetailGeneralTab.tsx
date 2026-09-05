import React from 'react';
import { Moto, MotoTenant } from '../../../types';
import { Edit } from 'lucide-react';
import { StandardizedPhotoGallery, PhotoGalleryItem } from '../../common/StandardizedPhotoGallery';

interface MotoDetailGeneralTabProps {
  moto: Moto;
  tenant?: MotoTenant;
  formatCurrency: (value: number) => string;
  formatCPF: (cpf: string) => string;
  setActiveSubTab: (tab: any) => void;
  setSelectedPhotoPreview: (data: { url: string; title: string }) => void;
  handleTriggerQuickUpload: (angle: 'front' | 'rear' | 'right' | 'left' | 'dashboard') => void;
  handleRemovePhotoAngle: (angle: 'front' | 'rear' | 'right' | 'left' | 'dashboard') => void;
}

export const MotoDetailGeneralTab: React.FC<MotoDetailGeneralTabProps> = ({
  moto,
  tenant,
  formatCurrency,
  formatCPF,
  setActiveSubTab,
  setSelectedPhotoPreview,
  handleTriggerQuickUpload,
  handleRemovePhotoAngle,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-[#101012] rounded-xl border border-white/[0.08]">
          <span className="text-[#9A9AA2] block text-[11px]">Placa / UF:</span>
          <strong className="text-sm font-mono text-[#F5F5F7] tracking-wider block mt-0.5">
            {moto.plate}
          </strong>
        </div>
        <div className="p-3 bg-[#101012] rounded-xl border border-white/[0.08]">
          <span className="text-[#9A9AA2] block text-[11px]">Renavam:</span>
          <strong className="text-xs font-mono text-[#F5F5F7] block mt-0.5">{moto.renavam}</strong>
        </div>
        <div className="p-3 bg-[#101012] rounded-xl border border-white/[0.08]">
          <span className="text-[#9A9AA2] block text-[11px]">Chassi:</span>
          <strong className="text-[11px] font-mono text-[#F5F5F7] truncate block mt-0.5" title={moto.chassi}>
            {moto.chassi}
          </strong>
        </div>
        <div className="p-3 bg-[#101012] rounded-xl border border-white/[0.08]">
          <span className="text-[#9A9AA2] block text-[11px]">Valor de Compra:</span>
          <strong className="text-xs text-[#10B981] block mt-0.5">
            {formatCurrency(moto.purchasePrice)}
          </strong>
        </div>
      </div>

      {/* Quick Client Summary if Rented */}
      {tenant && (
        <div className="p-3.5 bg-[#18181B] rounded-xl border border-[#E07A3F]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#101012] border border-white/[0.08] flex items-center justify-center shrink-0">
              {tenant.photoUrl || tenant.documents?.photo ? (
                <img
                  src={tenant.photoUrl || tenant.documents?.photo}
                  alt={tenant.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#E07A3F] font-bold text-base">{tenant.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E07A3F]">
                  Locatário Atual
                </span>
                <span className="text-[10px] text-[#9A9AA2]">CPF: {formatCPF(tenant.cpf)}</span>
              </div>
              <h4 className="text-sm font-bold text-[#F5F5F7]">{tenant.fullName}</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubTab('locatario')}
            className="px-3 py-1.5 bg-[#101012] hover:bg-[#25242C] text-[#E07A3F] border border-[#E07A3F]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Ver Locatário
          </button>
        </div>
      )}

      {/* Photo Gallery Grid */}
      <StandardizedPhotoGallery
        title="Fotos Oficiais do Veículo"
        subtitle="Fotos registradas dos 5 ângulos da motocicleta. Toque para ampliar, atualizar ou remover."
        items={[
          { key: 'front', label: 'Frente', url: moto.photos?.front },
          { key: 'rear', label: 'Traseira', url: moto.photos?.rear },
          { key: 'right', label: 'Lat. Direita', url: moto.photos?.right },
          { key: 'left', label: 'Lat. Esquerda', url: moto.photos?.left },
          { key: 'dashboard', label: 'Painel / KM', url: moto.photos?.dashboard },
        ]}
        columnsCount={5}
        badgeThemeColor="amber"
        onPreview={(url, label) =>
          setSelectedPhotoPreview({
            url,
            title: `Foto ${label} - ${moto.model} (${moto.plate})`,
          })
        }
        onUpload={(key) => handleTriggerQuickUpload(key as any)}
        onDelete={(key) => handleRemovePhotoAngle(key as any)}
      />
    </div>
  );
};
