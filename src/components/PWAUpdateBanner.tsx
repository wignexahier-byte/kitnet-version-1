import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAUpdateBannerProps {
  hasUpdate: boolean;
  onApplyUpdate: () => void;
}

export const PWAUpdateBanner: React.FC<PWAUpdateBannerProps> = ({
  hasUpdate,
  onApplyUpdate,
}) => {
  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#18181B] border border-violet-500/40 rounded-2xl shadow-2xl p-4 text-slate-100 backdrop-blur-lg"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                Nova Versão Disponível
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Uma atualização do Gestão Patrimonial está pronta para ser aplicada.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onApplyUpdate}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/20 active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar Agora
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
