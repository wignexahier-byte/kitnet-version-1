import React, { useState, useMemo } from 'react';
import { DOCUMENT_TYPES_LIST } from './documentTypesList';
import { Motorbike, Home, ShieldCheck, Scale, Check, ChevronDown } from 'lucide-react';

interface DocumentTypeSelectorProps {
  docType: string;
  onSelectDocType: (id: string) => void;
}

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  activeTabStyle: string;
  activeIconStyle: string;
  activeBadgeStyle: string;
  hoverTabStyle: string;
  selectedCardStyle: string;
  selectedIconBoxStyle: string;
  selectedCheckStyle: string;
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  docType,
  onSelectDocType,
}) => {
  // Infer active category from currently selected docType
  const currentDoc = DOCUMENT_TYPES_LIST.find((d) => d.id === docType);
  const initialCategory = currentDoc
    ? currentDoc.category === 'Financeiro' || currentDoc.category === 'Garantia'
      ? 'Garantia'
      : currentDoc.category === 'Encerramento' || currentDoc.category === 'Jurídico'
      ? 'Jurídico'
      : currentDoc.category
    : 'Motos';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const categories: CategoryConfig[] = [
    {
      id: 'Motos',
      label: 'Motos',
      icon: Motorbike,
      count: 3,
      activeTabStyle:
        'bg-[#E07A3F]/15 border-[#E07A3F]/50 text-[#FED7AA] shadow-[0_0_12px_rgba(224,122,63,0.15)] ring-1 ring-[#E07A3F]/30',
      activeIconStyle: 'text-[#FB923C]',
      activeBadgeStyle: 'bg-[#E07A3F]/25 text-[#FED7AA] border border-[#E07A3F]/40',
      hoverTabStyle: 'hover:text-[#FED7AA] hover:bg-[#E07A3F]/10 hover:border-[#E07A3F]/25',
      selectedCardStyle:
        'bg-[#1D1712] border-[#E07A3F] shadow-[0_0_20px_rgba(224,122,63,0.12)] ring-1 ring-[#E07A3F]/50',
      selectedIconBoxStyle: 'bg-[#E07A3F] text-slate-950 shadow-sm',
      selectedCheckStyle: 'bg-[#E07A3F] text-slate-950',
    },
    {
      id: 'Kitnets',
      label: 'Kitnets',
      icon: Home,
      count: 1,
      activeTabStyle:
        'bg-[#0EA5E9]/15 border-[#0EA5E9]/50 text-[#BAE6FD] shadow-[0_0_12px_rgba(14,165,233,0.15)] ring-1 ring-[#0EA5E9]/30',
      activeIconStyle: 'text-[#38BDF8]',
      activeBadgeStyle: 'bg-[#0EA5E9]/25 text-[#BAE6FD] border border-[#0EA5E9]/40',
      hoverTabStyle: 'hover:text-[#BAE6FD] hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9]/25',
      selectedCardStyle:
        'bg-[#101A24] border-[#0EA5E9] shadow-[0_0_20px_rgba(14,165,233,0.12)] ring-1 ring-[#0EA5E9]/50',
      selectedIconBoxStyle: 'bg-[#0EA5E9] text-slate-950 shadow-sm',
      selectedCheckStyle: 'bg-[#0EA5E9] text-slate-950',
    },
    {
      id: 'Garantia',
      label: 'Recibos & Caução',
      icon: ShieldCheck,
      count: 2,
      activeTabStyle:
        'bg-[#F97316]/15 border-[#F97316]/50 text-[#FDBA74] shadow-[0_0_12px_rgba(249,115,22,0.15)] ring-1 ring-[#F97316]/30',
      activeIconStyle: 'text-[#FB923C]',
      activeBadgeStyle: 'bg-[#F97316]/25 text-[#FDBA74] border border-[#F97316]/40',
      hoverTabStyle: 'hover:text-[#FDBA74] hover:bg-[#F97316]/10 hover:border-[#F97316]/25',
      selectedCardStyle:
        'bg-[#1F140E] border-[#F97316] shadow-[0_0_20px_rgba(249,115,22,0.12)] ring-1 ring-[#F97316]/50',
      selectedIconBoxStyle: 'bg-[#F97316] text-slate-950 shadow-sm',
      selectedCheckStyle: 'bg-[#F97316] text-slate-950',
    },
    {
      id: 'Jurídico',
      label: 'Jurídico & Distrato',
      icon: Scale,
      count: 2,
      activeTabStyle:
        'bg-[#8B5CF6]/15 border-[#8B5CF6]/50 text-[#DDD6FE] shadow-[0_0_12px_rgba(139,92,246,0.15)] ring-1 ring-[#8B5CF6]/30',
      activeIconStyle: 'text-[#A78BFA]',
      activeBadgeStyle: 'bg-[#8B5CF6]/25 text-[#DDD6FE] border border-[#8B5CF6]/40',
      hoverTabStyle: 'hover:text-[#DDD6FE] hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]/25',
      selectedCardStyle:
        'bg-[#1A1424] border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.12)] ring-1 ring-[#8B5CF6]/50',
      selectedIconBoxStyle: 'bg-[#8B5CF6] text-white shadow-sm',
      selectedCheckStyle: 'bg-[#8B5CF6] text-white',
    },
  ];

  const currentCategoryConfig = categories.find((c) => c.id === activeCategory) || categories[0];

  const filteredDocs = useMemo(() => {
    if (activeCategory === 'Garantia') {
      return DOCUMENT_TYPES_LIST.filter(
        (d) => d.category === 'Garantia' || d.category === 'Financeiro'
      );
    }
    if (activeCategory === 'Jurídico') {
      return DOCUMENT_TYPES_LIST.filter(
        (d) => d.category === 'Jurídico' || d.category === 'Encerramento'
      );
    }
    return DOCUMENT_TYPES_LIST.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-4">
      {/* Category Tabs: Sophisticated Segmented Control with Category-Specific Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#121215] border border-[#27272A] rounded-xl shadow-inner">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                // If the currently selected doc isn't in this category, select first in category
                const docsInCat =
                  cat.id === 'Garantia'
                    ? DOCUMENT_TYPES_LIST.filter(
                        (d) => d.category === 'Garantia' || d.category === 'Financeiro'
                      )
                    : cat.id === 'Jurídico'
                    ? DOCUMENT_TYPES_LIST.filter(
                        (d) => d.category === 'Jurídico' || d.category === 'Encerramento'
                      )
                    : DOCUMENT_TYPES_LIST.filter((d) => d.category === cat.id);
                if (docsInCat.length > 0 && !docsInCat.some((d) => d.id === docType)) {
                  onSelectDocType(docsInCat[0].id);
                }
              }}
              className={`w-full py-2.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                isActive
                  ? cat.activeTabStyle
                  : `border-transparent text-[#9CA3AF] bg-transparent hover:bg-[#18181B] ${cat.hoverTabStyle}`
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? cat.activeIconStyle : 'text-[#6B7280]'}`} />
              <span className="truncate">{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 transition-colors ${
                  isActive
                    ? cat.activeBadgeStyle
                    : 'bg-white/[0.05] text-[#9CA3AF] border border-white/[0.06]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Document Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredDocs.map((item) => {
          const Icon = item.icon;
          const isSelected = docType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDocType(item.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer relative flex flex-col justify-between gap-2.5 select-none active:scale-[0.99] ${
                isSelected
                  ? currentCategoryConfig.selectedCardStyle
                  : 'bg-[#18181B]/70 border-[#27272A] hover:bg-[#1E1E22] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 transition-colors ${
                      isSelected
                        ? currentCategoryConfig.selectedIconBoxStyle
                        : 'bg-[#121215] text-[#9CA3AF] border border-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`font-bold text-xs tracking-tight block truncate ${
                        isSelected ? 'text-[#F9FAFB]' : 'text-[#D1D5DB]'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[10px] block truncate font-medium ${
                        isSelected ? currentCategoryConfig.activeIconStyle : 'text-[#9CA3AF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-xs ${currentCategoryConfig.selectedCheckStyle}`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-relaxed pl-0.5">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Direct Dropdown for Fast Access on Mobile */}
      <div className="sm:hidden pt-1">
        <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-1 px-1">
          <span>Ou escolha direto por menu:</span>
          <span className={`font-semibold truncate max-w-[180px] ${currentCategoryConfig.activeIconStyle}`}>
            {currentDoc?.title}
          </span>
        </div>
        <div className="relative">
          <select
            value={docType}
            onChange={(e) => {
              onSelectDocType(e.target.value);
              const found = DOCUMENT_TYPES_LIST.find((d) => d.id === e.target.value);
              if (found) {
                const cat =
                  found.category === 'Financeiro' || found.category === 'Garantia'
                    ? 'Garantia'
                    : found.category === 'Encerramento' || found.category === 'Jurídico'
                    ? 'Jurídico'
                    : found.category;
                setActiveCategory(cat);
              }
            }}
            className="w-full bg-[#121215] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-xs text-[#F9FAFB] appearance-none focus:outline-none focus:border-[#E07A3F] pr-9"
          >
            {DOCUMENT_TYPES_LIST.map((doc) => (
              <option key={doc.id} value={doc.id}>
                [{doc.category}] {doc.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
