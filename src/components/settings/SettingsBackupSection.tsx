import React, { useState } from 'react';
import { Database, Download, Copy, Upload, Loader2, Check, AlertCircle, FileJson } from 'lucide-react';
import { SystemSettings } from '../../types';
import { safeLocalStorage } from '../../utils/storage';

interface SettingsBackupSectionProps {
  settings: SystemSettings;
  exportBackup: () => void;
  importBackup: (content: string) => boolean;
}

export const SettingsBackupSection: React.FC<SettingsBackupSectionProps> = ({
  settings,
  exportBackup,
  importBackup,
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState<boolean>(false);

  const handleExportBackupWithFeedback = () => {
    setIsExportingBackup(true);
    setTimeout(() => {
      exportBackup();
      setIsExportingBackup(false);
    }, 600);
  };

  const handleCopyBackup = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      settings,
      storageKeys: safeLocalStorage.keys().filter((k) => k.startsWith('gestao_patrimonial_')),
    };
    navigator.clipboard.writeText(JSON.stringify(fullBackup, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackup(content);
        if (success) {
          setImportStatus({ message: 'Backup restaurado com sucesso!' });
        } else {
          setImportStatus({ message: 'Erro ao ler arquivo de backup.', isError: true });
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl bg-[#11141e]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl shadow-black/30 space-y-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Dados & Backup
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] bg-white/[0.06] text-slate-400 border border-white/[0.08] px-2.5 py-1 rounded-full font-mono">
          <FileJson className="w-3 h-3 text-violet-400" />
          JSON
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Exporte todos os cadastros, contratos, despesas e auditorias em formato JSON para salvar uma cópia ou migrar de aparelho.
      </p>

      {/* Main Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Export JSON button */}
        <button
          type="button"
          onClick={handleExportBackupWithFeedback}
          disabled={isExportingBackup}
          className="p-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer transition-all shadow-lg shadow-violet-600/20 relative overflow-hidden disabled:opacity-75 group"
        >
          {isExportingBackup ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Gerando Arquivo JSON...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Exportar Backup Completo</span>
            </>
          )}
        </button>

        {/* Copy JSON button */}
        <button
          type="button"
          onClick={handleCopyBackup}
          className="p-3.5 rounded-xl bg-[#161a27] hover:bg-[#1f2438] border border-white/[0.08] hover:border-violet-500/40 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer transition-all shadow-md group"
        >
          {copySuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-bold">Copiado para o Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <span>Copiar Dados (JSON)</span>
            </>
          )}
        </button>
      </div>

      {/* Restore Section */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161a27] hover:bg-[#1f2438] border border-white/[0.08] hover:border-violet-500/40 text-slate-300 hover:text-white cursor-pointer transition-all active:scale-95 shadow-xs">
          <Upload className="w-3.5 h-3.5 text-violet-400" />
          <span>Restaurar de Arquivo JSON</span>
          <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
        </label>

        {importStatus && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg ${
              importStatus.isError
                ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            }`}
          >
            {importStatus.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            {importStatus.message}
          </span>
        )}
      </div>
    </div>
  );
};

