import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  Apple,
  Chrome,
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable?: boolean;
  onDirectInstall?: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isInstallable = false,
  onDirectInstall,
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-2xl max-w-lg w-full max-h-[92dvh] sm:max-h-[85vh] shadow-2xl overflow-hidden flex flex-col my-auto animate-modal-enter">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#121214] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#F2F1ED] flex items-center gap-2">
                Instalar no Celular (App Nativo)
              </h3>
              <p className="text-xs text-[#9C9CA3]">
                Acesse como aplicativo na tela de início sem barra de navegação
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C9CA3] hover:text-[#F2F1ED] hover:bg-[#2A2A2E] transition-colors cursor-pointer border border-transparent hover:border-[#2A2A2E]"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="p-3 sm:p-4 border-b border-[#2A2A2E] bg-[#121214] flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              platform === 'ios'
                ? 'bg-[#8B5CF6] text-[#121214] border-[#8B5CF6] shadow-sm'
                : 'bg-[#1C1C1F] text-[#9C9CA3] border-[#2A2A2E] hover:text-[#F2F1ED]'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad (iOS)</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              platform === 'android'
                ? 'bg-[#8B5CF6] text-[#121214] border-[#8B5CF6] shadow-sm'
                : 'bg-[#1C1C1F] text-[#9C9CA3] border-[#2A2A2E] hover:text-[#F2F1ED]'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Android (Chrome)</span>
          </button>
        </div>

        {/* Instructions Content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 modal-scroll-container"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {platform === 'ios' ? (
            <div className="space-y-3 text-xs sm:text-sm text-[#9C9CA3]">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED]">Abra no Safari</p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    Certifique-se de estar usando o navegador <strong className="text-[#F2F1ED]">Safari</strong> no seu iPhone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED] flex items-center gap-1.5">
                    Toque no botão Compartilhar
                    <Share className="w-4 h-4 text-[#8B5CF6] inline" />
                  </p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    Fica na barra inferior do Safari (o ícone de um quadrado com uma seta para cima).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED] flex items-center gap-1.5">
                    Selecione "Adicionar à Tela de Início"
                    <PlusSquare className="w-4 h-4 text-[#8B5CF6] inline" />
                  </p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    Role a lista de opções para baixo e toque em <strong className="text-[#F2F1ED]">"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED]">Toque em "Adicionar"</p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    O ícone do Gestão Patrimonial aparecerá na sua tela inicial como um app nativo!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs sm:text-sm text-[#9C9CA3]">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED]">Abra no Google Chrome</p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    No seu smartphone Android, acesse este link pelo navegador <strong className="text-[#F2F1ED]">Chrome</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED]">Toque no menu (3 pontos)</p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    Toque nos três pontinhos no canto superior direito do Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214] border border-[#2A2A2E]">
                <span className="w-6 h-6 rounded-full bg-[#8B5CF6] text-[#121214] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-[#F2F1ED]">
                    Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
                  </p>
                  <p className="text-xs text-[#9C9CA3] mt-0.5">
                    Confirme a instalação para ter acesso rápido direto do seu launcher.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              O app funciona em tela cheia, sem barra de URL, com carregamento instantâneo e notificações ativas!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121214] border-t border-[#2A2A2E] flex items-center justify-between gap-3 shrink-0">
          {isInstallable && onDirectInstall ? (
            <button
              type="button"
              onClick={onDirectInstall}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#121214] text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Smartphone className="w-4 h-4" />
              <span>Instalar Automaticamente</span>
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#8B5CF6]/10 active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
