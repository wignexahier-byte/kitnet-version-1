import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Shield,
  FileText,
  DollarSign,
  AlertTriangle,
  Send,
  Camera,
  Trash2,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import { MotoTenant, KitnetTenant } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, formatCPF, formatPhone } from '../utils/formatters';
import { calculateClientScore } from '../utils/scoreCalculator';
import { ScrollableChips } from './ScrollableChips';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ClientDetailProfileTab } from './clients/detail/ClientDetailProfileTab';
import { ClientDetailScoreTab } from './clients/detail/ClientDetailScoreTab';
import { ClientDetailContractsTab } from './clients/detail/ClientDetailContractsTab';
import { ClientDetailOccurrencesTab } from './clients/detail/ClientDetailOccurrencesTab';
import { ClientDetailDocumentsTab } from './clients/detail/ClientDetailDocumentsTab';

export interface ClientDetailDrawerProps {
  isOpen?: boolean;
  tenantId: string;
  tenantType: 'moto' | 'kitnet';
  onClose: () => void;
  onOpenWhatsApp?: (contractId?: string, installmentId?: string) => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  isOpen = true,
  tenantId,
  tenantType,
  onClose,
  onOpenWhatsApp,
}) => {
  const {
    motoTenants,
    kitnetTenants,
    motoContracts,
    kitnetContracts,
    motos,
    kitnets,
    updateMotoTenant,
    updateKitnetTenant,
    addTimelineEvent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'perfil' | 'contratos' | 'score' | 'ocorrencias' | 'documentos'
  >('perfil');

  // Photo management state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreviewModal, setPhotoPreviewModal] = useState<{ url: string; title: string } | null>(null);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  // Find tenant by ID based on type
  const tenant: MotoTenant | KitnetTenant | undefined =
    tenantType === 'moto'
      ? motoTenants.find((t) => t.id === tenantId)
      : kitnetTenants.find((t) => t.id === tenantId);

  // Find related contracts
  const userContracts =
    tenantType === 'moto'
      ? motoContracts.filter((c) => c.tenantId === tenantId)
      : kitnetContracts.filter((c) => c.tenantId === tenantId);

  if (!tenant) return null;

  // Calculate score dynamically
  const clientScore = calculateClientScore(tenant, userContracts);

  // CNH Expiration status check
  const getCNHStatus = (expirationDate: string) => {
    const today = new Date();
    const exp = new Date(expirationDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'CNH VENCIDA', badgeClass: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40' };
    }
    if (diffDays <= 30) {
      return { label: `VENCE EM ${diffDays} DIAS`, badgeClass: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/40' };
    }
    return { label: 'CNH REGULAR', badgeClass: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40' };
  };

  const scoreBadgeColors = {
    excelente: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    medio: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30',
    risco: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      if (tenantType === 'moto') {
        updateMotoTenant(tenant.id, {
          photoUrl: base64Data,
          documents: {
            ...tenant.documents,
            photo: base64Data,
          },
        });
      } else {
        updateKitnetTenant(tenant.id, {
          photoUrl: base64Data,
          documents: {
            ...tenant.documents,
            photo: base64Data,
          },
        });
      }

      addTimelineEvent({
        type: 'ocorrencia_cliente',
        title: `Foto do cliente atualizada`,
        description: `Foto de perfil atualizada para ${tenant.fullName}`,
        entityType: 'cliente',
        entityId: tenant.id,
      });

      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      alert('Erro ao carregar imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tenantType === 'moto') {
      updateMotoTenant(tenant.id, {
        photoUrl: undefined,
        documents: {
          ...tenant.documents,
          photo: undefined,
        },
      });
    } else {
      updateKitnetTenant(tenant.id, {
        photoUrl: undefined,
        documents: {
          ...tenant.documents,
          photo: undefined,
        },
      });
    }
  };

  return typeof document !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end animate-fadeIn font-sans">
          {/* Modal de visualização de foto ampliada */}
          {photoPreviewModal && (
            <div
              className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
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

          <div
            className="w-full max-w-2xl bg-[#1C1C1F] border-l border-[#2A2A2E] h-full flex flex-col shadow-2xl animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#121420] shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Client Avatar with Upload/Zoom Capabilities */}
                <div className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-[#161825] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-sm">
                  {tenant.photoUrl || tenant.documents?.photo ? (
                    <>
                      <img
                        src={tenant.photoUrl || tenant.documents?.photo}
                        alt={tenant.fullName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoPreviewModal({
                              url: tenant.photoUrl || tenant.documents?.photo || '',
                              title: `Foto: ${tenant.fullName}`,
                            })
                          }
                          className="p-1.5 bg-black/80 hover:bg-black text-white rounded-lg cursor-pointer transition-all active:scale-90"
                          title="Ampliar foto"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg cursor-pointer transition-all active:scale-90"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-violet-300 font-bold text-lg bg-gradient-to-br from-violet-500/20 to-purple-600/30">
                      {tenant.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{tenant.fullName}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                        tenantType === 'moto'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/25'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                      }`}
                    >
                      {tenantType === 'moto' ? 'Locatário Moto' : 'Inquilino Kitnet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5 flex-wrap">
                    <span className="whitespace-nowrap">CPF: {formatCPF(tenant.cpf)}</span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="whitespace-nowrap text-slate-300">{formatPhone(tenant.whatsapp || tenant.phone)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id={`drawer-photo-upload-${tenant.id}`}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#181a28] hover:bg-[#202336] text-slate-400 hover:text-white border border-white/[0.08] hover:border-violet-500/30 transition-all cursor-pointer active:scale-90 shadow-xs"
                  title="Alterar foto do cliente"
                >
                  {isUploadingPhoto ? <RefreshCw className="w-4 h-4 animate-spin text-violet-400" /> : <Camera className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 sm:p-2.5 rounded-xl bg-[#181a28] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 transition-all cursor-pointer active:scale-90 shadow-xs"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-white/[0.08] px-4 py-2.5 bg-[#121420] shrink-0">
              <ScrollableChips
                items={[
                  { id: 'perfil', label: 'Perfil', icon: User },
                  { id: 'score', label: 'Score', count: clientScore.score, icon: Shield },
                  { id: 'contratos', label: 'Contratos & Pagamentos', count: userContracts.length, icon: DollarSign },
                  { id: 'ocorrencias', label: 'Ocorrências', count: (tenant.occurrences || []).length, icon: AlertTriangle },
                  { id: 'documentos', label: 'Documentos', count: Object.values(tenant.documents || {}).filter(Boolean).length, icon: FileText },
                ]}
                activeId={activeTab}
                onSelect={(id) => setActiveTab(id as any)}
                variant="solid"
                size="sm"
              />
            </div>

            {/* Drawer Body with smooth crossfade */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a0b12] no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {activeTab === 'perfil' && (
                    <ClientDetailProfileTab
                      tenant={tenant}
                      tenantType={tenantType}
                      clientScore={clientScore}
                      scoreBadgeColors={scoreBadgeColors}
                      setActiveTab={setActiveTab}
                      formatCPF={formatCPF}
                      formatDate={formatDate}
                      formatPhone={formatPhone}
                      formatCurrency={formatCurrency}
                      getCNHStatus={getCNHStatus}
                    />
                  )}

                  {activeTab === 'score' && (
                    <ClientDetailScoreTab
                      clientScore={clientScore}
                      scoreBadgeColors={scoreBadgeColors}
                    />
                  )}

                  {activeTab === 'contratos' && (
                    <ClientDetailContractsTab
                      userContracts={userContracts}
                      tenantType={tenantType}
                      motos={motos}
                      kitnets={kitnets}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  )}

                  {activeTab === 'ocorrencias' && (
                    <ClientDetailOccurrencesTab
                      tenant={tenant}
                      tenantType={tenantType}
                      formatDate={formatDate}
                    />
                  )}

                  {activeTab === 'documentos' && (
                    <ClientDetailDocumentsTab tenant={tenant} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#121420] flex items-center justify-between gap-2 sm:gap-3 shrink-0">
              <a
                href={`https://wa.me/55${(tenant.whatsapp || tenant.phone).replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-10 px-3 sm:px-4 rounded-xl bg-[#25D366] hover:bg-[#1eb857] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 shadow-sm shadow-[#25D366]/20 truncate"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Conversar</span>
                <span className="hidden sm:inline">no WhatsApp</span>
              </a>
              {userContracts.length > 0 && onOpenWhatsApp && (
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(userContracts[0].id)}
                  className="h-10 px-3 sm:px-4 rounded-xl bg-[#181a28] hover:bg-[#25D366]/15 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>Cobrança</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="h-10 px-3.5 sm:px-4 rounded-xl bg-[#181a28] hover:bg-[#202336] text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150 active:scale-95 shrink-0"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
};
