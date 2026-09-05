import React from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs z-50 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>
                <strong className="font-semibold text-amber-100">Você está offline:</strong> O sistema continua funcionando normalmente. Todos os seus registros estão salvos no armazenamento local.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-300/80 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Modo Offline Ativo</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
