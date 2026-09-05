import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';

export type ImageUploadThemeColor = 'amber' | 'emerald' | 'sky' | 'purple' | 'slate';

interface ImageUploadInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'compact' | 'photo';
  className?: string;
  themeColor?: ImageUploadThemeColor;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label,
  aspectRatio = 'photo',
  className = '',
  themeColor = 'sky',
}) => {
  const fileGalleryInputRef = useRef<HTMLInputElement>(null);
  const fileCameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsProcessing(true);
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      onChange(compressed);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Não foi possível processar a imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const aspectClasses = {
    photo: 'aspect-square w-full',
    square: 'aspect-square w-full',
    video: 'aspect-video w-full',
    wide: 'aspect-[21/9] w-full',
    compact: 'h-20 sm:h-22 w-full',
  }[aspectRatio] || 'aspect-square w-full';

  const colorStyles = {
    amber: {
      activeText: 'text-amber-400',
      hoverBorder: 'hover:border-amber-500/50',
      dragBorder: 'border-amber-500 bg-amber-500/10 text-amber-400',
      btnHover: 'hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/10',
      loader: 'text-amber-400',
      activeRing: 'ring-amber-500/25',
    },
    emerald: {
      activeText: 'text-emerald-400',
      hoverBorder: 'hover:border-emerald-500/50',
      dragBorder: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
      btnHover: 'hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-500/10',
      loader: 'text-emerald-400',
      activeRing: 'ring-emerald-500/25',
    },
    sky: {
      activeText: 'text-sky-400',
      hoverBorder: 'hover:border-sky-500/50',
      dragBorder: 'border-sky-500 bg-sky-500/10 text-sky-400',
      btnHover: 'hover:border-sky-500/40 hover:text-sky-300 hover:bg-sky-500/10',
      loader: 'text-sky-400',
      activeRing: 'ring-sky-500/25',
    },
    purple: {
      activeText: 'text-purple-400',
      hoverBorder: 'hover:border-purple-500/50',
      dragBorder: 'border-purple-500 bg-purple-500/10 text-purple-400',
      btnHover: 'hover:border-purple-500/40 hover:text-purple-300 hover:bg-purple-500/10',
      loader: 'text-purple-400',
      activeRing: 'ring-purple-500/25',
    },
    slate: {
      activeText: 'text-slate-300',
      hoverBorder: 'hover:border-slate-400/50',
      dragBorder: 'border-slate-400 bg-slate-400/10 text-slate-300',
      btnHover: 'hover:border-slate-400/40 hover:text-white hover:bg-white/10',
      loader: 'text-slate-300',
      activeRing: 'ring-slate-400/25',
    },
  }[themeColor] || {
    activeText: 'text-sky-400',
    hoverBorder: 'hover:border-sky-500/50',
    dragBorder: 'border-sky-500 bg-sky-500/10 text-sky-400',
    btnHover: 'hover:border-sky-500/40 hover:text-sky-300 hover:bg-sky-500/10',
    loader: 'text-sky-400',
    activeRing: 'ring-sky-500/25',
  };

  return (
    <div className={`space-y-1 min-w-0 w-full max-w-full overflow-hidden ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-1">
          <label className="block text-[#9C9CA3] font-medium text-[11px] truncate">{label}</label>
        </div>
      )}

      {/* Hidden inputs: One for gallery/file chooser, one with capture for direct camera */}
      <input
        type="file"
        ref={fileGalleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />
      <input
        type="file"
        ref={fileCameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className={`relative ${aspectClasses} w-full rounded-xl overflow-hidden border border-white/[0.12] group bg-[#0E111A]`}>
          <img
            src={value}
            alt={label || 'Foto'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:bg-black/60 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-end sm:items-center justify-center p-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 p-1 bg-black/75 backdrop-blur-md rounded-lg border border-white/10 pointer-events-auto shadow-lg">
              <button
                type="button"
                onClick={() => fileCameraInputRef.current?.click()}
                className={`w-7 h-7 rounded-md bg-[#141721] hover:bg-[#1E2230] ${colorStyles.activeText} border border-white/[0.12] flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all shrink-0`}
                title="Tirar nova foto com câmera"
                aria-label="Tirar nova foto com câmera"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => fileGalleryInputRef.current?.click()}
                className="w-7 h-7 rounded-md bg-[#141721] hover:bg-[#1E2230] text-[#F2F1ED] hover:text-white border border-white/[0.12] flex items-center justify-center cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
                title="Escolher foto da galeria"
                aria-label="Escolher foto da galeria"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="w-7 h-7 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 flex items-center justify-center cursor-pointer transition-all shadow-xs active:scale-95 shrink-0"
                title="Remover foto"
                aria-label="Remover foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`${aspectClasses} w-full rounded-xl border border-dashed transition-all flex items-center justify-center p-1 text-center min-w-0 max-w-full overflow-hidden ${
            isDragging
              ? colorStyles.dragBorder
              : `border-white/[0.12] ${colorStyles.hoverBorder} bg-[#090B10]/80 hover:bg-[#0E111A]`
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className={`w-4 h-4 ${colorStyles.loader} animate-spin`} />
              <span className={`text-[10px] ${colorStyles.activeText} font-medium`}>Processando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full">
              {/* Botão Câmera - Ícone puro em quadradinho com cantos arredondados */}
              <button
                type="button"
                onClick={() => fileCameraInputRef.current?.click()}
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-[#141721] hover:bg-[#1C2030] ${colorStyles.activeText} border border-white/[0.10] ${colorStyles.btnHover} flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-xs shrink-0`}
                title="Tirar foto com câmera"
                aria-label="Tirar foto com câmera"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Botão Galeria - Ícone puro em quadradinho com cantos arredondados */}
              <button
                type="button"
                onClick={() => fileGalleryInputRef.current?.click()}
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-[#141721] hover:bg-[#1C2030] text-slate-300 hover:text-white border border-white/[0.10] ${colorStyles.btnHover} flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-xs shrink-0`}
                title="Escolher foto da galeria"
                aria-label="Escolher foto da galeria"
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

