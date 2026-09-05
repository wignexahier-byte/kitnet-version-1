import React from 'react';
import { Camera, ZoomIn, Upload, Trash2 } from 'lucide-react';

export interface PhotoGalleryItem {
  key: string;
  label: string;
  url?: string;
}

interface StandardizedPhotoGalleryProps {
  title: string;
  subtitle?: string;
  items: PhotoGalleryItem[];
  columnsCount?: 5 | 6;
  badgeThemeColor?: 'purple' | 'amber' | 'emerald' | 'sky';
  onPreview?: (url: string, title: string) => void;
  onUpload?: (key: string) => void;
  onDelete?: (key: string) => void;
}

export const StandardizedPhotoGallery: React.FC<StandardizedPhotoGalleryProps> = ({
  title,
  subtitle = 'Toque em qualquer foto para ampliar ou atualizar',
  items,
  columnsCount = 6,
  badgeThemeColor = 'purple',
  onPreview,
  onUpload,
  onDelete,
}) => {
  const filledCount = items.filter((item) => Boolean(item.url)).length;
  const totalCount = items.length;

  const badgeStyles = {
    purple: 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#A855F7]',
    amber: 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]',
    emerald: 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]',
    sky: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
  }[badgeThemeColor];

  return (
    <div className="space-y-3.5 w-full">
      {/* Header with Title and Photo Counter Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {title}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeStyles}`}>
          {filledCount} de {totalCount} fotos cadastradas
        </div>
      </div>

      {/* Standardized Responsive Square Photo Grid */}
      <div
        className={`grid grid-cols-2 ${
          columnsCount === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3 lg:grid-cols-6'
        } gap-3 sm:gap-4 w-full`}
      >
        {items.map((item, index) => {
          // If 5 items on a 2-column mobile layout, center the 5th item horizontally in row 3
          const isFifthOnMobile = columnsCount === 5 && index === 4;

          return (
            <div
              key={item.key}
              className={`flex flex-col items-center text-center space-y-1.5 min-w-0 ${
                isFifthOnMobile
                  ? 'col-span-2 sm:col-span-1 max-w-[calc(50%-0.375rem)] mx-auto w-full sm:max-w-none'
                  : 'w-full'
              }`}
            >
              {/* Centered label above the photo square */}
              <span className="text-xs font-semibold text-slate-300 text-center w-full truncate block px-0.5">
                {item.label}
              </span>

              {/* Standardized Square Photo Container */}
              <div className="w-full aspect-square rounded-2xl bg-[#0E1017] border border-white/[0.10] hover:border-white/[0.25] overflow-hidden flex flex-col items-center justify-center relative group transition-all shadow-md">
                {item.url ? (
                  <>
                    <img
                      src={item.url}
                      alt={item.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => onPreview?.(item.url!, item.label)}
                    />

                    {/* Interactive Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                      {onPreview && (
                        <button
                          type="button"
                          onClick={() => onPreview(item.url!, item.label)}
                          className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Ampliar foto"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      )}
                      {onUpload && (
                        <button
                          type="button"
                          onClick={() => onUpload(item.key)}
                          className="w-8 h-8 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Substituir foto"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item.key)}
                          className="w-8 h-8 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Remover foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Bottom label badge */}
                    <div className="absolute bottom-1.5 inset-x-2 text-center px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] text-white/90 font-medium truncate pointer-events-none">
                      {item.label}
                    </div>
                  </>
                ) : onUpload ? (
                  <button
                    type="button"
                    onClick={() => onUpload(item.key)}
                    className="w-full h-full flex flex-col items-center justify-center p-3 text-slate-500 hover:text-amber-400 hover:bg-white/[0.02] transition-colors cursor-pointer group/empty"
                    title={`Adicionar foto de ${item.label}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-1.5 group-hover/empty:scale-110 group-hover/empty:bg-amber-400/10 group-hover/empty:border-amber-400/30 transition-all">
                      <Camera className="w-5 h-5 text-slate-400 group-hover/empty:text-amber-400 transition-colors" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover/empty:text-slate-200">
                      Sem foto
                    </span>
                    <span className="text-[9px] text-amber-400/80 group-hover/empty:text-amber-400 flex items-center gap-0.5 mt-0.5 font-medium">
                      <Upload className="w-2.5 h-2.5" /> Adicionar
                    </span>
                  </button>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-slate-500">
                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-1.5">
                      <Camera className="w-5 h-5 text-slate-500 opacity-60" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">Sem foto</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
