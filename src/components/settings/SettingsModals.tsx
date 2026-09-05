import React from 'react';
import { createPortal } from 'react-dom';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface SettingsModalsProps {
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  onConfirmLogout: () => void;
  showClearTimelineModal: boolean;
  setShowClearTimelineModal: (show: boolean) => void;
  onConfirmClearTimeline: () => void;
}

export const SettingsModals: React.FC<SettingsModalsProps> = ({
  showLogoutModal,
  setShowLogoutModal,
  onConfirmLogout,
  showClearTimelineModal,
  setShowClearTimelineModal,
  onConfirmClearTimeline,
}) => {
  if (typeof document === 'undefined') return null;

  return (
    <>
      {/* MODAL: CONFIRMAR LOGOUT */}
      {showLogoutModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative overflow-hidden bg-gradient-to-b from-[#161a27] to-[#10121a] border border-white/[0.1] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-modal-enter my-auto">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
                <LogOut className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-slate-100">Sair da Conta Google?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Você precisará autenticar com sua conta Google novamente para acessar o sistema.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0d14] border border-white/[0.08] hover:border-white/[0.16] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    onConfirmLogout();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-lg shadow-rose-600/30"
                >
                  Confirmar Saída
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: CONFIRMAR LIMPAR TIMELINE */}
      {showClearTimelineModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative overflow-hidden bg-gradient-to-b from-[#161a27] to-[#10121a] border border-white/[0.1] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-modal-enter my-auto">
              <button
                type="button"
                onClick={() => setShowClearTimelineModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-slate-100">Limpar Todo o Histórico?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Isso apagará permanentemente todos os registros da timeline de auditoria. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearTimelineModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0b0d14] border border-white/[0.08] hover:border-white/[0.16] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirmClearTimeline();
                    setShowClearTimelineModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-lg shadow-rose-600/30"
                >
                  Sim, Apagar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

