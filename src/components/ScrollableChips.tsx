import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface ChipItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  badgeColor?: string;
}

interface ScrollableChipsProps {
  items: ChipItem[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: 'purple-solid' | 'purple-subtle' | 'blue-solid' | 'blue-subtle' | 'amber-solid' | 'amber-subtle' | 'moto' | 'kitnet' | 'tab' | 'subtle' | 'solid';
  size?: 'sm' | 'md';
  className?: string;
}

export const ScrollableChips: React.FC<ScrollableChipsProps> = ({
  items,
  activeId,
  onSelect,
  variant = 'purple-subtle',
  size = 'md',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 12);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 12);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const amount = containerRef.current.clientWidth * 0.65;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const getButtonStyles = (isActive: boolean) => {
    const basePadding = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm';

    if (variant === 'moto' || variant === 'amber-subtle') {
      if (isActive) {
        return `${basePadding} bg-[#E07A3F]/20 text-[#E07A3F] border border-[#E07A3F]/40 font-semibold shadow-xs`;
      }
      return `${basePadding} bg-[#141418] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-[#1A1A20] border border-white/[0.08] font-medium`;
    }

    if (variant === 'kitnet' || variant === 'blue-subtle') {
      if (isActive) {
        return `${basePadding} bg-[#0EA5E9]/20 text-[#0EA5E9] border border-[#0EA5E9]/40 font-semibold shadow-xs`;
      }
      return `${basePadding} bg-[#141418] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-[#1A1A20] border border-white/[0.08] font-medium`;
    }

    if (variant === 'amber-solid') {
      if (isActive) {
        return `${basePadding} bg-[#E07A3F] text-white font-semibold shadow-sm`;
      }
      return `${basePadding} bg-[#141418] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-[#1A1A20] border border-white/[0.08] font-medium`;
    }

    if (variant === 'blue-solid') {
      if (isActive) {
        return `${basePadding} bg-[#0EA5E9] text-white font-semibold shadow-sm`;
      }
      return `${basePadding} bg-[#141418] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-[#1A1A20] border border-white/[0.08] font-medium`;
    }

    if (variant === 'purple-solid' || variant === 'solid') {
      if (isActive) {
        return `${basePadding} bg-[#8B5CF6] text-white font-semibold shadow-sm`;
      }
      return `${basePadding} bg-[#141418] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-[#1A1A20] border border-white/[0.08] font-medium`;
    }

    if (variant === 'tab') {
      if (isActive) {
        return `${basePadding} bg-[#8B5CF6] text-white font-semibold shadow-sm rounded-lg`;
      }
      return `${basePadding} bg-transparent text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.05] font-medium rounded-lg`;
    }

    // Default subtle variant (purple)
    if (isActive) {
      return `${basePadding} bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 font-semibold shadow-xs`;
    }
    return `${basePadding} bg-[#141418] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-[#1A1A20] border border-white/[0.08] font-medium`;
  };

  return (
    <div className={`relative flex items-center group/chips max-w-full overflow-hidden ${className}`}>
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Rolar para esquerda"
          className="absolute left-0 z-10 w-7 h-7 rounded-full bg-[#101012]/95 border border-white/[0.15] text-[#F5F5F7] hidden sm:flex items-center justify-center shadow-lg backdrop-blur-sm hover:bg-[#1C1C1F] transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1 no-scrollbar scroll-smooth w-full touch-pan-x"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              id={`chip-${item.id}`}
              onClick={() => onSelect(item.id)}
              className={`shrink-0 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer active:scale-95 select-none ${getButtonStyles(
                isActive
              )}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{item.label}</span>
              {item.count !== undefined && item.count !== null && (
                <span
                  className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? variant.includes('solid') || variant === 'tab'
                        ? 'bg-black/25 text-white'
                        : variant === 'moto' || variant === 'amber-subtle'
                        ? 'bg-[#E07A3F]/25 text-[#E07A3F]'
                        : variant === 'kitnet' || variant === 'blue-subtle'
                        ? 'bg-[#0EA5E9]/25 text-[#0EA5E9]'
                        : 'bg-[#8B5CF6]/25 text-[#8B5CF6]'
                      : 'bg-white/[0.08] text-[#9A9AA2]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Rolar para direita"
          className="absolute right-0 z-10 w-7 h-7 rounded-full bg-[#101012]/95 border border-white/[0.15] text-[#F5F5F7] hidden sm:flex items-center justify-center shadow-lg backdrop-blur-sm hover:bg-[#1C1C1F] transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
