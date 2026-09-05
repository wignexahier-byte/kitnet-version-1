import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  Palette,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  FileText,
} from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  docTitle: string;
  isMonochrome: boolean;
  onToggleMonochrome: () => void;
  onPrint: () => void;
  onDownload: () => void;
  isGenerating?: boolean;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  docTitle,
  isMonochrome,
  onToggleMonochrome,
  onPrint,
  onDownload,
  isGenerating = false,
}) => {
  useBodyScrollLock(isOpen);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 60));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18181B] border-b border-[#2A2A2E] px-4 py-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-lg">
        {/* Title & Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-[#8B5CF6]/15 text-[#A78BFA] rounded-xl shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#F2F1ED] truncate">
              Pré-visualização do Documento
            </h2>
            <p className="text-[11px] text-[#9C9CA3] truncate max-w-[280px] sm:max-w-md">
              {docTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom controls (hidden on small mobile to save space) */}
          <div className="hidden md:flex items-center bg-[#121214] border border-white/[0.08] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 60}
              className="p-1 text-[#9C9CA3] hover:text-[#F2F1ED] disabled:opacity-30 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Reduzir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-[#D4D4D8] px-1 min-w-[36px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 150}
              className="p-1 text-[#9C9CA3] hover:text-[#F2F1ED] disabled:opacity-30 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 100 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 text-[#8B5CF6] hover:text-[#A78BFA] rounded-lg hover:bg-[#8B5CF6]/10 transition-colors cursor-pointer"
                title="Resetar zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Monochrome / Color toggle */}
          <button
            type="button"
            onClick={onToggleMonochrome}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isMonochrome
                ? 'bg-zinc-800 text-white border-zinc-500 shadow-xs'
                : 'bg-[#141418] text-[#9C9CA3] border-white/[0.08] hover:text-[#F2F1ED] hover:bg-[#1A1A20]'
            }`}
            title="Alternar entre modo econômico (P&B) e cores"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMonochrome ? 'P&B' : 'Colorido'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#141418] text-[#F5F5F7] border border-white/[0.08] hover:bg-[#1A1A20] hover:border-white/[0.15] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#9C9CA3]" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownload}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#121214] flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-[#8B5CF6]/20 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#9C9CA3] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer ml-1"
            title="Fechar pré-visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document Sheet Viewport */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 md:p-8 bg-[#0D0D10] flex justify-center items-start">
        <div
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full max-w-[840px] bg-white text-zinc-900 rounded-xl shadow-2xl overflow-visible border border-zinc-300 mb-12"
        >
          <div
            className="select-text"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>

      {/* Mobile Bottom Footer Helper */}
      <div className="bg-[#18181B]/95 border-t border-[#2A2A2E] px-4 py-2 flex items-center justify-between text-[11px] text-[#9C9CA3] sm:hidden shrink-0">
        <span>Toque em Imprimir ou PDF para salvar</span>
        <button
          type="button"
          onClick={onClose}
          className="text-[#8B5CF6] font-bold px-2 py-1"
        >
          Fechar
        </button>
      </div>
    </div>,
    document.body
  );
};
