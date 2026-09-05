import React from 'react';
import { AlertTriangle, Download, Settings, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface StorageWarningBannerProps {
  onNavigateToSettings?: () => void;
}

export const StorageWarningBanner: React.FC<StorageWarningBannerProps> = ({ onNavigateToSettings }) => {
  const { storageHealthWarning, exportBackup } = useApp();

  return (
    <AnimatePresence>
      {storageHealthWarning && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-rose-950/90 border-b border-rose-600/50 text-rose-200 px-4 py-2.5 text-xs z-[60] overflow-hidden shadow-lg backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="p-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4 animate-pulse text-rose-400" />
              </div>
              <div className="text-xs text-rose-100/90 leading-relaxed">
                <strong className="font-semibold text-rose-50 mr-1.5">Armazenamento do dispositivo cheio:</strong>
                <span>
                  O armazenamento do dispositivo está cheio. Alguns dados podem não estar sendo salvos permanentemente — recomendamos exportar um backup agora e liberar espaço apagando fotos antigas não essenciais.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={exportBackup}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup JSON</span>
              </button>

              {onNavigateToSettings && (
                <button
                  type="button"
                  onClick={onNavigateToSettings}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-700/50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ajustes</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
