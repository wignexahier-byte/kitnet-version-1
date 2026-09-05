import React from 'react';
import { createPortal } from 'react-dom';
import { Camera, X } from 'lucide-react';

interface PhotoZoomPreviewModalProps {
  photoPreview: { url: string; title: string } | null;
  onClose: () => void;
}

export const PhotoZoomPreviewModal: React.FC<PhotoZoomPreviewModalProps> = ({
  photoPreview,
  onClose,
}) => {
  if (!photoPreview) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-[#090B10] border border-white/[0.12] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-modal-enter">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0E111A]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Camera className="w-4 h-4" />
            </div>
            <span>{photoPreview.title}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center bg-[#090B10]">
          <img
            src={photoPreview.url}
            alt={photoPreview.title}
            referrerPolicy="no-referrer"
            className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/[0.08]"
          />
        </div>
        <div className="p-3.5 bg-[#0E111A] border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
